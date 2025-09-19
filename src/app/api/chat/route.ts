import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Chat route
 * - Node runtime (Gemini server SDK needs Node)
 * - Robust table discovery (handles different table names / missing tables)
 * - RAG: pulls projects, experiences, certifications, publications, and skills from Supabase and
 *   passes an authoritative JSON context to Gemini 1.5.
 * - Absolutely no hard‑coded employers/claims. Ground everything in context.
 */

export const runtime = "nodejs";

// --- ENV ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
// Prefer flash (higher quota) unless overridden
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("[api/chat] Missing Supabase env vars");
}
if (!GEMINI_API_KEY) {
  console.warn("[api/chat] Missing GEMINI_API_KEY");
}

const sb = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

// Utility: sleep
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Try a list of possible table names and return up to N rows from the first
 * one that exists. We swallow "table not found" and keep going so the bot
 * never hard-crashes if schemas differ between environments.
 */
async function selectFromFirstAvailable(
  candidates: string[],
  limit = 12
): Promise<any[]> {
  for (const name of candidates) {
    const { data, error } = await sb.from(name).select("*").limit(limit);
    if (error) {
      // Only warn; we will try the next candidate
      console.warn(`[api/chat] table '${name}' failed:`, error?.message || error);
      continue;
    }
    return Array.isArray(data) ? data : [];
  }
  return [];
}

/**
 * Small helper: stable sort by sort_order (if present).
 */
function sortByOrder<T extends { sort_order?: number }>(arr: T[]): T[] {
  return [...arr].sort(
    (a, b) => (a?.sort_order ?? 999) - (b?.sort_order ?? 999)
  );
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Pull context from Supabase (robust to different table names)
    const [projRaw, expRaw, certRaw, pubRaw, skillRaw] = await Promise.all([
      selectFromFirstAvailable(["projects", "project", "portfolio_projects"]),
      selectFromFirstAvailable([
        "experiences",
        "experience",
        "work_experience",
        "work_experiences",
      ]),
      selectFromFirstAvailable([
        "certifications",
        "certs",
        "certifications_list",
        "certs_list",
      ]),
      selectFromFirstAvailable([
        "publications",
        "publication",
        "papers",
        "articles",
      ]),
      selectFromFirstAvailable([
        "skills",
        "skill",
        "skill_items",
        "skill_list",
      ]),
    ]);

    const projects = sortByOrder(projRaw);
    const experiences = sortByOrder(expRaw);
    const certifications = sortByOrder(certRaw);
    const publications = sortByOrder(pubRaw);
    const skills = sortByOrder(skillRaw);

    const context = { projects, experiences, certifications, publications, skills };

    // --- System Prompt (identity + guardrails) ---
    const SYSTEM_PROMPT = `
You are **Bhargava's Portfolio Assistant** — a **RAG helper powered by Gemini 2.0 + Supabase**.
Your only knowledge comes from the JSON context provided (**projects, experiences, certifications, publications, skills**).

GOAL
- Help recruiters, hiring managers, and collaborators quickly evaluate Bhargava.
- Give **clear, confidence‑building** answers that show **role fit** for **AI/ML**, **Full‑Stack**, **Cloud/DevOps**, **Data/SQL & Data Engineering** — using **projects, publications, skills, and certifications** as evidence.
- Always ground claims in the supplied context. **Never invent** companies, titles, dates, metrics, or links.

STYLE
- Be concise and positive. Prefer **2–5 sentences** or short bullets.
- Use **evidence‑first** phrasing: mention the item (project/experience/cert/pub/skill) and the concrete impact/stack.
- When the user asks about a specific role (e.g., *SQL developer*), **map Bhargava’s relevant evidence** (projects that touch SQL/DB design/queries, experiences that reference PostgreSQL/MySQL/SQL, and data‑oriented certs) before concluding fit.
- If information is missing, say so briefly and point to the closest relevant items from context.
- Use light Markdown: bullets, short bold phrases for impact/tech; avoid code unless asked.

OUTPUT HINTS
- **Hiring fit:** 1‑sentence verdict + 3–5 evidence bullets (name → impact/metrics → tech).
- **Summary:** 3–5 compact bullets (tech + outcome).
- **Links:** include if present in the item (url/link/certificate_url).
- **Publications/Skills:** cite venue/year or group when helpful.
`;

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt =
      SYSTEM_PROMPT +
      "\n\nContext (authoritative JSON):\n" +
      JSON.stringify(context) +
      "\n\nUser question:\n" +
      message;

    // Call Gemini with light backoff on 429 (2 attempts max)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return NextResponse.json({ response: text });
      } catch (err: any) {
        const msg = err?.message || String(err);
        const is429 =
          err?.status === 429 || /Too Many Requests|quota|rate limit/i.test(msg);
        console.error("[api/chat] Gemini error:", msg);
        if (is429 && attempt === 0) {
          await wait(1500);
          continue;
        }
        break; // fall back
      }
    }

    // Fallback (non‑LLM), so UX never breaks
    return NextResponse.json({
      response: buildFallbackAnswer(message, context),
    });
  } catch (err: any) {
    console.error("[api/chat] fatal error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * Very small deterministic fallback that still uses the context.
 */
function buildFallbackAnswer(
  question: string,
  ctx: { projects: any[]; experiences: any[]; certifications: any[]; publications: any[]; skills: any[] }
): string {
  const q = (question || "").toLowerCase();

  if (/project|build|made|portfolio/.test(q)) {
    const lines = ctx.projects.slice(0, 5).map((p: any) => {
      const title = p.title || p.name || "Project";
      const year = p.year ? ` (${p.year})` : "";
      const brief = p.description ?? p.blurb ?? p.summary ?? "";
      return `• ${title}${year}${brief ? ` — ${brief}` : ""}`;
    });
    if (lines.length) {
      return `RAG (Gemini + Supabase) summary — **Projects**:\n${lines.join("\n")}`;
    }
  }

  if (/experience|work|role|company|intern/.test(q)) {
    const lines = ctx.experiences.slice(0, 4).map((e: any) => {
      const role = e.role || e.title || "Role";
      const company = e.company || e.org || "Company";
      const range = [e.start_date, e.end_date || "Present"]
        .filter(Boolean)
        .join(" → ");
      const brief = e.summary ?? e.description ?? "";
      return `• ${role} @ ${company} (${range})${brief ? ` — ${brief}` : ""}`;
    });
    if (lines.length) {
      return `RAG (Gemini + Supabase) summary — **Experience**:\n${lines.join(
        "\n"
      )}`;
    }
  }

  if (/cert|certificate|certification/.test(q)) {
    const lines = ctx.certifications.slice(0, 6).map((c: any) => {
      const name = c.name || c.title || "Certification";
      const issuer = c.issuer || c.organization || "Issuer";
      const when = c.issued_on || c.date || "";
      return `• ${name} — ${issuer}${when ? ` (${when})` : ""}`;
    });
    if (lines.length) {
      return `RAG (Gemini + Supabase) summary — **Certifications**:\n${lines.join(
        "\n"
      )}`;
    }
  }

  if (/publication|paper|journal|conference|article/i.test(q)) {
    const lines = ctx.publications.slice(0, 6).map((p: any) => {
      const title = p.title || p.name || "Publication";
      const venue = p.venue || p.journal || p.conference || "";
      const year = p.year || (p.published_on?.slice?.(0, 4) ?? "");
      const url = p.url || p.link || p.doi || "";
      const tail = [venue, year].filter(Boolean).join(", ");
      return `• ${title}${tail ? ` — ${tail}` : ""}${url ? ` — ${url}` : ""}`;
    });
    if (lines.length) {
      return `RAG (Gemini + Supabase) summary — **Publications**:\n${lines.join("\n")}`;
    }
  }

  if (/skill|stack|tech|technology|tools?/i.test(q)) {
    const lines = ctx.skills.slice(0, 10).map((s: any) => {
      const name = s.name || s.title || "Skill";
      const group = s.group_name || s.group || s.category || "";
      return `• ${name}${group ? ` — ${group}` : ""}`;
    });
    if (lines.length) {
      return `RAG (Gemini + Supabase) summary — **Skills**:\n${lines.join("\n")}`;
    }
  }

  return `**Bhargava’s Assistant (RAG: Supabase + Gemini 2.0)** — ${ctx.projects.length} project(s), ${ctx.experiences.length} experience item(s), ${ctx.certifications.length} certification(s), ${ctx.publications.length} publication(s), ${ctx.skills.length} skill(s). Ask about role fit (AI/ML • Full‑Stack • Cloud/DevOps • Data/SQL), or request summaries and evidence.`;
}
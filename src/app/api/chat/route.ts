import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Chat route
 * - Node runtime (Gemini server SDK needs Node)
 * - Robust table discovery (handles different table names / missing tables)
 * - RAG: pulls projects, experiences, certifications, publications, and skills from Supabase and
 *   passes an authoritative JSON context to Gemini (configurable model).
 * - Absolutely no hard‑coded employers/claims. Ground everything in context.
 */

export const runtime = "nodejs";

// --- ENV ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
// Prefer flash unless overridden
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

const OWNER_NAME = process.env.NEXT_PUBLIC_OWNER_NAME || "Vidya";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("[api/chat] Missing Supabase env vars");
}
if (!GEMINI_API_KEY) {
  console.warn("[api/chat] Missing GEMINI_API_KEY");
}

const sb = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

// Utility: sleep
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** A generic, sortable row shape from Supabase. */
type SortableRow = { sort_order?: number | null } & Record<string, unknown>;

/**
 * Try a list of possible table names and return up to N rows from the first
 * one that exists. We swallow "table not found" and keep going so the bot
 * never hard-crashes if schemas differ between environments.
 */
async function selectFromFirstAvailable<T extends Record<string, unknown>>(
  candidates: string[],
  limit = 12
): Promise<T[]> {
  for (const name of candidates) {
    const { data, error } = await sb.from(name).select("*").limit(limit);
    if (error) {
      // Only warn; try the next candidate
      console.warn(`[api/chat] table '${name}' failed:`, (error as { message?: string })?.message ?? String(error));
      continue;
    }
    return Array.isArray(data) ? (data as T[]) : [];
  }
  return [];
}

/**
 * Small helper: stable sort by sort_order (if present).
 */
function sortByOrder<T extends { sort_order?: number | null }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (a?.sort_order ?? 999) - (b?.sort_order ?? 999));
}

/** Safe getters to avoid `any` */
const pickStr = (obj: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
};
const pickNumOrYearStr = (obj: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number") return String(v);
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
};
const pickUrl = (obj: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && /^https?:\/\//i.test(v)) return v;
  }
  return "";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const message =
      typeof body === "object" && body !== null && typeof (body as Record<string, unknown>).message === "string"
        ? ((body as Record<string, unknown>).message as string)
        : "";

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Pull context from Supabase (robust to different table names)
    const [projRaw, expRaw, certRaw, pubRaw, skillRaw] = await Promise.all([
      selectFromFirstAvailable<SortableRow>(["projects", "project", "portfolio_projects"]),
      selectFromFirstAvailable<SortableRow>(["experiences", "experience", "work_experience", "work_experiences"]),
      selectFromFirstAvailable<SortableRow>(["certifications", "certs", "certifications_list", "certs_list"]),
      selectFromFirstAvailable<SortableRow>(["publications", "publication", "papers", "articles"]),
      selectFromFirstAvailable<SortableRow>(["skills", "skill", "skill_items", "skill_list"]),
    ]);

    const projects = sortByOrder(projRaw);
    const experiences = sortByOrder(expRaw);
    const certifications = sortByOrder(certRaw);
    const publications = sortByOrder(pubRaw);
    const skills = sortByOrder(skillRaw);

    const MAX = 8; // trim large arrays to keep prompt small & stable
    const context = {
      projects: projects.filter((p:any)=>p?.published !== false).slice(0, MAX),
      experiences: experiences.filter((e:any)=>e?.published !== false).slice(0, MAX),
      certifications: certifications.filter((c:any)=>c?.published !== false).slice(0, MAX),
      publications: publications.filter((p:any)=>p?.published !== false).slice(0, MAX),
      skills: skills.filter((s:any)=>s?.published !== false).slice(0, MAX),
    };

    console.log("[api/chat] ctx sizes", {
      projects: context.projects.length,
      experiences: context.experiences.length,
      certifications: context.certifications.length,
      publications: context.publications.length,
      skills: context.skills.length,
    });
    console.log("[api/chat] env", { hasGeminiKey: !!GEMINI_API_KEY, model: GEMINI_MODEL });

    // --- System Prompt (identity + guardrails) ---
    const SYSTEM_PROMPT = `
You are **${OWNER_NAME}'s Portfolio Assistant** — a **RAG helper powered by Gemini 2.0 + Supabase**.
Your only knowledge comes from the JSON context provided (**projects, experiences, certifications, publications, skills**).

GOAL
- Help recruiters, hiring managers, and collaborators quickly evaluate ${OWNER_NAME}.
- Give **clear, confidence‑building** answers that show **role fit** for **AI/ML**, **Full‑Stack**, **Cloud/DevOps**, **Data/SQL & Data Engineering** — using **projects, publications, skills, and certifications** as evidence.
- Always ground claims in the supplied context. **Never invent** companies, titles, dates, metrics, or links.

STYLE
- Be concise and positive. Prefer **2–5 sentences** or short bullets.
- Use **evidence‑first** phrasing: mention the item (project/experience/cert/pub/skill) and the concrete impact/stack.
- When the user asks about a specific role (e.g., *SQL developer*), **map ${OWNER_NAME}’s relevant evidence** (projects that touch SQL/DB design/queries, experiences that reference PostgreSQL/MySQL/SQL, and data‑oriented certs) before concluding fit.
- If information is missing, say so briefly and point to the closest relevant items from context.
- Use light Markdown: bullets, short bold phrases for impact/tech; avoid code unless asked.

OUTPUT HINTS
- **Hiring fit:** 1‑sentence verdict + 3–5 evidence bullets (name → impact/metrics → tech).
- **Summary:** 3–5 compact bullets (tech + outcome).
- **Links:** include if present in the item (url/link/certificate_url).
- **Publications/Skills:** cite venue/year or group when helpful.
`;

    async function pickSupportedModel() {
      const url = "https://generativelanguage.googleapis.com/v1/models";
      const res = await fetch(`${url}?key=${GEMINI_API_KEY}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || JSON.stringify(json));
      const list: Array<any> = json?.models || [];
      // prefer latest 1.5 flash variants that support generateContent
      const candidates = list
        .filter(m => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m?.name?.replace(/^models\//, ""))
        .filter(Boolean) as string[];
      // priority order
      const priority = ["gemini-1.5-flash-002", "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro-latest", "gemini-1.5-pro"];
      for (const p of priority) {
        if (candidates.includes(p)) return p;
      }
      // fallback to the first candidate if none match priority
      return candidates[0];
    }

    async function generateWithGemini(prompt: string) {
      let modelToUse = GEMINI_MODEL;
      let endpoint = `https://generativelanguage.googleapis.com/v1/models/${modelToUse}:generateContent`;
      let res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json?.error?.message || JSON.stringify(json);
        // If the configured model isn't found on v1, attempt discovery once.
        if (res.status === 404) {
          console.warn("[api/chat] model not found:", modelToUse, "- discovering alternatives...");
          try {
            modelToUse = await pickSupportedModel();
            if (!modelToUse) throw new Error("No supported models returned");
            endpoint = `https://generativelanguage.googleapis.com/v1/models/${modelToUse}:generateContent`;
            res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY! },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
              }),
            });
            const retryJson = await res.json();
            if (!res.ok) {
              throw new Error(retryJson?.error?.message || JSON.stringify(retryJson));
            }
            const retryText =
              retryJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
              retryJson?.candidates?.[0]?.output ?? "";
            console.log("[api/chat] using model:", modelToUse);
            return retryText || "";
          } catch (e) {
            throw new Error(typeof e === "string" ? e : (e as Error).message);
          }
        }
        throw new Error(msg);
      }
      const text =
        json?.candidates?.[0]?.content?.parts?.[0]?.text ??
        json?.candidates?.[0]?.output ?? // fallback for older shapes
        "";
      return text || "";
    }

    const prompt =
      SYSTEM_PROMPT +
      "\n\nContext (authoritative JSON):\n" +
      JSON.stringify(context) +
      "\n\nUser question:\n" +
      message;

    // Call Gemini with light backoff on 429 (2 attempts max)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const text = await generateWithGemini(prompt);
        return NextResponse.json({ response: text, model: GEMINI_MODEL });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const is429 = /Too Many Requests|quota|rate limit/i.test(msg) || (typeof err === "object" && err !== null && (err as { status?: number }).status === 429);
        console.error("[api/chat] Gemini error:", msg);
        if (is429 && attempt === 0) {
          await wait(1500);
          continue;
        }
        // if it's not retriable, bubble up as 500 with message so the client can see it in Network tab
        return NextResponse.json({ error: msg, fallback: buildFallbackAnswer(message, context) }, { status: 500 });
      }
    }

    // Fallback (non‑LLM), so UX never breaks
    return NextResponse.json({
      response: buildFallbackAnswer(message, context),
      note: "fallback"
    });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : String(err);
    console.error("[api/chat] fatal error:", m);
    return NextResponse.json({ error: m || "Internal error" }, { status: 500 });
  }
}

/**
 * Very small deterministic fallback that still uses the context.
 */
function buildFallbackAnswer(
  question: string,
  ctx: {
    projects: SortableRow[];
    experiences: SortableRow[];
    certifications: SortableRow[];
    publications: SortableRow[];
    skills: SortableRow[];
  }
): string {
  const q = (question || "").toLowerCase();

  if (/project|build|made|portfolio/.test(q)) {
    const lines = ctx.projects.slice(0, 5).map((p) => {
      const title = pickStr(p, "title", "name", "project_title") || "Project";
      const year = pickNumOrYearStr(p, "year");
      const brief = pickStr(p, "description", "blurb", "summary");
      return `• ${title}${year ? ` (${year})` : ""}${brief ? ` — ${brief}` : ""}`;
    });
    if (lines.length) {
      return `RAG (Gemini + Supabase) summary — **Projects**:\n${lines.join("\n")}`;
    }
  }

  if (/experience|work|role|company|intern/.test(q)) {
    const lines = ctx.experiences.slice(0, 4).map((e) => {
      const role = pickStr(e, "role", "title") || "Role";
      const company = pickStr(e, "company", "org", "organization") || "Company";
      const start = pickStr(e, "start", "start_date");
      const end = pickStr(e, "end", "end_date") || "Present";
      const brief = pickStr(e, "summary", "description");
      const range = [start, end].filter(Boolean).join(" → ");
      return `• ${role} @ ${company}${range ? ` (${range})` : ""}${brief ? ` — ${brief}` : ""}`;
    });
    if (lines.length) {
      return `RAG (Gemini + Supabase) summary — **Experience**:\n${lines.join("\n")}`;
    }
  }

  if (/cert|certificate|certification/.test(q)) {
    const lines = ctx.certifications.slice(0, 6).map((c) => {
      const name = pickStr(c, "name", "title") || "Certification";
      const issuer = pickStr(c, "issuer", "organization") || "Issuer";
      const when = pickStr(c, "issued_on", "date", "year");
      return `• ${name} — ${issuer}${when ? ` (${when})` : ""}`;
    });
    if (lines.length) {
      return `RAG (Gemini + Supabase) summary — **Certifications**:\n${lines.join("\n")}`;
    }
  }

  if (/publication|paper|journal|conference|article/.test(q)) {
    const lines = ctx.publications.slice(0, 6).map((p) => {
      const title = pickStr(p, "title", "name") || "Publication";
      const venue = pickStr(p, "venue", "journal", "conference");
      const year = pickNumOrYearStr(p, "year") || pickStr(p, "published_on");
      const url = pickUrl(p, "url", "link", "doi");
      const tail = [venue, year].filter(Boolean).join(", ");
      return `• ${title}${tail ? ` — ${tail}` : ""}${url ? ` — ${url}` : ""}`;
    });
    if (lines.length) {
      return `RAG (Gemini + Supabase) summary — **Publications**:\n${lines.join("\n")}`;
    }
  }

  if (/skill|stack|tech|technology|tools?/.test(q)) {
    const lines = ctx.skills.slice(0, 10).map((s) => {
      const name = pickStr(s, "name", "title") || "Skill";
      const group = pickStr(s, "group_name", "group", "category");
      return `• ${name}${group ? ` — ${group}` : ""}`;
    });
    if (lines.length) {
      return `RAG (Gemini + Supabase) summary — **Skills**:\n${lines.join("\n")}`;
    }
  }

  return `**${OWNER_NAME}’s Assistant (RAG: Supabase + Gemini 2.0)** — ${ctx.projects.length} project(s), ${ctx.experiences.length} experience item(s), ${ctx.certifications.length} certification(s), ${ctx.publications.length} publication(s), ${ctx.skills.length} skill(s). Ask about role fit (AI/ML • Full‑Stack • Cloud/DevOps • Data/SQL), or request summaries and evidence.`;
}
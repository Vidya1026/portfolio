import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// --- ENV ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
// Use flash by default (higher quota); let env override.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("[api/chat] Missing Supabase env vars");
}
if (!GEMINI_API_KEY) {
  console.warn("[api/chat] Missing GEMINI_API_KEY");
}

const sb = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

// Simple sleep
const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1) Live data from Supabase (compact)
    const [proj, exp, cert] = await Promise.all([
      sb.from("projects")
        .select("title, subtitle, description, tags, year, sort_order")
        .limit(8)
        .order("sort_order", { ascending: true }),
      sb.from("experiences")
        .select("company, role, start_date, end_date, summary, bullets, sort_order")
        .limit(8)
        .order("sort_order", { ascending: true }),
      sb.from("certifications")
        .select("name, issuer, issued_on, credential_url, badge_url, sort_order")
        .limit(8)
        .order("sort_order", { ascending: true }),
    ]);

    if (proj.error) throw proj.error;
    if (exp.error) throw exp.error;
    if (cert.error) throw cert.error;

    const context = {
      projects: proj.data ?? [],
      experiences: exp.data ?? [],
      certifications: cert.data ?? [],
    };

    // 2) Compose grounded prompt
    const SYSTEM_PROMPT = `
You are the portfolio assistant for **Bhargava** (Full‑Stack: React/Next.js, Java/Spring; AI/RAG). Your job is to quickly convince recruiters and hiring managers.

STYLE
- Be concise and confident. Prefer **2–5 sentences** or **short bullet points**.
- Always ground answers in the provided JSON context (projects, experiences, certifications).
- When useful, highlight **impact** (metrics, users, latency, cost) and **skills/stack** used.
- If information is missing, say so briefly and suggest the closest relevant item from context.
- Use light Markdown: headings, bullets, bold for key phrases. No code fences unless requested.

OUTPUT RULES
- If asked for a summary, include 3–5 bullets with project/role highlights and tech.
- If asked for fit/hiring recommendation, give a short evidence‑backed verdict.
- If asked for contact/next steps, point to the Projects/Experience sections.
`;
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `${SYSTEM_PROMPT}\n\nContext JSON (authoritative):\n${JSON.stringify(context)}\n\nUser question:\n${message}`;

    // 3) Try Gemini with backoff on 429 (2 attempts)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return NextResponse.json({ response: text });
      } catch (err: any) {
        // If quota 429, back off then retry once
        const is429 =
          err?.status === 429 ||
          /Too Many Requests|quota|rate limit/i.test(err?.message || "");
        if (is429 && attempt === 0) {
          await wait(2000); // 2s backoff
          continue;
        }
        // Otherwise bail to fallback
        console.error("[api/chat] Gemini error:", err?.message || err);
        break;
      }
    }

    // 4) Fallback: non-LLM concise answer from context so UX never breaks
    const fallback = buildFallbackAnswer(message, context);
    return NextResponse.json({
      response:
        fallback ||
        "I’m out of quota right now, but I can’t find that in the current resume context.",
    });
  } catch (err: any) {
    console.error("[api/chat] error", err);
    return NextResponse.json({ error: err?.message ?? "Internal error" }, { status: 500 });
  }
}

// Very small heuristic fallback so the bot still answers during quota limits
function buildFallbackAnswer(
  question: string,
  ctx: {
    projects: any[];
    experiences: any[];
    certifications: any[];
  }
): string {
  const q = question.toLowerCase();

  if (/project|build|made|portfolio/.test(q)) {
    const lines = ctx.projects.slice(0, 5).map((p: any) => {
      const t = [p.title, p.year ? `(${p.year})` : ""].filter(Boolean).join(" ");
      const d = p.description ? ` – ${p.description}` : "";
      return `• ${t}${d}`;
    });
    if (lines.length) {
      return `Here are Bhargava’s recent projects:\n${lines.join("\n")}`;
    }
  }

  if (/experience|work|role|company|intern/.test(q)) {
    const lines = ctx.experiences.slice(0, 4).map((e: any) => {
      const range = [e.start_date, e.end_date || "Present"].filter(Boolean).join(" → ");
      return `• ${e.role} @ ${e.company} (${range}) – ${e.summary ?? ""}`;
    });
    if (lines.length) {
      return `Experience overview:\n${lines.join("\n")}`;
    }
  }

  if (/cert|certificate|certification/.test(q)) {
    const lines = ctx.certifications.slice(0, 6).map((c: any) => {
      return `• ${c.name} — ${c.issuer}${c.issued_on ? ` (${c.issued_on})` : ""}`;
    });
    if (lines.length) {
      return `Certifications:\n${lines.join("\n")}`;
    }
  }

  // Generic compact summary
  const pCount = ctx.projects.length;
  const eCount = ctx.experiences.length;
  const cCount = ctx.certifications.length;
  return `Bhargava’s profile (quick summary): ${pCount} project(s), ${eCount} experience item(s), ${cCount} certification(s). Ask about projects, experience, or certifications.`;
}
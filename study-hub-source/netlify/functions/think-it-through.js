// Groq-assisted "think it through" helper for the Questions & Answers tab.
// Two things this deliberately does NOT do, on purpose:
//   1. It never just answers the question outright — the point (per her
//      request) is help thinking it through, so the prompt asks for guiding
//      questions and a research direction, not a direct answer.
//   2. It NEVER generates a URL or names a specific paper/study/author/year.
//      Same integrity risk as dissertation-recommendations.js: an LLM asked
//      for links or citations will confidently invent plausible-looking
//      ones that don't exist or don't resolve. Instead this returns bare
//      search-direction topics, and the frontend builds real search-engine
//      links (PubMed, Google Scholar, Google) from a fixed, known set of
//      base URLs — the model never touches a URL at any point.
//
// Requires GROQ_API_KEY set on this Netlify site (Site settings > Environment variables).

const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function getApiKey() {
  const v = typeof process !== "undefined" ? process.env.GROQ_API_KEY : null;
  if (v) return v;
  try {
    if (typeof Netlify !== "undefined" && Netlify.env?.get) {
      const v2 = Netlify.env.get("GROQ_API_KEY");
      if (v2) return v2;
    }
  } catch {}
  return null;
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}

function extractJson(text) {
  const stripped = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(stripped); }
  catch {
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    try { return JSON.parse(stripped.slice(start, end + 1)); } catch { return null; }
  }
}

// Same cheap safety net as dissertation-recommendations.js: a research
// direction naming a specific study almost always carries a 4-digit year.
function looksLikeCitation(str) {
  return /\b(19|20)\d{2}\b/.test(str);
}

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "POST required" }, 405);

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const question = (body.question || "").trim();
  if (!question) return jsonResponse({ error: "missing_question" });

  const apiKey = getApiKey();
  if (!apiKey) return jsonResponse({ error: "missing_api_key" });

  const systemPrompt = `A doctoral candidate in clinical herbalism has parked an open question she's trying to find the answer to herself. Help her THINK IT THROUGH — do not answer the question for her.

Respond with ONLY a JSON object in exactly this shape:
{
  "guidingQuestions": ["2-4 Socratic questions that help her break the question into smaller, answerable pieces, or surface an assumption worth checking"],
  "researchDirections": [{"topic": "a short search-able topic or phrase, NO named papers/authors/years/citations", "why": "one sentence on why this direction could help answer her question"}]
}
CRITICAL RULE: researchDirections topics must be plain searchable phrases only — never a named study, author, year, or specific source. Naming a specific "study" is more likely to be a confident hallucination than a real citation, which is a real integrity risk for dissertation-grade work. Include 2-4 research directions.`;
  const userPrompt = `Her open question: "${question}"`;

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.5,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      }),
    });
    if (!groqRes.ok) return jsonResponse({ error: "groq_request_failed" });
    const data = await groqRes.json();
    const parsed = extractJson(data?.choices?.[0]?.message?.content || "");
    if (!parsed) return jsonResponse({ error: "unparseable_response" });

    const guidingQuestions = (Array.isArray(parsed.guidingQuestions) ? parsed.guidingQuestions : [])
      .filter(Boolean).map(String).slice(0, 4);

    const researchDirections = (Array.isArray(parsed.researchDirections) ? parsed.researchDirections : [])
      .filter(r => r && r.topic && !looksLikeCitation(r.topic))
      .map(r => ({ topic: String(r.topic).trim(), why: r.why ? String(r.why).trim() : '' }))
      .slice(0, 4);

    return jsonResponse({ guidingQuestions, researchDirections });
  } catch (err) {
    return jsonResponse({ error: "unexpected_error" });
  }
};

export const config = {
  path: "/api/think-it-through",
};

// Groq-assisted "peer check" for the Fog Log. This stands in for the peer
// review step in the 3-step learning method (explain it so someone can
// correct you) when a real peer isn't on hand. It is explicitly NOT an
// authority — it never rewrites her explanation or hands her a "correct"
// version. It only flags, gently, whether anything in her own words looks
// off or worth double-checking, and says so honestly when it isn't sure
// either. Same honesty posture as word-lookup.js: low confidence stated
// plainly rather than a confident-sounding guess.

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

export default async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "POST required" }, 405);

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const concept = (body.concept || "").trim();
  const explanation = (body.explanation || "").trim();
  if (!concept || !explanation) return jsonResponse({ error: "missing_fields" });

  const apiKey = getApiKey();
  if (!apiKey) return jsonResponse({ error: "missing_api_key" });

  const systemPrompt = `You are acting as a knowledgeable peer, not an authority. The user is practicing explaining a concept in their own words as a learning technique — your job is only to gently flag anything in their explanation that looks incorrect, oversimplified, or worth double-checking, the way a peer catching a mistake would. Do NOT rewrite their explanation or provide "the correct" version — just point at what to double-check and briefly say why. If their explanation looks solid, say so plainly and briefly. If the concept itself is obscure/technical/clinical and you are not confident in your own read, say that honestly rather than inventing confident-sounding feedback. Respond with ONLY a JSON object: {"feedback": "...", "confidence": "high|medium|low"}. Keep feedback to 2-4 sentences.`;
  const userPrompt = `Concept: "${concept}"\nTheir explanation: "${explanation}"`;

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      }),
    });
    if (!groqRes.ok) return jsonResponse({ error: "groq_request_failed" });
    const data = await groqRes.json();
    const parsed = extractJson(data?.choices?.[0]?.message?.content || "");
    if (!parsed) return jsonResponse({ error: "unparseable_response" });
    return jsonResponse({
      feedback: parsed.feedback || "",
      confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "medium",
    });
  } catch (err) {
    return jsonResponse({ error: "unexpected_error" });
  }
};

export const config = {
  path: "/api/fog-log-check",
};

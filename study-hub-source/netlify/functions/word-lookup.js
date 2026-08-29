// Groq-assisted first-draft definitions for the Word Bank. Low-stakes
// compared to the dissertation-recommendations guardrails — a wrong
// definition of a common word is an easy, obvious error to catch, not a
// fabricated academic citation. Still worth being honest about the one real
// failure mode: uncommon herbalism/clinical/Latin terms are exactly where a
// model is most likely to confidently guess wrong, so this is always a
// draft to check, never presented as authoritative — the UI must label it
// as a draft, not swap it in silently.

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
  const word = (body.word || "").trim();
  const context = (body.context || "").trim();
  if (!word) return jsonResponse({ error: "missing_word" });

  const apiKey = getApiKey();
  if (!apiKey) return jsonResponse({ error: "missing_api_key" });

  const systemPrompt = `Give a concise dictionary-style entry for the given word. If it's an uncommon technical, clinical, herbalism, or Latin/botanical term, say so honestly rather than guessing confidently if you're not sure. Respond with ONLY a JSON object: {"definition": "...", "synonyms": ["...", "..."], "antonyms": ["...", "..."], "confidence": "high|medium|low"}. Use "low" confidence honestly for obscure or technical terms rather than inventing a confident-sounding answer.`;
  const userPrompt = context ? `Word: "${word}"\nContext it appeared in: "${context}"` : `Word: "${word}"`;

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
      definition: parsed.definition || "",
      synonyms: Array.isArray(parsed.synonyms) ? parsed.synonyms.slice(0, 6) : [],
      antonyms: Array.isArray(parsed.antonyms) ? parsed.antonyms.slice(0, 6) : [],
      confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "medium",
    });
  } catch (err) {
    return jsonResponse({ error: "unexpected_error" });
  }
};

export const config = {
  path: "/api/word-lookup",
};

// Groq-powered dissertation recommendations, deliberately split into two
// risk tiers:
//   1. Books & media — real, nameable works. Worst case if wrong: a mediocre
//      suggestion, easily checked by seeing if the book exists.
//   2. Research directions — topics/queries to go search, NEVER named papers,
//      authors, or years. An LLM asked to name specific studies will
//      confidently invent plausible-sounding ones that don't exist; for
//      dissertation-grade work that's a real integrity risk, not a minor
//      inconvenience. This function structurally cannot return a named paper
//      in the directions list — the prompt forbids it and the parser drops
//      anything in that list that looks like a citation (a 4-digit year).
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
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function extractJson(text) {
  const stripped = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    try { return JSON.parse(stripped.slice(start, end + 1)); } catch { return null; }
  }
}

// A named study/paper reference almost always carries a 4-digit year
// somewhere in the string. Research directions should be plain topic
// phrases with no year — this is a cheap but meaningful safety net on top
// of the prompt instruction, catching cases where the model slips.
function looksLikeCitation(str) {
  return /\b(19|20)\d{2}\b/.test(str);
}

export default async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "POST required" }, 405);
  }

  let body;
  try { body = await req.json(); } catch { body = {}; }

  const thesisStatement = (body.thesisStatement || "").trim();
  const gaps = Array.isArray(body.gaps) ? body.gaps.slice(-15) : [];
  const strengths = Array.isArray(body.strengths) ? body.strengths.slice(-10) : [];
  const highRelevanceTitles = Array.isArray(body.highRelevanceTitles) ? body.highRelevanceTitles.slice(-100) : [];
  const contradictingMedia = Array.isArray(body.contradictingMedia) ? body.contradictingMedia.slice(-10) : [];

  if (!thesisStatement) {
    return jsonResponse({ error: "missing_thesis", booksAndMedia: [], researchDirections: [] });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return jsonResponse({ error: "missing_api_key", booksAndMedia: [], researchDirections: [] });
  }

  const systemPrompt = `You are a research advisor helping a clinical herbalism doctoral-style candidate find what to read next for her dissertation.

CRITICAL RULE: You may recommend real, nameable BOOKS, documentaries, podcasts, or lectures — things with a title and creator that a person could look up and confirm exist. You must NEVER name a specific academic study, paper, or article with an author/year/journal — not even one you believe is real. Instead, for research-worthy gaps, describe the DIRECTION to search in (a topic, a research question, a field) with no named source attached. This is a hard rule: a named "study" is more likely to be a confident hallucination than a real citation, and this is dissertation-grade work where that is a serious integrity risk, not a minor inconvenience.

Respond with ONLY a JSON object in exactly this shape:
{
  "booksAndMedia": [{"title": "...", "creator": "...", "type": "Book|Documentary|Podcast|Lecture", "why": "one sentence connecting this to her actual gaps/thesis"}],
  "researchDirections": [{"topic": "a short research direction or question, NO named papers/authors/years", "why": "why this direction matters to her thesis or a specific framework gap"}]
}
Include 6-10 books/media and 5-8 research directions.`;

  const userPrompt = JSON.stringify({
    dissertation_statement: thesisStatement,
    known_framework_gaps: gaps,
    known_framework_strengths: strengths,
    already_flagged_high_relevance: highRelevanceTitles,
    media_that_complicated_or_contradicted_thesis: contradictingMedia,
  });

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      return jsonResponse({ error: "groq_request_failed", booksAndMedia: [], researchDirections: [] });
    }

    const data = await groqRes.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJson(content);
    if (!parsed) {
      return jsonResponse({ error: "unparseable_response", booksAndMedia: [], researchDirections: [] });
    }

    const booksAndMedia = (Array.isArray(parsed.booksAndMedia) ? parsed.booksAndMedia : [])
      .filter(b => b && b.title)
      .map(b => ({
        title: String(b.title).trim(),
        creator: b.creator ? String(b.creator).trim() : "",
        type: ["Book", "Documentary", "Podcast", "Lecture"].includes(b.type) ? b.type : "Book",
        why: b.why ? String(b.why).trim() : "",
      }))
      .slice(0, 10);

    // Safety net: drop any "research direction" that smells like a named
    // citation (contains a year), even though the prompt already forbids it.
    const researchDirections = (Array.isArray(parsed.researchDirections) ? parsed.researchDirections : [])
      .filter(r => r && r.topic && !looksLikeCitation(r.topic))
      .map(r => ({
        topic: String(r.topic).trim(),
        why: r.why ? String(r.why).trim() : "",
      }))
      .slice(0, 8);

    return jsonResponse({ booksAndMedia, researchDirections });
  } catch (err) {
    console.error("dissertation-recommendations error", err);
    return jsonResponse({ error: "unexpected_error", booksAndMedia: [], researchDirections: [] });
  }
};

export const config = {
  path: "/api/dissertation-recommendations",
};

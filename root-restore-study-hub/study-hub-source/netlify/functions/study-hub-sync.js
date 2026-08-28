import { getStore } from "@netlify/blobs";

// Mirrors the Personal Library Tracker's library.js exactly — same pattern,
// same CORS posture, separate blob store so the two apps' data never mixes.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const store = getStore("study-hub-data");
  const url = new URL(req.url);
  const key = (url.searchParams.get("key") || "").trim();

  if (!key) {
    return new Response(JSON.stringify({ error: "Missing sync key" }), {
      status: 400,
      headers: { "content-type": "application/json", ...CORS_HEADERS },
    });
  }

  if (req.method === "GET") {
    const data = await store.get(key, { type: "json" });
    return new Response(JSON.stringify({ data: data || null }), {
      status: 200,
      headers: { "content-type": "application/json", ...CORS_HEADERS },
    });
  }

  if (req.method === "POST" || req.method === "PUT") {
    const body = await req.json();
    await store.setJSON(key, body);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json", ...CORS_HEADERS },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
};

export const config = {
  path: "/api/study-hub",
};

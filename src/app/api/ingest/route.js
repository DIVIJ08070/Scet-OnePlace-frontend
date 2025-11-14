// app/api/ingest/route.js
import { NextResponse } from "next/server";
import { setPolicy } from "../../components/libs/policyStore";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) console.warn("WARNING: GOOGLE_API_KEY not set.");

const EMBED_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta2";
const EMBED_MODEL = "gemini-2.5-flash"; // change if your project uses a different model

function chunkText(text, maxChars = 1000, overlap = 200) {
  if (typeof text !== "string") text = String(text ?? "");
  maxChars = Number(maxChars) || 1000;
  overlap = Number(overlap) || 200;
  if (maxChars < 200) maxChars = 200;
  if (overlap < 0) overlap = 0;
  if (overlap >= maxChars) overlap = Math.floor(maxChars / 4);

  const chunks = [];
  let start = 0;
  const total = text.length;
  const step = Math.max(1, maxChars - overlap);
  while (start < total) {
    const end = Math.min(total, start + maxChars);
    const c = text.slice(start, end).trim();
    if (c) chunks.push(c);
    start += step;
  }
  return chunks;
}

async function embedBatch(texts) {
  // Google embed endpoint supports a JSON format with "text" inputs.
  // Endpoint: POST https://generativelanguage.googleapis.com/v1beta2/models/{model}:embedText?key=API_KEY
  const url = `${EMBED_ENDPOINT_BASE}/models/${encodeURIComponent(EMBED_MODEL)}:embedText?key=${GOOGLE_API_KEY}`;

  // Request body shape per docs: { "text": "..." } or maybe "instances". We'll send array of inputs as an array of "content" items.
  // Many Google docs show single inputs; to be safe we call sequentially for small batch sizes.
  const results = [];
  for (const t of texts) {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: t })
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Embedding API error: ${resp.status} ${txt}`);
    }
    const json = await resp.json();
    // typical response: { "embedding": { "values": [...] } } or { "outputs": [ { "embedding": [...] } ] }
    // normalize:
    let emb = null;
    if (json?.embedding?.values) emb = json.embedding.values;
    else if (json?.outputs?.[0]?.embedding?.values) emb = json.outputs[0].embedding.values;
    else if (json?.outputs?.[0]?.outputEmbeddings?.[0]?.values) emb = json.outputs[0].outputEmbeddings[0].values;
    else if (json?.data?.[0]?.embedding) emb = json.data[0].embedding; // fallback shapes
    if (!emb) {
      throw new Error("Unexpected embeddings response shape: " + JSON.stringify(json).slice(0, 800));
    }
    results.push(emb);
  }
  return results;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { text, version } = body ?? {};
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    const chunks = chunkText(text, 1000, 200);
    if (!chunks.length) return NextResponse.json({ error: "Chunking produced no chunks." }, { status: 500 });

    // For simplicity and reliability, embed sequentially in small batches
    const BATCH_SIZE = 4;
    const vectors = [];
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await embedBatch(batch);
      for (let j = 0; j < embeddings.length; j++) {
        const idx = i + j;
        vectors.push({
          id: `p-${Date.now()}-${idx}`,
          text: chunks[idx],
          embedding: embeddings[j],
          idx
        });
      }
    }

    // store in memory
    setPolicy(vectors, version ?? `v${Date.now()}`);

    return NextResponse.json({ ok: true, ingestedChunks: vectors.length, version: version ?? `v${Date.now()}` });
  } catch (err) {
    console.error("Ingest error:", err && err.stack ? err.stack : err);
    return NextResponse.json({ error: String(err.message ?? err) }, { status: 500 });
  }
}

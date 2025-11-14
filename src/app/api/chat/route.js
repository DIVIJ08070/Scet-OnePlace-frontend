// app/api/chat/route.js
import { NextResponse } from "next/server";
import { getPolicyChunks } from "@/lib/policyStore";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) console.warn("WARNING: GOOGLE_API_KEY not set.");

const EMBED_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta2";
const EMBED_MODEL = "textembedding-gecko@001"; // change if needed
const CHAT_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta2";
const CHAT_MODEL = "text-bison-001"; // or use a Gemini model id if your project exposes one

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

async function embedTextSingle(text) {
  const url = `${EMBED_ENDPOINT_BASE}/models/${encodeURIComponent(EMBED_MODEL)}:embedText?key=${GOOGLE_API_KEY}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Embedding API error: ${resp.status} ${txt}`);
  }
  const json = await resp.json();
  let emb = null;
  if (json?.embedding?.values) emb = json.embedding.values;
  else if (json?.outputs?.[0]?.embedding?.values) emb = json.outputs[0].embedding.values;
  else if (json?.data?.[0]?.embedding) emb = json.data[0].embedding;
  if (!emb) throw new Error("Unexpected embedding response: " + JSON.stringify(json).slice(0, 800));
  return emb;
}

export async function POST(req) {
  try {
    const { question } = await req.json();
    if (!question || !question.trim()) return NextResponse.json({ error: "No question provided" }, { status: 400 });

    const POLICY_CHUNKS = getPolicyChunks();
    if (!POLICY_CHUNKS || POLICY_CHUNKS.length === 0) {
      return NextResponse.json({ error: "No policy ingested. Use admin to ingest first." }, { status: 400 });
    }

    // 1) embed question
    const qEmb = await embedTextSingle(question);

    // 2) compute similarity with spherical cosine
    const scored = POLICY_CHUNKS.map(c => ({ ...c, score: cosine(qEmb, c.embedding) }));
    scored.sort((a, b) => b.score - a.score);
    const TOP_K = 5;
    const top = scored.slice(0, TOP_K);

    // 3) threshold
    const SCORE_THRESHOLD = 0.68; // tune as needed
    if (!top.length || top[0].score < SCORE_THRESHOLD) {
      return NextResponse.json({ answer: "I don't know based on the provided policy and information.", sources: [] });
    }

    // 4) assemble strict context
    const contextText = top.map((t, i) => `Source ${i + 1} (score=${t.score.toFixed(3)}):\n${t.text}`).join("\n\n---\n\n");
    const systemPrompt = `
You are the SCET OnePlace Assistant. You MUST answer strictly using ONLY the CONTEXT provided below.
- If the user's question cannot be answered from the CONTEXT, respond exactly: "I don't know based on the provided policy and information."
- Do NOT hallucinate or use any external knowledge.
- If you answer, include a single line "Sources: [n]" showing which source numbers you used.
CONTEXT:
${contextText}
`.trim();

    // 5) call Google text generation endpoint
    // Endpoint: POST https://generativelanguage.googleapis.com/v1beta2/models/{model}:generateText?key=API_KEY
    const url = `${CHAT_ENDPOINT_BASE}/models/${encodeURIComponent(CHAT_MODEL)}:generateText?key=${GOOGLE_API_KEY}`;
    const payload = {
      // Many Google SDK examples accept `prompt` or `inputText`. We put our messages into a structured prompt.
      prompt: `${systemPrompt}\n\nUser: ${question}\nAssistant:`,
      // Adjust temperature / maxOutputTokens / safety params as needed
      temperature: 0.0,
      maxOutputTokens: 600
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Generation API error: ${resp.status} ${txt}`);
    }
    const json = await resp.json();
    // Typical response shapes vary: check json.candidates[0].content or json.output or json[...]
    let answer = null;
    if (json?.candidates?.[0]?.content) answer = json.candidates[0].content;
    else if (json?.output?.[0]?.content) answer = json.output[0].content;
    else if (json?.responses?.[0]?.text) answer = json.responses[0].text;
    else answer = JSON.stringify(json).slice(0, 500);

    return NextResponse.json({
      answer: answer.trim(),
      sources: top.map((t, i) => ({ id: t.id, sourceIndex: i + 1, score: t.score }))
    });
  } catch (err) {
    console.error("Chat error:", err && err.stack ? err.stack : err);
    return NextResponse.json({ error: String(err.message ?? err) }, { status: 500 });
  }
}

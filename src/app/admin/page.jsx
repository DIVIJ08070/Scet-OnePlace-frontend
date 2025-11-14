// app/admin/page.jsx
"use client";
import { useState } from "react";

export default function AdminPage() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState(null);

  async function ingest() {
    if (!text.trim()) return setStatus("Paste your policy text first.");
    setStatus("Ingesting...");
    try {
      const resp = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, version: "policy-v1" }),
      });
      const data = await resp.json();
      if (data.ok)
        setStatus(`Ingested ${data.ingestedChunks} chunks (version ${data.version})`);
      else setStatus("Error: " + (data.error || JSON.stringify(data)));
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div className="mt-7 flex justify-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-2xl font-semibold mb-3">Admin — Ingest Policy</h1>
        <p className="text-gray-600 mb-3">
          Paste your policy below and click <b>Ingest</b>. Embeddings will be created server-side.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={18}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-3 flex items-center">
          <button
            onClick={ingest}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ingest Policy
          </button>
          <span className="ml-3 text-sm text-gray-700">{status}</span>
        </div>
      </div>
    </div>
  );
}

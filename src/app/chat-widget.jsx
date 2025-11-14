// app/chat-widget.jsx
"use client";
import { useState } from "react";

export default function ChatWidget() {
  const [q, setQ] = useState("");
  const [history, setHistory] = useState([]);

  async function send() {
    if (!q.trim()) return;
    setHistory(h => [...h, { from: "You", text: q }]);
    const question = q;
    setQ("");

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      const data = await resp.json();
      const botText = data.answer || data.error || "Error";
      setHistory(h => [...h, { from: "Bot", text: botText, sources: data.sources ?? [] }]);
    } catch (err) {
      setHistory(h => [...h, { from: "Bot", text: "Error: " + err.message }]);
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ height: 320, overflowY: "auto", border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
        {history.map((m, i) => (
          <div key={i} style={{ textAlign: m.from === "You" ? "right" : "left", margin: "8px 0" }}>
            <div style={{ display: "inline-block", padding: 8, borderRadius: 6, background: m.from === "You" ? "#e6f7ff" : "#f5f5f5" }}>
              <b>{m.from}:</b> <span dangerouslySetInnerHTML={{ __html: m.text }} />
              {m.sources && m.sources.length ? <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Sources: {m.sources.map(s => s.sourceIndex).join(", ")}</div> : null}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, padding: 8 }} placeholder="Ask something from the policy..." />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}

// api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message in body" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Ceil Copilot. When asked, return JSON only." },
          { role: "user", content: message }
        ],
        temperature: 0.2,
        max_tokens: 700
      })
    });

    const data = await response.json();
    // Try to extract a JSON block inside response text
    const assistant = data.choices?.[0]?.message?.content ?? "";
    const jsonMatch = (assistant || "").match(/\{[\s\S]*\}/);
    let parsed = null;
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[0]); } catch (e) { parsed = null; }
    }

    return res.status(200).json({ raw: assistant, parsed });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

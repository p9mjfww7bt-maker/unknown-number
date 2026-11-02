exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  const respond = (statusCode, payload) => ({ statusCode, headers, body: JSON.stringify(payload) });
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return respond(500, { error: "Gemini is not configured. Add GEMINI_API_KEY in Netlify environment variables, then redeploy." });

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return respond(400, { error: "Invalid request" }); }

  const profile = body.profile || {};
  const history = body.history || [];
  if (!Array.isArray(history) || history.length > 40) return respond(400, { error: "Invalid chat history" });
  const safe = value => typeof value === "string" ? value.slice(0, 300) : "";

  const instructions = `You are playing a fictional character in an interactive supernatural horror story called UNKNOWN NUMBER. This is fictional roleplay, not real contact with a deceased person. Roleplay as the visitor's imagined ${safe(profile.relationship) || "loved one"} named ${safe(profile.name) || "Unknown"}. Their nickname for the visitor is "${safe(profile.nickname)}". Personality: ${safe(profile.personality)}. Shared memory supplied by visitor: ${safe(profile.memory)}. Reply naturally in the language the visitor uses: English, Filipino/Tagalog, or Taglish. Mirror their language and formality. Be warm, believable, emotionally responsive, and conversational. Keep most replies to 1–3 sentences. Respond to the actual meaning of each message; do not use generic repeated fallback lines or force the supplied memory into unrelated replies. Do not invent specific shared memories or facts. You may refer naturally to the supplied memory when relevant. Ask a gentle follow-up only when it fits. Do not reveal the horror twist. If the visitor asks about death, respond briefly and evasively; the website separately detects common death questions and triggers its ending. Never claim to actually be a deceased person and never provide instructions for harm.`;

  const contents = history.slice(-20).map(message => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: String(message.content || "").slice(0, 1200) }]
  })).filter(message => message.parts[0].text.trim());

  if (!contents.length || contents[contents.length - 1].role !== "user") return respond(400, { error: "A user message is required" });

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions }] },
        contents,
        generationConfig: { temperature: 0.85, maxOutputTokens: 220 }
      })
    });
    const data = await result.json();
    if (!result.ok) {
      console.error("Gemini API error:", data.error?.message || result.status);
      return respond(502, { error: "Gemini could not generate a reply. Check the API key and model settings." });
    }
    const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
    if (!reply) return respond(502, { error: "Gemini returned an empty reply. Please try again." });
    return respond(200, { reply });
  } catch (error) {
    console.error("Gemini connection error:", error);
    return respond(500, { error: "Unable to reach Gemini right now." });
  }
};

// AI proxy — currently using Groq (free tier, 14,400 req/day)
// To switch back to Gemini: set USE_GEMINI=true in Vercel env vars
// To switch to OpenRouter: set USE_OPENROUTER=true in Vercel env vars

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, max_tokens } = req.body;
  const prompt = messages.map(m => m.content).join('\n\n');

  // ── GROQ (default — fastest, most generous free tier) ─────────────────────
  if (!process.env.USE_GEMINI && !process.env.USE_OPENROUTER) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: max_tokens || 300,
          temperature: 0.9,
        }),
      });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Groq error' });
      const text = data.choices?.[0]?.message?.content || '';
      return res.status(200).json({ content: [{ type: 'text', text }] });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── GEMINI (set USE_GEMINI=true in Vercel env vars to use this) ────────────
  if (process.env.USE_GEMINI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: max_tokens || 300, temperature: 0.9 },
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Gemini error' });
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return res.status(200).json({ content: [{ type: 'text', text }] });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── OPENROUTER (set USE_OPENROUTER=true in Vercel env vars to use this) ────
  if (process.env.USE_OPENROUTER) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://fate-weaver.vercel.app',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-3b-instruct:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: max_tokens || 300,
          temperature: 0.9,
        }),
      });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'OpenRouter error' });
      const text = data.choices?.[0]?.message?.content || '';
      return res.status(200).json({ content: [{ type: 'text', text }] });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

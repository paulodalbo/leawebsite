// Cloudflare Pages Function -> route: /generate-caption
export async function onRequestPost({ request, env }) {
  try {
    const { prompt } = await request.json();
    const apiKey = env.ANTHROPIC_API_KEY;

    if (!apiKey) return json({ error: 'Server missing ANTHROPIC_API_KEY. Add it in Cloudflare > Settings > Environment variables.' }, 500);
    if (!prompt) return json({ error: 'Missing prompt' }, 400);

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!r.ok) {
      const e = await r.json();
      return json({ error: `${r.status}: ${e.error?.message || 'Claude API error'}` }, r.status);
    }

    const d = await r.json();
    return json({ content: d.content[0].text });
  } catch (e) {
    return json({ error: e.message || 'Server error' }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

// Cloudflare Pages Function -> route: /update-content
export async function onRequestPost({ request, env }) {
  const token = env.GITHUB_TOKEN;
  const repo = env.GITHUB_REPO || 'paulodalbo/leawebsite';
  const branch = env.GITHUB_BRANCH || 'main';

  if (!token) return json({ error: 'Server missing GITHUB_TOKEN. Add it in Cloudflare > Settings > Environment variables.' }, 500);

  try {
    const { content } = await request.json();
    if (!content || typeof content !== 'object') return json({ error: 'Missing content' }, 400);

    const apiBase = `https://api.github.com/repos/${repo}/contents/content.json`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'lea-hub'
    };

    // Current file SHA + existing content (needed to update + merge)
    const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
    let sha, existing = {};
    if (getRes.ok) {
      const file = await getRes.json();
      sha = file.sha;
      try { existing = JSON.parse(atob(file.content)); } catch (e) { existing = {}; }
    }

    // Merge so a partial submit never wipes other fields
    const merged = { ...existing, ...content };
    const newContent = toBase64(JSON.stringify(merged, null, 2) + '\n');

    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Update site content via Hub',
        content: newContent,
        branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return json({ error: err.message || 'GitHub update failed' }, putRes.status);
    }

    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message || 'Server error' }, 500);
  }
}

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

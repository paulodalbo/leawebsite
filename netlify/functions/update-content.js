exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'paulodalbo/leawebsite';
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server missing GITHUB_TOKEN. Add it in Netlify > Environment variables.' }) };
  }

  try {
    const { content } = JSON.parse(event.body);
    if (!content || typeof content !== 'object') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing content' }) };
    }

    const apiBase = `https://api.github.com/repos/${repo}/contents/content.json`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'lea-hub'
    };

    // Get current file SHA (required to update)
    const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
    let sha;
    if (getRes.ok) {
      sha = (await getRes.json()).sha;
    }

    const newContent = Buffer.from(JSON.stringify(content, null, 2) + '\n').toString('base64');

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
      return { statusCode: putRes.status, body: JSON.stringify({ error: err.message || 'GitHub update failed' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Server error' }) };
  }
};

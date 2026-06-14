// LEA HUB — Copy Generator & Social Manager

const HUB_PASSWORD = 'nina3323';

// Check password on load
window.addEventListener('DOMContentLoaded', () => {
  const isAuthenticated = sessionStorage.getItem('hubAuthenticated');
  if (!isAuthenticated) {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('hubContent').style.display = 'none';
  } else {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('hubContent').style.display = 'block';
    initHub();
  }

  // Allow Enter key to submit password
  document.getElementById('passwordInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginHub();
  });
});

window.loginHub = function() {
  const password = document.getElementById('passwordInput').value;
  if (password === HUB_PASSWORD) {
    sessionStorage.setItem('hubAuthenticated', 'true');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('hubContent').style.display = 'block';
    initHub();
  } else {
    alert('❌ Incorrect password');
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
};

window.logoutHub = function() {
  sessionStorage.removeItem('hubAuthenticated');
  location.reload();
};

function initHub() {
  // API key is no longer handled in the browser — it lives securely
  // as a Netlify environment variable (ANTHROPIC_API_KEY).

  // Navigation
document.querySelectorAll('.hub-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;

    // Update active button
    document.querySelectorAll('.hub-nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update active section
    document.querySelectorAll('.hub-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section).classList.add('active');
  });
});

// Copy Generator
const generateBtn = document.getElementById('generateBtn');
const copyResults = document.getElementById('copyResults');

// --- Daily usage limit (per browser) ---
const DAILY_LIMIT = 30;

function getUsage() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let data;
  try { data = JSON.parse(localStorage.getItem('hubUsage')); } catch (e) { data = null; }
  if (!data || data.date !== today) {
    data = { date: today, count: 0 };
  }
  return data;
}

function getRemaining() {
  return Math.max(0, DAILY_LIMIT - getUsage().count);
}

function incrementUsage() {
  const data = getUsage();
  data.count += 1;
  localStorage.setItem('hubUsage', JSON.stringify(data));
  updateUsageDisplay();
}

function updateUsageDisplay() {
  const el = document.getElementById('usageCounter');
  if (el) el.textContent = `${getRemaining()} of ${DAILY_LIMIT} generations left today`;
}

generateBtn.addEventListener('click', async () => {
  const serviceType = document.getElementById('serviceType').value;
  const platform = document.getElementById('platform').value;
  const briefing = document.getElementById('briefing').value;
  const tone = document.getElementById('tone').value;
  const cta = document.getElementById('cta').value;

  if (!serviceType || !briefing.trim()) {
    alert('Please select a service and write your briefing.');
    return;
  }

  // Enforce daily limit
  if (getRemaining() <= 0) {
    copyResults.innerHTML = `<div class="empty-state" style="color: #C57F6A;"><p>Daily limit reached</p><p style="font-size:.9rem;">You've used all ${DAILY_LIMIT} generations for today. Please come back tomorrow.</p></div>`;
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span class="loading-spinner"></span>Generating...';
  copyResults.innerHTML = '';

  try {
    const prompt = buildPrompt(serviceType, platform, briefing, tone, cta);
    const captions = await generateCaptions(prompt);
    displayResults(captions);
    incrementUsage(); // only count successful generations
  } catch (error) {
    copyResults.innerHTML = `<div class="empty-state" style="color: #C57F6A;"><p>Error: ${error.message}</p></div>`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = 'Generate Captions';
  }
});

function buildPrompt(serviceType, platform, briefing, tone, cta) {
  const platformContext = {
    'instagram': 'Instagram post (2200 char limit)',
    'instagram-story': 'Instagram Story caption (short & catchy)',
    'tiktok': 'TikTok caption (hook + message)'
  }[platform];

  const ctaText = {
    'book': 'Call to action: "Book a session"',
    'learn': 'Call to action: "Learn more"',
    'dm': 'Call to action: "DM me"',
    'link': 'Call to action: "Link in bio"',
    'none': 'No call to action needed'
  }[cta];

  return `Write 2 ${platformContext} captions. English only.
Service: ${serviceType}. Brief: ${briefing}. Tone: ${tone}. ${ctaText}.
Warm, healing voice. A few subtle emojis. ${platform.startsWith('instagram') ? '8-12 English hashtags on a new line.' : 'Hook first line.'}

Format exactly:
CAPTION 1:
[text]
[hashtags]

CAPTION 2:
[text]
[hashtags]`;
}

async function generateCaptions(prompt) {
  try {
    // Call Netlify Function instead of API directly
    const response = await fetch('/generate-caption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate captions');
    }

    const data = await response.json();
    const text = data.content;

    // Parse captions from response
    return parseCaputions(text);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

function parseCaputions(text) {
  const captions = [];
  const sections = text.split(/CAPTION \d+:/);

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i].trim();
    const parts = section.split(/(?=^[#\s]*#)/m);

    let caption = parts[0].trim();
    let hashtags = '';

    if (parts.length > 1) {
      hashtags = parts.slice(1).join('').trim();
    }

    captions.push({ caption, hashtags });
  }

  return captions;
}

function displayResults(captions) {
  copyResults.innerHTML = '';

  if (captions.length === 0) {
    copyResults.innerHTML = '<div class="empty-state"><p>No captions generated. Try again.</p></div>';
    return;
  }

  captions.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'result-card';

    let hashtagsHtml = '';
    if (item.hashtags) {
      const tags = item.hashtags.match(/#[\w]+/g) || [];
      hashtagsHtml = `<div class="result-hashtags">${tags.map(tag => `<span>${tag}</span>`).join('')}</div>`;
    }

    card.innerHTML = `
      <h3>Option ${index + 1}</h3>
      <div class="result-copy">${escapeHtml(item.caption)}</div>
      ${hashtagsHtml}
      <button class="copy-btn" type="button">Copy Caption</button>
    `;

    // Attach the click handler directly so caption text (quotes, line
    // breaks, etc.) can never break an inline onclick string.
    const btn = card.querySelector('.copy-btn');
    btn.addEventListener('click', () => copyCaptionToClipboard(btn, item.caption, item.hashtags));

    copyResults.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyCaptionToClipboard(btn, caption, hashtags) {
  const fullText = hashtags ? `${caption}\n\n${hashtags}` : caption;

  const showCopied = () => {
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy Caption';
      btn.classList.remove('copied');
    }, 2000);
  };

  // Modern API (needs HTTPS — which Netlify provides)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText).then(showCopied).catch(() => fallbackCopy(fullText, showCopied));
  } else {
    fallbackCopy(fullText, showCopied);
  }
}

function fallbackCopy(text, onSuccess) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    onSuccess();
  } catch (e) {
    alert('Could not copy automatically. Please select and copy manually.');
  }
  document.body.removeChild(ta);
}

  // --- Website Manager ---
  const publishBtn = document.getElementById('publishBtn');
  const publishStatus = document.getElementById('publishStatus');
  const fields = () => document.querySelectorAll('#website [data-field]');

  // Load current content into the form
  fetch('/content.json?v=' + Date.now()).then(r => r.ok ? r.json() : {}).then(c => {
    fields().forEach(el => { if (c[el.dataset.field] != null) el.value = c[el.dataset.field]; });
  }).catch(() => {});

  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {
      const content = {};
      fields().forEach(el => { content[el.dataset.field] = el.value; });

      publishBtn.disabled = true;
      publishBtn.innerHTML = '<span class="loading-spinner"></span>Publishing...';
      publishStatus.textContent = '';

      try {
        const res = await fetch('/update-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Publish failed');
        publishStatus.style.color = '#5a7d3a';
        publishStatus.textContent = '✓ Published! Live in ~1 minute.';
      } catch (e) {
        publishStatus.style.color = '#C57F6A';
        publishStatus.textContent = 'Error: ' + e.message;
      } finally {
        publishBtn.disabled = false;
        publishBtn.innerHTML = 'Publish to website';
      }
    });
  }

  // Show today's remaining generations (after all consts are initialized)
  updateUsageDisplay();

  console.log('✦ Lea Hub loaded. Ready to generate amazing captions!');
}

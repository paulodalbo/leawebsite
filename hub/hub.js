// LEA HUB — Copy Generator & Social Manager

const HUB_PASSWORD = 'nina3323';

// ===== BRAND IDENTITY (shared by all generators) =====
const BRAND_VOICE = `BRAND: Lea — biomagnetic pair therapy. In person on the Gold Coast (Australia) and online worldwide.
WHO: Lea is a certified biomagnetism practitioner. Sessions are gentle, unhurried, deeply personal. Magnets are always placed in pairs on points found during a personal scan. No needles, no pressure, fully clothed.
VOICE: warm, calm, reassuring, grounded, sensory. Speaks like a trusted, caring practitioner — never hypey, never salesy, never clickbait. Quiet confidence over excitement.
LANGUAGE RULES: complementary wellness, NOT medical claims. Never promise to cure or treat disease. Words like "support", "balance", "calm", "ease", "rest" — not "heal disease" or "fix".
ALWAYS sounds like Lea: soothing, human, a little poetic, deeply respectful of the reader's body and time.`;

const BRAND_VISUAL = `VISUAL BRAND for Lea — BIOMAGNETISM / MAGNET PAIR THERAPY (terapia de ímãs). Gold Coast & online.

WHAT THE THERAPY ACTUALLY LOOKS LIKE (depict it accurately):
- Small, smooth, round/disc medium-strength magnets — placed in MATCHED PAIRS on the body (commonly one black/dark and one red/terracotta magnet per pair).
- The client is calm, fully clothed, resting on a treatment bed or relaxing — magnets rest gently on skin or clothing (e.g. forearm, hand, ankle, back, chest area). No needles, no machines, no wires.
- The practitioner (Lea) places the magnets by hand, unhurried and gentle.
- Settings: a warm, private, homely studio; or a peaceful online/home setting.
- It is COMPLEMENTARY WELLNESS, not hospital medicine.

VISUAL STYLE:
- Mood: serene, warm, editorial wellness, stillness, natural light, intimate and calming.
- Palette: soft cream/paper (#FCFAF5), warm sand & linen, muted gold (#BC9C6A), gentle clay/terracotta (#C57F6A), soft dusk blue (#8AA3BF), warm taupe browns. Low saturation, warm neutrals.
- Light: soft diffused natural daylight, golden warmth, gentle shadows. Never harsh, never neon, never cold clinical.
- Textures: linen, raw cotton, ceramic, warm timber, calm skin, smooth magnets, organic forms.
- Composition: minimal, airy, generous negative space, shallow depth of field, calm and uncluttered.

AVOID (important): giant horseshoe/U magnets, industrial/sci-fi magnets, glowing or floating magnets, metal filings, clinical hospital/MRI look, lab coats, needles, machines, stock-corporate vibe, busy backgrounds, harsh flash, oversaturated colors, any text/logos/watermarks.`;

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
  const language = document.getElementById('language').value;
  const length = document.getElementById('length').value;
  const audience = document.getElementById('audience').value;
  const emojis = document.getElementById('emojis').value;

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
    const prompt = buildPrompt({ serviceType, platform, briefing, tone, cta, language, length, audience, emojis });
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

function buildPrompt({ serviceType, platform, briefing, tone, cta, language, length, audience, emojis }) {
  const platformContext = {
    'instagram': 'Instagram feed post (max ~2200 chars)',
    'instagram-story': 'Instagram Story caption (short, punchy)',
    'tiktok': 'TikTok caption (strong hook first line)'
  }[platform];

  const ctaText = {
    'book': 'End with a soft invitation to book a session.',
    'dm': 'End by inviting them to DM Lea.',
    'link': 'End by pointing to the link in bio.',
    'whatsapp': 'End by inviting them to message Lea on WhatsApp.',
    'learn': 'End with a gentle "learn more" nudge.',
    'save': 'End by inviting them to save the post for later.',
    'none': 'No call to action.'
  }[cta];

  const lengthText = {
    'short': 'Keep each caption to 1–2 short lines.',
    'medium': 'Medium length — a few sentences.',
    'long': 'Longer, storytelling style — a small narrative that draws the reader in.'
  }[length];

  const emojiText = {
    'subtle': 'Use a few subtle, tasteful emojis.',
    'none': 'Do not use any emojis.',
    'expressive': 'Use expressive emojis (still tasteful, on-brand).'
  }[emojis];

  const hashLine = platform.startsWith('instagram')
    ? `Add 8–12 relevant hashtags in ${language} on a new line (well-formed, no typos, no other languages mixed in).`
    : 'No hashtags. Make the first line a scroll-stopping hook.';

  return `${BRAND_VOICE}

TASK: Write 2 distinct ${platformContext} captions in ${language}.
Topic/service: ${serviceType}.
Brief from Lea: ${briefing}.
${audience && audience.trim() ? `Speak to this audience: ${audience.trim()}.` : ''}
Tone: ${tone} (always within Lea's brand voice above).
${lengthText} ${emojiText} ${ctaText}
${hashLine}
Make the two options genuinely different in angle. Stay true to the brand voice — no medical claims, no hype.

Format your reply EXACTLY like this and nothing else:
CAPTION 1:
[caption text]
[hashtags line if Instagram]

CAPTION 2:
[caption text]
[hashtags line if Instagram]`;
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

  const original = btn.textContent;
  const showCopied = () => {
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = original;
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

  // --- Image Prompt Generator ---
  const imageBtn = document.getElementById('imageBtn');
  const imageResults = document.getElementById('imageResults');

  if (imageBtn) {
    imageBtn.addEventListener('click', async () => {
      const subject = document.getElementById('img_subject').value.trim();
      const format = document.getElementById('img_format').value;
      const tool = document.getElementById('img_tool').value;
      const mood = document.getElementById('img_mood').value.trim();

      if (!subject) { alert('Describe what the image should show.'); return; }
      if (getRemaining() <= 0) {
        imageResults.innerHTML = `<div class="empty-state" style="color:#C57F6A;"><p>Daily limit reached</p></div>`;
        return;
      }

      imageBtn.disabled = true;
      imageBtn.innerHTML = '<span class="loading-spinner"></span>Generating...';
      imageResults.innerHTML = '';

      const prompt = `${BRAND_VISUAL}

TASK: Write 2 ready-to-paste image-generation prompts for ${tool}, for Lea's BIOMAGNETISM / magnet pair therapy practice — both faithful to the visual brand AND to how this therapy really looks (see above).
Subject the client wants: ${subject}.
Format/aspect: ${format}.
${mood ? `Desired mood: ${mood}.` : ''}
Each prompt must: describe the scene, subject, lighting, palette, textures, composition and aspect — fully on-brand (warm, calm, natural light, soft neutrals) and accurate to magnet pair therapy. If magnets appear, they are small smooth discs in matched pairs on a clothed, relaxed body — never giant/industrial/sci-fi magnets. No text/logos in the image. Photorealistic, editorial wellness style.
Give 2 different takes. Format EXACTLY:
PROMPT 1:
[the full prompt]

PROMPT 2:
[the full prompt]`;

      try {
        const res = await fetch('/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed');
        const text = (await res.json()).content;
        const parts = text.split(/PROMPT \d+:/).map(s => s.trim()).filter(Boolean);
        imageResults.innerHTML = '';
        parts.forEach((p, i) => {
          const card = document.createElement('div');
          card.className = 'result-card';
          card.innerHTML = `<h3>Prompt ${i + 1}</h3><div class="result-copy">${escapeHtml(p)}</div><button class="copy-btn" type="button">Copy prompt</button>`;
          const b = card.querySelector('.copy-btn');
          b.addEventListener('click', () => copyCaptionToClipboard(b, p, ''));
          imageResults.appendChild(card);
        });
        incrementUsage();
      } catch (e) {
        imageResults.innerHTML = `<div class="empty-state" style="color:#C57F6A;"><p>Error: ${e.message}</p></div>`;
      } finally {
        imageBtn.disabled = false;
        imageBtn.innerHTML = 'Generate Image Prompt';
      }
    });
  }

  // Show today's remaining generations (after all consts are initialized)
  updateUsageDisplay();

  console.log('✦ Lea Hub loaded. Ready to generate amazing captions!');
}

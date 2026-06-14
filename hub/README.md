# ✦ Lea Hub — Website & Instagram Manager

Your all-in-one content creation and management hub for your biomagnetism practice.

## 🚀 Quick Start

1. **Get your Claude API Key** (free tier available):
   - Go to https://console.anthropic.com/account/keys
   - Create a new API key
   - Copy it

2. **Open the Hub**:
   - Open `hub/dashboard.html` in your browser
   - Paste your API key when prompted
   - Start generating content!

## 📋 Features (MVP)

### ✅ Copy Generator (Live)
- **Service-based templates** — Select from biomagnetism sessions, online services, testimonials, etc.
- **Multi-platform support** — Instagram, Instagram Stories, TikTok
- **Smart tone selection** — Warm, Professional, Playful, Healing
- **Auto-generated hashtags** — Optimized for Instagram
- **One-click copy** — Copy captions directly to clipboard

**How to use:**
1. Select a service type (e.g., "Biomagnetism Session")
2. Write your briefing (e.g., "Spring package, energy & calm focus, book by Friday")
3. Choose tone and call-to-action
4. Click "Generate Captions"
5. Pick your favorite and copy!

### 🔨 Coming Soon
- **Website Manager** — Edit your site content without touching code
- **Instagram Sync** — View recent posts, analytics, and schedule new ones
- **Content Calendar** — Plan your week visually
- **Analytics Dashboard** — Track engagement and best posting times

---

## 🔧 Technical Details

**Stack:**
- Pure HTML/CSS/JavaScript (no build required)
- Claude API (via Anthropic)
- Browser localStorage (for API key)

**File structure:**
```
hub/
├── dashboard.html    # Main UI
├── hub.js            # All logic
└── README.md         # This file
```

**API Usage:**
- Uses `claude-3-5-sonnet` model
- ~500 tokens per caption generation
- Safe for testing (you control costs)

---

## 💡 Tips

- **Save your API key** — It's stored locally in your browser (never sent anywhere else)
- **Experiment with tone** — Try different tones to find Lea's voice
- **Reuse good briefings** — Copy successful posts' structure for consistency
- **Test captions on a friend** — Before posting to Instagram

---

## 🐛 Troubleshooting

**"API key required"**
- Make sure you've generated a valid API key from Anthropic
- Try clearing browser cache and refreshing

**"Failed to generate captions"**
- Check if your API key is valid
- Make sure you have credits on your Anthropic account
- Try a shorter briefing

**Captions look weird**
- This is Claude learning your style — feedback improves it
- Add more specific instructions in the briefing

---

## 🔐 Security Note

Your API key is stored **only in your browser's localStorage**. It's never sent to any external server (except Anthropic's official API). If you want to use this on a shared computer, clear your browser data after.

---

## 📞 Next Steps

1. **Test the Copy Generator** — Generate 5-10 captions and feel the vibe
2. **Feedback** — What's missing? What works?
3. **Instagram Integration** — Once you love the copy generator, we add Instagram sync
4. **Automation** — Schedule posts directly from the hub

---

Enjoy! ✦

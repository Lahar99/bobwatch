# BobWatch

BobWatch was built entirely using IBM Bob at the IBM Bob Hackathon 2026. It is the safety layer every Bob user needs.

## 🎯 Tagline

**IBM Bob builds fast. BobWatch keeps it honest.**

---

## 🚨 The Problem

When you ask IBM Bob to build something, it ships code at lightning speed. But how do you know Bob didn't sneak in unintended changes, security vulnerabilities, or collateral damage? BobWatch analyzes GitHub Pull Requests to verify if the code matches your original intent, categorizing every change as **Intended**, **Collateral**, or **Risky**.

---

## ⚡ How It Works

- **Paste a GitHub PR URL** - BobWatch fetches the complete diff from any public repository
- **Describe your original intent** - Tell us what you asked Bob (or any developer) to build
- **Get instant AI analysis** - Gemini 2.5 Flash categorizes every file change and calculates your Trust Reality Delta (TRD) score

---

## 📊 TRD Score Explained

The **Trust Reality Delta (TRD)** score quantifies the gap between what you asked for and what actually got built:

```javascript
// Start at 100% trust
let score = 100;

// Each risky file reduces trust by 20%
score -= (riskyFiles.length * 20);

// Each collateral file reduces trust by 5%
score -= (collateralFiles.length * 5);

// Final score clamped between 0-100
```

**Score Interpretation:**
- **90-100%** - Excellent alignment, ship it
- **70-89%** - Good with minor side effects
- **50-69%** - Moderate concerns, review carefully
- **0-49%** - Major issues detected, do not merge

---

## 🛠️ Tech Stack

- **IBM Bob** - Built the entire application
- **Next.js 14** - React framework with App Router
- **Gemini 2.5 Flash** - AI-powered code analysis
- **GitHub API** - Pull request diff extraction
- **Vercel** - Production deployment

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key
Create `.env.local` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

Get your key at [Google AI Studio](https://aistudio.google.com/app/apikey)

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel
```bash
vercel
```

Add `GEMINI_API_KEY` as an environment variable in your Vercel project settings.

---

## 📝 Bob Session Logs

See `/bob_sessions` for complete IBM Bob development logs showing how this entire application was built from scratch in 24 hours.

---

## 👥 Team: One More Prompt

Built by two engineering students from Bangalore who shipped BobWatch in 24 hours using IBM Bob:

- **Chinmay** - Full-stack development, AI integration
- **Partner** - Architecture, deployment, testing

**Hackathon:** IBM Bob Hackathon 2026  
**Build Time:** 24 hours  
**Lines of Code Written by Humans:** ~50  
**Lines of Code Written by Bob:** ~2000+

---

**Made with IBM Bob** 🤖

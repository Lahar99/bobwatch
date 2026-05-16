# 🔍 BobWatch - Trust What Bob Built

BobWatch is an AI-powered code review tool that analyzes GitHub Pull Requests to verify if changes match your original intent. It uses Google Gemini 2.5 Flash to categorize code changes as **Intended**, **Collateral**, or **Risky**, providing a Trust Reality Delta (TRD) score.

## 🌐 Live Demo

**Try it now:** [https://bobwatch.vercel.app/](https://bobwatch.vercel.app/)

The app is fully deployed and ready to analyze any public GitHub Pull Request!

---

## 📊 Project Status

**Status:** ✅ **LIVE & PRODUCTION READY**

**Latest Updates:**
- ✅ Fully deployed on Vercel
- ✅ Gemini 2.5 Flash integration working
- ✅ GitHub API integration complete
- ✅ TRD scoring algorithm implemented
- ✅ Beautiful animated UI with loading states
- ✅ Comprehensive error handling
- ✅ Real-time PR analysis functional

**Try it now:** [https://bobwatch.vercel.app/](https://bobwatch.vercel.app/)

---

##  Features

- **AI-Powered Analysis** - Uses Gemini 2.5 Flash for intelligent code review
- **GitHub Integration** - Analyzes any public GitHub Pull Request
- **Security Focus** - Identifies risky changes with detailed explanations
- **TRD Score** - Quantifies trust between intent and reality (0-100%)
- **Beautiful Dashboard** - Clean, animated results display
- **Real-time Processing** - Fast analysis with loading states

---

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Gemini API Key** - Get yours at [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Open `.env.local` and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** Never commit `.env.local` to version control (already in `.gitignore`)

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 How to Use

### Step 1: Enter GitHub PR URL
Paste a GitHub Pull Request URL in the format:
```
https://github.com/owner/repository/pull/123
```

**Example URLs to try:**
- `https://github.com/facebook/react/pull/28000`
- `https://github.com/vercel/next.js/pull/60000`
- `https://github.com/microsoft/vscode/pull/200000`

### Step 2: Describe Your Intent
Enter what you originally told Bob (or the developer) to do:
```
"Add a login page with JWT authentication"
"Refactor the database connection logic"
"Fix the memory leak in the image processor"
```

### Step 3: Analyze
Click **"ANALYZE WITH BOBWATCH"** and wait for the AI analysis (typically 5-15 seconds).

### Step 4: Review Results
The dashboard shows:
- **TRD Score** (0-100%) - Higher is better
- **🚨 RISKY** - Security vulnerabilities or dangerous changes
- **⚠️ COLLATERAL** - Unintended side effects
- **✅ INTENDED** - Changes that match your intent

---

## 🏗️ Architecture

```
Frontend (Next.js)
    ↓
POST /api/analyze
    ↓
GitHub API (fetch PR diff)
    ↓
Gemini 2.5 Flash (AI analysis)
    ↓
TRD Score Calculation
    ↓
Results Dashboard
```

### Key Components

- **`app/page.js`** - Main input form
- **`app/results/page.js`** - Results dashboard
- **`app/api/analyze/route.js`** - Core analysis logic
- **`app/api/demo/route.js`** - Demo endpoint (fallback)

---

## 🔐 Security

### API Key Protection
- ✅ Stored in `.env.local` (server-side only)
- ✅ Never exposed to client-side code
- ✅ Excluded from version control

### Input Validation
- ✅ PR URL format validation
- ✅ User intent sanitization
- ✅ Error handling for invalid inputs

### Rate Limiting
- **GitHub API:** 60 requests/hour (unauthenticated)
- **Gemini API:** 15 requests/minute (free tier)

---

## 📊 TRD Score Calculation

```javascript
// Start at 100% trust
let score = 100;

// Each risky file reduces trust by 20%
score -= (riskyFiles.length * 20);

// Each collateral file reduces trust by 5%
score -= (collateralFiles.length * 5);

// Clamp between 0-100
return Math.max(0, Math.min(100, score));
```

### Score Interpretation
- **90-100%** - Excellent alignment, minimal concerns
- **70-89%** - Good alignment with some side effects
- **50-69%** - Moderate concerns, review carefully
- **0-49%** - Significant issues, major review needed

---

## 🎨 Customization

### Modify AI Prompt
Edit the prompt in `app/api/analyze/route.js`:

```javascript
function buildPrompt(userIntent, formattedDiff) {
  return `
Act as a Senior Security Engineer...
  `.trim();
}
```

### Adjust TRD Scoring
Modify weights in `calculateTRDScore()`:

```javascript
score -= (risky.length * 20);      // Change 20 to adjust risky weight
score -= (collateral.length * 5);  // Change 5 to adjust collateral weight
```

### Change AI Model
Update model name in `app/api/analyze/route.js`:

```javascript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',  // Change model here
  generationConfig: {
    responseMimeType: 'application/json'
  }
});
```

---

## 🐛 Troubleshooting

### "Gemini API key not configured"
- Check that `.env.local` exists
- Verify `GEMINI_API_KEY` is set correctly
- Restart the dev server after adding the key

### "Invalid GitHub PR URL"
- Ensure URL format: `https://github.com/owner/repo/pull/123`
- Check that the PR exists and is public
- Try a different PR URL

### "GitHub API rate limit exceeded"
- Wait 1 hour for rate limit reset
- Or add `GITHUB_TOKEN` to `.env.local` for higher limits

### "Failed to parse AI response"
- The AI returned invalid JSON
- Try again with a different PR
- Check Gemini API status

---

## 📦 Deployment

### ✅ Live on Vercel

**Production URL:** [https://bobwatch.vercel.app/](https://bobwatch.vercel.app/)

The app is currently deployed and running on Vercel with:
- ✅ Gemini 2.5 Flash AI integration
- ✅ GitHub PR analysis
- ✅ Real-time TRD scoring
- ✅ Beautiful animated dashboard
- ✅ Full error handling

### Deploy Your Own

#### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your API key
4. Deploy!

#### Other Platforms

Set the `GEMINI_API_KEY` environment variable in your platform's settings.

---

## 🧪 Testing

### Test with Demo API
Navigate to `/results` directly to see demo data without making API calls.

### Test API Endpoint
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": "https://github.com/facebook/react/pull/28000",
    "userIntent": "Add new feature"
  }'
```

### Check API Status
```bash
curl http://localhost:3000/api/analyze
```

---

## 📚 API Documentation

### POST `/api/analyze`

**Request:**
```json
{
  "githubUrl": "https://github.com/owner/repo/pull/123",
  "userIntent": "What you told Bob to do"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "score": 78,
    "risky": [
      {
        "filename": "src/auth/login.js",
        "explanation": "Security vulnerability explanation"
      }
    ],
    "collateral": [...],
    "intended": [...]
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use this project however you'd like!

---

## 🙏 Credits

- **AI Model:** Google Gemini 2.5 Flash
- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **Built with:** Bob (AI coding assistant)

---

## 📞 Support

Having issues? Check:
1. [Troubleshooting](#-troubleshooting) section above
2. [API Documentation](#-api-documentation)
3. [Implementation Plan](IMPLEMENTATION_PLAN.md)
4. [API Specification](API_SPECIFICATION.md)

---

## 🎯 Roadmap

### ✅ Completed
- [x] Core AI analysis with Gemini 2.5 Flash
- [x] GitHub PR integration
- [x] TRD scoring algorithm
- [x] Beautiful animated dashboard
- [x] Production deployment on Vercel
- [x] Error handling and validation
- [x] Real-time loading states

### 🚧 Planned Features
- [ ] Support for private repositories (GitHub token auth)
- [ ] Commit URL support (not just PRs)
- [ ] Multiple AI model options
- [ ] Export results as PDF/Markdown
- [ ] Historical analysis tracking
- [ ] Team collaboration features
- [ ] Custom scoring weights
- [ ] Webhook integration
- [ ] Browser extension
- [ ] CLI tool

---

**Made with ❤️ and Bob**

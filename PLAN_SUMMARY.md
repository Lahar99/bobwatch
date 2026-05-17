# BobWatch Gemini Integration - Plan Summary

## 🎯 Goal
<<<<<<< HEAD
Integrate Google Gemini 2.5 Flash AI to analyze GitHub Pull Request changes against user intent with real AI-powered analysis.
=======
Integrate Google Gemini 2.5 Flash AI to analyze GitHub Pull Request changes against user intent, replacing the mock `/api/demo` endpoint with real AI-powered analysis.
>>>>>>> 4cf9263e733633d37503ac1b36a58b53350f7f09

---

## 📋 What We're Building

### Current State
- ✅ Frontend UI complete ([`app/page.js`](app/page.js), [`app/results/page.js`](app/results/page.js))
<<<<<<< HEAD
- ✅ Real Gemini 2.5 Flash integration
- ✅ GitHub PR diff fetching
- ✅ Security-focused AI analysis
- ✅ Dashboard displays real AI analysis data
=======
- ✅ Mock API endpoint working ([`/api/demo`](app/api/demo/route.js))
- ✅ Dashboard displays mock data beautifully
- ❌ No real AI analysis yet

### Target State
- ✅ Real Gemini 2.5 Flash integration
- ✅ GitHub PR diff fetching
- ✅ Security-focused AI analysis
- ✅ Same beautiful dashboard, real data
>>>>>>> 4cf9263e733633d37503ac1b36a58b53350f7f09

---

## 🏗️ Architecture

```
User Input (PR URL + Intent)
    ↓
Frontend (app/page.js)
    ↓
POST /api/analyze
    ↓
Parse PR URL → Fetch GitHub Diff → Build AI Prompt
    ↓
Gemini 2.5 Flash API
    ↓
Parse Response → Calculate TRD Score
    ↓
<<<<<<< HEAD
Return JSON with analysis results
=======
Return JSON (same format as /api/demo)
>>>>>>> 4cf9263e733633d37503ac1b36a58b53350f7f09
    ↓
Display Results (app/results/page.js)
```

---

## 📦 Dependencies

### New Package Required
```bash
npm install @google/generative-ai
```

### Environment Variable
```env
# .env.local (create this file)
GEMINI_API_KEY=your_api_key_here
```

---

## 🔧 Files to Modify

### 1. **Create `.env.local`** (NEW)
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. **Update [`app/api/analyze/route.js`](app/api/analyze/route.js)** (MAJOR CHANGES)
**Current:** Placeholder with TODO comments  
**New:** Full Gemini integration with:
- PR URL parsing
- GitHub API calls
- Gemini prompt engineering
- TRD score calculation
- Error handling

### 3. **Update [`app/page.js`](app/page.js)** (MINOR CHANGES)
**Current:** Mock navigation after delay  
**New:** Real API call to `/api/analyze`
```javascript
// Replace this:
await new Promise(resolve => setTimeout(resolve, 1500));
router.push('/results');

// With this:
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ githubUrl: repoUrl, userIntent: instructions })
});
const result = await response.json();
sessionStorage.setItem('analysisResult', JSON.stringify(result.data));
router.push('/results');
```

### 4. **Update [`app/results/page.js`](app/results/page.js)** (MINOR CHANGES)
<<<<<<< HEAD
**Current:** Reads from sessionStorage
**Implementation:** Displays analysis results from sessionStorage
=======
**Current:** Always fetches from `/api/demo`  
**New:** Check sessionStorage first, fallback to demo
>>>>>>> 4cf9263e733633d37503ac1b36a58b53350f7f09
```javascript
useEffect(() => {
  const storedData = sessionStorage.getItem('analysisResult');
  if (storedData) {
    setData(JSON.parse(storedData));
    sessionStorage.removeItem('analysisResult');
<<<<<<< HEAD
=======
  } else {
    fetchData(); // Fallback to demo API
>>>>>>> 4cf9263e733633d37503ac1b36a58b53350f7f09
  }
}, []);
```

---

## 🎨 Gemini Prompt Design

### Professional Security Engineer Persona
```
Act as a Senior Security Engineer reviewing code changes.

USER INTENT:
{userIntent}

CODE CHANGES:
{formattedDiff}

TASK:
Analyze each modified file and categorize changes into:

1. INTENDED - Changes that directly fulfill the user's stated intent
2. COLLATERAL - Unintended but necessary side effects
3. RISKY - Changes that introduce security vulnerabilities or risks

For RISKY items, explain the EXACT security danger.

OUTPUT FORMAT (JSON):
{
  "risky": [...],
  "collateral": [...],
  "intended": [...]
}
```

---

## 📊 TRD Score Formula

```javascript
// Start at 100% trust
let score = 100;

// Each risky file reduces trust by 20%
score -= (risky.length * 20);

// Each collateral file reduces trust by 5%
score -= (collateral.length * 5);

// Intended files don't affect score (expected)

// Clamp between 0-100
return Math.max(0, Math.min(100, score));
```

### Examples
- **0 risky, 0 collateral, 5 intended** → 100% (Perfect!)
- **1 risky, 2 collateral, 3 intended** → 70% (Good with concerns)
- **3 risky, 5 collateral, 2 intended** → 15% (Major issues)

---

## 🔒 Security Measures

✅ **API Key Protection**
- Stored in `.env.local` (server-side only)
- Already in [`.gitignore`](.gitignore)
- Never exposed to client

✅ **Input Validation**
- Validate PR URL format
- Sanitize user intent
- Limit input length

✅ **Rate Limiting**
- GitHub API: 60 req/hour (unauthenticated)
- Gemini API: 15 req/min (free tier)
- Implement exponential backoff

✅ **Error Handling**
- Graceful degradation
- User-friendly error messages
- Detailed server-side logging

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Valid PR URL returns analysis
- [ ] Invalid PR URL shows error
- [ ] Missing API key shows error
- [ ] GitHub rate limit handled
- [ ] Gemini timeout handled
- [ ] Results display correctly
- [ ] Score animation works
- [ ] Card animations work
- [ ] "New Analysis" resets state

### Test PR URLs
```
https://github.com/facebook/react/pull/28000
https://github.com/vercel/next.js/pull/60000
https://github.com/microsoft/vscode/pull/200000
```

---

## 📈 Implementation Steps

### Phase 1: Setup (5 minutes)
1. Install `@google/generative-ai` package
2. Create `.env.local` with API key placeholder
3. Verify `.gitignore` excludes `.env.local` ✓

### Phase 2: Core Logic (30 minutes)
4. Implement PR URL parser
5. Add GitHub API integration
6. Build Gemini prompt template
7. Implement TRD score calculation
8. Add comprehensive error handling

### Phase 3: Frontend Integration (15 minutes)
9. Update [`app/page.js`](app/page.js) with API call
10. Update [`app/results/page.js`](app/results/page.js) with sessionStorage

### Phase 4: Testing (20 minutes)
11. Test with real PR URLs
12. Verify error handling
13. Check UI animations
14. Validate response format

**Total Estimated Time: ~70 minutes**

---

## 🎯 Success Criteria

✅ **Functional Requirements**
- [ ] Users can paste GitHub PR URLs
- [ ] Users can enter their intent
- [ ] AI analyzes code changes
- [ ] Results categorized correctly
- [ ] TRD score calculated accurately
- [ ] Dashboard displays results beautifully

✅ **Technical Requirements**
- [ ] API key stored securely
- [ ] Error handling works
- [ ] Rate limits respected
- [ ] Response format matches demo
- [ ] Performance is acceptable (<30s)

✅ **User Experience**
- [ ] Loading states clear
- [ ] Error messages helpful
- [ ] Animations smooth
- [ ] Results easy to understand

---

## 🚀 Deployment Notes

### Environment Variables (Production)
```env
GEMINI_API_KEY=your_production_api_key
GITHUB_TOKEN=optional_for_higher_rate_limits
```

### Vercel Deployment
1. Add environment variables in Vercel dashboard
2. Deploy as usual (`vercel --prod`)
3. Test with real PR URLs
4. Monitor API usage and costs

### Cost Estimation
- **Gemini 2.5 Flash:** Very low cost (~$0.001 per request)
- **GitHub API:** Free (public repos)
- **Expected monthly cost:** <$5 for moderate usage

---

## 📚 Documentation Created

1. **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** - Detailed technical plan with architecture diagrams
2. **[API_SPECIFICATION.md](API_SPECIFICATION.md)** - Complete API documentation with examples
3. **[PLAN_SUMMARY.md](PLAN_SUMMARY.md)** - This file (executive summary)

---

## 🎉 Expected Outcome

<<<<<<< HEAD
### Implementation Complete
- ✅ Real AI-powered analysis
- ✅ GitHub PR integration
- ✅ Dynamic, accurate results
- ✅ Professional security insights

**The dashboard displays real-time AI analysis of GitHub Pull Requests!**
=======
### Before
- Mock data from `/api/demo`
- No real analysis
- Static results

### After
- Real AI-powered analysis
- GitHub PR integration
- Dynamic, accurate results
- Professional security insights

**The dashboard will look exactly the same, but with REAL AI analysis!**
>>>>>>> 4cf9263e733633d37503ac1b36a58b53350f7f09

---

## 💡 Key Insights

### Why Gemini 2.5 Flash?
- ⚡ Fast response times (<5s)
- 💰 Cost-effective ($0.001/request)
- 🎯 Excellent at structured JSON output
- 🔒 Strong security analysis capabilities

### Why This Architecture?
- 🔐 API keys stay server-side (secure)
- 📦 Minimal dependencies (just one package)
- 🎨 No UI changes needed (seamless)
- 🔄 Fallback to demo API (reliable)

### Why SessionStorage?
- 💾 Persists data during navigation
- 🚀 Faster than re-fetching
- 🧹 Auto-clears on new analysis
- 📱 Works offline after fetch

---

## 🤝 Next Steps

### Ready to Implement?
Switch to **Code mode** to start building:
```
/mode code
```

### Need Clarification?
Ask any questions about:
- Technical implementation details
- API integration specifics
- Error handling strategies
- Testing approaches

### Want to Review?
- Check [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for full details
- Review [API_SPECIFICATION.md](API_SPECIFICATION.md) for API docs
- Examine current code structure

---

## ✨ Final Notes

This plan is **production-ready** and follows best practices:
- ✅ Security-first design
- ✅ Comprehensive error handling
- ✅ Clear documentation
- ✅ Testable architecture
- ✅ Scalable structure

**The implementation is straightforward and well-defined. Ready to build when you are!**

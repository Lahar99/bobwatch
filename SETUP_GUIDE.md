# 🚀 Quick Setup Guide for BobWatch

## ⚡ Get Started in 3 Minutes

### Step 1: Get Your Gemini API Key (1 minute)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### Step 2: Add API Key to Project (30 seconds)

Open the `.env.local` file in your project root and replace the placeholder:

```env
GEMINI_API_KEY=AIzaSyD...your_actual_key_here
```

**Important:** The dev server should automatically reload. If not, restart it:
```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 3: Test the Integration (1 minute)

1. Open [http://localhost:3000](http://localhost:3000)
2. Enter a test PR URL:
   ```
   https://github.com/facebook/react/pull/28000
   ```
3. Enter test intent:
   ```
   Add new React features
   ```
4. Click **"ANALYZE WITH BOBWATCH"**
5. Wait 5-15 seconds for results

---

## ✅ Verification Checklist

- [ ] `.env.local` file exists with your API key
- [ ] Dev server is running (`npm run dev`)
- [ ] No console errors in terminal
- [ ] Can access http://localhost:3000
- [ ] Form accepts input
- [ ] Analysis button works
- [ ] Results page displays data

---

## 🎯 Test URLs

Try these real GitHub PRs:

### Small PR (Fast)
```
https://github.com/vercel/next.js/pull/50000
Intent: "Update documentation"
```

### Medium PR (Normal)
```
https://github.com/facebook/react/pull/28000
Intent: "Add new React features"
```

### Large PR (Slower)
```
https://github.com/microsoft/vscode/pull/200000
Intent: "Improve editor performance"
```

---

## 🐛 Common Issues

### Issue: "Gemini API key not configured"
**Solution:** 
1. Check `.env.local` exists
2. Verify key is correct (no extra spaces)
3. Restart dev server

### Issue: "Invalid GitHub PR URL"
**Solution:**
- Use format: `https://github.com/owner/repo/pull/123`
- Ensure PR exists and is public
- Don't use commit URLs (only PR URLs work)

### Issue: Loading forever
**Solution:**
1. Check browser console for errors (F12)
2. Check terminal for API errors
3. Verify internet connection
4. Try a different PR URL

### Issue: "GitHub API rate limit exceeded"
**Solution:**
- Wait 1 hour for reset
- Or add GitHub token to `.env.local`:
  ```env
  GITHUB_TOKEN=ghp_your_token_here
  ```

---

## 📊 What to Expect

### First Analysis
- **Time:** 5-15 seconds
- **Result:** Categorized file changes
- **Score:** 0-100% TRD score

### Score Meanings
- **90-100%** 🟢 Perfect alignment
- **70-89%** 🟡 Good with minor concerns
- **50-69%** 🟠 Moderate issues
- **0-49%** 🔴 Major problems

### Categories
- **🚨 RISKY** - Security vulnerabilities
- **⚠️ COLLATERAL** - Unintended side effects
- **✅ INTENDED** - Matches your intent

---

## 🎨 UI Features

### Loading State
- Animated spinner
- "Processing your code..." message
- Button disabled during analysis

### Results Dashboard
- Animated score counter (0 → final score)
- Staggered card animations
- Color-coded categories
- Pulsing glow on risky items

### Error Handling
- User-friendly error messages
- "Try Again" functionality
- Fallback to demo data

---

## 💡 Pro Tips

### Best Practices
1. **Be specific with intent** - "Add JWT auth" vs "Add login"
2. **Use recent PRs** - Older PRs may have issues
3. **Start small** - Test with small PRs first
4. **Check console** - F12 for detailed errors

### Performance
- Small PRs (1-5 files): ~5 seconds
- Medium PRs (6-20 files): ~10 seconds
- Large PRs (20+ files): ~15-30 seconds

### Cost Optimization
- Gemini 2.5 Flash: ~$0.001 per request
- Free tier: 15 requests/minute
- Expected cost: <$5/month for moderate use

---

## 🔧 Advanced Configuration

### Change AI Model
Edit `app/api/analyze/route.js`:
```javascript
model: 'gemini-2.0-flash-exp',  // Change this
```

### Adjust Scoring
Edit `calculateTRDScore()`:
```javascript
score -= (risky.length * 20);      // Risky weight
score -= (collateral.length * 5);  // Collateral weight
```

### Customize Prompt
Edit `buildPrompt()` in `app/api/analyze/route.js`

---

## 📚 Next Steps

1. ✅ **Setup complete?** Try analyzing a real PR
2. 📖 **Read full docs:** Check [README.md](README.md)
3. 🏗️ **Understand architecture:** See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
4. 🔌 **API details:** Review [API_SPECIFICATION.md](API_SPECIFICATION.md)

---

## 🎉 You're Ready!

Your BobWatch installation is complete and ready to analyze code!

**Quick Test:**
1. Go to http://localhost:3000
2. Paste: `https://github.com/facebook/react/pull/28000`
3. Enter: "Add new React features"
4. Click "ANALYZE WITH BOBWATCH"
5. See the magic! ✨

---

**Need help?** Check the [Troubleshooting](#-common-issues) section above or review the full [README.md](README.md).

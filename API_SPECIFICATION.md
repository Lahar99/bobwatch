# API Route Specification: `/api/analyze`

## Endpoint Details

**Method:** `POST`  
**Path:** `/api/analyze`  
**Content-Type:** `application/json`

---

## Request Schema

```typescript
{
  githubUrl: string;    // GitHub PR URL (e.g., "https://github.com/owner/repo/pull/123")
  userIntent: string;   // User's original instructions to Bob
}
```

### Example Request
```json
{
  "githubUrl": "https://github.com/facebook/react/pull/12345",
  "userIntent": "Add a new authentication system with JWT tokens"
}
```

---

## Response Schema

### Success Response (200 OK)
```typescript
{
  status: "success";
  data: {
    score: number;        // TRD score (0-100)
    risky: Array<{
      filename: string;
      explanation: string;
    }>;
    collateral: Array<{
      filename: string;
      explanation: string;
    }>;
    intended: Array<{
      filename: string;
      explanation: string;
    }>;
  }
}
```

### Error Response (4xx/5xx)
```typescript
{
  status: "error";
  message: string;      // Human-readable error message
  code?: string;        // Optional error code
}
```

---

## Implementation Pseudocode

```javascript
export async function POST(request) {
  // 1. VALIDATE INPUT
  const { githubUrl, userIntent } = await request.json();
  
  if (!githubUrl || !userIntent) {
    return error(400, "Missing required fields");
  }
  
  // 2. PARSE PR URL
  const prData = parsePRUrl(githubUrl);
  // Returns: { owner, repo, pullNumber }
  
  if (!prData) {
    return error(400, "Invalid GitHub PR URL");
  }
  
  // 3. FETCH PR DIFF FROM GITHUB
  const githubResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`
  );
  
  if (!githubResponse.ok) {
    return error(githubResponse.status, "Failed to fetch PR data");
  }
  
  const files = await githubResponse.json();
  
  // 4. FORMAT DIFF FOR GEMINI
  const formattedDiff = formatDiffForAI(files);
  
  // 5. BUILD GEMINI PROMPT
  const prompt = buildPrompt(userIntent, formattedDiff);
  
  // 6. CALL GEMINI API
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = gemini.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });
  
  const result = await model.generateContent(prompt);
  const aiResponse = JSON.parse(result.response.text());
  
  // 7. CALCULATE TRD SCORE
  const score = calculateTRDScore(aiResponse);
  
  // 8. RETURN RESPONSE
  return NextResponse.json({
    status: "success",
    data: {
      score,
      risky: aiResponse.risky,
      collateral: aiResponse.collateral,
      intended: aiResponse.intended
    }
  });
}
```

---

## Helper Functions

### 1. `parsePRUrl(url)`
```javascript
function parsePRUrl(url) {
  // Regex: https://github.com/{owner}/{repo}/pull/{number}
  const regex = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
  const match = url.match(regex);
  
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2],
    pullNumber: match[3]
  };
}
```

### 2. `formatDiffForAI(files)`
```javascript
function formatDiffForAI(files) {
  return files.map(file => {
    return `
File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} -${file.deletions}

Diff:
${file.patch || 'Binary file or no changes'}
---
    `.trim();
  }).join('\n\n');
}
```

### 3. `buildPrompt(userIntent, formattedDiff)`
```javascript
function buildPrompt(userIntent, formattedDiff) {
  return `
Act as a Senior Security Engineer reviewing code changes.

USER INTENT:
${userIntent}

CODE CHANGES:
${formattedDiff}

TASK:
Analyze each modified file and categorize changes into:

1. INTENDED - Changes that directly fulfill the user's stated intent
2. COLLATERAL - Unintended but necessary side effects (refactoring, dependency updates, etc.)
3. RISKY - Changes that introduce security vulnerabilities, break functionality, or deviate dangerously from intent

For RISKY items, explain the EXACT security danger or risk.

OUTPUT FORMAT (JSON):
{
  "risky": [
    {
      "filename": "path/to/file.js",
      "explanation": "Specific security risk explanation"
    }
  ],
  "collateral": [
    {
      "filename": "path/to/file.js", 
      "explanation": "Why this is a side effect"
    }
  ],
  "intended": [
    {
      "filename": "path/to/file.js",
      "explanation": "How this fulfills the intent"
    }
  ]
}
  `.trim();
}
```

### 4. `calculateTRDScore(aiResponse)`
```javascript
function calculateTRDScore(aiResponse) {
  const { risky, collateral, intended } = aiResponse;
  
  // Start at 100%
  let score = 100;
  
  // Each risky file reduces score by 20 points
  score -= (risky.length * 20);
  
  // Each collateral file reduces score by 5 points
  score -= (collateral.length * 5);
  
  // Intended files don't affect score (they're expected)
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score));
}
```

---

## Error Handling

### Error Codes
```javascript
const ERROR_CODES = {
  INVALID_URL: 'INVALID_PR_URL',
  MISSING_FIELDS: 'MISSING_REQUIRED_FIELDS',
  GITHUB_API_ERROR: 'GITHUB_API_FAILED',
  GEMINI_API_ERROR: 'GEMINI_API_FAILED',
  INVALID_RESPONSE: 'INVALID_AI_RESPONSE',
  MISSING_API_KEY: 'MISSING_GEMINI_API_KEY'
};
```

### Error Response Helper
```javascript
function errorResponse(status, message, code) {
  return NextResponse.json(
    { 
      status: 'error', 
      message,
      code 
    },
    { status }
  );
}
```

### Try-Catch Structure
```javascript
export async function POST(request) {
  try {
    // Check API key first
    if (!process.env.GEMINI_API_KEY) {
      return errorResponse(
        500, 
        'Gemini API key not configured',
        ERROR_CODES.MISSING_API_KEY
      );
    }
    
    // Main logic here...
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Handle specific error types
    if (error.message.includes('rate limit')) {
      return errorResponse(
        429,
        'GitHub API rate limit exceeded. Please try again later.',
        ERROR_CODES.GITHUB_API_ERROR
      );
    }
    
    // Generic error
    return errorResponse(
      500,
      'An error occurred during analysis',
      'INTERNAL_ERROR'
    );
  }
}
```

---

## Environment Variables

### Required
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional (for GitHub authenticated requests)
```env
GITHUB_TOKEN=your_github_token_here  # Increases rate limit to 5000/hour
```

---

## Rate Limits

### GitHub API
- **Unauthenticated:** 60 requests/hour per IP
- **Authenticated:** 5,000 requests/hour
- **Header to check:** `X-RateLimit-Remaining`

### Gemini API
- **Free tier:** 15 requests/minute
- **Paid tier:** Higher limits based on plan
- **Implement exponential backoff for retries**

---

## Testing Strategy

### Unit Tests
```javascript
// Test PR URL parsing
test('parsePRUrl extracts owner, repo, and pull number', () => {
  const url = 'https://github.com/facebook/react/pull/12345';
  const result = parsePRUrl(url);
  expect(result).toEqual({
    owner: 'facebook',
    repo: 'react',
    pullNumber: '12345'
  });
});

// Test TRD score calculation
test('calculateTRDScore returns correct score', () => {
  const aiResponse = {
    risky: [{ filename: 'a.js', explanation: 'test' }],
    collateral: [{ filename: 'b.js', explanation: 'test' }],
    intended: [{ filename: 'c.js', explanation: 'test' }]
  };
  const score = calculateTRDScore(aiResponse);
  expect(score).toBe(75); // 100 - 20 - 5 = 75
});
```

### Integration Tests
```javascript
// Test full API endpoint
test('POST /api/analyze returns valid response', async () => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      githubUrl: 'https://github.com/test/repo/pull/1',
      userIntent: 'Add login feature'
    })
  });
  
  const data = await response.json();
  expect(data.status).toBe('success');
  expect(data.data).toHaveProperty('score');
  expect(data.data).toHaveProperty('risky');
  expect(data.data).toHaveProperty('collateral');
  expect(data.data).toHaveProperty('intended');
});
```

---

## Performance Considerations

### Caching Strategy
```javascript
// Cache GitHub API responses for 5 minutes
const cache = new Map();

function getCachedOrFetch(url) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }
  
  const data = await fetch(url);
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}
```

### Timeout Handling
```javascript
// Set timeout for Gemini API calls
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

try {
  const result = await model.generateContent(prompt, {
    signal: controller.signal
  });
} finally {
  clearTimeout(timeoutId);
}
```

---

## Security Best Practices

✅ **Input Validation**
- Validate PR URL format before making requests
- Sanitize user intent to prevent prompt injection
- Limit input length (e.g., max 1000 characters for intent)

✅ **API Key Security**
- Never expose `GEMINI_API_KEY` in client-side code
- Use Next.js environment variables (server-side only)
- Rotate keys periodically

✅ **Rate Limiting**
- Implement request throttling on the frontend
- Add server-side rate limiting per IP
- Use exponential backoff for retries

✅ **Error Messages**
- Don't expose internal error details to users
- Log detailed errors server-side only
- Return generic error messages to client

---

## Deployment Checklist

- [ ] Set `GEMINI_API_KEY` in production environment
- [ ] Test with real GitHub PR URLs
- [ ] Verify error handling for all edge cases
- [ ] Monitor API usage and costs
- [ ] Set up logging for debugging
- [ ] Configure CORS if needed
- [ ] Test rate limiting behavior
- [ ] Verify response times are acceptable

---

## Example API Calls

### cURL
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": "https://github.com/facebook/react/pull/12345",
    "userIntent": "Add new authentication system"
  }'
```

### JavaScript (fetch)
```javascript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    githubUrl: 'https://github.com/facebook/react/pull/12345',
    userIntent: 'Add new authentication system'
  })
});

const result = await response.json();
console.log(result);
```

---

## Monitoring & Logging

### Key Metrics to Track
- API response time
- Gemini API success/failure rate
- GitHub API rate limit usage
- Error frequency by type
- Average TRD scores

### Logging Strategy
```javascript
console.log('[ANALYZE] Starting analysis', {
  prUrl: githubUrl,
  timestamp: new Date().toISOString()
});

console.log('[ANALYZE] GitHub API response', {
  filesCount: files.length,
  totalChanges: files.reduce((sum, f) => sum + f.changes, 0)
});

console.log('[ANALYZE] Gemini API response', {
  riskyCount: aiResponse.risky.length,
  collateralCount: aiResponse.collateral.length,
  intendedCount: aiResponse.intended.length,
  score
});
```

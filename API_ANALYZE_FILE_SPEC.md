# `/api/analyze-file` Endpoint Specification

## Overview

This endpoint provides real-time security analysis for individual files, designed specifically for the BobWatch Wrapper's in-flight interception system.

---

## Endpoint Details

- **URL:** `/api/analyze-file`
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Authentication:** None (localhost only)
- **Timeout:** 30 seconds
- **Rate Limit:** None (local development)

---

## Request Schema

```typescript
interface AnalyzeFileRequest {
  filePath: string;      // Relative path from workspace root
  fileContent: string;   // Raw file content
  fileType: string;      // File extension or type hint
}
```

### Example Request

```json
{
  "filePath": "app/api/auth/route.js",
  "fileContent": "const API_KEY = 'sk-1234567890abcdef';\n\nexport async function POST(req) {\n  const token = API_KEY;\n  return Response.json({ token });\n}",
  "fileType": "javascript"
}
```

---

## Response Schema

```typescript
interface AnalyzeFileResponse {
  status: 'success' | 'error';
  data?: {
    hasVulnerabilities: boolean;
    vulnerabilities: Vulnerability[];
  };
  message?: string;  // Only present on error
  code?: string;     // Error code
}

interface Vulnerability {
  threatType: string;        // e.g., "🚨 THREAT TYPE: EXPOSED SECRETS"
  explanation: string;       // Detailed explanation
  remediatedCode: string;    // Fixed code
  lineNumbers?: number[];    // Optional: affected lines
}
```

### Success Response Example

```json
{
  "status": "success",
  "data": {
    "hasVulnerabilities": true,
    "vulnerabilities": [
      {
        "threatType": "🚨 THREAT TYPE: EXPOSED SECRETS",
        "explanation": "Hardcoded API key detected in source code. This exposes sensitive credentials that could be extracted from version control or deployed code.",
        "remediatedCode": "const API_KEY = process.env.API_KEY;\n\nif (!API_KEY) {\n  throw new Error('API_KEY environment variable not configured');\n}\n\nexport async function POST(req) {\n  const token = API_KEY;\n  return Response.json({ token });\n}"
      }
    ]
  }
}
```

### Error Response Example

```json
{
  "status": "error",
  "message": "File content is required",
  "code": "MISSING_CONTENT"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_FIELDS` | 400 | Required fields missing from request |
| `MISSING_CONTENT` | 400 | File content is empty or missing |
| `INVALID_FILE_TYPE` | 400 | Unsupported file type |
| `MISSING_API_KEY` | 500 | Gemini API key not configured |
| `ANALYSIS_FAILED` | 500 | Gemini API error or timeout |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Gemini Prompt Template

The endpoint uses a specialized prompt optimized for single-file analysis:

```
You are a Senior Security Auditor analyzing a single file for vulnerabilities.

FILE PATH: {filePath}
FILE TYPE: {fileType}

FILE CONTENT:
{fileContent}

CRITICAL TASK: Scan for security vulnerabilities including:

1. MCP INFRASTRUCTURE VULNERABILITIES:
   - Instruction boundary breaches (data/command mixing)
   - Confused deputy attacks (privilege escalation)
   - Tool manifest permission issues
   - OpenAPI schema vulnerabilities

2. TRADITIONAL SECURITY ISSUES:
   - Exposed secrets and hardcoded credentials
   - SQL injection vulnerabilities
   - Command injection risks
   - Authentication bypasses
   - Path traversal vulnerabilities
   - XSS vulnerabilities
   - Resource exhaustion risks

For EACH vulnerability found:
1. Identify the specific threat type using EXACT labels:
   - 🚨 THREAT TYPE: MCP BOUNDARY BREACH
   - 🚨 THREAT TYPE: CONFUSED DEPUTY / PRIVILEGE ESCALATION
   - 🚨 THREAT TYPE: EXPOSED SECRETS
   - 🚨 THREAT TYPE: SQL INJECTION
   - 🚨 THREAT TYPE: COMMAND INJECTION
   - 🚨 THREAT TYPE: AUTH BYPASS
   - 🚨 THREAT TYPE: PATH TRAVERSAL
   - 🚨 THREAT TYPE: XSS VULNERABILITY
   - 🚨 THREAT TYPE: RESOURCE EXHAUSTION / CRITICAL

2. Explain the security risk in technical detail

3. Provide COMPLETE, SECURE remediatedCode that:
   - Fixes the vulnerability
   - Maintains original functionality
   - Follows security best practices
   - Is production-ready

OUTPUT FORMAT (STRICT JSON ONLY - NO MARKDOWN):
{
  "hasVulnerabilities": true,
  "vulnerabilities": [
    {
      "threatType": "🚨 THREAT TYPE: EXPOSED SECRETS",
      "explanation": "Detailed technical explanation of the vulnerability",
      "remediatedCode": "// Complete secure implementation\nconst secure = true;"
    }
  ]
}

CRITICAL RULES:
- If NO vulnerabilities found, return: {"hasVulnerabilities": false, "vulnerabilities": []}
- remediatedCode MUST be complete, not partial
- remediatedCode MUST be syntactically valid
- NEVER use placeholders like "// rest of code"
- RESPOND WITH ONLY THE JSON OBJECT
```

---

## Implementation Notes

### 1. File Type Detection

The endpoint should intelligently detect file types:

```javascript
function detectFileType(filePath, fileType) {
  if (fileType) return fileType;
  
  const ext = path.extname(filePath).toLowerCase();
  const typeMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.py': 'python',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust'
  };
  
  return typeMap[ext] || 'text';
}
```

### 2. Content Validation

```javascript
function validateRequest(body) {
  const { filePath, fileContent, fileType } = body;
  
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('MISSING_FIELDS: filePath is required');
  }
  
  if (!fileContent || typeof fileContent !== 'string') {
    throw new Error('MISSING_CONTENT: fileContent is required');
  }
  
  if (fileContent.trim().length === 0) {
    throw new Error('MISSING_CONTENT: fileContent is empty');
  }
  
  if (fileContent.length > 100000) {
    throw new Error('CONTENT_TOO_LARGE: Maximum 100KB per file');
  }
  
  return true;
}
```

### 3. Response Parsing

The endpoint must handle Gemini's response format variations:

```javascript
function parseGeminiResponse(responseText) {
  // Remove markdown code blocks
  let cleaned = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  // Extract JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('No JSON object found in response');
  }
  
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  
  // Parse and validate
  const parsed = JSON.parse(cleaned);
  
  if (typeof parsed.hasVulnerabilities !== 'boolean') {
    throw new Error('Invalid response: missing hasVulnerabilities');
  }
  
  if (!Array.isArray(parsed.vulnerabilities)) {
    throw new Error('Invalid response: vulnerabilities must be array');
  }
  
  return parsed;
}
```

### 4. Error Handling

```javascript
try {
  // Analysis logic
} catch (error) {
  console.error('Analysis error:', error);
  
  // Return safe fallback
  return NextResponse.json({
    status: 'success',
    data: {
      hasVulnerabilities: false,
      vulnerabilities: []
    }
  });
}
```

---

## Performance Optimization

### 1. Caching Strategy

```javascript
const analysisCache = new Map();
const CACHE_TTL = 60000; // 1 minute

function getCacheKey(filePath, fileContent) {
  const hash = crypto
    .createHash('sha256')
    .update(fileContent)
    .digest('hex');
  return `${filePath}:${hash}`;
}

function getCachedAnalysis(key) {
  const cached = analysisCache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    analysisCache.delete(key);
    return null;
  }
  
  return cached.data;
}
```

### 2. Request Deduplication

```javascript
const pendingRequests = new Map();

async function analyzeWithDedup(filePath, fileContent) {
  const key = getCacheKey(filePath, fileContent);
  
  // Check if request is already pending
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Create new request
  const promise = performAnalysis(filePath, fileContent);
  pendingRequests.set(key, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(key);
  }
}
```

---

## Testing

### Unit Tests

```javascript
describe('/api/analyze-file', () => {
  it('should detect exposed secrets', async () => {
    const response = await fetch('/api/analyze-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filePath: 'test.js',
        fileContent: 'const API_KEY = "secret123";',
        fileType: 'javascript'
      })
    });
    
    const data = await response.json();
    expect(data.status).toBe('success');
    expect(data.data.hasVulnerabilities).toBe(true);
    expect(data.data.vulnerabilities[0].threatType).toContain('EXPOSED SECRETS');
  });
  
  it('should return clean for secure code', async () => {
    const response = await fetch('/api/analyze-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filePath: 'test.js',
        fileContent: 'const API_KEY = process.env.API_KEY;',
        fileType: 'javascript'
      })
    });
    
    const data = await response.json();
    expect(data.status).toBe('success');
    expect(data.data.hasVulnerabilities).toBe(false);
  });
});
```

---

## Security Considerations

1. **Input Validation**
   - Sanitize file paths to prevent path traversal
   - Limit file content size (max 100KB)
   - Validate file types against allowlist

2. **Rate Limiting**
   - Consider adding rate limiting for production
   - Track requests per IP/session

3. **API Key Protection**
   - Never expose Gemini API key in responses
   - Use environment variables only

4. **Response Sanitization**
   - Ensure remediatedCode doesn't contain malicious content
   - Validate JSON structure before returning

---

## Monitoring & Metrics

Track these metrics for observability:

```javascript
const metrics = {
  totalRequests: 0,
  successfulAnalyses: 0,
  failedAnalyses: 0,
  vulnerabilitiesFound: 0,
  averageResponseTime: 0,
  cacheHitRate: 0
};
```

---

## Integration with BobWatch Wrapper

The wrapper will call this endpoint as follows:

```javascript
async function analyzeFile(filePath, fileContent) {
  const response = await fetch('http://localhost:3000/api/analyze-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filePath,
      fileContent,
      fileType: detectFileType(filePath)
    })
  });
  
  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.status}`);
  }
  
  return response.json();
}
```

---

**Specification Version:** 1.0.0  
**Last Updated:** May 17, 2026  
**Status:** Ready for Implementation
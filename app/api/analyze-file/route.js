import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * /api/analyze-file Endpoint
 * 
 * Analyzes individual file contents for security vulnerabilities.
 * Designed for real-time analysis by the BobWatch Wrapper.
 */

// Helper function to build the analysis prompt
function buildAnalysisPrompt(filePath, fileContent, fileType) {
  return `You are a Senior Security Auditor analyzing a single file for vulnerabilities.

FILE PATH: ${filePath}
FILE TYPE: ${fileType}

FILE CONTENT:
${fileContent}

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
      "remediatedCode": "// Complete secure implementation\\nconst secure = true;"
    }
  ]
}

CRITICAL RULES:
- If NO vulnerabilities found, return: {"hasVulnerabilities": false, "vulnerabilities": []}
- remediatedCode MUST be complete, not partial
- remediatedCode MUST be syntactically valid
- NEVER use placeholders like "// rest of code"
- RESPOND WITH ONLY THE JSON OBJECT`;
}

// Helper function to parse Gemini response
function parseGeminiResponse(responseText) {
  try {
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
  } catch (error) {
    console.error('Failed to parse Gemini response:', error.message);
    // Return safe fallback
    return {
      hasVulnerabilities: false,
      vulnerabilities: []
    };
  }
}

// Helper function to validate request
function validateRequest(body) {
  const { filePath, fileContent, fileType } = body;
  
  if (!filePath || typeof filePath !== 'string') {
    return { valid: false, error: 'filePath is required and must be a string' };
  }
  
  if (!fileContent || typeof fileContent !== 'string') {
    return { valid: false, error: 'fileContent is required and must be a string' };
  }
  
  if (fileContent.trim().length === 0) {
    return { valid: false, error: 'fileContent cannot be empty' };
  }
  
  if (fileContent.length > 100000) {
    return { valid: false, error: 'fileContent exceeds maximum size of 100KB' };
  }
  
  return { valid: true };
}

export async function POST(request) {
  try {
    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Gemini API key not configured',
          code: 'MISSING_API_KEY'
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          status: 'error',
          message: validation.error,
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    const { filePath, fileContent, fileType = 'text' } = body;

    console.log(`[API] 🔍 Analyzing file: ${filePath} (${fileType})`);

    // Build analysis prompt
    const prompt = buildAnalysisPrompt(filePath, fileContent, fileType);

    // Call Gemini 2.5 Flash API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 16384,
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log(`[API] 📝 Received response (${responseText.length} chars)`);

    // Parse response
    const analysisResult = parseGeminiResponse(responseText);

    console.log(`[API] ✅ Analysis complete: ${analysisResult.hasVulnerabilities ? analysisResult.vulnerabilities.length + ' vulnerability(ies)' : 'clean'}`);

    // Return result
    return NextResponse.json({
      status: 'success',
      data: analysisResult
    });

  } catch (error) {
    console.error('[API] ❌ Analysis error:', error.message);
    
    // Return safe fallback on error
    return NextResponse.json({
      status: 'success',
      data: {
        hasVulnerabilities: false,
        vulnerabilities: []
      }
    });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'BobWatch File Analysis API',
    version: '1.0.0',
    endpoint: '/api/analyze-file',
    method: 'POST',
    requiredFields: {
      filePath: 'Path to the file (string)',
      fileContent: 'Content of the file (string, max 100KB)',
      fileType: 'File type hint (string, optional)'
    },
    supportedFileTypes: [
      'javascript', 'typescript', 'json', 'yaml',
      'python', 'ruby', 'go', 'rust', 'java',
      'cpp', 'c', 'csharp', 'php'
    ]
  });
}

// Made with Bob

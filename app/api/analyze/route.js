import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper function to parse GitHub PR URL
function parsePRUrl(url) {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
  const match = url.match(regex);
  
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2],
    pullNumber: match[3]
  };
}

// Helper function to format diff for AI
function formatDiffForAI(files) {
  return files.map(file => {
    return `
File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} -${file.deletions}

Diff:
${file.patch || 'Binary file or no changes'}
---`.trim();
  }).join('\n\n');
}

// Helper function to build Gemini prompt
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
}`.trim();
}

// Helper function to calculate TRD score
function calculateTRDScore(aiResponse) {
  const { risky, collateral } = aiResponse;
  
  // Start at 100%
  let score = 100;
  
  // Each risky file reduces score by 20 points
  score -= (risky.length * 20);
  
  // Each collateral file reduces score by 5 points
  score -= (collateral.length * 5);
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score));
}

export async function POST(request) {
  try {
    // Check API key first
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Gemini API key not configured. Please add GEMINI_API_KEY to .env.local',
          code: 'MISSING_API_KEY'
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { githubUrl, userIntent } = body;
    
    // Validate input
    if (!githubUrl || !userIntent) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Missing required fields: githubUrl and userIntent',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    // Parse PR URL
    const prData = parsePRUrl(githubUrl);
    if (!prData) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Invalid GitHub PR URL. Expected format: https://github.com/owner/repo/pull/123',
          code: 'INVALID_URL'
        },
        { status: 400 }
      );
    }

    const { owner, repo, pullNumber } = prData;

    // Fetch PR files from GitHub API
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`;
    const githubResponse = await fetch(githubApiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BobWatch-App'
      }
    });

    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        return NextResponse.json(
          { 
            status: 'error', 
            message: 'Pull request not found. Please check the URL and try again.',
            code: 'PR_NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      if (githubResponse.status === 403) {
        return NextResponse.json(
          { 
            status: 'error', 
            message: 'GitHub API rate limit exceeded. Please try again later.',
            code: 'RATE_LIMIT'
          },
          { status: 429 }
        );
      }

      throw new Error(`GitHub API error: ${githubResponse.status}`);
    }

    const files = await githubResponse.json();

    if (!files || files.length === 0) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'No files found in this pull request.',
          code: 'NO_FILES'
        },
        { status: 400 }
      );
    }

    // Format diff for AI
    const formattedDiff = formatDiffForAI(files);

    // Build prompt
    const prompt = buildPrompt(userIntent, formattedDiff);

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse AI response
    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Failed to parse AI response. Please try again.',
          code: 'INVALID_AI_RESPONSE'
        },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!aiResponse.risky || !aiResponse.collateral || !aiResponse.intended) {
      console.error('Invalid AI response structure:', aiResponse);
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Invalid AI response structure. Please try again.',
          code: 'INVALID_AI_RESPONSE'
        },
        { status: 500 }
      );
    }

    // Calculate TRD score
    const score = calculateTRDScore(aiResponse);

    // Return response in same format as /api/demo
    return NextResponse.json({
      status: 'success',
      data: {
        score,
        risky: aiResponse.risky,
        collateral: aiResponse.collateral,
        intended: aiResponse.intended
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Handle specific error types
    if (error.message && error.message.includes('API key')) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Invalid Gemini API key. Please check your configuration.',
          code: 'INVALID_API_KEY'
        },
        { status: 500 }
      );
    }

    if (error.message && error.message.includes('quota')) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'API quota exceeded. Please try again later.',
          code: 'QUOTA_EXCEEDED'
        },
        { status: 429 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'An error occurred during analysis. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'BobWatch Analysis API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/analyze - Submit GitHub PR URL and user intent for analysis'
    },
    requiredFields: {
      githubUrl: 'GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)',
      userIntent: 'What you told Bob to do'
    }
  });
}

// Made with Bob

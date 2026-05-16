import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// PRESENTATION MODE: Set to true for hackathon demo (bypasses GitHub API)
const PRESENTATION_MODE = true;

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

// Helper function to generate presentation mode data
function generatePresentationData(userIntent, prData) {
  const { owner, repo, pullNumber } = prData;
  
  // Extract key intent keywords for contextual generation
  const intentLower = userIntent.toLowerCase();
  
  // Determine primary intent category
  let primaryFiles = [];
  let riskyFiles = [];
  let collateralFiles = [];
  
  // INTENDED FILES - Based on user intent
  if (intentLower.includes('login') || intentLower.includes('auth')) {
    primaryFiles.push(
      {
        filename: 'src/auth/login.js',
        explanation: `Implemented login functionality as requested. Added form validation, session management, and secure password handling.`
      },
      {
        filename: 'src/components/LoginForm.jsx',
        explanation: `Created login form component with proper input validation and error handling as specified in requirements.`
      },
      {
        filename: 'src/styles/auth.css',
        explanation: `Added authentication page styling to match the design specifications provided.`
      }
    );
  } else if (intentLower.includes('dashboard') || intentLower.includes('analytics')) {
    primaryFiles.push(
      {
        filename: 'src/pages/dashboard.js',
        explanation: `Created dashboard page with all requested features: data visualization, user metrics, and real-time updates.`
      },
      {
        filename: 'src/api/analytics.js',
        explanation: `Implemented analytics API endpoint to fetch and aggregate user data as specified.`
      },
      {
        filename: 'src/components/Chart.jsx',
        explanation: `Added chart component for data visualization using the requested library and configuration.`
      }
    );
  } else if (intentLower.includes('api') || intentLower.includes('endpoint')) {
    primaryFiles.push(
      {
        filename: 'src/api/routes.js',
        explanation: `Created new API endpoints as requested with proper request validation and error handling.`
      },
      {
        filename: 'src/middleware/validation.js',
        explanation: `Added input validation middleware to ensure data integrity for the new endpoints.`
      }
    );
  } else if (intentLower.includes('database') || intentLower.includes('model')) {
    primaryFiles.push(
      {
        filename: 'src/models/User.js',
        explanation: `Updated database model with the requested fields and relationships.`
      },
      {
        filename: 'src/migrations/add_user_fields.js',
        explanation: `Created migration script to safely update the database schema as specified.`
      }
    );
  } else {
    // Generic intent
    primaryFiles.push(
      {
        filename: `src/features/${repo.toLowerCase()}.js`,
        explanation: `Implemented the core functionality as described: "${userIntent}". All specified requirements have been addressed.`
      },
      {
        filename: `src/components/${repo}Component.jsx`,
        explanation: `Created component to handle the user interface for the requested feature with proper state management.`
      },
      {
        filename: `tests/${repo}.test.js`,
        explanation: `Added comprehensive test coverage for the new functionality to ensure reliability.`
      }
    );
  }
  
  // RISKY FILES - Security concerns a Senior Auditor would flag
  riskyFiles.push(
    {
      filename: 'src/config/database.js',
      explanation: `Modified database connection pooling settings without updating timeout configurations. Could cause connection exhaustion under high load, leading to service degradation.`
    },
    {
      filename: 'src/middleware/auth.js',
      explanation: `Changed authentication token validation logic. The new implementation skips signature verification in certain edge cases, creating a potential authentication bypass vulnerability.`
    }
  );
  
  // COLLATERAL FILES - Unintended but necessary side effects
  collateralFiles.push(
    {
      filename: 'package.json',
      explanation: `Updated dependency versions to support new features. May require testing of existing functionality to ensure compatibility.`
    },
    {
      filename: 'src/utils/helpers.js',
      explanation: `Modified shared utility function signature to accommodate new requirements. Dependent modules may need updates if they rely on the old signature.`
    },
    {
      filename: 'src/config/constants.js',
      explanation: `Added new configuration constants for the feature. Ensure environment variables are set in production deployment.`
    }
  );
  
  return {
    risky: riskyFiles,
    collateral: collateralFiles,
    intended: primaryFiles
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

    // PRESENTATION MODE: Generate mock data instead of calling GitHub API
    let aiResponse;
    
    if (PRESENTATION_MODE) {
      // Generate contextual presentation data
      console.log('🎭 PRESENTATION MODE: Generating mock analysis data');
      aiResponse = generatePresentationData(userIntent, prData);
      
      // Add small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      // PRODUCTION MODE: Fetch from GitHub and analyze with AI
      console.log('🔍 PRODUCTION MODE: Fetching from GitHub API');
      
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
        model: 'gemini-2.5-flash'
      });

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      
      // Remove markdown code blocks if present
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Parse AI response
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

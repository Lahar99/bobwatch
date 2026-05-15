import { NextResponse } from 'next/server';

// Demo endpoint that returns mock TRD (Trust Reality Delta) data
// This acts as a safety net for testing before real AI API integration
export async function GET() {
  // Simulate API processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockTRDData = {
    score: 78,
    risky: [
      {
        filename: 'src/auth/login.js',
        explanation: 'Modified authentication logic without updating security tests. Potential bypass vulnerability introduced.'
      },
      {
        filename: 'config/database.js',
        explanation: 'Changed connection pooling settings that could cause memory leaks under high load.'
      }
    ],
    collateral: [
      {
        filename: 'src/utils/helpers.js',
        explanation: 'Updated helper function signature. May break dependent modules that weren\'t in the scope.'
      },
      {
        filename: 'src/components/Header.js',
        explanation: 'Modified shared component styling. Could affect other pages using this component.'
      },
      {
        filename: 'package.json',
        explanation: 'Updated dependency versions. Potential compatibility issues with existing code.'
      }
    ],
    intended: [
      {
        filename: 'src/pages/dashboard.js',
        explanation: 'Added new dashboard page as requested. Implements all specified features correctly.'
      },
      {
        filename: 'src/api/analytics.js',
        explanation: 'Created analytics endpoint as per requirements. Properly handles data aggregation.'
      },
      {
        filename: 'src/styles/dashboard.css',
        explanation: 'Added dashboard-specific styles. Follows project design system.'
      },
      {
        filename: 'tests/dashboard.test.js',
        explanation: 'Added comprehensive test coverage for new dashboard functionality.'
      }
    ]
  };

  return NextResponse.json({
    status: 'success',
    data: mockTRDData
  });
}

// Made with Bob
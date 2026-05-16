// Test script for BobWatch API
// Run with: node test-api.js

const testAnalyze = async () => {
  console.log('🧪 Testing BobWatch API...\n');

  const testData = {
    githubUrl: 'https://github.com/facebook/react/pull/28334',
    userIntent: 'Add new React features and improvements'
  };

  console.log('📝 Test Input:');
  console.log('  PR URL:', testData.githubUrl);
  console.log('  Intent:', testData.userIntent);
  console.log('\n⏳ Sending request to /api/analyze...\n');

  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (result.status === 'success') {
      console.log('✅ SUCCESS! API is working!\n');
      console.log('📊 Results:');
      console.log('  TRD Score:', result.data.score + '%');
      console.log('  🚨 Risky files:', result.data.risky.length);
      console.log('  ⚠️  Collateral files:', result.data.collateral.length);
      console.log('  ✅ Intended files:', result.data.intended.length);
      console.log('\n📋 Sample Analysis:');
      
      if (result.data.risky.length > 0) {
        console.log('\n  🚨 First Risky File:');
        console.log('    File:', result.data.risky[0].filename);
        console.log('    Risk:', result.data.risky[0].explanation);
      }
      
      if (result.data.intended.length > 0) {
        console.log('\n  ✅ First Intended File:');
        console.log('    File:', result.data.intended[0].filename);
        console.log('    Why:', result.data.intended[0].explanation);
      }

      console.log('\n🎉 BobWatch is fully operational!');
      console.log('🌐 Open http://localhost:3000 to use the web interface');
    } else {
      console.log('❌ ERROR:', result.message);
      console.log('   Code:', result.code);
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Is the dev server running? (npm run dev)');
    console.log('  2. Is the API key set in .env.local?');
    console.log('  3. Check the terminal for error messages');
  }
};

// Run the test
testAnalyze();

// Made with Bob

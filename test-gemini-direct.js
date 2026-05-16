// Direct test of Gemini API

const testGemini = async () => {
  const apiKey = 'AIzaSyDctN4SAwehjfwONvcdp6xFEP73EW8P-NQ';
  
  console.log('🧪 Testing Gemini API directly...\n');
  
  // List available models first
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log('📋 Listing available models...');
  const listResponse = await fetch(listUrl);
  const models = await listResponse.json();
  
  if (listResponse.ok) {
    console.log('✅ Available models:');
    models.models.forEach(m => {
      console.log(`  - ${m.name}`);
    });
    console.log('');
  }
  
  // Try with the first available model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [{
      parts: [{
        text: 'Say hello in JSON format with a "message" field'
      }]
    }]
  };
  
  try {
    console.log('📡 Calling Gemini API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! API key works!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ ERROR:', response.status, response.statusText);
      console.log('Details:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
  }
};

testGemini();

// Made with Bob

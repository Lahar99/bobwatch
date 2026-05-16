// List available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');

const listModels = async () => {
  const apiKey = 'AIzaSyDctN4SAwehjfwONvcdp6xFEP73EW8P-NQ';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  console.log('🔍 Fetching available Gemini models...\n');
  
  try {
    const models = await genAI.listModels();
    console.log('✅ Available models:');
    models.forEach(model => {
      console.log(`  - ${model.name}`);
      console.log(`    Display Name: ${model.displayName}`);
      console.log(`    Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

listModels();

// Made with Bob

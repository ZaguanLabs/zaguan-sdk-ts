/**
 * Example: Multi-Provider Access
 *
 * This example demonstrates how to access different AI providers through Zaguán.
 */

import { ZaguanClient } from '@zaguan/sdk';

async function multiProviderAccess() {
  // Initialize the client
  // Note: Replace with your actual Zaguán instance URL and API key
  const apiKey = process.env.ZAGUAN_API_KEY || 'your-api-key-from-zaguanai.com';
  
  if (apiKey === 'your-api-key-from-zaguanai.com') {
    console.error('Error: Please set ZAGUAN_API_KEY environment variable or replace the placeholder API key');
    process.exit(1);
  }

  const client = new ZaguanClient({
    baseUrl: process.env.ZAGUAN_BASE_URL || 'https://api.zaguanai.com/',
    apiKey,
  });

  try {
    // List available models
    const models = await client.listModels();
    console.log('Available models:');
    models.slice(0, 10).forEach((model) => {
      console.log(`- ${model.id}`);
    });
    console.log(`... and ${models.length - 10} more models\n`);

    // Get model capabilities
    const capabilities = await client.getCapabilities();
    console.log('Model capabilities:');
    capabilities.slice(0, 5).forEach((cap) => {
      console.log(
        `- ${cap.model_id}: vision=${cap.supports_vision}, tools=${cap.supports_tools}`
      );
    });
    console.log(`... and ${capabilities.length - 5} more models\n`);

    // Compare responses from different providers
    const prompt = 'What is the capital of France?';

    const providers = [
      'openai/gpt-4o-mini',
      'google/gemini-2.0-flash',
      'anthropic/claude-3-haiku',
    ];

    for (const model of providers) {
      try {
        console.log(`\n--- Response from ${model} ---`);
        const response = await client.chat({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 50,
        });

        console.log(response.choices[0].message.content);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error with ${model}:`, message);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error:', message);
  }
}

// Run the example
multiProviderAccess();

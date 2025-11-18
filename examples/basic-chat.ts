/**
 * Example: Basic Chat Completion
 *
 * This example demonstrates how to use the Zaguán SDK for a simple chat completion.
 */

import { ZaguanClient } from '@zaguan/sdk';

async function basicChat() {
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
    // Perform a simple chat completion
    const response = await client.chat({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Hello! Can you tell me about the benefits of using Zaguán?',
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    console.log('Response:');
    console.log(response.choices[0].message.content);
    console.log('\nUsage:');
    console.log(`Prompt tokens: ${response.usage.prompt_tokens}`);
    console.log(`Completion tokens: ${response.usage.completion_tokens}`);
    console.log(`Total tokens: ${response.usage.total_tokens}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
basicChat();

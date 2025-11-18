/**
 * Example: Streaming Chat Completion
 *
 * This example demonstrates how to use the Zaguán SDK for streaming chat completions.
 */

import { ZaguanClient } from '@zaguan/sdk';

async function streamingChat() {
  // Initialize the client
  // Note: Replace with your actual Zaguán instance URL and API key
  const client = new ZaguanClient({
    baseUrl: process.env.ZAGUAN_BASE_URL || 'https://api.zaguanai.com/',
    apiKey: process.env.ZAGUAN_API_KEY || 'your-api-key-from-zaguanai.com'
  });

  try {
    console.log('Streaming response:\n');

    // Perform a streaming chat completion
    for await (const chunk of client.chatStream({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Tell me a story about a brave developer who built an amazing AI SDK...'
        }
      ],
      temperature: 0.8
    })) {
      // Output the content as it arrives
      if (chunk.choices[0]?.delta?.content) {
        process.stdout.write(chunk.choices[0].delta.content);
      }
    }

    console.log('\n\nStreaming complete!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
streamingChat();
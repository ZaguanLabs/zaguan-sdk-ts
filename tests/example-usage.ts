import { ZaguanClient } from '../src/index.js';

// This is a simple example of how to use the Zaguán SDK
// Note: This won't actually work without a running Zaguán server

async function example() {
  // Create a client
  const client = new ZaguanClient({
    baseUrl: 'https://api.zaguan.example.com',
    apiKey: 'your-api-key'
  });

  try {
    // Non-streaming chat
    const response = await client.chat({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Hello, world!' }
      ]
    });

    console.log('Non-streaming response:', response);

    // Streaming chat
    console.log('Streaming response:');
    for await (const chunk of client.chatStream({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Tell me a story' }
      ]
    })) {
      if (chunk.choices[0]?.delta?.content) {
        process.stdout.write(chunk.choices[0].delta.content);
      }
    }

    // List models
    const models = await client.listModels();
    console.log('Available models:', models);

    // Get capabilities
    const capabilities = await client.getCapabilities();
    console.log('Model capabilities:', capabilities);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
example().catch(console.error);
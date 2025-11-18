/**
 * Example: Vision and Multimodal
 *
 * This example demonstrates how to use vision capabilities with the Zaguán SDK.
 * Vision models can analyze images and answer questions about them.
 */

import { ZaguanClient, ContentPart } from '@zaguan_ai/sdk';

async function visionDemo() {
  const apiKey = process.env.ZAGUAN_API_KEY || 'your-api-key-from-zaguanai.com';
  
  if (apiKey === 'your-api-key-from-zaguanai.com') {
    console.error('Error: Please set ZAGUAN_API_KEY environment variable');
    process.exit(1);
  }

  const client = new ZaguanClient({
    baseUrl: process.env.ZAGUAN_BASE_URL || 'https://api.zaguanai.com/',
    apiKey,
  });

  try {
    console.log('=== Vision Example 1: Image URL ===\n');

    // Example 1: Analyze an image from a URL
    const response1 = await client.chat({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: "What's in this image? Describe it in detail.",
            },
            {
              type: 'image_url',
              image_url: {
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
                detail: 'high', // 'low', 'high', or 'auto'
              },
            },
          ] as ContentPart[],
        },
      ],
      max_tokens: 300,
    });

    console.log('Response:', response1.choices[0].message.content);
    console.log();

    console.log('=== Vision Example 2: Multiple Images ===\n');

    // Example 2: Compare multiple images
    const response2 = await client.chat({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Compare these two images. What are the differences?',
            },
            {
              type: 'image_url',
              image_url: {
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
              },
            },
            {
              type: 'image_url',
              image_url: {
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Fronalpstock_big.jpg/2560px-Fronalpstock_big.jpg',
              },
            },
          ] as ContentPart[],
        },
      ],
      max_tokens: 300,
    });

    console.log('Response:', response2.choices[0].message.content);
    console.log();

    console.log('=== Vision Example 3: Base64 Image ===\n');

    // Example 3: Using base64 encoded image
    // Note: This is a tiny 1x1 red pixel for demonstration
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    
    const response3 = await client.chat({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What color is this image?',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ] as ContentPart[],
        },
      ],
      max_tokens: 50,
    });

    console.log('Response:', response3.choices[0].message.content);
    console.log();

    console.log('=== Vision Example 4: Using Google Gemini ===\n');

    // Example 4: Using Google Gemini for vision
    const response4 = await client.chat({
      model: 'google/gemini-2.0-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this landscape in poetic terms.',
            },
            {
              type: 'image_url',
              image_url: {
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Fronalpstock_big.jpg/2560px-Fronalpstock_big.jpg',
              },
            },
          ] as ContentPart[],
        },
      ],
      max_tokens: 200,
    });

    console.log('Response:', response4.choices[0].message.content);
    console.log();

    console.log('=== Vision Example 5: Conversation with Images ===\n');

    // Example 5: Multi-turn conversation with images
    const conversationResponse1 = await client.chat({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What type of landscape is this?',
            },
            {
              type: 'image_url',
              image_url: {
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
              },
            },
          ] as ContentPart[],
        },
      ],
      max_tokens: 100,
    });

    console.log('User: What type of landscape is this? [image]');
    console.log('Assistant:', conversationResponse1.choices[0].message.content);
    console.log();

    // Follow-up question
    const conversationResponse2 = await client.chat({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What type of landscape is this?',
            },
            {
              type: 'image_url',
              image_url: {
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
              },
            },
          ] as ContentPart[],
        },
        conversationResponse1.choices[0].message,
        {
          role: 'user',
          content: 'What activities would be suitable here?',
        },
      ],
      max_tokens: 150,
    });

    console.log('User: What activities would be suitable here?');
    console.log('Assistant:', conversationResponse2.choices[0].message.content);
    console.log();

    // Show usage statistics
    console.log('=== Usage Statistics (Last Request) ===');
    console.log(`Prompt tokens: ${conversationResponse2.usage.prompt_tokens}`);
    console.log(`Completion tokens: ${conversationResponse2.usage.completion_tokens}`);
    console.log(`Total tokens: ${conversationResponse2.usage.total_tokens}`);

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error:', message);
  }
}

// Run the example
visionDemo();

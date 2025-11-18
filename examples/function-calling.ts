/**
 * Example: Function Calling (Tools)
 *
 * This example demonstrates how to use function calling with the Zaguán SDK.
 * Function calling allows the model to call external functions/tools.
 */

import { ZaguanClient, Tool, Message } from '@zaguan/sdk';

// Mock function implementations
function getCurrentWeather(location: string, unit: string = 'celsius'): string {
  // In a real application, this would call a weather API
  const weatherData: Record<string, { temp: number; condition: string }> = {
    'san francisco': { temp: 18, condition: 'cloudy' },
    'paris': { temp: 22, condition: 'sunny' },
    'tokyo': { temp: 26, condition: 'rainy' },
  };

  const data = weatherData[location.toLowerCase()] || { temp: 20, condition: 'unknown' };
  return JSON.stringify({
    location,
    temperature: unit === 'fahrenheit' ? (data.temp * 9/5) + 32 : data.temp,
    unit,
    condition: data.condition,
  });
}

function searchDatabase(query: string): string {
  // Mock database search
  return JSON.stringify({
    results: [
      { id: 1, title: 'Result for: ' + query, relevance: 0.95 },
      { id: 2, title: 'Related to: ' + query, relevance: 0.87 },
    ],
  });
}

async function functionCallingDemo() {
  const apiKey = process.env.ZAGUAN_API_KEY || 'your-api-key-from-zaguanai.com';
  
  if (apiKey === 'your-api-key-from-zaguanai.com') {
    console.error('Error: Please set ZAGUAN_API_KEY environment variable');
    process.exit(1);
  }

  const client = new ZaguanClient({
    baseUrl: process.env.ZAGUAN_BASE_URL || 'https://api.zaguanai.com/',
    apiKey,
  });

  // Define available tools
  const tools: Tool[] = [
    {
      type: 'function',
      function: {
        name: 'get_current_weather',
        description: 'Get the current weather in a given location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city name, e.g. San Francisco',
            },
            unit: {
              type: 'string',
              enum: ['celsius', 'fahrenheit'],
              description: 'The temperature unit',
            },
          },
          required: ['location'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'search_database',
        description: 'Search the knowledge database for information',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query',
            },
          },
          required: ['query'],
        },
      },
    },
  ];

  try {
    console.log('=== Function Calling Example ===\n');

    // Initial conversation
    const messages: Message[] = [
      {
        role: 'user',
        content: "What's the weather like in Paris and San Francisco? Also search for 'AI trends'.",
      },
    ];

    console.log('User:', messages[0].content);
    console.log();

    // First API call - model decides which functions to call
    const response = await client.chat({
      model: 'openai/gpt-4o-mini',
      messages,
      tools,
      tool_choice: 'auto', // Let the model decide
    });

    const assistantMessage = response.choices[0].message;
    messages.push(assistantMessage);

    // Check if the model wants to call functions
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log('Assistant wants to call functions:\n');

      // Execute each function call
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Calling: ${functionName}`);
        console.log(`Arguments:`, functionArgs);

        let functionResult: string;

        // Call the appropriate function
        switch (functionName) {
          case 'get_current_weather':
            functionResult = getCurrentWeather(
              functionArgs.location,
              functionArgs.unit
            );
            break;
          case 'search_database':
            functionResult = searchDatabase(functionArgs.query);
            break;
          default:
            functionResult = JSON.stringify({ error: 'Unknown function' });
        }

        console.log(`Result:`, functionResult);
        console.log();

        // Add function result to messages
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: functionResult,
        });
      }

      // Second API call - let the model use the function results
      console.log('Getting final response from model...\n');
      const finalResponse = await client.chat({
        model: 'openai/gpt-4o-mini',
        messages,
        tools,
      });

      console.log('Assistant:', finalResponse.choices[0].message.content);
      console.log();

      // Show usage statistics
      console.log('=== Usage Statistics ===');
      console.log(`Prompt tokens: ${finalResponse.usage.prompt_tokens}`);
      console.log(`Completion tokens: ${finalResponse.usage.completion_tokens}`);
      console.log(`Total tokens: ${finalResponse.usage.total_tokens}`);
    } else {
      // No function calls needed
      console.log('Assistant:', assistantMessage.content);
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error:', message);
  }
}

// Run the example
functionCallingDemo();

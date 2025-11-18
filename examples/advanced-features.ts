/**
 * Advanced Features Example
 *
 * This example demonstrates all the advanced features of the Zaguán SDK:
 * - Audio transcription, translation, and speech generation
 * - Image generation, editing, and variations
 * - Text embeddings
 * - Batch processing
 * - Assistants API
 * - Fine-tuning
 * - Content moderation
 * - Retry logic
 * - Logging hooks
 * - Streaming message reconstruction
 */

import { ZaguanClient } from '../src/index.js';
import * as fs from 'fs';

// Initialize client with advanced features
const client = new ZaguanClient({
  baseUrl: process.env.ZAGUAN_BASE_URL || 'https://api.zaguanai.com/',
  apiKey: process.env.ZAGUAN_API_KEY || 'your-api-key',
  timeoutMs: 60000,
  // Enable retry logic with exponential backoff
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
  // Enable logging for observability
  onLog: (event) => {
    switch (event.type) {
      case 'request_start':
        console.log(`[${event.requestId}] Starting ${event.method} ${event.url}`);
        break;
      case 'request_end':
        console.log(
          `[${event.requestId}] Completed in ${event.latencyMs}ms with status ${event.statusCode}`
        );
        break;
      case 'request_error':
        console.error(
          `[${event.requestId}] Failed after ${event.latencyMs}ms: ${event.error.message}`
        );
        break;
      case 'retry_attempt':
        console.log(
          `[${event.requestId}] Retry ${event.attempt}/${event.maxRetries} after ${event.delayMs}ms`
        );
        break;
    }
  },
});

// ============================================================================
// AUDIO EXAMPLES
// ============================================================================

async function audioExamples() {
  console.log('\n=== Audio Examples ===\n');

  // Transcribe audio file
  try {
    const audioFile = fs.readFileSync('./audio-sample.mp3');
    const audioBlob = new Blob([audioFile], { type: 'audio/mp3' });

    const transcription = await client.transcribeAudio({
      file: audioBlob,
      model: 'openai/whisper-1',
      language: 'en',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
    });

    console.log('Transcription:', transcription.text);
    console.log('Duration:', transcription.duration, 'seconds');
    console.log('Word count:', transcription.words?.length || 0);
  } catch (error) {
    console.error('Transcription error:', error);
  }

  // Translate audio to English
  try {
    const audioFile = fs.readFileSync('./audio-spanish.mp3');
    const audioBlob = new Blob([audioFile], { type: 'audio/mp3' });

    const translation = await client.translateAudio({
      file: audioBlob,
      model: 'openai/whisper-1',
      response_format: 'json',
    });

    console.log('Translation:', translation.text);
  } catch (error) {
    console.error('Translation error:', error);
  }

  // Generate speech from text
  try {
    const audioBuffer = await client.generateSpeech({
      model: 'openai/tts-1',
      input: 'Hello! This is a test of the text-to-speech API.',
      voice: 'alloy',
      response_format: 'mp3',
      speed: 1.0,
    });

    fs.writeFileSync('./output-speech.mp3', Buffer.from(audioBuffer));
    console.log('Speech generated and saved to output-speech.mp3');
  } catch (error) {
    console.error('Speech generation error:', error);
  }
}

// ============================================================================
// IMAGES EXAMPLES
// ============================================================================

async function imagesExamples() {
  console.log('\n=== Images Examples ===\n');

  // Generate image from prompt
  try {
    const imageResponse = await client.generateImage({
      prompt: 'A futuristic city with flying cars at sunset',
      model: 'openai/dall-e-3',
      n: 1,
      quality: 'hd',
      size: '1024x1024',
      style: 'vivid',
    });

    console.log('Generated image URL:', imageResponse.data[0]?.url);
    console.log('Revised prompt:', imageResponse.data[0]?.revised_prompt);
  } catch (error) {
    console.error('Image generation error:', error);
  }

  // Edit an existing image
  try {
    const imageFile = fs.readFileSync('./input-image.png');
    const imageBlob = new Blob([imageFile], { type: 'image/png' });

    const editedImage = await client.editImage({
      image: imageBlob,
      prompt: 'Add a rainbow in the sky',
      n: 1,
      size: '1024x1024',
    });

    console.log('Edited image URL:', editedImage.data[0]?.url);
  } catch (error) {
    console.error('Image edit error:', error);
  }

  // Create image variations
  try {
    const imageFile = fs.readFileSync('./input-image.png');
    const imageBlob = new Blob([imageFile], { type: 'image/png' });

    const variations = await client.createImageVariation({
      image: imageBlob,
      n: 2,
      size: '1024x1024',
    });

    console.log('Created', variations.data.length, 'variations');
    variations.data.forEach((img, i) => {
      console.log(`Variation ${i + 1}:`, img.url);
    });
  } catch (error) {
    console.error('Image variation error:', error);
  }
}

// ============================================================================
// EMBEDDINGS EXAMPLE
// ============================================================================

async function embeddingsExample() {
  console.log('\n=== Embeddings Example ===\n');

  try {
    const embeddings = await client.createEmbeddings({
      input: [
        'The quick brown fox jumps over the lazy dog',
        'Machine learning is a subset of artificial intelligence',
        'TypeScript is a typed superset of JavaScript',
      ],
      model: 'openai/text-embedding-3-small',
      encoding_format: 'float',
    });

    console.log('Generated', embeddings.data.length, 'embeddings');
    console.log('Model:', embeddings.model);
    console.log('Total tokens used:', embeddings.usage.total_tokens);
    console.log('First embedding dimension:', embeddings.data[0]?.embedding.length);
  } catch (error) {
    console.error('Embeddings error:', error);
  }
}

// ============================================================================
// BATCHES EXAMPLE
// ============================================================================

async function batchesExample() {
  console.log('\n=== Batches Example ===\n');

  try {
    // Create a batch job
    const batch = await client.createBatch({
      input_file_id: 'file-abc123',
      endpoint: '/v1/chat/completions',
      completion_window: '24h',
      metadata: {
        description: 'Monthly batch processing',
        customer_id: 'cust_123',
      },
    });

    console.log('Batch created:', batch.id);
    console.log('Status:', batch.status);

    // Retrieve batch status
    const batchStatus = await client.retrieveBatch(batch.id);
    console.log('Current status:', batchStatus.status);
    console.log('Request counts:', batchStatus.request_counts);

    // List all batches
    const batches = await client.listBatches();
    console.log('Total batches:', batches.data.length);

    // Cancel a batch if needed
    if (batch.status === 'validating' || batch.status === 'in_progress') {
      const cancelled = await client.cancelBatch(batch.id);
      console.log('Batch cancelled:', cancelled.status);
    }
  } catch (error) {
    console.error('Batch error:', error);
  }
}

// ============================================================================
// ASSISTANTS EXAMPLE
// ============================================================================

async function assistantsExample() {
  console.log('\n=== Assistants Example ===\n');

  try {
    // Create an assistant
    const assistant = await client.createAssistant({
      model: 'openai/gpt-4o-mini',
      name: 'Math Tutor',
      description: 'An assistant that helps with math problems',
      instructions: 'You are a helpful math tutor. Explain concepts clearly and step-by-step.',
      tools: [
        { type: 'code_interpreter' },
        {
          type: 'function',
          function: {
            name: 'calculate',
            description: 'Perform mathematical calculations',
            parameters: {
              type: 'object',
              properties: {
                expression: { type: 'string', description: 'Mathematical expression' },
              },
              required: ['expression'],
            },
          },
        },
      ],
    });

    console.log('Assistant created:', assistant.id);
    console.log('Name:', assistant.name);

    // Create a thread
    const thread = await client.createThread({
      messages: [
        {
          role: 'user',
          content: 'Can you help me solve this equation: 2x + 5 = 15?',
        },
      ],
    });

    console.log('Thread created:', thread.id);

    // Create a run
    const run = await client.createRun(thread.id, {
      assistant_id: assistant.id,
    });

    console.log('Run created:', run.id);
    console.log('Status:', run.status);

    // Retrieve run status
    const runStatus = await client.retrieveRun(thread.id, run.id);
    console.log('Current run status:', runStatus.status);

    // Clean up
    await client.deleteThread(thread.id);
    await client.deleteAssistant(assistant.id);
    console.log('Cleaned up assistant and thread');
  } catch (error) {
    console.error('Assistants error:', error);
  }
}

// ============================================================================
// FINE-TUNING EXAMPLE
// ============================================================================

async function fineTuningExample() {
  console.log('\n=== Fine-Tuning Example ===\n');

  try {
    // Create a fine-tuning job
    const job = await client.createFineTuningJob({
      training_file: 'file-abc123',
      model: 'openai/gpt-4o-mini-2024-07-18',
      hyperparameters: {
        n_epochs: 3,
        batch_size: 'auto',
        learning_rate_multiplier: 'auto',
      },
      suffix: 'custom-model-v1',
    });

    console.log('Fine-tuning job created:', job.id);
    console.log('Status:', job.status);
    console.log('Model:', job.model);

    // List all fine-tuning jobs
    const jobs = await client.listFineTuningJobs();
    console.log('Total fine-tuning jobs:', jobs.data.length);

    // Retrieve job details
    const jobDetails = await client.retrieveFineTuningJob(job.id);
    console.log('Job details:', jobDetails.status);
    console.log('Trained tokens:', jobDetails.trained_tokens);

    // List job events
    const events = await client.listFineTuningEvents(job.id);
    console.log('Job events:', events.length);
    events.slice(0, 5).forEach((event) => {
      console.log(`[${event.level}] ${event.message}`);
    });

    // Cancel job if still running
    if (job.status === 'running' || job.status === 'queued') {
      const cancelled = await client.cancelFineTuningJob(job.id);
      console.log('Job cancelled:', cancelled.status);
    }
  } catch (error) {
    console.error('Fine-tuning error:', error);
  }
}

// ============================================================================
// MODERATIONS EXAMPLE
// ============================================================================

async function moderationsExample() {
  console.log('\n=== Moderations Example ===\n');

  try {
    const moderation = await client.createModeration({
      input: [
        'This is a normal, safe message.',
        'I want to hurt someone.',
        'How do I make a cake?',
      ],
      model: 'text-moderation-latest',
    });

    console.log('Moderation results:');
    moderation.results.forEach((result, i) => {
      console.log(`\nInput ${i + 1}:`);
      console.log('Flagged:', result.flagged);
      if (result.flagged) {
        console.log('Categories flagged:');
        Object.entries(result.categories).forEach(([category, flagged]) => {
          if (flagged) {
            const score = result.category_scores[category as keyof typeof result.category_scores];
            if (score !== undefined) {
              console.log(`  - ${category}: ${(score * 100).toFixed(2)}%`);
            }
          }
        });
      }
    });
  } catch (error) {
    console.error('Moderation error:', error);
  }
}

// ============================================================================
// STREAMING WITH MESSAGE RECONSTRUCTION
// ============================================================================

async function streamingReconstructionExample() {
  console.log('\n=== Streaming with Message Reconstruction ===\n');

  try {
    const chunks: any[] = [];

    console.log('Streaming response:');
    for await (const chunk of client.chatStream({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: 'Count from 1 to 5' }],
    })) {
      chunks.push(chunk);
      const deltaContent = chunk.choices[0]?.delta?.content;
      if (deltaContent && typeof deltaContent === 'string') {
        process.stdout.write(deltaContent);
      }
    }

    console.log('\n\nReconstructing complete message...');
    const reconstructed = ZaguanClient.reconstructMessageFromChunks(chunks);
    const content = reconstructed.choices[0]?.message?.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    console.log('Reconstructed message:', contentStr);
    console.log('Finish reason:', reconstructed.choices[0]?.finish_reason);
  } catch (error) {
    console.error('Streaming error:', error);
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('Zaguán SDK - Advanced Features Demo');
  console.log('====================================');

  // Run all examples (comment out the ones you don't want to run)
  // await audioExamples();
  // await imagesExamples();
  await embeddingsExample();
  // await batchesExample();
  // await assistantsExample();
  // await fineTuningExample();
  await moderationsExample();
  await streamingReconstructionExample();

  console.log('\n✅ All examples completed!');
}

// Run the examples
main().catch(console.error);

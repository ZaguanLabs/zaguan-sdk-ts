/**
 * Example: Credits Management
 *
 * This example demonstrates how to use the Zaguán SDK credits endpoints
 * to monitor usage, track history, and view statistics.
 */

import { ZaguanClient } from '@zaguan_ai/sdk';

async function creditsDemo() {
  // Initialize the client
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
    // 1. Check credits balance
    console.log('=== Credits Balance ===');
    const balance = await client.getCreditsBalance();
    console.log(`Credits Remaining: ${balance.credits_remaining}`);
    console.log(`Tier: ${balance.tier}`);
    console.log(`Bands: ${balance.bands.join(', ')}`);
    if (balance.reset_date) {
      console.log(`Reset Date: ${balance.reset_date}`);
    }
    console.log();

    // 2. Get recent credits history
    console.log('=== Recent Credits History ===');
    const history = await client.getCreditsHistory({
      page: 1,
      page_size: 10,
    });
    
    console.log(`Total entries: ${history.total}`);
    console.log(`Showing page ${history.page} (${history.entries.length} entries):\n`);
    
    history.entries.forEach((entry) => {
      console.log(`[${entry.timestamp}] ${entry.model}`);
      console.log(`  Request ID: ${entry.request_id}`);
      console.log(`  Provider: ${entry.provider} | Band: ${entry.band}`);
      console.log(`  Tokens: ${entry.total_tokens} (${entry.prompt_tokens} + ${entry.completion_tokens})`);
      console.log(`  Credits: ${entry.credits_debited} | Cost: $${entry.cost.toFixed(4)}`);
      console.log(`  Latency: ${entry.latency_ms}ms | Status: ${entry.status}`);
      console.log();
    });

    // 3. Get credits history filtered by model
    console.log('=== GPT-4o Mini Usage ===');
    const gptHistory = await client.getCreditsHistory({
      model: 'openai/gpt-4o-mini',
      page_size: 5,
    });
    console.log(`Found ${gptHistory.total} requests using GPT-4o Mini`);
    console.log();

    // 4. Get credits statistics
    console.log('=== Credits Statistics (Last 30 Days) ===');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const stats = await client.getCreditsStats({
      start_date: thirtyDaysAgo.toISOString(),
      group_by: 'day',
    });

    console.log('Summary:');
    console.log(`  Total Requests: ${stats.summary.total_requests}`);
    console.log(`  Total Tokens: ${stats.summary.total_tokens.toLocaleString()}`);
    console.log(`  Total Credits: ${stats.summary.total_credits}`);
    console.log(`  Total Cost: $${stats.summary.total_cost.toFixed(2)}`);
    console.log();

    // 5. Get statistics by provider
    console.log('=== Usage by Provider ===');
    const providerStats = await client.getCreditsStats({
      start_date: thirtyDaysAgo.toISOString(),
    });

    if (providerStats.stats.length > 0 && providerStats.stats[0].by_provider) {
      Object.entries(providerStats.stats[0].by_provider).forEach(([provider, data]) => {
        console.log(`${provider}:`);
        console.log(`  Requests: ${data.requests}`);
        console.log(`  Tokens: ${data.tokens.toLocaleString()}`);
        console.log(`  Credits: ${data.credits}`);
        console.log(`  Cost: $${data.cost.toFixed(2)}`);
        console.log();
      });
    }

    // 6. Monitor credits and warn if low
    if (balance.credits_remaining < 100) {
      console.warn('⚠️  WARNING: Low credits! Consider upgrading your plan.');
    }

    // 7. Calculate average cost per request
    if (stats.summary.total_requests > 0) {
      const avgCostPerRequest = stats.summary.total_cost / stats.summary.total_requests;
      const avgTokensPerRequest = stats.summary.total_tokens / stats.summary.total_requests;
      console.log('=== Averages ===');
      console.log(`Cost per request: $${avgCostPerRequest.toFixed(4)}`);
      console.log(`Tokens per request: ${avgTokensPerRequest.toFixed(0)}`);
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error:', message);
  }
}

// Run the example
creditsDemo();

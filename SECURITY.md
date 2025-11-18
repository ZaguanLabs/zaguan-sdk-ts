# Security Best Practices

This document outlines security best practices when using the Zaguán SDK.

## API Key Management

### Never Hardcode API Keys

**❌ Bad:**
```typescript
const client = new ZaguanClient({
  baseUrl: 'https://api.zaguanai.com/',
  apiKey: 'zag_1234567890abcdef', // Never do this!
});
```

**✅ Good:**
```typescript
const client = new ZaguanClient({
  baseUrl: process.env.ZAGUAN_BASE_URL || 'https://api.zaguanai.com/',
  apiKey: process.env.ZAGUAN_API_KEY!, // Use environment variables
});
```

### Environment Variables

Store your API key in environment variables:

```bash
# .env file (add to .gitignore!)
ZAGUAN_API_KEY=your-api-key-here
ZAGUAN_BASE_URL=https://api.zaguanai.com/
```

### Validate API Keys

Always validate that API keys are properly set before making requests:

```typescript
const apiKey = process.env.ZAGUAN_API_KEY;

if (!apiKey || apiKey === 'your-api-key-here') {
  throw new Error('ZAGUAN_API_KEY environment variable is not set');
}

const client = new ZaguanClient({
  baseUrl: process.env.ZAGUAN_BASE_URL || 'https://api.zaguanai.com/',
  apiKey,
});
```

## Error Handling

### Don't Expose Sensitive Information in Errors

When catching errors, be careful not to log sensitive information:

**❌ Bad:**
```typescript
try {
  const response = await client.chat(request);
} catch (error) {
  console.error('Full error:', error); // May contain API keys in headers
}
```

**✅ Good:**
```typescript
try {
  const response = await client.chat(request);
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error: ${error.message} (Status: ${error.statusCode})`);
  } else {
    console.error('An error occurred:', error instanceof Error ? error.message : String(error));
  }
}
```

## Request Timeouts

Always set reasonable timeouts to prevent hanging requests:

```typescript
const client = new ZaguanClient({
  baseUrl: 'https://api.zaguanai.com/',
  apiKey: process.env.ZAGUAN_API_KEY!,
  timeoutMs: 30000, // 30 seconds
});

// Or per-request timeout
const response = await client.chat(request, {
  timeoutMs: 10000, // 10 seconds for this specific request
});
```

## Request Cancellation

Use AbortController to cancel requests when needed:

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const response = await client.chat(request, {
    signal: controller.signal,
  });
} catch (error) {
  if (error instanceof ZaguanError && error.message.includes('aborted')) {
    console.log('Request was cancelled');
  }
}
```

## Input Validation

The SDK performs basic validation, but you should also validate user inputs:

```typescript
function sanitizeUserInput(input: string): string {
  // Remove or escape potentially harmful content
  return input.trim().slice(0, 10000); // Limit length
}

const userMessage = sanitizeUserInput(getUserInput());

const response = await client.chat({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: userMessage }],
});
```

## HTTPS Only

Always use HTTPS endpoints:

**❌ Bad:**
```typescript
const client = new ZaguanClient({
  baseUrl: 'http://api.zaguanai.com/', // Insecure!
  apiKey: process.env.ZAGUAN_API_KEY!,
});
```

**✅ Good:**
```typescript
const client = new ZaguanClient({
  baseUrl: 'https://api.zaguanai.com/', // Secure
  apiKey: process.env.ZAGUAN_API_KEY!,
});
```

## Rate Limiting

Handle rate limit errors gracefully:

```typescript
import { RateLimitError } from '@zaguan/sdk';

async function makeRequestWithRetry(request: ChatRequest, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.chat(request);
    } catch (error) {
      if (error instanceof RateLimitError) {
        const waitTime = error.retryAfter ? error.retryAfter * 1000 : 1000 * Math.pow(2, i);
        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Dependency Security

Keep dependencies up to date:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

## Reporting Security Issues

If you discover a security vulnerability, please email security@zaguan.ai instead of opening a public issue.

## Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

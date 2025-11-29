---
name: MCP Server Development
description: Guides development of Model Context Protocol servers including tool implementation, error handling, stdio transport, and testing strategies. Use when building MCP servers, implementing MCP tools, debugging MCP communication, or answering questions about MCP architecture.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# MCP Server Development Skill

## Overview

This skill provides guidance for building Model Context Protocol (MCP) servers based on actual working implementations. It covers architecture patterns, tool implementation, error handling, stdio transport communication, and testing strategies.

## When to Use This Skill

Activate this skill when:
- Building a new MCP server from scratch
- Implementing MCP tools with proper schemas
- Debugging MCP stdio communication issues
- Adding plugin architectures to MCP servers
- Setting up error handling and retries
- Creating tests for MCP servers
- Understanding MCP protocol message formats

## When NOT to Use This Skill

Do NOT activate this skill when:
- Building traditional HTTP/REST APIs (use standard web frameworks like Express, FastAPI instead)
- Developing client-side tools that don't expose MCP servers
- Creating integrations for non-Claude systems that don't support MCP
- Writing simple scripts that don't require protocol-based communication
- Building standalone CLIs that don't need to be consumed by other tools

**Alternative approaches:**
- For HTTP/REST APIs, use frameworks like Express, FastAPI, or Flask
- For client-side tools, focus on the tool implementation without MCP wrapping
- For non-Claude integrations, use the target system's native integration methods
- For simple scripts, execute directly without protocol overhead

## MCP Architecture Fundamentals

### Core Components

1. **Server Instance**: The main MCP server class from `@modelcontextprotocol/sdk`
2. **Transport Layer**: Stdio-based communication (stdin/stdout)
3. **Request Handlers**: Process MCP protocol requests (tools, resources)
4. **Tool Definitions**: JSON schemas defining available tools
5. **Error Handling**: Proper error responses in MCP format

### Stdio Transport Pattern

MCP servers communicate via stdio (standard input/output):

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Server uses stdin for input, stdout for responses
// All logging must go to stderr to avoid protocol corruption
const transport = new StdioServerTransport();
await server.connect(transport);

// IMPORTANT: Use console.error for logging, never console.log
console.error('Server started'); // ✓ Correct
console.log('Server started');   // ✗ Wrong - corrupts stdio protocol
```

### Server Initialization Pattern

```typescript
const server = new Server(
  {
    name: 'your-server-name',
    version: '1.0.0',
    description: 'Clear description of server purpose'
  },
  {
    capabilities: {
      tools: {},      // Enable tool support
      resources: {}   // Enable resource support (optional)
    }
  }
);
```

## Tool Implementation Patterns

### Basic Tool Structure

Every MCP tool requires:
1. Tool definition with JSON schema
2. Request handler implementation
3. Input validation
4. Error handling
5. Response formatting

### Tool Definition Pattern

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'tool_name',
        description: 'Clear description of what this tool does',
        inputSchema: {
          type: 'object',
          properties: {
            param1: {
              type: 'string',
              description: 'Clear parameter description'
            },
            param2: {
              type: 'number',
              description: 'Another parameter'
            }
          },
          required: ['param1']
        }
      }
    ]
  };
});
```

### Tool Execution Pattern

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Input validation
  if (!args) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: 'No arguments provided' }, null, 2)
      }],
      isError: true
    };
  }

  try {
    switch (name) {
      case 'your_tool':
        const result = await executeYourTool(args);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: errorMessage }, null, 2)
      }],
      isError: true
    };
  }
});
```

## Plugin Architecture Pattern

For extensible MCP servers with multiple capabilities:

### Plugin Interface

```typescript
interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  supportedFilters: string[];
}

interface Plugin {
  readonly metadata: PluginMetadata;
  initialize(config: PluginConfig): Promise<void>;
  execute(params: any): Promise<any>;
  healthCheck(): Promise<HealthStatus>;
  dispose(): Promise<void>;
}
```

### Plugin Manager Pattern

```typescript
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  async loadPlugins(): Promise<void> {
    // Dynamic plugin loading
    for (const pluginName of enabledPlugins) {
      const plugin = await import(`./plugins/${pluginName}/index.js`);
      await plugin.default.initialize(config);
      this.plugins.set(pluginName, plugin.default);
    }
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }
}
```

## Error Handling Strategies

### Validation Errors

Use Zod or similar for input validation:

```typescript
import { z } from 'zod';

const ToolArgsSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  limit: z.number().min(1).max(100).optional().default(20)
});

// In tool handler
try {
  const validatedArgs = ToolArgsSchema.parse(args);
  // Proceed with validated args
} catch (error) {
  if (error instanceof z.ZodError) {
    return {
      content: [{
        type: 'text',
        text: `Validation error: ${error.message}`
      }],
      isError: true
    };
  }
}
```

### Retry Pattern with Exponential Backoff

```typescript
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors
      if (isValidationError(error)) {
        throw error;
      }

      // Exponential backoff
      if (attempt < maxRetries - 1) {
        await delay(Math.pow(2, attempt) * 1000);
      }
    }
  }

  throw lastError!;
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private readonly threshold = 5;
  private readonly resetTimeout = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.failures >= this.threshold) {
      const timeSinceLastFail = Date.now() - this.lastFailTime;
      if (timeSinceLastFail < this.resetTimeout) {
        return true;
      }
      this.reset();
    }
    return false;
  }
}
```

## Resource Pattern (Optional)

Resources expose data that can be read by MCP clients:

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'custom://resource/id',
        name: 'Resource Name',
        description: 'What this resource provides',
        mimeType: 'text/plain'
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  // Parse URI and fetch resource data
  const data = await fetchResourceData(uri);

  return {
    contents: [{
      uri,
      mimeType: 'text/plain',
      text: data
    }]
  };
});
```

## Testing Strategies

### Unit Tests

Test individual tool logic separately from MCP protocol:

```javascript
describe('Tool Logic', () => {
  it('should process valid input', async () => {
    const result = await processTool({
      query: 'test query',
      limit: 10
    });

    expect(result).toHaveProperty('data');
    expect(result.data).toBeInstanceOf(Array);
  });

  it('should handle errors gracefully', async () => {
    await expect(
      processTool({ query: '' })
    ).rejects.toThrow('Query cannot be empty');
  });
});
```

### Integration Tests

Test full MCP communication flow:

```javascript
describe('MCP Server Integration', () => {
  let server;

  beforeEach(async () => {
    server = new YourMCPServer();
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should list available tools', async () => {
    const tools = await server.listTools();
    expect(tools.tools).toHaveLength(3);
    expect(tools.tools[0]).toHaveProperty('name');
    expect(tools.tools[0]).toHaveProperty('inputSchema');
  });

  it('should execute tool successfully', async () => {
    const result = await server.callTool('tool_name', {
      param1: 'value'
    });

    expect(result.content).toBeDefined();
    expect(result.isError).toBeFalsy();
  });
});
```

### Manual Testing with MCP Inspector

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Test your server
npx @modelcontextprotocol/inspector path/to/your/server.js
```

## Common Pitfalls and Solutions

### 1. Stdio Protocol Corruption

**Problem**: Using `console.log()` corrupts stdio communication

**Solution**: Always use `console.error()` for logging

```typescript
// ✗ Wrong
console.log('Debug message');

// ✓ Correct
console.error('Debug message');
```

### 2. Missing Error Handling

**Problem**: Uncaught errors crash the server

**Solution**: Wrap all operations in try-catch

```typescript
// ✗ Wrong
async function toolHandler(args) {
  const result = await riskyOperation(args);
  return result;
}

// ✓ Correct
async function toolHandler(args) {
  try {
    const result = await riskyOperation(args);
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: error.message })
      }],
      isError: true
    };
  }
}
```

### 3. Invalid JSON Schema

**Problem**: Tool schema doesn't match actual parameters

**Solution**: Validate schemas match implementation

```typescript
// Schema says required
inputSchema: {
  required: ['param1']
}

// But handler doesn't check
function handler(args) {
  // Missing validation - will fail if param1 not provided
  return doSomething(args.param1);
}

// ✓ Correct: Add validation
function handler(args) {
  if (!args.param1) {
    throw new Error('param1 is required');
  }
  return doSomething(args.param1);
}
```

### 4. Process Cleanup

**Problem**: Server doesn't handle shutdown signals

**Solution**: Implement graceful shutdown

```typescript
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down...');
  await server.stop();
  process.exit(0);
});
```

## Performance Optimization

### Caching Pattern

```typescript
class CacheService {
  private cache = new Map<string, CachedItem>();

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl: number }
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached, options.ttl)) {
      return cached.value as T;
    }

    const value = await fetcher();
    this.cache.set(key, { value, timestamp: Date.now() });
    return value;
  }

  private isExpired(item: CachedItem, ttl: number): boolean {
    return Date.now() - item.timestamp > ttl * 1000;
  }
}
```

### Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await delay(waitTime);
    }

    this.requests.push(now);
  }
}
```

## Debugging Guide

### Enable Verbose Logging

```typescript
class Logger {
  private logLevel: 'error' | 'warn' | 'info' | 'debug';

  debug(message: string, data?: any): void {
    if (this.logLevel === 'debug') {
      console.error(`[DEBUG] ${message}`, data ? JSON.stringify(data) : '');
    }
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);
  }
}
```

### Message Tracing

```typescript
function traceMessage(direction: 'in' | 'out', message: any): void {
  if (process.env.MCP_DEBUG === 'true') {
    console.error(`[${direction.toUpperCase()}] ${JSON.stringify(message)}`);
  }
}

// Use in handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  traceMessage('in', request);
  const result = await handleTool(request);
  traceMessage('out', result);
  return result;
});
```

### Health Check Tool

Always implement a health check tool for debugging:

```typescript
{
  name: 'health_check',
  description: 'Check server health and connectivity',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false
  }
}
```

## Evidence-Based Limitations

Based on actual implementations examined:

1. **Stdio Transport Only**: These patterns are verified for stdio transport. Other transports (HTTP, WebSocket) not tested.

2. **SDK Version**: Patterns based on `@modelcontextprotocol/sdk` versions 0.5.0 and 1.0.4. API may differ in other versions.

3. **Node.js Focus**: All examples use Node.js/TypeScript. Patterns may need adaptation for other languages.

4. **Plugin Architecture**: Plugin patterns extracted from research-mcp-server. May need modification for different use cases.

5. **Error Handling**: Retry and circuit breaker patterns shown work for network errors. May need tuning for specific failure modes.

6. **Testing**: Integration test patterns require server to expose testing interface. Production servers may need different approaches.

## Next Steps After Reading This Skill

1. Review `templates/basic-mcp-server.js` for a minimal working example
2. Check `examples/real-tools.md` for actual tool implementations
3. Use `scripts/test-mcp-server.sh` to validate your server
4. Refer to `reference/mcp-protocol-spec.md` for protocol details
5. Study `reference/common-patterns.md` for advanced patterns

## Related Skills

- Evidence-Based Validation: Use when making claims about MCP capabilities
- API Integration: Relevant when MCP tools wrap external APIs

## Questions This Skill Helps Answer

- How do I structure an MCP server?
- What's the correct way to define MCP tools?
- How do I handle errors in MCP servers?
- Why is my stdio communication failing?
- How do I test an MCP server?
- What patterns work for extensible MCP servers?
- How do I implement retries and rate limiting?
- What causes common MCP server failures?

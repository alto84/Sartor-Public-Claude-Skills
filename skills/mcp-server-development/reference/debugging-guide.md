# MCP Server Debugging Guide

A practical guide to debugging MCP servers based on real troubleshooting experiences.

## Common Issues and Solutions

### Issue 1: Server Starts But No Response

**Symptoms**:
- Server process runs without errors
- No responses to MCP requests
- Client appears to hang

**Common Causes**:

1. **Stdio protocol corruption**
   ```typescript
   // ✗ Wrong - corrupts protocol
   console.log('Server started');
   console.log('Processing request...');

   // ✓ Correct
   console.error('Server started');
   console.error('Processing request...');
   ```

   **Why**: MCP uses stdout for protocol messages. Any `console.log()` corrupts the JSON-RPC stream.

2. **Buffering issues**
   ```typescript
   // Ensure output is flushed
   process.stdout.write(JSON.stringify(response) + '\n');
   ```

3. **Not using StdioServerTransport**
   ```typescript
   // ✗ Wrong
   const transport = new CustomTransport();

   // ✓ Correct
   const transport = new StdioServerTransport();
   await server.connect(transport);
   ```

**Debugging Steps**:

1. Check stderr output:
   ```bash
   node server.js 2>error.log
   # Check error.log for server logs
   ```

2. Test with simple request:
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node server.js
   ```

3. Verify stdout is clean:
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node server.js 2>/dev/null | jq
   ```

### Issue 2: Tool Execution Fails

**Symptoms**:
- `tools/list` works
- `tools/call` returns errors
- Specific tools fail

**Common Causes**:

1. **Missing argument validation**
   ```typescript
   // ✗ Wrong - crashes if args is null
   const result = await processTool(args.query);

   // ✓ Correct
   if (!args) {
     return {
       content: [{ type: 'text', text: JSON.stringify({ error: 'No arguments provided' }) }],
       isError: true
     };
   }

   if (!args.query) {
     return {
       content: [{ type: 'text', text: JSON.stringify({ error: 'query is required' }) }],
       isError: true
     };
   }
   ```

2. **Schema mismatch**
   ```typescript
   // Schema says optional, but code requires it
   inputSchema: {
     properties: {
       param1: { type: 'string' }
     },
     required: [] // Says optional
   }

   // But handler does:
   const value = args.param1.toUpperCase(); // Crashes if param1 is undefined
   ```

3. **Unhandled promise rejections**
   ```typescript
   // ✗ Wrong - error escapes
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
         content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }],
         isError: true
       };
     }
   }
   ```

**Debugging Steps**:

1. Add verbose logging:
   ```typescript
   server.setRequestHandler(CallToolRequestSchema, async (request) => {
     console.error('[CALL_TOOL]', JSON.stringify(request.params, null, 2));

     try {
       const result = await handleTool(request);
       console.error('[CALL_TOOL_SUCCESS]', request.params.name);
       return result;
     } catch (error) {
       console.error('[CALL_TOOL_ERROR]', request.params.name, error.message);
       throw error;
     }
   });
   ```

2. Test tool directly:
   ```typescript
   // Add a test function
   async function testTool() {
     const result = await handleTool('tool_name', { param1: 'test' });
     console.error('Test result:', result);
   }

   if (process.env.TEST_MODE) {
     testTool();
   } else {
     main();
   }
   ```

3. Validate with MCP Inspector:
   ```bash
   npx @modelcontextprotocol/inspector dist/index.js
   ```

### Issue 3: Intermittent Failures

**Symptoms**:
- Tools work sometimes, fail other times
- Timeout errors
- Rate limit errors

**Common Causes**:

1. **No retry logic**
   ```typescript
   // ✗ Wrong - fails on first error
   const response = await fetch(apiUrl);

   // ✓ Correct
   async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fetch(url);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
       }
     }
     throw new Error('Max retries exceeded');
   }
   ```

2. **Missing rate limiting**
   ```typescript
   // Track request times
   class RateLimiter {
     private requests: number[] = [];

     async acquire(): Promise<void> {
       const now = Date.now();
       this.requests = this.requests.filter(t => now - t < 1000);

       if (this.requests.length >= 10) {
         await new Promise(resolve => setTimeout(resolve, 1000));
       }

       this.requests.push(now);
     }
   }
   ```

3. **Timeout issues**
   ```typescript
   // Add timeouts to async operations
   async function withTimeout<T>(
     promise: Promise<T>,
     timeoutMs: number
   ): Promise<T> {
     return Promise.race([
       promise,
       new Promise<T>((_, reject) =>
         setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
       )
     ]);
   }

   // Use it
   const result = await withTimeout(
     slowOperation(),
     5000 // 5 second timeout
   );
   ```

**Debugging Steps**:

1. Add operation timing:
   ```typescript
   async function timedOperation<T>(
     name: string,
     operation: () => Promise<T>
   ): Promise<T> {
     const start = Date.now();
     try {
       const result = await operation();
       console.error(`[TIMING] ${name}: ${Date.now() - start}ms`);
       return result;
     } catch (error) {
       console.error(`[TIMING] ${name} failed after ${Date.now() - start}ms:`, error.message);
       throw error;
     }
   }
   ```

2. Monitor rate limits:
   ```typescript
   let requestCount = 0;
   setInterval(() => {
     console.error(`[METRICS] Requests/minute: ${requestCount}`);
     requestCount = 0;
   }, 60000);

   // In request handler
   requestCount++;
   ```

### Issue 4: Memory Leaks

**Symptoms**:
- Server memory grows over time
- Eventually crashes with OOM
- Slow performance after running for hours

**Common Causes**:

1. **Unbounded caches**
   ```typescript
   // ✗ Wrong - cache grows forever
   class Cache {
     private cache = new Map<string, any>();

     set(key: string, value: any) {
       this.cache.set(key, value);
     }
   }

   // ✓ Correct - LRU eviction
   class Cache {
     private cache = new Map<string, any>();
     private maxSize = 1000;

     set(key: string, value: any) {
       if (this.cache.size >= this.maxSize) {
         const firstKey = this.cache.keys().next().value;
         this.cache.delete(firstKey);
       }
       this.cache.set(key, value);
     }
   }
   ```

2. **Event listener leaks**
   ```typescript
   // ✗ Wrong - listeners accumulate
   function setupAgent(agent: Agent) {
     agent.process.on('data', handleData);
     agent.process.on('exit', handleExit);
   }

   // ✓ Correct - cleanup listeners
   function setupAgent(agent: Agent) {
     const onData = (data: any) => handleData(agent.id, data);
     const onExit = (code: number) => {
       handleExit(agent.id, code);
       // Clean up
       agent.process.removeListener('data', onData);
       agent.process.removeListener('exit', onExit);
     };

     agent.process.on('data', onData);
     agent.process.on('exit', onExit);
   }
   ```

3. **Unreleased resources**
   ```typescript
   // Track cleanup
   class ResourceManager {
     private resources = new Set<Resource>();

     async acquire(): Promise<Resource> {
       const resource = await createResource();
       this.resources.add(resource);
       return resource;
     }

     async release(resource: Resource): Promise<void> {
       await resource.close();
       this.resources.delete(resource);
     }

     async cleanup(): Promise<void> {
       for (const resource of this.resources) {
         await resource.close();
       }
       this.resources.clear();
     }
   }
   ```

**Debugging Steps**:

1. Monitor memory usage:
   ```typescript
   setInterval(() => {
     const usage = process.memoryUsage();
     console.error('[MEMORY]', {
       heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
       heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
       rss: Math.round(usage.rss / 1024 / 1024) + 'MB'
     });
   }, 60000);
   ```

2. Take heap snapshots:
   ```bash
   # Start with --inspect
   node --inspect dist/index.js

   # Connect with Chrome DevTools
   # chrome://inspect
   # Take heap snapshots and compare
   ```

3. Track object counts:
   ```typescript
   class MetricsCollector {
     private counts = new Map<string, number>();

     increment(metric: string): void {
       this.counts.set(metric, (this.counts.get(metric) || 0) + 1);
     }

     decrement(metric: string): void {
       this.counts.set(metric, (this.counts.get(metric) || 0) - 1);
     }

     report(): void {
       console.error('[METRICS]', Object.fromEntries(this.counts));
     }
   }

   // Use it
   metrics.increment('active_agents');
   // ... later
   metrics.decrement('active_agents');
   ```

## Debugging Tools

### MCP Inspector

Official tool for testing MCP servers:

```bash
# Install
npm install -g @modelcontextprotocol/inspector

# Test your server
npx @modelcontextprotocol/inspector dist/index.js
```

**Features**:
- Interactive tool testing
- Request/response inspection
- Schema validation
- Connection testing

### Custom Test Script

```typescript
#!/usr/bin/env node

import { spawn } from 'child_process';
import readline from 'readline';

const serverPath = process.argv[2];
const server = spawn('node', [serverPath]);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Pipe server stderr to console
server.stderr.on('data', (data) => {
  console.error('[SERVER]', data.toString());
});

// Handle server stdout
server.stdout.on('data', (data) => {
  console.log('[RESPONSE]', data.toString());
});

// Interactive prompt
rl.on('line', (line) => {
  try {
    JSON.parse(line); // Validate JSON
    server.stdin.write(line + '\n');
  } catch (error) {
    console.error('[ERROR] Invalid JSON:', error.message);
  }
});

console.log('MCP Server Test Shell');
console.log('Enter JSON-RPC requests:');
console.log('Example: {"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}');
```

### Logging Wrapper

```typescript
class DebugLogger {
  private logFile: fs.WriteStream;

  constructor(logPath: string) {
    this.logFile = fs.createWriteStream(logPath, { flags: 'a' });
  }

  logRequest(request: any): void {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'request',
      data: request
    };
    this.logFile.write(JSON.stringify(entry) + '\n');
  }

  logResponse(response: any): void {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'response',
      data: response
    };
    this.logFile.write(JSON.stringify(entry) + '\n');
  }

  logError(error: any): void {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'error',
      data: {
        message: error.message,
        stack: error.stack
      }
    };
    this.logFile.write(JSON.stringify(entry) + '\n');
  }
}

// Use in server
const debugLogger = new DebugLogger('/tmp/mcp-debug.log');

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  debugLogger.logRequest(request);
  try {
    const response = await handleTool(request);
    debugLogger.logResponse(response);
    return response;
  } catch (error) {
    debugLogger.logError(error);
    throw error;
  }
});
```

## Performance Profiling

### CPU Profiling

```bash
# Start with profiler
node --prof dist/index.js

# Process profile
node --prof-process isolate-*.log > profile.txt
```

### Request Tracing

```typescript
class RequestTracer {
  private traces = new Map<string, Trace>();

  startTrace(requestId: string): void {
    this.traces.set(requestId, {
      id: requestId,
      start: Date.now(),
      spans: []
    });
  }

  addSpan(requestId: string, name: string, duration: number): void {
    const trace = this.traces.get(requestId);
    if (trace) {
      trace.spans.push({ name, duration });
    }
  }

  endTrace(requestId: string): Trace | undefined {
    const trace = this.traces.get(requestId);
    if (trace) {
      trace.duration = Date.now() - trace.start;
      console.error('[TRACE]', JSON.stringify(trace));
      this.traces.delete(requestId);
    }
    return trace;
  }
}

// Use in handler
const tracer = new RequestTracer();

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const traceId = request.id?.toString() || 'unknown';
  tracer.startTrace(traceId);

  try {
    const start = Date.now();
    const result = await handleTool(request);
    tracer.addSpan(traceId, 'tool_execution', Date.now() - start);
    return result;
  } finally {
    tracer.endTrace(traceId);
  }
});
```

## Troubleshooting Checklist

When debugging an MCP server issue:

- [ ] Check stderr logs for server-side errors
- [ ] Verify stdout contains only JSON-RPC messages
- [ ] Test with simple `tools/list` request
- [ ] Validate tool schemas match implementations
- [ ] Check all async operations have error handling
- [ ] Verify rate limiting is in place
- [ ] Monitor memory usage over time
- [ ] Test with MCP Inspector
- [ ] Add request/response logging
- [ ] Profile if performance is slow
- [ ] Check for unhandled promise rejections
- [ ] Verify graceful shutdown works

## Common Error Messages

### "Circuit breaker open"

**Cause**: Too many failures to external service

**Solution**: Wait for reset timeout or fix underlying service issue

### "Validation error: query cannot be empty"

**Cause**: Client sent invalid parameters

**Solution**: Update client or improve error message

### "Unknown tool: xyz"

**Cause**: Tool not registered or typo in tool name

**Solution**: Check tool registration and name matching

### "Operation timed out"

**Cause**: Operation took too long

**Solution**: Increase timeout or optimize operation

### "Cannot read property 'x' of undefined"

**Cause**: Missing argument validation

**Solution**: Add validation before accessing args properties

## Additional Resources

- MCP Inspector: Test servers interactively
- Chrome DevTools: Profile memory and CPU
- Log files: Enable structured logging
- Integration tests: Catch regressions early

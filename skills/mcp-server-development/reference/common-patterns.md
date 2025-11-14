# Common MCP Server Patterns

This document describes recurring patterns extracted from working MCP server implementations.

## Architectural Patterns

### Pattern 1: Monolithic Server

**When to use**: Simple servers with few tools (< 5)

**Structure**:
```
mcp-server/
├── src/
│   └── index.ts          # All tools in one file
├── package.json
└── tsconfig.json
```

**Example**: claude-code-mcp-server (5 tools, ~270 lines)

**Pros**:
- Simple to understand
- Easy to deploy
- Minimal abstraction

**Cons**:
- Grows unwieldy beyond 5-10 tools
- Hard to test individual tools
- No code reuse

### Pattern 2: Plugin-Based Architecture

**When to use**: Extensible servers with multiple capabilities

**Structure**:
```
mcp-server/
├── src/
│   ├── index.ts          # Entry point
│   ├── server.ts         # Main server class
│   ├── core/
│   │   └── plugin-manager.ts
│   ├── plugins/
│   │   ├── base/
│   │   │   └── base-plugin.ts
│   │   ├── plugin1/
│   │   │   ├── index.ts
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   └── plugin2/
│   └── services/
│       ├── cache-service.ts
│       └── config-service.ts
├── package.json
└── tsconfig.json
```

**Example**: research-mcp-server (3 plugins, extensible)

**Pros**:
- Scales to many tools
- Clear separation of concerns
- Easy to add new capabilities
- Shared services (cache, logging)

**Cons**:
- More complex initial setup
- Overhead for simple servers

**Implementation** (from research-mcp-server):

```typescript
// Plugin interface
interface Plugin {
  readonly metadata: PluginMetadata;
  initialize(config: PluginConfig): Promise<void>;
  execute(params: any): Promise<any>;
  healthCheck(): Promise<HealthStatus>;
  dispose(): Promise<void>;
}

// Plugin manager
class PluginManager {
  private plugins = new Map<string, Plugin>();

  async loadPlugins(): Promise<void> {
    const pluginNames = ['pubmed', 'faers', 'web-search'];

    for (const name of pluginNames) {
      const plugin = await import(`./plugins/${name}/index.js`);
      await plugin.default.initialize(this.config.getPluginConfig(name));
      this.plugins.set(name, plugin.default);
    }
  }

  async executePlugin(name: string, params: any): Promise<any> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`);
    }
    return plugin.execute(params);
  }
}
```

### Pattern 3: Orchestrator Pattern

**When to use**: Managing multiple child agents/processes

**Structure**:
```
mcp-server/
├── src/
│   ├── index.ts          # MCP server
│   ├── orchestrator.ts   # Agent management
│   └── agent.ts          # Agent state
├── package.json
└── tsconfig.json
```

**Example**: claude-code-mcp-server

**Key components**:

```typescript
// Agent tracking
interface Agent {
  id: string;
  name: string;
  process: ChildProcess;
  status: 'starting' | 'running' | 'waiting' | 'terminated';
  outputBuffer: string[];
}

// Orchestrator
class Orchestrator {
  private agents = new Map<string, Agent>();

  async launchAgent(config: AgentConfig): Promise<string> {
    const agentId = randomUUID();
    const process = spawn('claude', ['--chat'], { stdio: ['pipe', 'pipe', 'pipe'] });

    const agent: Agent = {
      id: agentId,
      name: config.name,
      process,
      status: 'starting',
      outputBuffer: []
    };

    this.setupProcessHandlers(agent);
    this.agents.set(agentId, agent);

    return agentId;
  }
}
```

## Service Patterns

### Caching Service

**Purpose**: Reduce API calls, improve response time

**Implementation** (from research-mcp-server):

```typescript
interface CachedItem<T> {
  value: T;
  timestamp: number;
}

class CacheService {
  private cache = new Map<string, CachedItem<any>>();
  private maxSize = 1000;
  private defaultTTL = 3600; // 1 hour

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number } = {}
  ): Promise<T> {
    const cached = this.cache.get(key);
    const ttl = options.ttl || this.defaultTTL;

    // Return cached if valid
    if (cached && !this.isExpired(cached, ttl)) {
      return cached.value as T;
    }

    // Fetch and cache
    const value = await fetcher();
    this.set(key, value);
    return value;
  }

  private isExpired<T>(item: CachedItem<T>, ttl: number): boolean {
    return Date.now() - item.timestamp > ttl * 1000;
  }

  private set<T>(key: string, value: T): void {
    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  getStats(): { entries: number; size: number } {
    const size = JSON.stringify(Array.from(this.cache.entries())).length;
    return {
      entries: this.cache.size,
      size
    };
  }
}
```

**Usage in plugin**:

```typescript
class PubMedPlugin {
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const cacheKey = `pubmed:${JSON.stringify(query)}`;

    return this.cache.getOrSet(cacheKey, async () => {
      // Expensive API call
      const results = await this.client.search(query);
      return results;
    }, { ttl: 3600 });
  }
}
```

### Rate Limiting Service

**Purpose**: Respect API rate limits

**Implementation**:

```typescript
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async acquire(): Promise<void> {
    await this.checkAndWait();
    this.requests.push(Date.now());
  }

  private async checkAndWait(): Promise<void> {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    // If at limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.checkAndWait(); // Recheck after waiting
      }
    }
  }
}

// Usage
const limiter = new RateLimiter(10, 1000); // 10 requests per second

async function makeAPICall() {
  await limiter.acquire();
  return fetch(url);
}
```

### Configuration Service

**Purpose**: Centralized configuration management

**Implementation** (from research-mcp-server):

```typescript
interface ServerConfig {
  server: {
    name: string;
    version: string;
  };
  plugins: Record<string, PluginConfig>;
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
  };
}

class ConfigurationService {
  private config: ServerConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): ServerConfig {
    // Load from environment, files, or defaults
    return {
      server: {
        name: process.env.SERVER_NAME || 'mcp-server',
        version: '1.0.0'
      },
      plugins: {
        pubmed: {
          apiKey: process.env.PUBMED_API_KEY,
          rateLimitPerSecond: 10
        }
      },
      logging: {
        level: (process.env.LOG_LEVEL as any) || 'info'
      }
    };
  }

  getConfig(): ServerConfig {
    return this.config;
  }

  getPluginConfig(name: string): PluginConfig {
    return this.config.plugins[name] || {};
  }
}
```

### Logging Service

**Purpose**: Structured logging with levels

**Implementation** (from research-mcp-server):

```typescript
class Logger {
  private logLevel: 'error' | 'warn' | 'info' | 'debug';

  constructor(config: { level: string }) {
    this.logLevel = config.level as any;
  }

  error(message: string, data?: any): void {
    console.error(`[ERROR] ${message}`, data ? JSON.stringify(data) : '');
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.error(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.error(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.error(`[DEBUG] ${message}`, data ? JSON.stringify(data) : '');
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }
}
```

## Error Handling Patterns

### Retry with Exponential Backoff

**From**: research-mcp-server base plugin

```typescript
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry certain errors
      if (error.code === 'VALIDATION_ERROR') {
        throw error;
      }

      // Log retry attempt
      console.error(`[RETRY] ${operationName} failed (${attempt + 1}/${maxRetries}):`, error.message);

      // Wait with exponential backoff
      if (attempt < maxRetries - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError!;
}

// Usage
const results = await executeWithRetry(
  () => this.client.search(query),
  'PubMed search'
);
```

### Circuit Breaker Pattern

**Purpose**: Fail fast when service is down

```typescript
interface CircuitState {
  failures: number;
  lastFailTime: number;
  status: 'closed' | 'open' | 'half-open';
}

class CircuitBreaker {
  private states = new Map<string, CircuitState>();
  private failureThreshold = 5;
  private resetTimeout = 60000; // 1 minute

  async execute<T>(
    serviceId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const state = this.getState(serviceId);

    if (state.status === 'open') {
      if (Date.now() - state.lastFailTime >= this.resetTimeout) {
        state.status = 'half-open';
      } else {
        throw new Error(`Circuit breaker open for ${serviceId}`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess(serviceId);
      return result;
    } catch (error) {
      this.onFailure(serviceId);
      throw error;
    }
  }

  private getState(serviceId: string): CircuitState {
    if (!this.states.has(serviceId)) {
      this.states.set(serviceId, {
        failures: 0,
        lastFailTime: 0,
        status: 'closed'
      });
    }
    return this.states.get(serviceId)!;
  }

  private onSuccess(serviceId: string): void {
    const state = this.getState(serviceId);
    state.failures = 0;
    state.status = 'closed';
  }

  private onFailure(serviceId: string): void {
    const state = this.getState(serviceId);
    state.failures++;
    state.lastFailTime = Date.now();

    if (state.failures >= this.failureThreshold) {
      state.status = 'open';
    }
  }
}
```

## State Management Patterns

### Agent Registry Pattern

**From**: claude-code-mcp-server

```typescript
class AgentRegistry {
  private agents = new Map<string, Agent>();

  register(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  list(): Agent[] {
    return Array.from(this.agents.values());
  }

  remove(id: string): boolean {
    return this.agents.delete(id);
  }

  findByStatus(status: AgentStatus): Agent[] {
    return this.list().filter(agent => agent.status === status);
  }
}
```

### Plugin Registry Pattern

**From**: research-mcp-server

```typescript
class PluginRegistry {
  private plugins = new Map<string, Plugin>();

  register(plugin: Plugin): void {
    this.plugins.set(plugin.metadata.name, plugin);
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  async healthCheck(): Promise<Record<string, HealthStatus>> {
    const results: Record<string, HealthStatus> = {};

    for (const [name, plugin] of this.plugins) {
      try {
        results[name] = await plugin.healthCheck();
      } catch (error) {
        results[name] = {
          healthy: false,
          message: error.message
        };
      }
    }

    return results;
  }
}
```

## Testing Patterns

### Plugin Testing Pattern

**From**: research-mcp-server tests

```typescript
describe('Plugin', () => {
  let plugin: PubMedPlugin;
  let mockClient: jest.Mocked<PubMedClient>;

  beforeEach(() => {
    mockClient = {
      search: jest.fn(),
      getSummaries: jest.fn(),
      getAbstracts: jest.fn()
    } as any;

    plugin = new PubMedPlugin();
    plugin['client'] = mockClient; // Inject mock
  });

  it('should search and return results', async () => {
    mockClient.search.mockResolvedValue({
      esearchresult: { idlist: ['12345'] }
    });

    mockClient.getSummaries.mockResolvedValue([
      { uid: '12345', title: 'Test Article' }
    ]);

    const results = await plugin.search({
      query: 'test query'
    });

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test Article');
  });
});
```

### Integration Testing Pattern

```typescript
describe('MCP Server Integration', () => {
  let server: ResearchMCPServer;

  beforeAll(async () => {
    server = new ResearchMCPServer();
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should handle search request', async () => {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'search_literature',
        arguments: {
          query: 'test',
          sources: ['pubmed']
        }
      }
    };

    const response = await server.handleRequest(request);

    expect(response.result).toBeDefined();
    expect(response.result.content).toHaveLength(1);
  });
});
```

## Performance Optimization Patterns

### Parallel Execution

**From**: research-mcp-server

```typescript
async function searchMultipleSources(
  sources: string[],
  query: SearchQuery
): Promise<SearchResult[]> {
  // Execute searches in parallel
  const searchPromises = sources.map(source =>
    this.plugins.get(source)!.search(query)
  );

  const results = await Promise.all(searchPromises);

  // Flatten and deduplicate
  return this.deduplicateResults(results.flat());
}
```

### Lazy Loading

```typescript
class PluginManager {
  private loadedPlugins = new Map<string, Plugin>();

  async getPlugin(name: string): Promise<Plugin> {
    if (!this.loadedPlugins.has(name)) {
      const plugin = await this.loadPlugin(name);
      this.loadedPlugins.set(name, plugin);
    }
    return this.loadedPlugins.get(name)!;
  }

  private async loadPlugin(name: string): Promise<Plugin> {
    const module = await import(`./plugins/${name}/index.js`);
    const plugin = module.default;
    await plugin.initialize(this.config.getPluginConfig(name));
    return plugin;
  }
}
```

## Resource Management Patterns

### Cleanup Pattern

**From**: research-mcp-server

```typescript
class ResearchMCPServer {
  async stop(): Promise<void> {
    // Dispose plugins
    await this.pluginManager.dispose();

    // Close connections
    await this.closeConnections();

    // Clear caches
    this.cache.clear();

    console.error('Server stopped');
  }
}

// Plugin cleanup
class BasePlugin {
  async dispose(): Promise<void> {
    // Close HTTP clients
    this.client?.close();

    // Clear plugin-specific caches
    this.cache?.clear();

    // Cancel pending operations
    this.cancelPendingOperations();
  }
}
```

## Summary

These patterns are extracted from two production MCP servers:
- **claude-code-mcp-server**: Orchestrator pattern, agent management
- **research-mcp-server**: Plugin architecture, service layer, caching

Choose patterns based on your server's complexity and requirements. Simple servers can start monolithic and refactor to plugins as they grow.

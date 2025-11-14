# Real MCP Tool Examples

This document contains actual tool implementations extracted from working MCP servers. Each example includes the complete tool definition, handler, and supporting code.

## Example 1: Literature Search Tool

**Source**: research-mcp-server
**Purpose**: Search academic literature across multiple databases
**Complexity**: High - Multi-source, filtering, caching, validation

### Tool Definition

```typescript
{
  name: 'search_literature',
  description: 'Search academic literature across multiple databases (PubMed, Semantic Scholar, CrossRef, ArXiv)',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (e.g., "COVID-19 vaccine efficacy")'
      },
      sources: {
        type: 'array',
        items: { type: 'string', enum: ['pubmed', 'faers', 'web'] },
        description: 'Data sources to search',
        default: ['pubmed', 'web']
      },
      filters: {
        type: 'object',
        properties: {
          dateRange: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date' },
              end: { type: 'string', format: 'date' }
            }
          },
          author: { type: 'string' },
          journal: { type: 'string' },
          meshTerms: { type: 'array', items: { type: 'string' } }
        }
      },
      options: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          sortBy: { type: 'string', enum: ['relevance', 'date', 'citations'] }
        }
      }
    },
    required: ['query']
  }
}
```

### Handler Implementation

```typescript
private async searchLiterature(args: any): Promise<any> {
  // Validate with Zod
  const SearchLiteratureSchema = z.object({
    query: z.string().min(1, 'Query cannot be empty'),
    sources: z.array(z.enum(['pubmed', 'faers', 'web'])).optional().default(['pubmed', 'web']),
    filters: z.object({
      dateRange: z.object({
        start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
      }).optional(),
      author: z.string().optional(),
      journal: z.string().optional(),
      meshTerms: z.array(z.string()).optional()
    }).optional(),
    options: z.object({
      limit: z.number().min(1).max(100).optional().default(20),
      sortBy: z.enum(['relevance', 'date', 'citations']).optional().default('relevance')
    }).optional()
  });

  const validatedArgs = SearchLiteratureSchema.parse(args);

  const query: SearchQuery = {
    query: validatedArgs.query,
    filters: validatedArgs.filters,
    options: validatedArgs.options
  };

  this.logger.info('Executing literature search', {
    query: query.query,
    sources: validatedArgs.sources
  });

  // Execute searches across selected sources
  const results = await this.pluginManager.search(validatedArgs.sources, query);

  // Format results
  const formattedResults = this.formatSearchResults(results);

  return {
    content: [{
      type: 'text',
      text: formattedResults
    }]
  };
}
```

### Supporting Code

```typescript
// Result formatting
private formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No results found for your query.';
  }

  const grouped = this.groupResultsBySource(results);
  let output = `# Literature Search Results\n\nFound ${results.length} results:\n\n`;

  for (const [source, sourceResults] of Object.entries(grouped)) {
    output += `## ${this.formatSourceName(source)} (${sourceResults.length})\n\n`;

    sourceResults.slice(0, 10).forEach((result, index) => {
      output += `### ${index + 1}. ${result.title}\n\n`;

      if (result.authors && result.authors.length > 0) {
        const authorNames = result.authors.slice(0, 5).map(a => a.name).join(', ');
        output += `**Authors:** ${authorNames}\n\n`;
      }

      if (result.publicationDate) {
        output += `**Published:** ${result.publicationDate.toISOString().split('T')[0]}\n\n`;
      }

      if (result.abstract) {
        output += `**Abstract:** ${result.abstract.substring(0, 300)}...\n\n`;
      }

      if (result.doi) {
        output += `**DOI:** [${result.doi}](https://doi.org/${result.doi})\n\n`;
      }

      output += '---\n\n';
    });
  }

  return output;
}

private groupResultsBySource(results: SearchResult[]): Record<string, SearchResult[]> {
  const grouped: Record<string, SearchResult[]> = {};

  for (const result of results) {
    if (!grouped[result.source]) {
      grouped[result.source] = [];
    }
    grouped[result.source].push(result);
  }

  return grouped;
}
```

### Design Decisions

1. **Zod validation**: Catches invalid input before processing
2. **Multi-source support**: Aggregates results from multiple APIs
3. **Markdown formatting**: Readable output for users
4. **Result limiting**: Prevents overwhelming responses
5. **Error handling**: Each layer handles its own errors

## Example 2: Agent Launch Tool

**Source**: claude-code-mcp-server
**Purpose**: Launch and manage Claude Code agent instances
**Complexity**: High - Process management, stdio communication, state tracking

### Tool Definition

```typescript
{
  name: 'launch_claude_agent',
  description: 'Launch a new Claude Code agent instance with full access to Claude Code capabilities',
  inputSchema: {
    type: 'object',
    properties: {
      agent_name: {
        type: 'string',
        description: 'Descriptive name for the agent (e.g., "code-reviewer")'
      },
      initial_prompt: {
        type: 'string',
        description: 'Initial prompt/task to give the agent'
      },
      working_directory: {
        type: 'string',
        description: 'Working directory for the agent (defaults to current)'
      }
    },
    required: ['agent_name', 'initial_prompt']
  }
}
```

### Handler Implementation

```typescript
async launchAgent(config: AgentConfig): Promise<{
  success: boolean;
  agent_id?: string;
  message: string;
}> {
  const agentId = randomUUID();
  const workingDir = config.workingDirectory || process.cwd();

  try {
    // Spawn Claude CLI process
    const childProcess = spawn(
      'claude',
      ['--chat'],
      {
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
        },
      }
    );

    // Create agent record
    const agent: Agent = {
      id: agentId,
      name: config.name,
      process: childProcess,
      workingDirectory: workingDir,
      status: 'starting',
      createdAt: new Date(),
      outputBuffer: [],
      errorBuffer: [],
    };

    // Set up output handlers
    childProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      agent.outputBuffer.push(output);

      // Detect when agent is ready
      if (output.includes('You:') || output.includes('>')) {
        agent.status = 'waiting';
      }
    });

    childProcess.stderr?.on('data', (data) => {
      agent.errorBuffer.push(data.toString());
    });

    childProcess.on('exit', (code) => {
      agent.status = 'terminated';
      console.error(`Agent ${agentId} exited with code ${code}`);
    });

    // Store agent
    this.agents.set(agentId, agent);

    // Wait for agent to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Send initial prompt
    if (agent.status === 'waiting') {
      agent.status = 'running';
      childProcess.stdin?.write(config.initialPrompt + '\n');
    }

    return {
      success: true,
      agent_id: agentId,
      message: `Agent '${config.name}' launched successfully with ID: ${agentId}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to launch agent: ${errorMessage}`,
    };
  }
}
```

### Supporting Code

```typescript
// Agent state interface
interface Agent {
  id: string;
  name: string;
  process: ChildProcess;
  workingDirectory: string;
  status: 'starting' | 'running' | 'waiting' | 'terminated';
  createdAt: Date;
  outputBuffer: string[];
  errorBuffer: string[];
}

// Send prompt to agent
async sendPrompt(
  agentId: string,
  prompt: string
): Promise<{ success: boolean; message: string }> {
  const agent = this.agents.get(agentId);

  if (!agent) {
    return {
      success: false,
      message: `Agent with ID ${agentId} not found`,
    };
  }

  if (agent.status === 'terminated') {
    return {
      success: false,
      message: `Agent ${agentId} has been terminated`,
    };
  }

  try {
    agent.status = 'running';
    agent.process.stdin?.write(prompt + '\n');

    return {
      success: true,
      message: `Prompt sent to agent ${agentId}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to send prompt: ${errorMessage}`,
    };
  }
}

// Get agent output
async getAgentOutput(
  agentId: string,
  waitForCompletion: boolean = false
): Promise<{
  agent_id: string;
  status: string;
  output: string;
  errors: string;
}> {
  const agent = this.agents.get(agentId);

  if (!agent) {
    throw new Error(`Agent with ID ${agentId} not found`);
  }

  // Wait for completion if requested
  if (waitForCompletion) {
    let attempts = 0;
    while (agent.status === 'running' && attempts < 60) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }
  }

  // Get and clear buffers
  const output = agent.outputBuffer.join('');
  const errors = agent.errorBuffer.join('');

  agent.outputBuffer = [];
  agent.errorBuffer = [];

  return {
    agent_id: agentId,
    status: agent.status,
    output,
    errors,
  };
}
```

### Design Decisions

1. **UUID for IDs**: Unique, unpredictable agent identifiers
2. **Buffered output**: Store output for later retrieval
3. **Status tracking**: Monitor agent lifecycle states
4. **Cleanup on exit**: Handle process termination gracefully
5. **Non-blocking**: Launch doesn't wait for completion

## Example 3: Health Check Tool

**Source**: research-mcp-server
**Purpose**: Check server and plugin health status
**Complexity**: Medium - Aggregates status from multiple sources

### Tool Definition

```typescript
{
  name: 'health_check',
  description: 'Check the health status of all research data sources',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false
  }
}
```

### Handler Implementation

```typescript
private async healthCheck(): Promise<any> {
  this.logger.info('Executing health check');

  // Check plugin health
  const health = await this.pluginManager.healthCheck();

  // Get cache statistics
  const cacheStats = this.pluginManager.getCacheStats();

  // Determine overall status
  let status = 'All systems operational';
  const issues: string[] = [];

  for (const [plugin, pluginHealth] of Object.entries(health)) {
    if (!pluginHealth.healthy) {
      issues.push(`${plugin}: ${pluginHealth.message}`);
    }
  }

  if (issues.length > 0) {
    status = `Issues detected:\n${issues.join('\n')}`;
  }

  // Format health report
  const healthReport = `# Research MCP Server Health Check

## Status: ${issues.length === 0 ? '✅ Healthy' : '⚠️ Issues Detected'}

${status}

## Plugin Status:
${Object.entries(health).map(([plugin, pluginHealth]) =>
  `- **${plugin}**: ${pluginHealth.healthy ? '✅' : '❌'} ${pluginHealth.message || ''} (${pluginHealth.responseTime}ms)`
).join('\n')}

## Cache Statistics:
- **Entries**: ${cacheStats.entries}
- **Size**: ${Math.round(cacheStats.size / 1024 / 1024 * 100) / 100} MB

## Available Plugins:
${this.pluginManager.getLoadedPlugins().map(name => `- ${name}`).join('\n')}`;

  return {
    content: [{
      type: 'text',
      text: healthReport
    }]
  };
}
```

### Supporting Code

```typescript
// Plugin health check interface
interface HealthStatus {
  healthy: boolean;
  message?: string;
  responseTime: number;
}

// Plugin manager health check
async healthCheck(): Promise<Record<string, HealthStatus>> {
  const results: Record<string, HealthStatus> = {};

  for (const [name, plugin] of this.plugins) {
    const start = Date.now();
    try {
      await plugin.healthCheck();
      results[name] = {
        healthy: true,
        responseTime: Date.now() - start
      };
    } catch (error) {
      results[name] = {
        healthy: false,
        message: error.message,
        responseTime: Date.now() - start
      };
    }
  }

  return results;
}

// Plugin health check implementation
protected async performHealthCheck(): Promise<void> {
  // Test connectivity with simple request
  const testParams: SearchParams = {
    query: 'test',
    limit: 1
  };

  await this.client.search(testParams);
}
```

### Design Decisions

1. **No parameters**: Health check requires no input
2. **Comprehensive status**: Checks all plugins individually
3. **Performance metrics**: Includes response times
4. **Cache visibility**: Shows cache usage
5. **Clear indicators**: Uses emoji for quick status assessment

## Example 4: Simple Echo Tool

**Source**: basic-mcp-server template
**Purpose**: Test server connectivity and basic functionality
**Complexity**: Low - Minimal validation and processing

### Tool Definition

```typescript
{
  name: 'echo',
  description: 'Echoes back the provided message with metadata',
  inputSchema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'The message to echo back'
      }
    },
    required: ['message']
  }
}
```

### Handler Implementation

```typescript
function handleEcho(args: any): any {
  // Validate required parameters
  if (typeof args.message !== 'string') {
    throw new Error('message must be a string');
  }

  return {
    echoed: args.message,
    length: args.message.length,
    timestamp: new Date().toISOString(),
    reversed: args.message.split('').reverse().join('')
  };
}
```

### Design Decisions

1. **Simple validation**: Type check only
2. **Useful metadata**: Length, timestamp, reversed text
3. **No external calls**: Pure function
4. **Predictable**: Same input always produces same output (except timestamp)
5. **Testing tool**: Verifies MCP communication works

## Example 5: Calculate Tool

**Source**: basic-mcp-server template
**Purpose**: Demonstrate parameter validation and enums
**Complexity**: Low - Basic arithmetic with validation

### Tool Definition

```typescript
{
  name: 'calculate',
  description: 'Performs simple arithmetic operations',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['add', 'subtract', 'multiply', 'divide'],
        description: 'The operation to perform'
      },
      a: {
        type: 'number',
        description: 'First operand'
      },
      b: {
        type: 'number',
        description: 'Second operand'
      }
    },
    required: ['operation', 'a', 'b']
  }
}
```

### Handler Implementation

```typescript
function handleCalculate(args: any): any {
  const { operation, a, b } = args;

  // Validate parameters
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both a and b must be numbers');
  }

  const validOperations = ['add', 'subtract', 'multiply', 'divide'];
  if (!validOperations.includes(operation)) {
    throw new Error(`Invalid operation. Must be one of: ${validOperations.join(', ')}`);
  }

  // Perform calculation
  let result: number;
  switch (operation) {
    case 'add':
      result = a + b;
      break;
    case 'subtract':
      result = a - b;
      break;
    case 'multiply':
      result = a * b;
      break;
    case 'divide':
      if (b === 0) {
        throw new Error('Cannot divide by zero');
      }
      result = a / b;
      break;
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return {
    operation,
    a,
    b,
    result,
    expression: `${a} ${getOperationSymbol(operation)} ${b} = ${result}`,
  };
}

function getOperationSymbol(operation: string): string {
  const symbols: Record<string, string> = {
    add: '+',
    subtract: '-',
    multiply: '*',
    divide: '/',
  };
  return symbols[operation] || operation;
}
```

### Design Decisions

1. **Enum validation**: Limits operations to known set
2. **Edge case handling**: Division by zero check
3. **Helpful output**: Includes formatted expression
4. **Type validation**: Ensures numeric inputs
5. **Extensible**: Easy to add new operations

## Key Patterns Across Examples

### 1. Validation Pattern

All tools validate inputs before processing:
- Type checking
- Required field verification
- Enum validation
- Range checking

### 2. Error Handling Pattern

Consistent error handling:
```typescript
try {
  const result = await processData(args);
  return {
    content: [{ type: 'text', text: JSON.stringify(result) }]
  };
} catch (error) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }],
    isError: true
  };
}
```

### 3. Response Formatting Pattern

Two approaches observed:
- **JSON**: Structured data, easy to parse
- **Markdown**: Human-readable, formatted output

### 4. Metadata Pattern

Include helpful metadata:
- Timestamps
- Request IDs
- Result counts
- Performance metrics

### 5. Logging Pattern

All handlers log:
- Input parameters
- Execution status
- Errors
- Performance data

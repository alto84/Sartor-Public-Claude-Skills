# MCP Tool Implementation Patterns

This document provides real-world patterns for implementing different types of MCP tools, extracted from working implementations.

## Pattern 1: Simple Data Retrieval Tool

**Use case**: Fetch data from an API or database

**Example**: Health check tool (from research-mcp-server)

```typescript
{
  name: 'health_check',
  description: 'Check the health status of all data sources',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false
  }
}

// Handler
async function handleHealthCheck(): Promise<any> {
  try {
    // Collect health status from various sources
    const health = await checkDataSources();
    const stats = await getSystemStats();

    // Format response
    const report = `# System Health Check

## Status: ${health.allHealthy ? '✅ Healthy' : '⚠️ Issues Detected'}

## Components:
${formatHealthStatus(health.components)}

## System Statistics:
- Memory Usage: ${stats.memory}
- Cache Size: ${stats.cacheSize}
- Uptime: ${stats.uptime}`;

    return {
      content: [{
        type: 'text',
        text: report
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Health check failed: ${error.message}`
      }],
      isError: true
    };
  }
}
```

**Key points**:
- No required parameters
- Aggregates data from multiple sources
- Formats output as readable text
- Includes comprehensive error handling

## Pattern 2: Search Tool with Filters

**Use case**: Query external APIs with filtering

**Example**: Literature search (from research-mcp-server)

```typescript
{
  name: 'search_literature',
  description: 'Search academic literature across multiple databases',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query'
      },
      sources: {
        type: 'array',
        items: { type: 'string', enum: ['pubmed', 'web', 'faers'] },
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
          author: { type: 'string' }
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

// Handler with validation
async function handleSearch(args: any): Promise<any> {
  // Validate using Zod
  const SearchSchema = z.object({
    query: z.string().min(1, 'Query cannot be empty'),
    sources: z.array(z.enum(['pubmed', 'web', 'faers'])).optional().default(['pubmed']),
    filters: z.object({
      dateRange: z.object({
        start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
      }).optional(),
      author: z.string().optional()
    }).optional(),
    options: z.object({
      limit: z.number().min(1).max(100).default(20),
      sortBy: z.enum(['relevance', 'date', 'citations']).default('relevance')
    }).optional()
  });

  try {
    const validated = SearchSchema.parse(args);

    // Execute search
    const results = await performSearch(validated);

    // Format results
    return {
      content: [{
        type: 'text',
        text: formatSearchResults(results)
      }]
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [{
          type: 'text',
          text: `Validation error: ${error.errors[0].message}`
        }],
        isError: true
      };
    }
    throw error;
  }
}
```

**Key points**:
- Complex nested parameters
- Optional parameters with defaults
- Input validation with Zod
- Enum constraints for limited options
- Error differentiation (validation vs execution)

## Pattern 3: Agent Orchestration Tool

**Use case**: Manage child processes or agents

**Example**: Launch agent (from claude-code-mcp-server)

```typescript
{
  name: 'launch_claude_agent',
  description: 'Launch a new Claude Code agent instance',
  inputSchema: {
    type: 'object',
    properties: {
      agent_name: {
        type: 'string',
        description: 'Descriptive name for the agent'
      },
      initial_prompt: {
        type: 'string',
        description: 'Initial task for the agent'
      },
      working_directory: {
        type: 'string',
        description: 'Working directory (defaults to current)'
      }
    },
    required: ['agent_name', 'initial_prompt']
  }
}

// Handler
async function handleLaunchAgent(args: any): Promise<any> {
  const { agent_name, initial_prompt, working_directory } = args;

  try {
    // Spawn child process
    const agentId = generateAgentId();
    const workingDir = working_directory || process.cwd();

    const childProcess = spawn(
      'claude',
      ['--chat'],
      {
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe']
      }
    );

    // Track agent state
    agents.set(agentId, {
      id: agentId,
      name: agent_name,
      process: childProcess,
      status: 'starting',
      createdAt: new Date()
    });

    // Setup process handlers
    childProcess.stdout.on('data', (data) => {
      handleAgentOutput(agentId, data);
    });

    childProcess.on('exit', (code) => {
      handleAgentExit(agentId, code);
    });

    // Wait for agent to be ready
    await waitForAgentReady(agentId);

    // Send initial prompt
    childProcess.stdin.write(initial_prompt + '\n');

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          agent_id: agentId,
          message: `Agent '${agent_name}' launched successfully`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: error.message
        }, null, 2)
      }],
      isError: true
    };
  }
}
```

**Key points**:
- Process lifecycle management
- Asynchronous initialization
- State tracking
- Event handling
- Proper cleanup

## Pattern 4: Analysis Tool with Multiple Steps

**Use case**: Multi-step analysis workflow

**Example**: Drug safety analysis (from research-mcp-server)

```typescript
{
  name: 'analyze_drug_safety',
  description: 'Analyze drug safety data from FDA FAERS',
  inputSchema: {
    type: 'object',
    properties: {
      drugName: {
        type: 'string',
        description: 'Name of the drug to analyze'
      },
      analysisType: {
        type: 'string',
        enum: ['adverse_events', 'interactions', 'demographics'],
        description: 'Type of analysis to perform'
      },
      dateRange: {
        type: 'object',
        properties: {
          start: { type: 'string', format: 'date' },
          end: { type: 'string', format: 'date' }
        }
      }
    },
    required: ['drugName', 'analysisType']
  }
}

// Handler
async function handleDrugSafetyAnalysis(args: any): Promise<any> {
  const { drugName, analysisType, dateRange } = args;

  try {
    // Step 1: Fetch raw data
    const rawData = await fetchFAERSData(drugName, dateRange);

    // Step 2: Process based on analysis type
    let analysis;
    switch (analysisType) {
      case 'adverse_events':
        analysis = await analyzeAdverseEvents(rawData);
        break;
      case 'interactions':
        analysis = await analyzeDrugInteractions(rawData);
        break;
      case 'demographics':
        analysis = await analyzeDemographics(rawData);
        break;
    }

    // Step 3: Generate report
    const report = formatAnalysisReport(analysis, drugName, analysisType);

    return {
      content: [{
        type: 'text',
        text: report
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Analysis failed: ${error.message}`
      }],
      isError: true
    };
  }
}

// Helper: Format analysis report
function formatAnalysisReport(analysis: any, drugName: string, type: string): string {
  return `# Drug Safety Analysis: ${drugName}

## Analysis Type: ${type}

## Summary
- Total Events: ${analysis.totalEvents.toLocaleString()}
- Serious Events: ${analysis.seriousEvents.toLocaleString()}

## Top Findings
${analysis.topFindings.map((f: any, i: number) =>
  `${i + 1}. ${f.name}: ${f.count} reports`
).join('\n')}

*Note: This analysis is based on FAERS data and should be interpreted by qualified healthcare professionals.*`;
}
```

**Key points**:
- Multi-step workflow
- Type-specific processing
- Data aggregation
- Formatted output with markdown
- Appropriate disclaimers

## Parameter Validation Best Practices

### 1. Always validate required parameters

```typescript
function validateArgs(args: any, required: string[]): void {
  for (const field of required) {
    if (!(field in args) || args[field] === null || args[field] === undefined) {
      throw new Error(`Required parameter missing: ${field}`);
    }
  }
}
```

### 2. Validate parameter types

```typescript
function validateTypes(args: any, schema: Record<string, string>): void {
  for (const [field, expectedType] of Object.entries(schema)) {
    if (field in args && typeof args[field] !== expectedType) {
      throw new Error(`Parameter '${field}' must be ${expectedType}, got ${typeof args[field]}`);
    }
  }
}
```

### 3. Validate enum values

```typescript
function validateEnum(value: any, allowedValues: string[], fieldName: string): void {
  if (!allowedValues.includes(value)) {
    throw new Error(`Invalid ${fieldName}: '${value}'. Must be one of: ${allowedValues.join(', ')}`);
  }
}
```

## Error Response Patterns

### 1. Validation Error

```typescript
{
  content: [{
    type: 'text',
    text: JSON.stringify({
      error: 'Validation failed',
      details: 'query parameter is required',
      received: args
    }, null, 2)
  }],
  isError: true
}
```

### 2. Not Found Error

```typescript
{
  content: [{
    type: 'text',
    text: JSON.stringify({
      error: 'Resource not found',
      resource: agentId,
      available: getAvailableResources()
    }, null, 2)
  }],
  isError: true
}
```

### 3. External API Error

```typescript
{
  content: [{
    type: 'text',
    text: JSON.stringify({
      error: 'External API request failed',
      service: 'PubMed',
      message: error.message,
      retryable: isRetryableError(error)
    }, null, 2)
  }],
  isError: true
}
```

## Success Response Patterns

### 1. Simple Data

```typescript
{
  content: [{
    type: 'text',
    text: JSON.stringify({ result: 'success', data: processedData }, null, 2)
  }]
}
```

### 2. Formatted Text

```typescript
{
  content: [{
    type: 'text',
    text: formatAsMarkdown(data)
  }]
}
```

### 3. Structured Result with Metadata

```typescript
{
  content: [{
    type: 'text',
    text: JSON.stringify({
      success: true,
      data: results,
      metadata: {
        count: results.length,
        timestamp: new Date().toISOString(),
        cached: fromCache
      }
    }, null, 2)
  }]
}
```

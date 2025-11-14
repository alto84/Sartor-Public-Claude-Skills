# MCP Protocol Specification Reference

This document describes the Model Context Protocol as observed in working implementations. These are empirical observations from actual servers, not theoretical specifications.

## Protocol Basics

### Transport Layer

**Observed in**: claude-code-mcp-server, research-mcp-server

MCP uses stdio (standard input/output) for communication:
- **Input**: JSON-RPC messages via stdin
- **Output**: JSON-RPC responses via stdout
- **Logging**: Server logs via stderr (critical - stdout must be clean)

```typescript
// Server initialization
const transport = new StdioServerTransport();
await server.connect(transport);

// This pattern appears in both servers examined
```

### Message Format

All MCP messages use JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "method_name",
  "params": {}
}
```

## Request Types Observed

### 1. List Tools Request

**Method**: `tools/list`

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "tool_name",
        "description": "What the tool does",
        "inputSchema": {
          "type": "object",
          "properties": {},
          "required": []
        }
      }
    ]
  }
}
```

**Implementation pattern** (from both servers):
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [/* tool definitions */]
  };
});
```

### 2. Call Tool Request

**Method**: `tools/call`

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": {
      "param1": "value1"
    }
  }
}
```

**Success Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Result data as JSON string"
      }
    ]
  }
}
```

**Error Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"error\": \"Error message\"}"
      }
    ],
    "isError": true
  }
}
```

**Implementation pattern**:
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Execute tool
    const result = await executeTool(name, args);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: error.message }, null, 2)
      }],
      isError: true
    };
  }
});
```

### 3. List Resources Request

**Method**: `resources/list`

**Observed in**: claude-code-mcp-server (not all servers implement this)

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "resources/list",
  "params": {}
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "resources": [
      {
        "uri": "custom://resource/id",
        "name": "Resource Name",
        "description": "What this resource provides",
        "mimeType": "text/plain"
      }
    ]
  }
}
```

### 4. Read Resource Request

**Method**: `resources/read`

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "resources/read",
  "params": {
    "uri": "custom://resource/id"
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "contents": [
      {
        "uri": "custom://resource/id",
        "mimeType": "text/plain",
        "text": "Resource content"
      }
    ]
  }
}
```

## Server Capabilities Declaration

Servers declare capabilities during initialization:

```typescript
const server = new Server(
  {
    name: 'server-name',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {},      // Indicates tool support
      resources: {}   // Indicates resource support (optional)
    }
  }
);
```

**Observed capabilities**:
- `tools`: All examined servers support tools
- `resources`: Only claude-code-mcp-server implements resources
- Other capabilities may exist but were not observed

## Tool Schema Format

Tool schemas use JSON Schema format:

### Required Fields
- `name`: String identifier for the tool
- `description`: Human-readable description
- `inputSchema`: JSON Schema object

### Input Schema Structure

```json
{
  "type": "object",
  "properties": {
    "param_name": {
      "type": "string",
      "description": "Parameter description"
    }
  },
  "required": ["param_name"]
}
```

### Supported Types (observed)

- `string`: Text values
- `number`: Numeric values
- `boolean`: True/false
- `object`: Nested objects
- `array`: Lists of values

### Supported Constraints (observed)

```json
{
  "type": "string",
  "enum": ["option1", "option2"],
  "minLength": 1
}

{
  "type": "number",
  "minimum": 1,
  "maximum": 100
}

{
  "type": "array",
  "items": { "type": "string" }
}
```

## Error Handling Patterns

### Pattern 1: Tool Not Found

```typescript
if (!toolExists(name)) {
  throw new Error(`Unknown tool: ${name}`);
}
```

Returns error response with `isError: true`

### Pattern 2: Missing Arguments

```typescript
if (!args) {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ error: 'No arguments provided' })
    }],
    isError: true
  };
}
```

### Pattern 3: Validation Failure

**Using Zod** (observed in research-mcp-server):
```typescript
try {
  const validated = Schema.parse(args);
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

### Pattern 4: Execution Error

```typescript
try {
  const result = await riskyOperation();
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ error: errorMessage })
    }],
    isError: true
  };
}
```

## Lifecycle Events

### Server Startup

```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Server running'); // Note: stderr, not stdout
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

### Graceful Shutdown

**Observed in**: research-mcp-server

```typescript
process.on('SIGINT', async () => {
  console.error('Shutting down...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down...');
  await server.stop();
  process.exit(0);
});
```

### Unhandled Errors

```typescript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
```

## Content Types

### Text Content (observed in all servers)

```json
{
  "type": "text",
  "text": "Content as string"
}
```

Used for:
- JSON responses (stringified)
- Markdown formatted output
- Plain text messages
- Error messages

### Other Content Types

Not observed in examined implementations. The SDK may support other types, but these servers only use `text`.

## Protocol Constraints

### Critical Rules (based on implementation failures)

1. **Never use console.log**: Corrupts stdio protocol
2. **Always use console.error for logging**: Keeps stdout clean
3. **Validate all inputs**: Protocol doesn't guarantee type safety
4. **Handle all errors**: Uncaught errors crash the server
5. **Use proper JSON-RPC format**: Required for compatibility

### Recommended Practices (from working servers)

1. **Structured error responses**: Include error details in JSON
2. **Input validation**: Use Zod or similar before processing
3. **Graceful shutdown**: Handle SIGINT/SIGTERM
4. **Health check tool**: Include for debugging
5. **Descriptive tool schemas**: Clear descriptions help users

## SDK Versions Observed

- `@modelcontextprotocol/sdk@0.5.0` (research-mcp-server)
- `@modelcontextprotocol/sdk@1.0.4` (claude-code-mcp-server)

**Note**: API appears stable across these versions, but breaking changes are possible.

## Limitations of This Reference

This specification is based on two working MCP server implementations:
1. claude-code-mcp-server (orchestrator pattern)
2. research-mcp-server (plugin-based pattern)

**Not covered**:
- Prompts capability (not observed)
- Sampling capability (not observed)
- HTTP or WebSocket transports (only stdio observed)
- Binary content types (only text observed)
- Streaming responses (not observed)
- Pagination (not observed in protocol layer)

**Source of truth**: For official specification, refer to MCP documentation at modelcontextprotocol.io. This document reflects actual implementation patterns only.

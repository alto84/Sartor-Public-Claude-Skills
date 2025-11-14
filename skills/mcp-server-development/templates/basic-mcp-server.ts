#!/usr/bin/env node

/**
 * Basic MCP Server Template
 *
 * This is a minimal working MCP server extracted from actual implementations.
 * It demonstrates the essential patterns for:
 * - Server initialization
 * - Stdio transport
 * - Tool definition and handling
 * - Error handling
 * - Graceful shutdown
 *
 * To use this template:
 * 1. Install dependencies: npm install @modelcontextprotocol/sdk
 * 2. Build: tsc basic-mcp-server.ts
 * 3. Run: node basic-mcp-server.js
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Initialize the MCP server
 *
 * The server declaration includes:
 * - name: Identifier for your server
 * - version: Semantic version
 * - capabilities: What features the server supports
 */
const server = new Server(
  {
    name: 'basic-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}, // Enable tool support
    },
  }
);

/**
 * Define available tools
 *
 * Each tool needs:
 * - name: Unique identifier
 * - description: What the tool does
 * - inputSchema: JSON Schema for parameters
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'echo',
        description: 'Echoes back the provided message. Useful for testing server connectivity.',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message to echo back',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'calculate',
        description: 'Performs a simple calculation (add, subtract, multiply, divide)',
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              enum: ['add', 'subtract', 'multiply', 'divide'],
              description: 'The operation to perform',
            },
            a: {
              type: 'number',
              description: 'First operand',
            },
            b: {
              type: 'number',
              description: 'Second operand',
            },
          },
          required: ['operation', 'a', 'b'],
        },
      },
    ],
  };
});

/**
 * Handle tool execution
 *
 * Pattern:
 * 1. Extract tool name and arguments
 * 2. Validate arguments exist
 * 3. Route to appropriate handler
 * 4. Return formatted response or error
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Validate arguments exist
  if (!args) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'No arguments provided' }, null, 2),
        },
      ],
      isError: true,
    };
  }

  try {
    // Route to appropriate tool handler
    switch (name) {
      case 'echo': {
        const result = handleEcho(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'calculate': {
        const result = handleCalculate(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    // Always catch and format errors properly
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Tool Implementation: Echo
 *
 * Simple tool that demonstrates:
 * - Parameter validation
 * - Type checking
 * - Response formatting
 */
function handleEcho(args: any): any {
  // Validate required parameters
  if (typeof args.message !== 'string') {
    throw new Error('message must be a string');
  }

  return {
    echoed: args.message,
    length: args.message.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Tool Implementation: Calculate
 *
 * Demonstrates:
 * - Multiple parameter validation
 * - Enum validation
 * - Error handling for edge cases
 */
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

/**
 * Helper function
 */
function getOperationSymbol(operation: string): string {
  const symbols: Record<string, string> = {
    add: '+',
    subtract: '-',
    multiply: '*',
    divide: '/',
  };
  return symbols[operation] || operation;
}

/**
 * Start the server
 *
 * CRITICAL: Use StdioServerTransport for stdio communication
 * CRITICAL: All logging must use console.error, never console.log
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Use console.error for logging - console.log corrupts stdio
  console.error('Basic MCP Server running on stdio');
  console.error('Available tools: echo, calculate');
}

/**
 * Graceful shutdown handlers
 *
 * Important for cleanup when server is terminated
 */
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

/**
 * Error handlers for unhandled errors
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Start the server
 */
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

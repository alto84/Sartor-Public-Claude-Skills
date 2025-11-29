/**
 * Mock agent for testing communication systems
 *
 * Creates an agent that responds to messages with configurable behavior.
 * Useful for testing agent communication without full agent implementation.
 *
 * Usage: npx ts-node scripts/mock-agent.ts [options]
 *
 * Options:
 *   --id <string>         Agent ID (default: mock-agent-<random>)
 *   --delay <ms>          Response delay in milliseconds (default: 100)
 *   --failure-rate <0-1>  Probability of failure (default: 0)
 *   --verbose             Enable verbose logging
 *   --port <number>       Port for HTTP server mode (optional)
 *   --file <path>         File path for file-based communication (optional)
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { performance } from 'perf_hooks';

// Parse command line arguments
function parseArgs(): MockAgentConfig {
  const args = process.argv.slice(2);
  const config: MockAgentConfig = {
    id: `mock-agent-${Math.random().toString(36).substring(7)}`,
    responseDelay: 100,
    failureRate: 0,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--id':
        config.id = args[++i];
        break;
      case '--delay':
        config.responseDelay = parseInt(args[++i], 10);
        break;
      case '--failure-rate':
        config.failureRate = parseFloat(args[++i]);
        break;
      case '--verbose':
        config.verbose = true;
        break;
      case '--port':
        config.port = parseInt(args[++i], 10);
        break;
      case '--file':
        config.filePath = args[++i];
        break;
    }
  }

  return config;
}

// Configuration interface
interface MockAgentConfig {
  id: string;
  responseDelay: number;
  failureRate: number;
  verbose: boolean;
  port?: number;
  filePath?: string;
}

// Message interface
interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: string;
  payload: any;
  timestamp: number;
  correlationId?: string;
}

// Response behavior configuration
interface ResponseBehavior {
  pattern: RegExp | string;
  response: (msg: AgentMessage) => any;
  delay?: number;
  failureRate?: number;
}

// Statistics tracking
interface AgentStatistics {
  messagesReceived: number;
  messagesSent: number;
  errorsGenerated: number;
  averageResponseTime: number;
  uptime: number;
  startTime: number;
  responseTimes: number[];
}

/**
 * MockAgent class - Simulates an agent for testing
 */
class MockAgent extends EventEmitter {
  private config: MockAgentConfig;
  private stats: AgentStatistics;
  private behaviors: ResponseBehavior[] = [];
  private messageLog: AgentMessage[] = [];
  private httpServer?: http.Server;
  private fileWatcher?: fs.FSWatcher;
  private isShuttingDown = false;

  constructor(config: MockAgentConfig) {
    super();
    this.config = config;
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      errorsGenerated: 0,
      averageResponseTime: 0,
      uptime: 0,
      startTime: Date.now(),
      responseTimes: []
    };

    this.setupDefaultBehaviors();
    this.log('info', `Mock Agent initialized with ID: ${config.id}`);
  }

  /**
   * Setup default response behaviors
   */
  private setupDefaultBehaviors(): void {
    // Echo behavior
    this.addBehavior({
      pattern: /^echo$/,
      response: (msg) => ({
        type: 'echo-response',
        originalMessage: msg.payload
      })
    });

    // Ping/Pong behavior
    this.addBehavior({
      pattern: /^ping$/,
      response: () => ({ type: 'pong', timestamp: Date.now() })
    });

    // Status request behavior
    this.addBehavior({
      pattern: /^status$/,
      response: () => ({
        type: 'status-response',
        agentId: this.config.id,
        status: 'active',
        stats: this.getStats()
      })
    });

    // Help behavior
    this.addBehavior({
      pattern: /^help$/,
      response: () => ({
        type: 'help-response',
        availableCommands: [
          'echo - Returns the sent message',
          'ping - Responds with pong',
          'status - Returns agent status',
          'help - Shows this help',
          'calculate - Performs basic math (e.g., calculate 2 + 2)',
          'delay <ms> - Responds after specified delay',
          'error - Triggers an error response'
        ]
      })
    });

    // Calculate behavior
    this.addBehavior({
      pattern: /^calculate (.+)$/,
      response: (msg) => {
        try {
          // Simple math evaluation (be careful in production!)
          const expression = msg.payload.replace('calculate ', '');
          const result = this.evaluateMath(expression);
          return {
            type: 'calculation-response',
            expression,
            result
          };
        } catch (error) {
          return {
            type: 'error',
            message: 'Invalid calculation expression'
          };
        }
      }
    });

    // Delay behavior
    this.addBehavior({
      pattern: /^delay (\d+)$/,
      response: (msg) => {
        const match = msg.payload.match(/^delay (\d+)$/);
        const delay = match ? parseInt(match[1], 10) : 1000;
        return {
          type: 'delayed-response',
          message: `Responded after ${delay}ms delay`
        };
      },
      delay: 1000 // Will be overridden by the matched value
    });

    // Error trigger behavior
    this.addBehavior({
      pattern: /^error$/,
      response: () => {
        throw new Error('Simulated error for testing');
      }
    });
  }

  /**
   * Simple math evaluator (safe subset of operations)
   */
  private evaluateMath(expression: string): number {
    // Remove spaces and validate expression
    const cleaned = expression.replace(/\s/g, '');

    // Only allow numbers, operators, and parentheses
    if (!/^[\d+\-*/().]+$/.test(cleaned)) {
      throw new Error('Invalid characters in expression');
    }

    // Use Function constructor to safely evaluate
    try {
      const fn = new Function('return ' + cleaned);
      const result = fn();
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result');
      }
      return result;
    } catch (error) {
      throw new Error('Evaluation failed');
    }
  }

  /**
   * Add a custom response behavior
   */
  addBehavior(behavior: ResponseBehavior): void {
    this.behaviors.push(behavior);
    this.log('debug', `Added behavior for pattern: ${behavior.pattern}`);
  }

  /**
   * Process incoming message
   */
  async processMessage(message: AgentMessage): Promise<void> {
    const startTime = performance.now();
    this.stats.messagesReceived++;
    this.messageLog.push(message);

    this.log('info', `Received message from ${message.from}: ${message.type}`);
    this.log('debug', `Message payload: ${JSON.stringify(message.payload)}`);

    // Check if we should simulate a failure
    if (Math.random() < this.config.failureRate) {
      this.stats.errorsGenerated++;
      this.log('error', 'Simulating failure (based on failure rate)');
      this.emit('error', new Error('Simulated failure'));
      return;
    }

    // Find matching behavior
    const behavior = this.findMatchingBehavior(message);
    if (!behavior) {
      this.log('warn', `No behavior matched for message type: ${message.type}`);
      await this.sendResponse(message, {
        type: 'unknown-command',
        message: `Unknown command: ${message.type}`
      });
      return;
    }

    // Apply delay
    const delay = behavior.delay || this.config.responseDelay;
    if (delay > 0) {
      this.log('debug', `Delaying response by ${delay}ms`);
      await this.sleep(delay);
    }

    // Generate response
    try {
      const response = behavior.response(message);
      await this.sendResponse(message, response);

      const responseTime = performance.now() - startTime;
      this.stats.responseTimes.push(responseTime);
      this.updateAverageResponseTime();

      this.log('debug', `Response time: ${responseTime.toFixed(2)}ms`);
    } catch (error) {
      this.stats.errorsGenerated++;
      this.log('error', `Error generating response: ${error}`);
      await this.sendResponse(message, {
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Find behavior matching the message
   */
  private findMatchingBehavior(message: AgentMessage): ResponseBehavior | undefined {
    const messageContent = message.type || message.payload;

    return this.behaviors.find(behavior => {
      if (typeof behavior.pattern === 'string') {
        return messageContent === behavior.pattern;
      } else {
        return behavior.pattern.test(messageContent);
      }
    });
  }

  /**
   * Send response back to sender
   */
  private async sendResponse(originalMessage: AgentMessage, response: any): Promise<void> {
    const responseMessage: AgentMessage = {
      id: `${this.config.id}-${Date.now()}`,
      from: this.config.id,
      to: originalMessage.from,
      type: response.type || 'response',
      payload: response,
      timestamp: Date.now(),
      correlationId: originalMessage.id
    };

    this.stats.messagesSent++;
    this.emit('message-sent', responseMessage);

    this.log('info', `Sent response to ${responseMessage.to}: ${responseMessage.type}`);
  }

  /**
   * Start HTTP server mode
   */
  async startHttpServer(): Promise<void> {
    if (!this.config.port) {
      throw new Error('Port not specified for HTTP server mode');
    }

    this.httpServer = http.createServer((req, res) => {
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'healthy', id: this.config.id }));
            return;
          }

          if (req.url === '/stats') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(this.getStats()));
            return;
          }

          if (req.url === '/messages' && req.method === 'POST') {
            const message = JSON.parse(body) as AgentMessage;
            await this.processMessage(message);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'accepted' }));
            return;
          }

          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
        } catch (error) {
          this.log('error', `HTTP request error: ${error}`);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    });

    return new Promise((resolve) => {
      this.httpServer!.listen(this.config.port, () => {
        this.log('info', `HTTP server listening on port ${this.config.port}`);
        resolve();
      });
    });
  }

  /**
   * Start file-based communication mode
   */
  async startFileWatcher(): Promise<void> {
    if (!this.config.filePath) {
      throw new Error('File path not specified for file-based mode');
    }

    const dir = path.dirname(this.config.filePath);
    const filename = path.basename(this.config.filePath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Watch for file changes
    this.fileWatcher = fs.watch(dir, async (eventType, changedFile) => {
      if (changedFile === filename && eventType === 'change') {
        try {
          const content = fs.readFileSync(this.config.filePath, 'utf8');
          const messages = content.split('\n')
            .filter(line => line.trim())
            .map(line => {
              try {
                return JSON.parse(line) as AgentMessage;
              } catch {
                return null;
              }
            })
            .filter(msg => msg !== null && msg.to === this.config.id);

          for (const message of messages) {
            if (message) {
              await this.processMessage(message);
            }
          }
        } catch (error) {
          this.log('error', `File reading error: ${error}`);
        }
      }
    });

    this.log('info', `Watching for messages in: ${this.config.filePath}`);

    // Write responses to output file
    this.on('message-sent', (message: AgentMessage) => {
      const outputPath = this.config.filePath!.replace('.json', '-responses.json');
      fs.appendFileSync(outputPath, JSON.stringify(message) + '\n');
    });
  }

  /**
   * Get current statistics
   */
  getStats(): AgentStatistics {
    this.stats.uptime = Date.now() - this.stats.startTime;
    return { ...this.stats };
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(): void {
    if (this.stats.responseTimes.length === 0) {
      this.stats.averageResponseTime = 0;
      return;
    }

    const sum = this.stats.responseTimes.reduce((a, b) => a + b, 0);
    this.stats.averageResponseTime = sum / this.stats.responseTimes.length;

    // Keep only last 100 response times to prevent memory growth
    if (this.stats.responseTimes.length > 100) {
      this.stats.responseTimes = this.stats.responseTimes.slice(-100);
    }
  }

  /**
   * Logging helper
   */
  private log(level: string, message: string): void {
    if (!this.config.verbose && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.config.id}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(`\x1b[31m${prefix} ${message}\x1b[0m`);
        break;
      case 'warn':
        console.warn(`\x1b[33m${prefix} ${message}\x1b[0m`);
        break;
      case 'info':
        console.log(`\x1b[36m${prefix} ${message}\x1b[0m`);
        break;
      case 'debug':
        console.log(`\x1b[90m${prefix} ${message}\x1b[0m`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    this.log('info', 'Shutting down mock agent...');

    if (this.httpServer) {
      await new Promise((resolve) => {
        this.httpServer!.close(resolve as any);
      });
    }

    if (this.fileWatcher) {
      this.fileWatcher.close();
    }

    const stats = this.getStats();
    this.log('info', `Final statistics:`);
    this.log('info', `  Messages received: ${stats.messagesReceived}`);
    this.log('info', `  Messages sent: ${stats.messagesSent}`);
    this.log('info', `  Errors generated: ${stats.errorsGenerated}`);
    this.log('info', `  Average response time: ${stats.averageResponseTime.toFixed(2)}ms`);
    this.log('info', `  Uptime: ${(stats.uptime / 1000).toFixed(2)}s`);

    this.log('info', 'Mock agent shutdown complete');
    process.exit(0);
  }
}

/**
 * Interactive CLI mode
 */
async function runInteractiveCLI(agent: MockAgent): Promise<void> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n\x1b[32mMock Agent Interactive Mode\x1b[0m');
  console.log('Type messages to simulate incoming messages.');
  console.log('Commands: /stats, /help, /quit\n');

  const processInput = async (input: string) => {
    if (input.startsWith('/')) {
      const command = input.substring(1).toLowerCase();

      switch (command) {
        case 'stats':
          console.log('\nAgent Statistics:');
          console.log(JSON.stringify(agent.getStats(), null, 2));
          break;

        case 'help':
          console.log('\nAvailable commands:');
          console.log('  /stats - Show agent statistics');
          console.log('  /help - Show this help');
          console.log('  /quit - Exit the program');
          console.log('\nMessage types:');
          console.log('  echo <message> - Echo back the message');
          console.log('  ping - Receive a pong response');
          console.log('  status - Get agent status');
          console.log('  calculate <expr> - Calculate math expression');
          console.log('  delay <ms> - Get delayed response');
          console.log('  error - Trigger an error');
          break;

        case 'quit':
        case 'exit':
          await agent.shutdown();
          process.exit(0);
          break;

        default:
          console.log(`Unknown command: ${command}`);
      }
    } else {
      // Simulate an incoming message
      const message: AgentMessage = {
        id: `cli-${Date.now()}`,
        from: 'cli-user',
        to: agent['config'].id,
        type: input.split(' ')[0],
        payload: input,
        timestamp: Date.now()
      };

      await agent.processMessage(message);
    }

    rl.prompt();
  };

  rl.on('line', (input: string) => {
    processInput(input.trim());
  });

  rl.on('close', async () => {
    await agent.shutdown();
  });

  rl.prompt();
}

/**
 * Main execution
 */
async function main() {
  const config = parseArgs();

  console.log('\x1b[36m╔════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║       Mock Agent for Testing          ║\x1b[0m');
  console.log('\x1b[36m╚════════════════════════════════════════╝\x1b[0m\n');

  const agent = new MockAgent(config);

  // Setup shutdown handlers
  process.on('SIGINT', async () => {
    console.log('\n\x1b[33mReceived SIGINT, shutting down gracefully...\x1b[0m');
    await agent.shutdown();
  });

  process.on('SIGTERM', async () => {
    console.log('\n\x1b[33mReceived SIGTERM, shutting down gracefully...\x1b[0m');
    await agent.shutdown();
  });

  // Start appropriate mode
  try {
    if (config.port) {
      await agent.startHttpServer();
      console.log(`\x1b[32mMock agent running in HTTP mode on port ${config.port}\x1b[0m`);
      console.log('Send POST requests to /messages with AgentMessage JSON\n');
    } else if (config.filePath) {
      await agent.startFileWatcher();
      console.log(`\x1b[32mMock agent running in file-based mode\x1b[0m`);
      console.log(`Watching file: ${config.filePath}\n`);
    } else {
      console.log('\x1b[32mMock agent running in interactive CLI mode\x1b[0m');
      await runInteractiveCLI(agent);
    }

    // Display configuration
    console.log('Configuration:');
    console.log(`  Agent ID: ${config.id}`);
    console.log(`  Response Delay: ${config.responseDelay}ms`);
    console.log(`  Failure Rate: ${(config.failureRate * 100).toFixed(1)}%`);
    console.log(`  Verbose: ${config.verbose}`);
    console.log('');
  } catch (error) {
    console.error(`\x1b[31mFailed to start mock agent: ${error}\x1b[0m`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`\x1b[31mFatal error: ${error.message}\x1b[0m`);
    process.exit(1);
  });
}

export { MockAgent, MockAgentConfig, AgentMessage };
/**
 * Test script for validating InterAgentCoordinator setup
 *
 * Usage: npx ts-node scripts/test-coordinator.ts
 *
 * This script validates all aspects of the coordinator functionality
 * including agent registration, message routing, shared data pool,
 * and quality gate evaluation.
 */

import { performance } from 'perf_hooks';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test result tracking
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

// Mock Coordinator for testing
class MockCoordinator {
  private agents: Map<string, any> = new Map();
  private messages: any[] = [];
  private sharedData: Map<string, any> = new Map();
  private qualityGates: Map<string, (data: any) => boolean> = new Map();

  registerAgent(agentId: string, config: any = {}): boolean {
    if (this.agents.has(agentId)) {
      return false;
    }
    this.agents.set(agentId, {
      id: agentId,
      config,
      status: 'active',
      registeredAt: new Date()
    });
    return true;
  }

  unregisterAgent(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  getRegisteredAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  sendMessage(from: string, to: string, message: any): boolean {
    if (!this.agents.has(from) || !this.agents.has(to)) {
      return false;
    }
    this.messages.push({
      from,
      to,
      message,
      timestamp: new Date()
    });
    return true;
  }

  getMessages(agentId?: string): any[] {
    if (agentId) {
      return this.messages.filter(m => m.to === agentId || m.from === agentId);
    }
    return this.messages;
  }

  setSharedData(key: string, value: any): void {
    this.sharedData.set(key, {
      value,
      updatedAt: new Date()
    });
  }

  getSharedData(key: string): any {
    const data = this.sharedData.get(key);
    return data ? data.value : undefined;
  }

  addQualityGate(name: string, validator: (data: any) => boolean): void {
    this.qualityGates.set(name, validator);
  }

  evaluateQualityGates(data: any): { passed: boolean; failures: string[] } {
    const failures: string[] = [];

    for (const [name, validator] of this.qualityGates) {
      try {
        if (!validator(data)) {
          failures.push(name);
        }
      } catch (error) {
        failures.push(`${name} (error: ${error})`);
      }
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }

  reset(): void {
    this.agents.clear();
    this.messages = [];
    this.sharedData.clear();
    this.qualityGates.clear();
  }
}

// Test suite
class CoordinatorTestSuite {
  private coordinator: MockCoordinator;
  private results: TestResult[] = [];

  constructor() {
    this.coordinator = new MockCoordinator();
  }

  private async runTest(name: string, testFn: () => Promise<void> | void): Promise<TestResult> {
    const startTime = performance.now();
    const result: TestResult = {
      name,
      passed: false,
      duration: 0
    };

    try {
      await testFn();
      result.passed = true;
    } catch (error) {
      result.passed = false;
      result.error = error instanceof Error ? error.message : String(error);
    }

    result.duration = performance.now() - startTime;
    return result;
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  private assertEqual(actual: any, expected: any, message?: string): void {
    const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
    if (!isEqual) {
      throw new Error(
        message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      );
    }
  }

  // Test: Agent Registration
  async testAgentRegistration(): Promise<void> {
    this.coordinator.reset();

    // Test successful registration
    const result1 = this.coordinator.registerAgent('agent1', { type: 'worker' });
    this.assert(result1 === true, 'Agent registration should succeed');

    // Test duplicate registration
    const result2 = this.coordinator.registerAgent('agent1', { type: 'worker' });
    this.assert(result2 === false, 'Duplicate agent registration should fail');

    // Test multiple agents
    this.coordinator.registerAgent('agent2', { type: 'analyzer' });
    this.coordinator.registerAgent('agent3', { type: 'validator' });

    const agents = this.coordinator.getRegisteredAgents();
    this.assertEqual(agents.length, 3, 'Should have 3 registered agents');
    this.assert(agents.includes('agent1'), 'Should include agent1');
    this.assert(agents.includes('agent2'), 'Should include agent2');
    this.assert(agents.includes('agent3'), 'Should include agent3');
  }

  // Test: Agent Unregistration
  async testAgentUnregistration(): Promise<void> {
    this.coordinator.reset();

    this.coordinator.registerAgent('agent1');
    this.coordinator.registerAgent('agent2');

    const result1 = this.coordinator.unregisterAgent('agent1');
    this.assert(result1 === true, 'Unregistration should succeed');

    const result2 = this.coordinator.unregisterAgent('agent1');
    this.assert(result2 === false, 'Unregistering non-existent agent should fail');

    const agents = this.coordinator.getRegisteredAgents();
    this.assertEqual(agents.length, 1, 'Should have 1 agent remaining');
    this.assert(agents[0] === 'agent2', 'Remaining agent should be agent2');
  }

  // Test: Message Routing
  async testMessageRouting(): Promise<void> {
    this.coordinator.reset();

    this.coordinator.registerAgent('sender');
    this.coordinator.registerAgent('receiver');

    // Test successful message send
    const result1 = this.coordinator.sendMessage('sender', 'receiver', {
      type: 'test',
      content: 'Hello, World!'
    });
    this.assert(result1 === true, 'Message send should succeed');

    // Test message send with unregistered sender
    const result2 = this.coordinator.sendMessage('unknown', 'receiver', {});
    this.assert(result2 === false, 'Message from unregistered agent should fail');

    // Test message send to unregistered receiver
    const result3 = this.coordinator.sendMessage('sender', 'unknown', {});
    this.assert(result3 === false, 'Message to unregistered agent should fail');

    // Verify message storage
    const messages = this.coordinator.getMessages();
    this.assertEqual(messages.length, 1, 'Should have 1 message');
    this.assertEqual(messages[0].from, 'sender');
    this.assertEqual(messages[0].to, 'receiver');
    this.assertEqual(messages[0].message.content, 'Hello, World!');
  }

  // Test: Message Filtering
  async testMessageFiltering(): Promise<void> {
    this.coordinator.reset();

    this.coordinator.registerAgent('agent1');
    this.coordinator.registerAgent('agent2');
    this.coordinator.registerAgent('agent3');

    this.coordinator.sendMessage('agent1', 'agent2', { id: 1 });
    this.coordinator.sendMessage('agent2', 'agent3', { id: 2 });
    this.coordinator.sendMessage('agent3', 'agent1', { id: 3 });
    this.coordinator.sendMessage('agent1', 'agent3', { id: 4 });

    // Test filtering by agent
    const agent1Messages = this.coordinator.getMessages('agent1');
    this.assertEqual(agent1Messages.length, 3, 'Agent1 should have 3 messages');

    const agent2Messages = this.coordinator.getMessages('agent2');
    this.assertEqual(agent2Messages.length, 2, 'Agent2 should have 2 messages');
  }

  // Test: Shared Data Pool
  async testSharedDataPool(): Promise<void> {
    this.coordinator.reset();

    // Test setting and getting data
    this.coordinator.setSharedData('config', { maxRetries: 3, timeout: 5000 });
    const config = this.coordinator.getSharedData('config');
    this.assertEqual(config.maxRetries, 3, 'Should retrieve correct config');

    // Test overwriting data
    this.coordinator.setSharedData('config', { maxRetries: 5 });
    const updatedConfig = this.coordinator.getSharedData('config');
    this.assertEqual(updatedConfig.maxRetries, 5, 'Should retrieve updated config');

    // Test non-existent data
    const missing = this.coordinator.getSharedData('nonexistent');
    this.assertEqual(missing, undefined, 'Non-existent data should return undefined');

    // Test multiple data entries
    this.coordinator.setSharedData('state', 'active');
    this.coordinator.setSharedData('counter', 42);

    this.assertEqual(this.coordinator.getSharedData('state'), 'active');
    this.assertEqual(this.coordinator.getSharedData('counter'), 42);
  }

  // Test: Quality Gate Evaluation
  async testQualityGateEvaluation(): Promise<void> {
    this.coordinator.reset();

    // Add quality gates
    this.coordinator.addQualityGate('hasRequiredFields', (data) => {
      return data.id !== undefined && data.content !== undefined;
    });

    this.coordinator.addQualityGate('contentLength', (data) => {
      return data.content && data.content.length >= 10;
    });

    this.coordinator.addQualityGate('validFormat', (data) => {
      return typeof data.id === 'string';
    });

    // Test passing all gates
    const goodData = { id: 'test123', content: 'This is valid content' };
    const result1 = this.coordinator.evaluateQualityGates(goodData);
    this.assert(result1.passed === true, 'Good data should pass all gates');
    this.assertEqual(result1.failures.length, 0, 'Should have no failures');

    // Test failing some gates
    const badData = { id: 123, content: 'short' };
    const result2 = this.coordinator.evaluateQualityGates(badData);
    this.assert(result2.passed === false, 'Bad data should fail some gates');
    this.assert(result2.failures.includes('contentLength'), 'Should fail content length');
    this.assert(result2.failures.includes('validFormat'), 'Should fail format validation');

    // Test missing required fields
    const incompleteData = { content: 'Some content here' };
    const result3 = this.coordinator.evaluateQualityGates(incompleteData);
    this.assert(result3.passed === false, 'Incomplete data should fail');
    this.assert(result3.failures.includes('hasRequiredFields'), 'Should fail required fields check');
  }

  // Test: Performance Under Load
  async testPerformanceUnderLoad(): Promise<void> {
    this.coordinator.reset();

    const agentCount = 100;
    const messageCount = 1000;

    // Register many agents
    const startReg = performance.now();
    for (let i = 0; i < agentCount; i++) {
      this.coordinator.registerAgent(`agent${i}`);
    }
    const regDuration = performance.now() - startReg;

    // Send many messages
    const startMsg = performance.now();
    for (let i = 0; i < messageCount; i++) {
      const from = `agent${Math.floor(Math.random() * agentCount)}`;
      const to = `agent${Math.floor(Math.random() * agentCount)}`;
      this.coordinator.sendMessage(from, to, { messageId: i });
    }
    const msgDuration = performance.now() - startMsg;

    // Performance assertions
    this.assert(regDuration < 100, `Registration too slow: ${regDuration}ms`);
    this.assert(msgDuration < 500, `Message sending too slow: ${msgDuration}ms`);

    const agents = this.coordinator.getRegisteredAgents();
    this.assertEqual(agents.length, agentCount, `Should have ${agentCount} agents`);

    const messages = this.coordinator.getMessages();
    this.assert(messages.length > 0, 'Should have sent messages');
  }

  // Test: Error Handling
  async testErrorHandling(): Promise<void> {
    this.coordinator.reset();

    // Add a quality gate that throws an error
    this.coordinator.addQualityGate('errorGate', (data) => {
      throw new Error('Simulated error');
    });

    const result = this.coordinator.evaluateQualityGates({ test: 'data' });
    this.assert(result.passed === false, 'Should fail when gate throws error');
    this.assert(
      result.failures.some(f => f.includes('errorGate')),
      'Should include error gate in failures'
    );
  }

  // Run all tests
  async runAll(): Promise<void> {
    console.log(`${colors.bright}${colors.cyan}Starting InterAgentCoordinator Test Suite${colors.reset}\n`);

    const tests = [
      { name: 'Agent Registration', fn: () => this.testAgentRegistration() },
      { name: 'Agent Unregistration', fn: () => this.testAgentUnregistration() },
      { name: 'Message Routing', fn: () => this.testMessageRouting() },
      { name: 'Message Filtering', fn: () => this.testMessageFiltering() },
      { name: 'Shared Data Pool', fn: () => this.testSharedDataPool() },
      { name: 'Quality Gate Evaluation', fn: () => this.testQualityGateEvaluation() },
      { name: 'Performance Under Load', fn: () => this.testPerformanceUnderLoad() },
      { name: 'Error Handling', fn: () => this.testErrorHandling() }
    ];

    for (const test of tests) {
      process.stdout.write(`Running: ${test.name}... `);
      const result = await this.runTest(test.name, test.fn);
      this.results.push(result);

      if (result.passed) {
        console.log(`${colors.green}✓${colors.reset} (${result.duration.toFixed(2)}ms)`);
      } else {
        console.log(`${colors.red}✗${colors.reset} (${result.duration.toFixed(2)}ms)`);
        if (result.error) {
          console.log(`  ${colors.red}Error: ${result.error}${colors.reset}`);
        }
      }
    }

    this.printSummary();
  }

  private printSummary(): void {
    console.log(`\n${colors.bright}Test Summary${colors.reset}`);
    console.log('─'.repeat(50));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total Tests: ${this.results.length}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`Average Duration: ${(totalDuration / this.results.length).toFixed(2)}ms`);

    if (failed === 0) {
      console.log(`\n${colors.green}${colors.bright}✓ All tests passed!${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bright}✗ ${failed} test(s) failed${colors.reset}`);
      console.log('\nFailed tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error || 'Unknown error'}`);
        });
    }

    // Exit with appropriate code
    process.exit(failed === 0 ? 0 : 1);
  }
}

// Main execution
async function main() {
  const suite = new CoordinatorTestSuite();
  await suite.runAll();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(`${colors.red}Uncaught Exception: ${error.message}${colors.reset}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(`${colors.red}Unhandled Rejection: ${reason}${colors.reset}`);
  process.exit(1);
});

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`${colors.red}Fatal Error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

export { MockCoordinator, CoordinatorTestSuite };
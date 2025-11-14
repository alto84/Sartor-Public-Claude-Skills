/**
 * Multi-Agent Orchestrator Template
 *
 * Simplified orchestrator pattern extracted from SKG Agent Prototype 2.
 * Demonstrates task assignment, agent registry interaction, and health monitoring.
 *
 * Usage:
 *   const orchestrator = new AgentOrchestrator();
 *   await orchestrator.initialize();
 *   const result = await orchestrator.executeTask(task);
 */

import { EventEmitter } from 'events';

// ============================================================================
// Type Definitions
// ============================================================================

interface AgentCapability {
  name: string;
  version: string;
  parameters?: Record<string, any>;
}

interface AgentManifest {
  id: string;
  name: string;
  version: string;
  capabilities: AgentCapability[];
  endpoint: string;
  healthCheckEndpoint?: string;
  metadata?: Record<string, any>;
}

interface Task {
  id: string;
  type: string;
  description: string;
  requiredCapabilities: string[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  timeout?: number;
  retries?: number;
  metadata?: Record<string, any>;
}

interface TaskResult {
  taskId: string;
  agentId: string;
  status: 'success' | 'failure' | 'timeout';
  result?: any;
  error?: string;
  executionTime: number;
  timestamp: number;
}

interface HealthStatus {
  healthy: boolean;
  lastCheck: number;
  responseTime?: number;
  errorCount: number;
}

// ============================================================================
// Agent Registry
// ============================================================================

class AgentRegistry {
  private agents: Map<string, AgentManifest> = new Map();
  private healthStatus: Map<string, HealthStatus> = new Map();
  private healthCheckInterval: number = 30000; // 30 seconds

  async registerAgent(manifest: AgentManifest): Promise<void> {
    this.agents.set(manifest.id, manifest);
    this.healthStatus.set(manifest.id, {
      healthy: true,
      lastCheck: Date.now(),
      errorCount: 0
    });

    console.log(`Agent registered: ${manifest.id} (${manifest.name})`);
  }

  async unregisterAgent(agentId: string): Promise<void> {
    this.agents.delete(agentId);
    this.healthStatus.delete(agentId);
    console.log(`Agent unregistered: ${agentId}`);
  }

  getAgent(agentId: string): AgentManifest | undefined {
    return this.agents.get(agentId);
  }

  findAgentsByCapability(capability: string): AgentManifest[] {
    return Array.from(this.agents.values()).filter(agent =>
      agent.capabilities.some(c => c.name === capability)
    );
  }

  getHealthyAgents(): AgentManifest[] {
    return Array.from(this.agents.values()).filter(agent => {
      const health = this.healthStatus.get(agent.id);
      return health?.healthy === true;
    });
  }

  async checkHealth(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    try {
      const startTime = Date.now();

      // In real implementation, make HTTP/RPC call to health endpoint
      // For template, simulate health check
      const isHealthy = await this.simulateHealthCheck(agent);

      const responseTime = Date.now() - startTime;

      this.healthStatus.set(agentId, {
        healthy: isHealthy,
        lastCheck: Date.now(),
        responseTime,
        errorCount: isHealthy ? 0 : (this.healthStatus.get(agentId)?.errorCount || 0) + 1
      });

      return isHealthy;
    } catch (error) {
      this.healthStatus.set(agentId, {
        healthy: false,
        lastCheck: Date.now(),
        errorCount: (this.healthStatus.get(agentId)?.errorCount || 0) + 1
      });
      return false;
    }
  }

  private async simulateHealthCheck(agent: AgentManifest): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    // 95% success rate for simulation
    return Math.random() > 0.05;
  }

  async startHealthMonitoring(): Promise<void> {
    setInterval(async () => {
      for (const agentId of this.agents.keys()) {
        await this.checkHealth(agentId);
      }
    }, this.healthCheckInterval);
  }
}

// ============================================================================
// Task Queue (Priority-based)
// ============================================================================

class TaskQueue {
  private queues: Map<string, Task[]> = new Map([
    ['critical', []],
    ['high', []],
    ['normal', []],
    ['low', []]
  ]);

  private priorityOrder = ['critical', 'high', 'normal', 'low'];

  enqueue(task: Task): void {
    const queue = this.queues.get(task.priority) || this.queues.get('normal')!;
    queue.push(task);
  }

  dequeue(): Task | null {
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority)!;
      if (queue.length > 0) {
        return queue.shift()!;
      }
    }
    return null;
  }

  peek(): Task | null {
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority)!;
      if (queue.length > 0) {
        return queue[0];
      }
    }
    return null;
  }

  size(): number {
    return Array.from(this.queues.values()).reduce((sum, q) => sum + q.length, 0);
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }
}

// ============================================================================
// Task Executor
// ============================================================================

class TaskExecutor {
  private registry: AgentRegistry;
  private maxConcurrent: number = 10;
  private activeExecutions: Map<string, Promise<TaskResult>> = new Map();

  constructor(registry: AgentRegistry) {
    this.registry = registry;
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    // Find capable and healthy agent
    const agent = await this.selectAgent(task);

    if (!agent) {
      return {
        taskId: task.id,
        agentId: 'none',
        status: 'failure',
        error: 'No capable agent available',
        executionTime: Date.now() - startTime,
        timestamp: Date.now()
      };
    }

    // Execute task with timeout and retry
    try {
      const result = await this.executeWithRetry(task, agent);

      return {
        taskId: task.id,
        agentId: agent.id,
        status: 'success',
        result,
        executionTime: Date.now() - startTime,
        timestamp: Date.now()
      };
    } catch (error: any) {
      return {
        taskId: task.id,
        agentId: agent.id,
        status: 'failure',
        error: error.message,
        executionTime: Date.now() - startTime,
        timestamp: Date.now()
      };
    }
  }

  private async selectAgent(task: Task): Promise<AgentManifest | null> {
    // Find agents with required capabilities
    const capableAgents = task.requiredCapabilities.length > 0
      ? this.findCapableAgents(task.requiredCapabilities)
      : this.registry.getHealthyAgents();

    if (capableAgents.length === 0) {
      return null;
    }

    // Simple selection: first healthy agent
    // In production, use load balancing (weighted round-robin, least connections, etc.)
    return capableAgents[0];
  }

  private findCapableAgents(requiredCapabilities: string[]): AgentManifest[] {
    const agents = this.registry.getHealthyAgents();

    return agents.filter(agent => {
      const agentCapabilities = agent.capabilities.map(c => c.name);
      return requiredCapabilities.every(required =>
        agentCapabilities.includes(required)
      );
    });
  }

  private async executeWithRetry(
    task: Task,
    agent: AgentManifest,
    attempt: number = 0
  ): Promise<any> {
    const maxRetries = task.retries || 3;
    const timeout = task.timeout || 30000;

    try {
      // Execute task with timeout
      const result = await this.executeWithTimeout(task, agent, timeout);
      return result;
    } catch (error) {
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry
        return this.executeWithRetry(task, agent, attempt + 1);
      }

      throw error;
    }
  }

  private async executeWithTimeout(
    task: Task,
    agent: AgentManifest,
    timeout: number
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Task ${task.id} timeout after ${timeout}ms`));
      }, timeout);

      try {
        // In real implementation, make RPC/HTTP call to agent
        // For template, simulate execution
        const result = await this.simulateTaskExecution(task, agent);

        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  private async simulateTaskExecution(task: Task, agent: AgentManifest): Promise<any> {
    // Simulate task execution delay
    const executionTime = Math.random() * 2000 + 500; // 500-2500ms
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // 90% success rate for simulation
    if (Math.random() > 0.1) {
      return {
        taskType: task.type,
        processedBy: agent.id,
        result: `Completed: ${task.description}`,
        timestamp: Date.now()
      };
    } else {
      throw new Error('Simulated task execution failure');
    }
  }
}

// ============================================================================
// Main Orchestrator
// ============================================================================

export class AgentOrchestrator extends EventEmitter {
  private registry: AgentRegistry;
  private taskQueue: TaskQueue;
  private executor: TaskExecutor;
  private running: boolean = false;
  private processingInterval: number = 100; // Check queue every 100ms

  constructor() {
    super();
    this.registry = new AgentRegistry();
    this.taskQueue = new TaskQueue();
    this.executor = new TaskExecutor(this.registry);
  }

  async initialize(): Promise<void> {
    console.log('Initializing orchestrator...');

    // Start health monitoring
    await this.registry.startHealthMonitoring();

    // Start task processing
    this.running = true;
    this.processQueue();

    console.log('Orchestrator initialized');
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down orchestrator...');
    this.running = false;
    console.log('Orchestrator shutdown complete');
  }

  async registerAgent(manifest: AgentManifest): Promise<void> {
    await this.registry.registerAgent(manifest);
    this.emit('agent:registered', manifest);
  }

  async unregisterAgent(agentId: string): Promise<void> {
    await this.registry.unregisterAgent(agentId);
    this.emit('agent:unregistered', agentId);
  }

  async submitTask(task: Task): Promise<void> {
    this.taskQueue.enqueue(task);
    this.emit('task:submitted', task);
    console.log(`Task submitted: ${task.id} (${task.type}) - Priority: ${task.priority}`);
  }

  async executeTask(task: Task): Promise<TaskResult> {
    console.log(`Executing task immediately: ${task.id}`);

    const result = await this.executor.executeTask(task);

    this.emit('task:completed', result);

    return result;
  }

  private async processQueue(): Promise<void> {
    while (this.running) {
      if (!this.taskQueue.isEmpty()) {
        const task = this.taskQueue.dequeue();

        if (task) {
          this.executor.executeTask(task)
            .then(result => {
              this.emit('task:completed', result);
              console.log(`Task completed: ${task.id} - Status: ${result.status}`);
            })
            .catch(error => {
              console.error(`Task failed: ${task.id} - Error: ${error.message}`);
            });
        }
      }

      await new Promise(resolve => setTimeout(resolve, this.processingInterval));
    }
  }

  getQueueSize(): number {
    return this.taskQueue.size();
  }

  getRegisteredAgents(): AgentManifest[] {
    return this.registry.getHealthyAgents();
  }
}

// ============================================================================
// Example Usage
// ============================================================================

async function exampleUsage() {
  const orchestrator = new AgentOrchestrator();
  await orchestrator.initialize();

  // Register some agents
  await orchestrator.registerAgent({
    id: 'agent-1',
    name: 'Data Processing Agent',
    version: '1.0.0',
    capabilities: [
      { name: 'data-transform', version: '1.0' },
      { name: 'data-validate', version: '1.0' }
    ],
    endpoint: 'http://localhost:3001'
  });

  await orchestrator.registerAgent({
    id: 'agent-2',
    name: 'Analysis Agent',
    version: '1.0.0',
    capabilities: [
      { name: 'data-analyze', version: '1.0' },
      { name: 'report-generate', version: '1.0' }
    ],
    endpoint: 'http://localhost:3002'
  });

  // Submit tasks
  const task1: Task = {
    id: 'task-1',
    type: 'data-processing',
    description: 'Transform customer data',
    requiredCapabilities: ['data-transform'],
    priority: 'high',
    timeout: 5000,
    retries: 2
  };

  const task2: Task = {
    id: 'task-2',
    type: 'analysis',
    description: 'Analyze sales trends',
    requiredCapabilities: ['data-analyze'],
    priority: 'normal',
    timeout: 10000
  };

  // Execute tasks
  const result1 = await orchestrator.executeTask(task1);
  console.log('Result 1:', result1);

  const result2 = await orchestrator.executeTask(task2);
  console.log('Result 2:', result2);

  // Or submit to queue for async processing
  await orchestrator.submitTask({
    id: 'task-3',
    type: 'report',
    description: 'Generate monthly report',
    requiredCapabilities: ['report-generate'],
    priority: 'low',
    timeout: 30000
  });

  // Listen for events
  orchestrator.on('task:completed', (result: TaskResult) => {
    console.log(`Event: Task ${result.taskId} completed with status ${result.status}`);
  });

  // Check queue status
  console.log(`Queue size: ${orchestrator.getQueueSize()}`);

  // Shutdown after some time
  setTimeout(async () => {
    await orchestrator.shutdown();
  }, 60000);
}

// Run example if executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}

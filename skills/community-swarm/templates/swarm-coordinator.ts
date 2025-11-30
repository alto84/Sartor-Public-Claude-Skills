/**
 * Community Swarm Coordinator
 * Central coordination system for 10-agent swarm with delegation-only orchestration
 */

import {
  AgentId,
  AgentCapability,
  AgentStatus,
  SwarmMessage,
  SwarmMessageType,
  SwarmTask,
  TaskResult,
  SharedDataEntry,
  QualityGate,
  QualityGateResult,
  HookType,
  HookHandler,
  HookContext,
  SwarmConfig,
  SwarmStatus,
  Priority,
  RecoveryStrategy,
  SwarmError,
  AuditEntry,
  ImprovementSuggestion,
  Evidence
} from './swarm-types';

/**
 * Priority queue for message handling
 */
class PriorityQueue<T> {
  private items: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number): void {
    const entry = { item, priority };
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority < priority) {
        this.items.splice(i, 0, entry);
        added = true;
        break;
      }
    }
    if (!added) this.items.push(entry);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  peek(): T | undefined {
    return this.items[0]?.item;
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

/**
 * Main coordinator class for the community swarm
 */
export class SwarmCoordinator {
  private config: SwarmConfig;
  private agents: Map<AgentId, AgentCapability> = new Map();
  private messageQueue: PriorityQueue<SwarmMessage> = new PriorityQueue();
  private dataPool: Map<string, SharedDataEntry> = new Map();
  private tasks: Map<string, SwarmTask> = new Map();
  private results: Map<string, TaskResult> = new Map();
  private hooks: Map<HookType, HookHandler[]> = new Map();
  private auditLog: AuditEntry[] = [];
  private suggestions: ImprovementSuggestion[] = [];
  private startTime: Date;
  private messageHandlers: Map<AgentId, (msg: SwarmMessage) => Promise<void>> = new Map();

  constructor(config: SwarmConfig) {
    this.config = config;
    this.startTime = new Date();
    this.initializeHooks();
    this.log('Coordinator', 'Swarm coordinator initialized');
  }

  /**
   * Initialize hooks from configuration
   */
  private initializeHooks(): void {
    for (const [hookType, handlers] of Object.entries(this.config.hooks || {})) {
      this.hooks.set(hookType as HookType, handlers || []);
    }
  }

  /**
   * Register an agent with the swarm
   */
  async registerAgent(capability: AgentCapability): Promise<void> {
    // Execute pre-spawn hooks
    const hookContext: HookContext = {
      hookType: HookType.PRE_SPAWN,
      agent: capability,
      metadata: {}
    };
    await this.executeHooks(HookType.PRE_SPAWN, hookContext);

    // Register the agent
    this.agents.set(capability.agentId, capability);
    this.audit(capability.agentId, 'REGISTER', { capabilities: capability.capabilities });

    // Execute post-spawn hooks
    await this.executeHooks(HookType.POST_SPAWN, {
      ...hookContext,
      hookType: HookType.POST_SPAWN
    });

    this.log('Coordinator', `Agent registered: ${capability.agentId}`);
  }

  /**
   * Register message handler for an agent
   */
  registerMessageHandler(agentId: AgentId, handler: (msg: SwarmMessage) => Promise<void>): void {
    this.messageHandlers.set(agentId, handler);
  }

  /**
   * Delegate a task to an agent (ORCHESTRATOR'S PRIMARY FUNCTION)
   * The orchestrator NEVER executes tasks - only delegates
   */
  async delegateTask(task: SwarmTask): Promise<string> {
    // Verify orchestrator is not assigning to itself
    if (task.assignedTo === AgentId.ORCHESTRATOR) {
      throw new Error('VIOLATION: Orchestrator cannot execute tasks - must delegate');
    }

    // Execute pre-task hooks
    const hookContext: HookContext = {
      hookType: HookType.PRE_TASK,
      task,
      metadata: {}
    };
    await this.executeHooks(HookType.PRE_TASK, hookContext);

    // Find best agent if not specified
    if (!task.assignedTo) {
      task.assignedTo = this.findBestAgent(task);
    }

    // Validate agent availability
    const agent = this.agents.get(task.assignedTo);
    if (!agent || agent.status !== AgentStatus.READY) {
      throw new Error(`Agent ${task.assignedTo} not available`);
    }

    // Store task and send assignment message
    this.tasks.set(task.id, task);
    await this.sendMessage({
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: SwarmMessageType.TASK_ASSIGN,
      priority: task.priority,
      from: AgentId.ORCHESTRATOR,
      to: task.assignedTo,
      payload: task,
      metadata: { timestamp: new Date() }
    });

    this.audit(AgentId.ORCHESTRATOR, 'DELEGATE', {
      taskId: task.id,
      assignedTo: task.assignedTo
    });

    this.log('Coordinator', `Task ${task.id} delegated to ${task.assignedTo}`);
    return task.id;
  }

  /**
   * Send a message through the coordinator
   */
  async sendMessage(message: SwarmMessage): Promise<void> {
    // Execute pre-send hooks
    await this.executeHooks(HookType.PRE_SEND, {
      hookType: HookType.PRE_SEND,
      message,
      metadata: {}
    });

    // Add to priority queue
    const priorityValue = this.getPriorityValue(message.priority);
    this.messageQueue.enqueue(message, priorityValue);

    // Process queue
    await this.processMessageQueue();
  }

  /**
   * Process messages from the queue
   */
  private async processMessageQueue(): Promise<void> {
    while (!this.messageQueue.isEmpty()) {
      const message = this.messageQueue.dequeue();
      if (!message) break;

      try {
        await this.routeMessage(message);
      } catch (error) {
        this.log('Coordinator', `Failed to route message ${message.id}: ${error}`);
        await this.handleError({
          code: 'MESSAGE_ROUTING_FAILED',
          message: `Failed to route message: ${error}`,
          recoveryStrategy: RecoveryStrategy.RETRY,
          retryCount: 0,
          maxRetries: 3,
          context: { message }
        });
      }
    }
  }

  /**
   * Route message to recipients
   */
  private async routeMessage(message: SwarmMessage): Promise<void> {
    const recipients = Array.isArray(message.to) ? message.to : [message.to];

    for (const recipient of recipients) {
      const handler = this.messageHandlers.get(recipient as AgentId);
      if (handler) {
        try {
          await handler(message);

          // Execute post-receive hooks
          await this.executeHooks(HookType.POST_RECEIVE, {
            hookType: HookType.POST_RECEIVE,
            message,
            metadata: { recipient }
          });
        } catch (error) {
          this.log('Coordinator', `Failed to deliver to ${recipient}: ${error}`);
        }
      }
    }
  }

  /**
   * Share data in the pool
   */
  shareData(key: string, value: any, sourceAgent: AgentId, evidence: Evidence, tags: string[] = []): void {
    const existing = this.dataPool.get(key);
    const entry: SharedDataEntry = {
      key,
      value,
      sourceAgent,
      timestamp: new Date(),
      evidence,
      accessLog: [{
        agentId: sourceAgent,
        operation: 'WRITE',
        timestamp: new Date()
      }],
      version: existing ? existing.version + 1 : 1,
      tags
    };

    this.dataPool.set(key, entry);
    this.audit(sourceAgent, 'DATA_WRITE', { key, version: entry.version });
    this.log('Coordinator', `Data shared: ${key} by ${sourceAgent}`);
  }

  /**
   * Get data from the pool
   */
  getData(key: string, requestingAgent: AgentId): any {
    const entry = this.dataPool.get(key);
    if (entry) {
      entry.accessLog.push({
        agentId: requestingAgent,
        operation: 'READ',
        timestamp: new Date()
      });
      this.audit(requestingAgent, 'DATA_READ', { key });
      return entry.value;
    }
    return undefined;
  }

  /**
   * Submit task result (with context protection for orchestrator)
   */
  async submitResult(result: TaskResult): Promise<void> {
    // Validate result includes required evidence
    if (!result.evidence || result.evidence.confidence === undefined) {
      throw new Error('Result must include evidence with confidence score');
    }

    // Enforce context protection - summaries only
    if (this.config.contextProtection.enabled) {
      const wordCount = result.summary.split(/\s+/).length;
      if (wordCount > this.config.contextProtection.maxSummaryWords) {
        throw new Error(`Summary exceeds ${this.config.contextProtection.maxSummaryWords} word limit`);
      }
    }

    // Run quality gates
    for (const gate of this.config.qualityGates) {
      if (gate.enforceFor.includes(result.agentId)) {
        const gateResult = await this.evaluateQualityGate(gate, result);
        if (!gateResult.passed && gate.blocking) {
          // Send revision request
          await this.sendMessage({
            id: `msg-${Date.now()}`,
            type: SwarmMessageType.REVISION_NEEDED,
            priority: Priority.HIGH,
            from: AgentId.QUALITY_GATE,
            to: result.agentId,
            payload: {
              taskId: result.taskId,
              gate: gate.name,
              reason: gateResult.reason,
              suggestedFix: gateResult.suggestedFix
            },
            metadata: { timestamp: new Date() }
          });
          return;
        }
        result.qualityGatesPassed.push(gate.name);
      }
    }

    // Store result
    this.results.set(result.taskId, result);

    // Execute post-task hooks
    await this.executeHooks(HookType.POST_TASK, {
      hookType: HookType.POST_TASK,
      task: this.tasks.get(result.taskId),
      result,
      metadata: {}
    });

    this.audit(result.agentId, 'TASK_COMPLETE', {
      taskId: result.taskId,
      status: result.status,
      duration: result.duration
    });

    this.log('Coordinator', `Result received for task ${result.taskId}`);
  }

  /**
   * Evaluate a quality gate
   */
  private async evaluateQualityGate(gate: QualityGate, result: TaskResult): Promise<QualityGateResult> {
    const evaluatedAt = new Date();

    switch (gate.type) {
      case 'FORMAT':
        const hasRequired = gate.criteria.requiredFields?.every(
          field => result.output && result.output[field] !== undefined
        ) ?? true;
        return {
          passed: hasRequired,
          gateName: gate.name,
          reason: hasRequired ? undefined : 'Missing required fields',
          evaluatedAt
        };

      case 'EVIDENCE':
        const hasEvidence = result.evidence.citations.length > 0;
        const meetsConfidence = result.evidence.confidence >= (gate.criteria.minConfidence || 0);
        return {
          passed: hasEvidence && meetsConfidence,
          gateName: gate.name,
          reason: !hasEvidence ? 'Missing citations' :
                  !meetsConfidence ? 'Confidence below threshold' : undefined,
          evaluatedAt
        };

      case 'CONSISTENCY':
        // Check for contradictions with other results
        return {
          passed: true,
          gateName: gate.name,
          evaluatedAt
        };

      case 'CUSTOM':
        if (gate.criteria.customValidator) {
          return gate.criteria.customValidator(result.output);
        }
        return { passed: true, gateName: gate.name, evaluatedAt };

      default:
        return { passed: true, gateName: gate.name, evaluatedAt };
    }
  }

  /**
   * Request assistance from another agent
   */
  async requestAssistance(
    fromAgent: AgentId,
    capability: string,
    request: any
  ): Promise<void> {
    const assistingAgent = this.findAgentByCapability(capability);
    if (!assistingAgent) {
      throw new Error(`No agent with capability: ${capability}`);
    }

    await this.sendMessage({
      id: `msg-${Date.now()}`,
      type: SwarmMessageType.ASSISTANCE_REQUEST,
      priority: Priority.HIGH,
      from: fromAgent,
      to: assistingAgent,
      payload: request,
      metadata: { timestamp: new Date() }
    });

    this.audit(fromAgent, 'ASSISTANCE_REQUEST', {
      to: assistingAgent,
      capability
    });
  }

  /**
   * Add improvement suggestion
   */
  addSuggestion(suggestion: ImprovementSuggestion): void {
    this.suggestions.push(suggestion);
    this.audit(AgentId.AUTONOMOUS, 'SUGGESTION', {
      category: suggestion.category,
      action: suggestion.suggestion.action
    });
  }

  /**
   * Get swarm status
   */
  getStatus(): SwarmStatus {
    const agentStatuses = Array.from(this.agents.entries()).map(([id, agent]) => ({
      agentId: id,
      status: agent.status,
      currentTask: agent.currentTask,
      lastHeartbeat: new Date()
    }));

    const taskCounts = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      failed: 0
    };

    this.tasks.forEach((task, id) => {
      const result = this.results.get(id);
      if (result) {
        if (result.status === 'SUCCESS') taskCounts.completed++;
        else if (result.status === 'FAILED') taskCounts.failed++;
      } else {
        taskCounts.inProgress++;
      }
    });

    return {
      agents: agentStatuses,
      tasks: taskCounts,
      messageQueue: {
        depth: this.messageQueue.size(),
        oldestMessage: undefined
      },
      dataPool: {
        entries: this.dataPool.size,
        totalSize: 0
      },
      health: this.determineHealth(),
      uptime: Date.now() - this.startTime.getTime()
    };
  }

  /**
   * Execute hooks of a given type
   */
  private async executeHooks(hookType: HookType, context: HookContext): Promise<void> {
    const handlers = this.hooks.get(hookType) || [];

    for (const handler of handlers.sort((a, b) => b.priority - a.priority)) {
      try {
        const result = await handler.execute(context);
        if (!result.proceed) {
          throw new Error(`Hook ${handler.name} blocked execution`);
        }
        if (result.modifications) {
          Object.assign(context, result.modifications);
        }
      } catch (error) {
        if (handler.critical) {
          throw error;
        }
        this.log('Coordinator', `Non-critical hook error: ${error}`);
      }
    }
  }

  /**
   * Handle errors with recovery strategies
   */
  private async handleError(error: SwarmError): Promise<void> {
    await this.executeHooks(HookType.ON_ERROR, {
      hookType: HookType.ON_ERROR,
      error: new Error(error.message),
      metadata: error.context
    });

    switch (error.recoveryStrategy) {
      case RecoveryStrategy.RETRY:
        if (error.retryCount < error.maxRetries) {
          const delay = Math.min(
            this.config.recovery.backoffBase * Math.pow(2, error.retryCount),
            this.config.recovery.backoffMax
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          error.retryCount++;
          // Retry logic would go here
        }
        break;

      case RecoveryStrategy.REASSIGN:
        // Find alternative agent and reassign
        break;

      case RecoveryStrategy.ESCALATE:
        this.log('Coordinator', `ESCALATION: ${error.message}`);
        break;
    }

    this.audit(error.agent || AgentId.ORCHESTRATOR, 'ERROR', error);
  }

  /**
   * Find best agent for a task
   */
  private findBestAgent(task: SwarmTask): AgentId {
    let bestAgent: AgentId | undefined;
    let bestScore = -1;

    this.agents.forEach((agent, agentId) => {
      if (agentId === AgentId.ORCHESTRATOR) return;
      if (agent.status !== AgentStatus.READY) return;

      let score = 0;
      const taskType = task.type.toLowerCase();

      // Score based on capabilities
      if (agent.capabilities.some(c => taskType.includes(c))) {
        score += 10;
      }

      // Score based on specializations
      if (agent.specializations?.some(s => taskType.includes(s))) {
        score += 5;
      }

      // Score based on performance
      if (agent.performance) {
        score += agent.performance.qualityScore;
      }

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agentId;
      }
    });

    if (!bestAgent) {
      throw new Error(`No suitable agent found for task type: ${task.type}`);
    }

    return bestAgent;
  }

  /**
   * Find agent by capability
   */
  private findAgentByCapability(capability: string): AgentId | undefined {
    for (const [agentId, agent] of this.agents) {
      if (agent.capabilities.includes(capability) && agent.status === AgentStatus.READY) {
        return agentId;
      }
    }
    return undefined;
  }

  /**
   * Determine swarm health
   */
  private determineHealth(): 'HEALTHY' | 'DEGRADED' | 'CRITICAL' {
    const agents = Array.from(this.agents.values());
    const healthyAgents = agents.filter(a => a.status === AgentStatus.READY).length;
    const ratio = healthyAgents / agents.length;

    if (ratio >= 0.8) return 'HEALTHY';
    if (ratio >= 0.5) return 'DEGRADED';
    return 'CRITICAL';
  }

  /**
   * Get priority value for queue ordering
   */
  private getPriorityValue(priority: Priority): number {
    const map = {
      [Priority.CRITICAL]: 1000,
      [Priority.HIGH]: 100,
      [Priority.NORMAL]: 10,
      [Priority.LOW]: 1
    };
    return map[priority] || 10;
  }

  /**
   * Add audit log entry
   */
  private audit(agent: AgentId, action: string, details: any): void {
    this.auditLog.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      agent,
      action,
      details,
      outcome: 'SUCCESS',
      relatedEntities: []
    });
  }

  /**
   * Log message
   */
  private log(source: string, message: string): void {
    console.error(`[${new Date().toISOString()}] [${source}] ${message}`);
  }

  /**
   * Get audit log
   */
  getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }

  /**
   * Get improvement suggestions
   */
  getSuggestions(): ImprovementSuggestion[] {
    return [...this.suggestions];
  }
}

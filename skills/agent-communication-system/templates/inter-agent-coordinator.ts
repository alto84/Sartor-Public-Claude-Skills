/**
 * Inter-Agent Coordinator
 * Central coordination system for managing multi-agent communication and data sharing
 */

import {
  MCPMessage,
  MessageType,
  Priority,
  CoordinationPlan,
  SharedDataEntry,
  AgentRequest,
  AgentResponse,
  AgentCapabilities,
  AgentPhase,
  DataFlow,
  QualityGate,
  AccessRecord,
  AssistanceRequest,
  AssistanceResponse,
  AgentResult,
  GateResult
} from './message-types';

/**
 * Priority queue implementation for message handling
 */
class PriorityQueue<T> {
  private items: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number): void {
    const queueElement = { item, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority < priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueElement);
    }
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
 * Main coordinator class for inter-agent communication
 */
export class InterAgentCoordinator {
  private messageQueue: PriorityQueue<MCPMessage>;
  private registeredAgents: Map<string, AgentCapabilities>;
  private sharedDataPool: Map<string, SharedDataEntry>;
  private accessLog: AccessRecord[];
  private activeRequests: Map<string, AgentRequest>;
  private messageHandlers: Map<string, (message: MCPMessage) => Promise<void>>;
  private channels: Map<string, Set<string>>;  // channel name -> subscriber IDs
  private messageHistory: Map<string, MCPMessage[]>;
  private deadLetterQueue: MCPMessage[];

  constructor() {
    this.messageQueue = new PriorityQueue<MCPMessage>();
    this.registeredAgents = new Map();
    this.sharedDataPool = new Map();
    this.accessLog = [];
    this.activeRequests = new Map();
    this.messageHandlers = new Map();
    this.channels = new Map();
    this.messageHistory = new Map();
    this.deadLetterQueue = [];
  }

  /**
   * Register a new agent with the coordinator
   */
  registerAgent(capabilities: AgentCapabilities): void {
    this.registeredAgents.set(capabilities.agentId, capabilities);
    console.error(`[Coordinator] Agent registered: ${capabilities.agentId} with capabilities: ${capabilities.capabilities.join(', ')}`);
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.registeredAgents.delete(agentId);
    // Remove from all channels
    this.channels.forEach(subscribers => {
      subscribers.delete(agentId);
    });
    console.error(`[Coordinator] Agent unregistered: ${agentId}`);
  }

  /**
   * Subscribe an agent to a channel
   */
  subscribeToChannel(agentId: string, channel: string): void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(agentId);
    console.error(`[Coordinator] Agent ${agentId} subscribed to channel: ${channel}`);
  }

  /**
   * Plan coordination for multiple agents
   */
  planCoordination(params: {
    phases: AgentPhase[];
    dataFlow?: DataFlow[];
    qualityGates?: QualityGate[];
    timeout?: number;
  }): CoordinationPlan {
    const plan: CoordinationPlan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Coordination Plan',
      description: 'Auto-generated coordination plan',
      executionPhases: params.phases,
      dataFlowDesign: params.dataFlow || [],
      qualityGates: params.qualityGates || [],
      timeout: params.timeout || 300000, // 5 minutes default
      metadata: {
        createdBy: 'coordinator',
        createdAt: new Date(),
        estimatedDuration: this.estimateExecutionTime(params.phases),
        tags: []
      }
    };

    console.error(`[Coordinator] Created coordination plan: ${plan.id} with ${plan.executionPhases.length} phases`);
    return plan;
  }

  /**
   * Execute a coordination plan
   */
  async executeWithCoordination(plan: CoordinationPlan): Promise<Map<string, AgentResult>> {
    const results = new Map<string, AgentResult>();
    const startTime = Date.now();

    console.error(`[Coordinator] Starting execution of plan: ${plan.id}`);

    try {
      // Execute phases in order
      for (const phase of plan.executionPhases) {
        // Check dependencies
        if (!this.areDependenciesMet(phase.dependencies, results)) {
          throw new Error(`Dependencies not met for phase with agents: ${phase.agents.join(', ')}`);
        }

        // Execute phase
        if (phase.type === 'parallel') {
          await this.executeParallelPhase(phase, results);
        } else {
          await this.executeSequentialPhase(phase, results);
        }

        // Check timeout
        if (plan.timeout && Date.now() - startTime > plan.timeout) {
          throw new Error(`Coordination plan ${plan.id} timed out after ${plan.timeout}ms`);
        }
      }

      // Apply quality gates
      for (const gate of plan.qualityGates) {
        const gateResults = await this.evaluateQualityGates(gate, results);
        if (gate.blocking && !gateResults.every(r => r.passed)) {
          throw new Error(`Blocking quality gate '${gate.name}' failed`);
        }
      }

      console.error(`[Coordinator] Successfully completed plan: ${plan.id}`);
      return results;
    } catch (error) {
      console.error(`[Coordinator] Plan execution failed: ${error}`);
      throw error;
    }
  }

  /**
   * Send a message through the coordinator
   */
  async sendMessage(message: MCPMessage): Promise<void> {
    // Add to queue with priority
    const priorityValue = this.getPriorityValue(message.priority);
    this.messageQueue.enqueue(message, priorityValue);

    // Store in history
    if (!this.messageHistory.has(message.from)) {
      this.messageHistory.set(message.from, []);
    }
    this.messageHistory.get(message.from)!.push(message);

    // Process immediately if possible
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
        console.error(`[Coordinator] Failed to route message ${message.id}: ${error}`);
        this.deadLetterQueue.push(message);
      }
    }
  }

  /**
   * Route a message to its destination(s)
   */
  private async routeMessage(message: MCPMessage): Promise<void> {
    const recipients = this.resolveRecipients(message);

    for (const recipient of recipients) {
      if (this.messageHandlers.has(recipient)) {
        try {
          await this.deliverWithRetry(message, recipient);
        } catch (error) {
          console.error(`[Coordinator] Failed to deliver message to ${recipient}: ${error}`);
        }
      }
    }
  }

  /**
   * Deliver message with retry logic
   */
  private async deliverWithRetry(message: MCPMessage, recipient: string): Promise<void> {
    const maxRetries = message.acknowledgment?.retries || 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const handler = this.messageHandlers.get(recipient);
        if (handler) {
          await handler(message);
          return;
        }
      } catch (error) {
        attempt++;
        if (attempt < maxRetries) {
          await this.exponentialBackoff(attempt);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Share data in the pool
   */
  shareData(key: string, value: any, sourceAgent: string, citations: string[] = [], tags: string[] = []): void {
    const entry: SharedDataEntry = {
      key,
      value,
      type: typeof value as any,
      metadata: {
        sourceAgent,
        timestamp: new Date(),
        citations,
        accessedBy: [sourceAgent],
        version: 1,
        tags
      }
    };

    // Check if updating existing entry
    const existing = this.sharedDataPool.get(key);
    if (existing) {
      entry.metadata.version = existing.metadata.version + 1;
    }

    this.sharedDataPool.set(key, entry);
    this.logAccess(sourceAgent, key, 'WRITE');
    console.error(`[Coordinator] Data shared: ${key} by ${sourceAgent}`);
  }

  /**
   * Get data from the pool
   */
  getData(key: string, requestingAgent: string): any {
    const entry = this.sharedDataPool.get(key);
    if (entry) {
      // Update access tracking
      if (!entry.metadata.accessedBy.includes(requestingAgent)) {
        entry.metadata.accessedBy.push(requestingAgent);
      }
      this.logAccess(requestingAgent, key, 'READ');
      return entry.value;
    }
    return undefined;
  }

  /**
   * Find data by tags
   */
  findDataByTag(tag: string): SharedDataEntry[] {
    const results: SharedDataEntry[] = [];
    this.sharedDataPool.forEach(entry => {
      if (entry.metadata.tags.includes(tag)) {
        results.push(entry);
      }
    });
    return results;
  }

  /**
   * Request assistance from capable agents
   */
  async requestAssistance(request: AssistanceRequest): Promise<AssistanceResponse> {
    console.error(`[Coordinator] Processing assistance request ${request.requestId} from ${request.fromAgent}`);

    // Find capable agent
    const assistant = this.findBestAssistant(request);
    if (!assistant) {
      return {
        requestId: request.requestId,
        fromAgent: 'coordinator',
        toAgent: request.fromAgent,
        status: 'DECLINED',
        error: {
          code: 'NO_CAPABLE_AGENT',
          message: 'No agent available with required capabilities'
        },
        metadata: {
          timestamp: new Date(),
          processingTime: 0
        }
      };
    }

    // Forward request to assistant
    const message: MCPMessage = {
      id: `msg-${request.requestId}`,
      type: MessageType.ASSISTANCE_REQUEST,
      priority: request.urgency === 'BLOCKING' ? Priority.CRITICAL : Priority.HIGH,
      from: request.fromAgent,
      to: assistant,
      payload: request,
      metadata: {
        timestamp: new Date(),
        correlationId: request.requestId
      }
    };

    await this.sendMessage(message);

    // Wait for response (simplified - in real implementation would use promise/callback)
    return this.waitForAssistanceResponse(request.requestId, request.timeout || 30000);
  }

  /**
   * Get aggregated status of all agents
   */
  getSystemStatus(): {
    agents: { id: string; status: string; taskCount: number }[];
    messageQueueSize: number;
    sharedDataSize: number;
    deadLetterQueueSize: number;
  } {
    const agents = Array.from(this.registeredAgents.values()).map(agent => ({
      id: agent.agentId,
      status: agent.status,
      taskCount: agent.activeTaskCount
    }));

    return {
      agents,
      messageQueueSize: this.messageQueue.size(),
      sharedDataSize: this.sharedDataPool.size,
      deadLetterQueueSize: this.deadLetterQueue.length
    };
  }

  /**
   * Get citation graph from shared data
   */
  getCitationGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    this.sharedDataPool.forEach((entry, key) => {
      graph.set(key, entry.metadata.citations);
    });
    return graph;
  }

  /**
   * Clear expired data from pool
   */
  cleanupExpiredData(): number {
    const now = Date.now();
    let cleaned = 0;

    this.sharedDataPool.forEach((entry, key) => {
      if (entry.metadata.ttl) {
        const expiryTime = entry.metadata.timestamp.getTime() + entry.metadata.ttl;
        if (now > expiryTime) {
          this.sharedDataPool.delete(key);
          cleaned++;
        }
      }
    });

    if (cleaned > 0) {
      console.error(`[Coordinator] Cleaned up ${cleaned} expired data entries`);
    }
    return cleaned;
  }

  /**
   * Register a message handler for an agent
   */
  registerMessageHandler(agentId: string, handler: (message: MCPMessage) => Promise<void>): void {
    this.messageHandlers.set(agentId, handler);
  }

  // Private helper methods

  private getPriorityValue(priority: Priority): number {
    const priorityMap = {
      [Priority.CRITICAL]: 1000,
      [Priority.HIGH]: 100,
      [Priority.NORMAL]: 10,
      [Priority.LOW]: 1
    };
    return priorityMap[priority] || 10;
  }

  private resolveRecipients(message: MCPMessage): string[] {
    if (message.to === '*') {
      // Broadcast to all agents
      return Array.from(this.registeredAgents.keys());
    } else if (message.channel) {
      // Channel-based routing
      return Array.from(this.channels.get(message.channel) || []);
    } else if (Array.isArray(message.to)) {
      return message.to;
    } else {
      return [message.to];
    }
  }

  private async exponentialBackoff(attempt: number): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private logAccess(agentId: string, key: string, operation: 'READ' | 'WRITE' | 'DELETE'): void {
    this.accessLog.push({
      agentId,
      key,
      operation,
      timestamp: new Date()
    });
  }

  private estimateExecutionTime(phases: AgentPhase[]): number {
    let totalTime = 0;
    for (const phase of phases) {
      const phaseTime = phase.timeout || 60000; // Default 1 minute per phase
      if (phase.type === 'sequential') {
        totalTime += phaseTime * phase.agents.length;
      } else {
        totalTime += phaseTime;
      }
    }
    return totalTime;
  }

  private areDependenciesMet(dependencies: string[], results: Map<string, AgentResult>): boolean {
    for (const dep of dependencies) {
      if (!results.has(dep) || results.get(dep)!.status !== 'SUCCESS') {
        return false;
      }
    }
    return true;
  }

  private async executeParallelPhase(phase: AgentPhase, results: Map<string, AgentResult>): Promise<void> {
    const promises = phase.agents.map(agentId => this.executeAgent(agentId, results));
    const phaseResults = await Promise.all(promises);
    phaseResults.forEach(result => {
      if (result) {
        results.set(result.agentId, result);
      }
    });
  }

  private async executeSequentialPhase(phase: AgentPhase, results: Map<string, AgentResult>): Promise<void> {
    for (const agentId of phase.agents) {
      const result = await this.executeAgent(agentId, results);
      if (result) {
        results.set(result.agentId, result);
      }
    }
  }

  private async executeAgent(agentId: string, _previousResults: Map<string, AgentResult>): Promise<AgentResult | null> {
    // This is a placeholder - in real implementation would trigger agent execution
    console.error(`[Coordinator] Executing agent: ${agentId}`);

    // Simulated result
    return {
      agentId,
      taskId: `task-${Date.now()}`,
      status: 'SUCCESS',
      output: {},
      steps: [],
      citations: [],
      confidence: 0.9,
      metadata: {
        startTime: new Date(),
        endTime: new Date(),
        totalDuration: 1000,
        dataProduced: []
      }
    };
  }

  private async evaluateQualityGates(gate: QualityGate, results: Map<string, AgentResult>): Promise<GateResult[]> {
    const gateResults: GateResult[] = [];
    for (const agentId of gate.enforceFor) {
      const agentResult = results.get(agentId);
      if (agentResult) {
        // Placeholder evaluation - real implementation would use quality-gate.ts
        const result: GateResult = {
          passed: true,
          gateName: gate.name,
          evaluatedAt: new Date(),
          evaluationTime: 100
        };
        gateResults.push(result);
      }
    }
    return gateResults;
  }

  private findBestAssistant(request: AssistanceRequest): string | null {
    let bestAgent: string | null = null;
    let bestScore = -1;

    this.registeredAgents.forEach((capabilities, agentId) => {
      if (agentId === request.fromAgent) return; // Can't assist yourself
      if (capabilities.status !== 'AVAILABLE') return;

      // Check required capabilities
      if (request.requiredCapabilities) {
        const hasAll = request.requiredCapabilities.every(req =>
          capabilities.capabilities.includes(req)
        );
        if (!hasAll) return;
      }

      // Calculate score
      let score = 0;

      // Exact type match
      if (capabilities.capabilities.includes(request.type)) {
        score += 10;
      }

      // Specialization bonus
      if (capabilities.specializations?.includes(request.type)) {
        score += 5;
      }

      // Lower load is better
      score -= capabilities.activeTaskCount;

      // Historical success rate
      const history = capabilities.assistanceHistory?.[request.type];
      if (history && history.total > 0) {
        score += (history.success / history.total) * 3;
      }

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agentId;
      }
    });

    return bestAgent;
  }

  private async waitForAssistanceResponse(requestId: string, timeout: number): Promise<AssistanceResponse> {
    // Simplified implementation - in real system would use proper async/await with event emitters
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Assistance request ${requestId} timed out after ${timeout}ms`));
      }, timeout);

      // Placeholder response
      setTimeout(() => {
        clearTimeout(timer);
        resolve({
          requestId,
          fromAgent: 'assistant',
          toAgent: 'requester',
          status: 'COMPLETED',
          result: {},
          metadata: {
            timestamp: new Date(),
            processingTime: 1000
          }
        });
      }, 1000);
    });
  }
}
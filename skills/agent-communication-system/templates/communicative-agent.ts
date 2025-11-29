/**
 * Communicative Agent Base Class
 * Abstract base class for agents with built-in communication capabilities
 */

import {
  AgentContext,
  AgentResult,
  AssistanceRequest,
  AssistanceResponse,
  StepResult,
  ProgressUpdate,
  MCPMessage,
  MessageType,
  Priority
} from './message-types';

/**
 * Configuration for the communicative agent
 */
export interface AgentConfig {
  agentId: string;
  capabilities: string[];
  specializations?: string[];
  maxConcurrentTasks?: number;
  progressThrottleMs?: number;          // Minimum time between progress updates
  defaultTimeout?: number;               // Default timeout for operations
  orchestratorUrl?: string;              // URL/ID of the orchestrator
}

/**
 * Abstract base class for communicative agents
 */
export abstract class CommunicativeAgent {
  protected agentId: string;
  protected capabilities: string[];
  protected specializations: string[];
  protected stepResults: StepResult[] = [];
  protected citations: Set<string> = new Set();
  protected sharedDataAccessed: Set<string> = new Set();
  protected sharedDataProduced: Set<string> = new Set();
  protected lastProgressUpdate: number = 0;
  protected progressThrottleMs: number;
  protected currentTaskId: string | null = null;
  protected orchestrator: any;           // Reference to orchestrator/coordinator
  protected activeAssistanceRequests: Map<string, AssistanceRequest> = new Map();

  constructor(config: AgentConfig) {
    this.agentId = config.agentId;
    this.capabilities = config.capabilities;
    this.specializations = config.specializations || [];
    this.progressThrottleMs = config.progressThrottleMs || 5000; // 5 seconds default
  }

  /**
   * Abstract method - must be implemented by subclasses
   * Main execution method for the agent
   */
  abstract execute(context: AgentContext): Promise<AgentResult>;

  /**
   * Abstract method - must be implemented by subclasses
   * Determines if this agent can assist with a request
   */
  abstract canAssist(request: AssistanceRequest): boolean;

  /**
   * Report progress to the orchestrator
   * Includes throttling to prevent spam
   */
  protected reportProgress(step: string, percentage: number, details?: any): void {
    const now = Date.now();

    // Throttle progress updates
    if (percentage < 100 && now - this.lastProgressUpdate < this.progressThrottleMs) {
      return;
    }

    this.lastProgressUpdate = now;

    const update: ProgressUpdate = {
      agentId: this.agentId,
      taskId: this.currentTaskId || 'unknown',
      step,
      percentage,
      status: this.determineStatus(percentage),
      details,
      timestamp: new Date()
    };

    // Send to orchestrator
    this.sendProgressUpdate(update);
    console.error(`[${this.agentId}] Progress: ${step} - ${percentage}%`);
  }

  /**
   * Request assistance from another agent
   */
  protected async requestAssistance(type: string, context: any, requiredCapabilities?: string[]): Promise<AssistanceResponse> {
    const requestId = `assist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const request: AssistanceRequest = {
      requestId,
      fromAgent: this.agentId,
      type,
      context,
      requiredCapabilities,
      urgency: 'HIGH',
      timeout: 30000,
      reason: `Agent ${this.agentId} needs help with ${type}`
    };

    this.activeAssistanceRequests.set(requestId, request);

    console.error(`[${this.agentId}] Requesting assistance: ${type}`);

    try {
      // Send request through orchestrator
      const response = await this.sendAssistanceRequest(request);

      if (response.status === 'COMPLETED' || response.status === 'PARTIAL') {
        console.error(`[${this.agentId}] Assistance received: ${response.status}`);

        // Track citations from assistance
        if (response.metadata?.citations) {
          response.metadata.citations.forEach(c => this.citations.add(c));
        }
      } else {
        console.error(`[${this.agentId}] Assistance failed: ${response.status}`);
      }

      return response;
    } finally {
      this.activeAssistanceRequests.delete(requestId);
    }
  }

  /**
   * Share data to the shared data pool
   */
  protected shareData(key: string, value: any, citations?: string[]): void {
    if (this.orchestrator) {
      this.orchestrator.shareData(key, value, this.agentId, citations || [], []);
      this.sharedDataProduced.add(key);
      console.error(`[${this.agentId}] Shared data: ${key}`);
    } else {
      console.error(`[${this.agentId}] Warning: No orchestrator connection for sharing data`);
    }
  }

  /**
   * Get data from the shared data pool
   */
  protected async getData(key: string): Promise<any> {
    if (this.orchestrator) {
      const data = this.orchestrator.getData(key, this.agentId);
      if (data !== undefined) {
        this.sharedDataAccessed.add(key);
        console.error(`[${this.agentId}] Retrieved data: ${key}`);
      }
      return data;
    } else {
      console.error(`[${this.agentId}] Warning: No orchestrator connection for getting data`);
      return undefined;
    }
  }

  /**
   * Notify orchestrator of task completion
   */
  protected notifyCompletion(result: AgentResult): void {
    const message: MCPMessage = {
      id: `msg-complete-${Date.now()}`,
      type: MessageType.COMPLETED,
      priority: Priority.NORMAL,
      from: this.agentId,
      to: 'orchestrator',
      payload: result,
      metadata: {
        timestamp: new Date(),
        correlationId: result.taskId
      }
    };

    this.sendMessage(message);
    console.error(`[${this.agentId}] Task completed: ${result.taskId}`);
  }

  /**
   * Set the orchestrator/coordinator reference
   */
  setOrchestrator(orchestrator: any): void {
    this.orchestrator = orchestrator;
  }

  /**
   * Handle incoming messages
   */
  async receiveMessage(message: MCPMessage): Promise<void> {
    console.error(`[${this.agentId}] Received message: ${message.type} from ${message.from}`);

    switch (message.type) {
      case MessageType.TASK:
        await this.handleTaskMessage(message);
        break;

      case MessageType.ASSISTANCE_REQUEST:
        await this.handleAssistanceRequest(message);
        break;

      case MessageType.DATA_REQUEST:
        await this.handleDataRequest(message);
        break;

      case MessageType.SYSTEM:
        await this.handleSystemMessage(message);
        break;

      default:
        console.error(`[${this.agentId}] Unhandled message type: ${message.type}`);
    }
  }

  /**
   * Get current agent status
   */
  getStatus(): {
    agentId: string;
    status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    activeTask: string | null;
    capabilities: string[];
  } {
    return {
      agentId: this.agentId,
      status: this.currentTaskId ? 'BUSY' : 'AVAILABLE',
      activeTask: this.currentTaskId,
      capabilities: this.capabilities
    };
  }

  /**
   * Add a step result to the execution history
   */
  protected addStepResult(stepName: string, output: any, confidence: number = 1.0): void {
    const startTime = Date.now();

    const step: StepResult = {
      stepName,
      output,
      citations: Array.from(this.citations),
      confidence,
      timestamp: new Date(),
      duration: 0, // Will be updated when step completes
      metadata: {
        dataAccessed: Array.from(this.sharedDataAccessed),
        dataProduced: Array.from(this.sharedDataProduced),
        assistanceRequested: this.activeAssistanceRequests.size > 0
      }
    };

    this.stepResults.push(step);

    // Update duration if we can
    if (this.stepResults.length > 1) {
      const prevStep = this.stepResults[this.stepResults.length - 2];
      prevStep.duration = startTime - prevStep.timestamp.getTime();
    }
  }

  /**
   * Build the final agent result
   */
  protected buildResult(
    status: 'SUCCESS' | 'FAILURE' | 'PARTIAL',
    output: any,
    error?: { code: string; message: string; details?: any }
  ): AgentResult {
    const endTime = new Date();
    const startTime = this.stepResults[0]?.timestamp || endTime;

    return {
      agentId: this.agentId,
      taskId: this.currentTaskId || 'unknown',
      status,
      output,
      steps: this.stepResults,
      citations: Array.from(this.citations),
      confidence: this.calculateOverallConfidence(),
      metadata: {
        startTime,
        endTime,
        totalDuration: endTime.getTime() - startTime.getTime(),
        dataProduced: Array.from(this.sharedDataProduced)
      },
      error
    };
  }

  // Private helper methods

  private determineStatus(percentage: number): ProgressUpdate['status'] {
    if (percentage === 0) return 'started';
    if (percentage === 100) return 'completed';
    if (percentage < 0) return 'error';
    return 'progress';
  }

  private calculateOverallConfidence(): number {
    if (this.stepResults.length === 0) return 0;

    const totalConfidence = this.stepResults.reduce((sum, step) => sum + step.confidence, 0);
    return totalConfidence / this.stepResults.length;
  }

  private sendProgressUpdate(update: ProgressUpdate): void {
    const message: MCPMessage = {
      id: `msg-progress-${Date.now()}`,
      type: MessageType.STATUS,
      priority: Priority.LOW,
      from: this.agentId,
      to: 'orchestrator',
      payload: update,
      metadata: {
        timestamp: new Date()
      }
    };

    this.sendMessage(message);
  }

  private async sendAssistanceRequest(request: AssistanceRequest): Promise<AssistanceResponse> {
    if (this.orchestrator) {
      return await this.orchestrator.requestAssistance(request);
    }

    // Fallback response if no orchestrator
    return {
      requestId: request.requestId,
      fromAgent: 'system',
      toAgent: this.agentId,
      status: 'DECLINED',
      error: {
        code: 'NO_ORCHESTRATOR',
        message: 'No orchestrator available to handle assistance request'
      },
      metadata: {
        timestamp: new Date(),
        processingTime: 0
      }
    };
  }

  private sendMessage(message: MCPMessage): void {
    if (this.orchestrator) {
      this.orchestrator.sendMessage(message);
    } else {
      console.error(`[${this.agentId}] Warning: No orchestrator to send message`);
    }
  }

  private async handleTaskMessage(message: MCPMessage): Promise<void> {
    this.currentTaskId = message.metadata.correlationId || `task-${Date.now()}`;
    const context: AgentContext = {
      taskId: this.currentTaskId,
      input: message.payload,
      sharedData: new Map(),
      previousSteps: []
    };

    try {
      const result = await this.execute(context);
      this.notifyCompletion(result);
    } catch (error) {
      const errorResult = this.buildResult(
        'FAILURE',
        null,
        {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      this.notifyCompletion(errorResult);
    } finally {
      this.currentTaskId = null;
      this.stepResults = [];
      this.citations.clear();
      this.sharedDataAccessed.clear();
      this.sharedDataProduced.clear();
    }
  }

  private async handleAssistanceRequest(message: MCPMessage): Promise<void> {
    const request = message.payload as AssistanceRequest;

    if (!this.canAssist(request)) {
      const response: AssistanceResponse = {
        requestId: request.requestId,
        fromAgent: this.agentId,
        toAgent: request.fromAgent,
        status: 'DECLINED',
        error: {
          code: 'CANNOT_ASSIST',
          message: 'Agent cannot provide requested assistance'
        },
        metadata: {
          timestamp: new Date(),
          processingTime: 0
        }
      };

      this.sendAssistanceResponse(response, request.fromAgent);
      return;
    }

    // Execute assistance
    try {
      const startTime = Date.now();
      const result = await this.provideAssistance(request);

      const response: AssistanceResponse = {
        requestId: request.requestId,
        fromAgent: this.agentId,
        toAgent: request.fromAgent,
        status: 'COMPLETED',
        result,
        metadata: {
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
          confidence: 0.9,
          citations: Array.from(this.citations)
        }
      };

      this.sendAssistanceResponse(response, request.fromAgent);
    } catch (error) {
      const response: AssistanceResponse = {
        requestId: request.requestId,
        fromAgent: this.agentId,
        toAgent: request.fromAgent,
        status: 'FAILED',
        error: {
          code: 'ASSISTANCE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        metadata: {
          timestamp: new Date(),
          processingTime: 0
        }
      };

      this.sendAssistanceResponse(response, request.fromAgent);
    }
  }

  private async handleDataRequest(message: MCPMessage): Promise<void> {
    const { key } = message.payload;
    const data = await this.getData(key);

    const response: MCPMessage = {
      id: `msg-data-response-${Date.now()}`,
      type: MessageType.DATA_RESPONSE,
      priority: Priority.NORMAL,
      from: this.agentId,
      to: message.from,
      payload: { key, value: data },
      metadata: {
        timestamp: new Date(),
        correlationId: message.id
      }
    };

    this.sendMessage(response);
  }

  private async handleSystemMessage(message: MCPMessage): Promise<void> {
    const { event } = message.payload;
    console.error(`[${this.agentId}] System event: ${event}`);

    // Handle specific system events
    if (event === 'shutdown-warning') {
      // Prepare for shutdown
      await this.prepareShutdown();
    }
  }

  private sendAssistanceResponse(response: AssistanceResponse, recipient: string): void {
    const message: MCPMessage = {
      id: `msg-assist-response-${Date.now()}`,
      type: MessageType.ASSISTANCE_RESPONSE,
      priority: Priority.HIGH,
      from: this.agentId,
      to: recipient,
      payload: response,
      metadata: {
        timestamp: new Date(),
        correlationId: response.requestId
      }
    };

    this.sendMessage(message);
  }

  /**
   * Override this method to provide assistance
   */
  protected async provideAssistance(request: AssistanceRequest): Promise<any> {
    // Default implementation - override in subclass
    throw new Error(`Agent ${this.agentId} does not implement provideAssistance`);
  }

  /**
   * Override this method to handle shutdown
   */
  protected async prepareShutdown(): Promise<void> {
    // Default implementation - override in subclass if needed
    console.error(`[${this.agentId}] Preparing for shutdown`);
  }
}
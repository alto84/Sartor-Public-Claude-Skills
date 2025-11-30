/**
 * Type definitions for the Community Swarm system
 * Defines all interfaces for 10-agent orchestration with delegation-only pattern
 */

/**
 * Agent identifiers for the 10-agent swarm
 */
export enum AgentId {
  ORCHESTRATOR = 'orchestrator',
  ASSESSMENT = 'assessment-agent',
  IMPLEMENTATION = 'implementation-agent',
  VALIDATION = 'validation-agent',
  RESEARCH = 'research-agent',
  SYNTHESIS = 'synthesis-agent',
  QUALITY_GATE = 'quality-gate-agent',
  MONITOR = 'monitor-agent',
  AUDIT = 'audit-agent',
  GIT = 'git-agent',
  AUTONOMOUS = 'autonomous-agent'
}

/**
 * Message types for swarm communication
 */
export enum SwarmMessageType {
  // Task management
  TASK_ASSIGN = 'TASK_ASSIGN',
  TASK_PROGRESS = 'TASK_PROGRESS',
  TASK_COMPLETE = 'TASK_COMPLETE',
  TASK_FAILED = 'TASK_FAILED',

  // Agent collaboration
  ASSISTANCE_REQUEST = 'ASSISTANCE_REQUEST',
  ASSISTANCE_RESPONSE = 'ASSISTANCE_RESPONSE',

  // Data sharing
  DATA_SHARE = 'DATA_SHARE',
  DATA_REQUEST = 'DATA_REQUEST',
  DATA_RESPONSE = 'DATA_RESPONSE',

  // Quality gates
  QUALITY_CHECK = 'QUALITY_CHECK',
  QUALITY_PASS = 'QUALITY_PASS',
  QUALITY_FAIL = 'QUALITY_FAIL',
  REVISION_NEEDED = 'REVISION_NEEDED',

  // System
  HEARTBEAT = 'HEARTBEAT',
  ALERT = 'ALERT',
  SHUTDOWN = 'SHUTDOWN'
}

/**
 * Priority levels for messages and tasks
 */
export enum Priority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW'
}

/**
 * Agent status in the swarm
 */
export enum AgentStatus {
  SPAWNING = 'SPAWNING',
  READY = 'READY',
  BUSY = 'BUSY',
  COMPLETING = 'COMPLETING',
  ERROR = 'ERROR',
  SHUTDOWN = 'SHUTDOWN'
}

/**
 * Evidence attached to agent outputs
 */
export interface Evidence {
  citations: string[];           // Source references
  confidence: number;            // 0.0 - 1.0
  sources: string[];             // Where evidence came from
  isSpeculative?: boolean;       // If suggestion is speculative
  validationMethod?: string;     // How to validate
}

/**
 * Standard message structure for swarm communication
 */
export interface SwarmMessage {
  id: string;
  type: SwarmMessageType;
  priority: Priority;
  from: AgentId | string;
  to: AgentId | string | (AgentId | string)[];
  payload: any;
  metadata: {
    timestamp: Date;
    correlationId?: string;
    replyTo?: string;
    ttl?: number;
  };
  evidence?: Evidence;
}

/**
 * Agent capability registration
 */
export interface AgentCapability {
  agentId: AgentId;
  capabilities: string[];
  specializations?: string[];
  model: 'opus' | 'sonnet' | 'haiku';
  status: AgentStatus;
  currentTask?: string;
  performance?: {
    tasksCompleted: number;
    averageTime: number;
    qualityScore: number;
  };
}

/**
 * Task structure for delegation
 */
export interface SwarmTask {
  id: string;
  type: string;
  description: string;
  assignedTo?: AgentId;
  priority: Priority;
  dependencies: string[];
  inputs: any;
  expectedOutputs: string[];
  timeout?: number;
  qualityGates: string[];
  metadata: {
    createdAt: Date;
    createdBy: AgentId;
    deadline?: Date;
  };
}

/**
 * Task result from an agent
 */
export interface TaskResult {
  taskId: string;
  agentId: AgentId;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  output: any;
  summary: string;              // Required: < 500 words for orchestrator
  evidence: Evidence;
  qualityGatesPassed: string[];
  duration: number;
  errors?: {
    code: string;
    message: string;
    recoverable: boolean;
  }[];
}

/**
 * Shared data pool entry
 */
export interface SharedDataEntry {
  key: string;
  value: any;
  sourceAgent: AgentId;
  timestamp: Date;
  evidence: Evidence;
  accessLog: {
    agentId: AgentId;
    operation: 'READ' | 'WRITE';
    timestamp: Date;
  }[];
  version: number;
  tags: string[];
}

/**
 * Quality gate definition
 */
export interface QualityGate {
  id: string;
  name: string;
  type: 'FORMAT' | 'EVIDENCE' | 'CONSISTENCY' | 'CUSTOM';
  criteria: {
    requiredFields?: string[];
    minConfidence?: number;
    requireCitations?: boolean;
    customValidator?: (output: any) => QualityGateResult;
  };
  blocking: boolean;
  enforceFor: AgentId[];
}

/**
 * Quality gate evaluation result
 */
export interface QualityGateResult {
  passed: boolean;
  gateName: string;
  reason?: string;
  suggestedFix?: string;
  details?: any;
  evaluatedAt: Date;
}

/**
 * Hook types in the swarm lifecycle
 */
export enum HookType {
  PRE_SPAWN = 'pre-spawn',
  POST_SPAWN = 'post-spawn',
  PRE_TASK = 'pre-task',
  POST_TASK = 'post-task',
  PRE_SHUTDOWN = 'pre-shutdown',
  POST_SHUTDOWN = 'post-shutdown',
  PRE_SEND = 'pre-send',
  POST_RECEIVE = 'post-receive',
  ON_ERROR = 'on-error',
  ON_TIMEOUT = 'on-timeout'
}

/**
 * Hook context passed to hook handlers
 */
export interface HookContext {
  hookType: HookType;
  agent?: AgentCapability;
  task?: SwarmTask;
  message?: SwarmMessage;
  result?: TaskResult;
  error?: Error;
  metadata: Record<string, any>;
}

/**
 * Hook handler interface
 */
export interface HookHandler {
  name: string;
  priority: number;
  critical: boolean;
  execute: (context: HookContext) => Promise<HookResult>;
}

/**
 * Hook execution result
 */
export interface HookResult {
  proceed: boolean;
  modifications?: Partial<HookContext>;
  errors?: string[];
}

/**
 * Recovery strategy for error handling
 */
export enum RecoveryStrategy {
  RETRY = 'RETRY',
  REASSIGN = 'REASSIGN',
  ROLLBACK = 'ROLLBACK',
  ESCALATE = 'ESCALATE',
  TERMINATE = 'TERMINATE'
}

/**
 * Error classification
 */
export interface SwarmError {
  code: string;
  message: string;
  agent?: AgentId;
  task?: string;
  recoveryStrategy: RecoveryStrategy;
  retryCount: number;
  maxRetries: number;
  context: any;
}

/**
 * Swarm configuration
 */
export interface SwarmConfig {
  agents: {
    [K in AgentId]?: {
      model: 'opus' | 'sonnet' | 'haiku';
      capabilities: string[];
      maxConcurrentTasks: number;
    };
  };
  hooks: {
    [K in HookType]?: HookHandler[];
  };
  qualityGates: QualityGate[];
  contextProtection: {
    enabled: boolean;
    maxSummaryWords: number;
    maxCodeLines: number;
  };
  timeouts: {
    taskDefault: number;
    heartbeat: number;
    messageDelivery: number;
  };
  recovery: {
    maxRetries: number;
    backoffBase: number;
    backoffMax: number;
  };
}

/**
 * Swarm status for monitoring
 */
export interface SwarmStatus {
  agents: {
    agentId: AgentId;
    status: AgentStatus;
    currentTask?: string;
    lastHeartbeat: Date;
  }[];
  tasks: {
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  };
  messageQueue: {
    depth: number;
    oldestMessage?: Date;
  };
  dataPool: {
    entries: number;
    totalSize: number;
  };
  health: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  uptime: number;
}

/**
 * Improvement suggestion from autonomous agent
 */
export interface ImprovementSuggestion {
  id: string;
  category: 'OPTIMIZATION' | 'QUALITY' | 'CONSISTENCY' | 'SECURITY' | 'CREATIVE';
  priority: Priority;
  observation: {
    what: string;
    where: string;
    evidence: string[];
  };
  suggestion: {
    action: string;
    rationale: string;
    effort: 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT';
    impact: 'MINOR' | 'MODERATE' | 'MAJOR';
  };
  isSpeculative: boolean;
  confidence: number;
  timestamp: Date;
}

/**
 * Audit log entry
 */
export interface AuditEntry {
  id: string;
  timestamp: Date;
  agent: AgentId;
  action: string;
  details: any;
  outcome: 'SUCCESS' | 'FAILURE';
  relatedEntities: {
    type: string;
    id: string;
  }[];
}

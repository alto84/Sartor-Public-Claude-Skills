/**
 * Type definitions for agent communication system
 * Provides all interfaces and enums for message passing between agents
 */

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
 * Types of messages that can be sent between agents
 */
export enum MessageType {
  // Task management
  TASK = 'TASK',
  STATUS = 'STATUS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',

  // Data exchange
  DATA_REQUEST = 'DATA_REQUEST',
  DATA_RESPONSE = 'DATA_RESPONSE',
  SHARED_DATA = 'SHARED_DATA',

  // Collaboration
  ASSISTANCE_REQUEST = 'ASSISTANCE_REQUEST',
  ASSISTANCE_RESPONSE = 'ASSISTANCE_RESPONSE',
  CONSENSUS = 'CONSENSUS',
  LEARNING = 'LEARNING',

  // System events
  HEARTBEAT = 'HEARTBEAT',
  DISCOVERY = 'DISCOVERY',
  SYSTEM = 'SYSTEM'
}

/**
 * Standardized message structure for agent-to-agent communication
 */
export interface MCPMessage {
  // Core fields
  id: string;                           // Unique message identifier
  type: MessageType;                    // Message category
  priority: Priority;                   // Message priority level

  // Routing
  from: string;                         // Sender agent ID
  to: string | string[];                // Recipient(s) - can be array for broadcast
  channel?: string;                     // Topic/channel for pub-sub

  // Content
  payload: any;                         // Message content
  metadata: {
    timestamp: Date;
    correlationId?: string;             // For request-response pairing
    replyTo?: string;                   // Response channel
    ttl?: number;                       // Time to live in milliseconds
  };

  // Delivery
  acknowledgment?: {
    required: boolean;
    timeout: number;                    // Timeout in milliseconds
    retries: number;                    // Number of retry attempts
  };
}

/**
 * Execution phase for agent coordination
 */
export interface AgentPhase {
  agents: string[];                     // Agent IDs to execute in this phase
  type: 'parallel' | 'sequential';     // Execution mode
  dependencies: string[];               // IDs of phases that must complete first
  timeout?: number;                    // Phase timeout in milliseconds
}

/**
 * Data flow design between agents
 */
export interface DataFlow {
  from: string;                         // Source agent ID
  to: string;                          // Destination agent ID
  dataKey: string;                     // Key in shared data pool
  required: boolean;                   // Whether this data is required
}

/**
 * Quality gate definition for validation
 */
export interface QualityGate {
  name: string;
  type: 'CITATION_CHECK' | 'PEER_REVIEW' | 'FORMAT_VALIDATION' | 'CONFIDENCE_THRESHOLD' | 'CUSTOM';
  criteria: GateCriteria;
  blocking: boolean;                    // Whether failure blocks execution
  enforceFor: string[];                 // Agent IDs to enforce gate for
}

/**
 * Criteria for quality gate evaluation
 */
export interface GateCriteria {
  // Citation requirements
  minCitations?: number;                // Minimum number of citations required
  citationTypes?: string[];             // Required citation types (e.g., 'pubmed', 'arxiv')

  // Peer review
  minReviewers?: number;                // Minimum number of reviewers required
  reviewerCapabilities?: string[];      // Required capabilities for reviewers

  // Format validation
  schema?: any;                         // JSON Schema for validation
  requiredFields?: string[];            // Fields that must be present

  // Confidence scoring
  minConfidence?: number;               // Minimum confidence score (0.0-1.0)

  // Custom validation
  validationFunction?: (output: any) => ValidationResult;
}

/**
 * Result from custom validation function
 */
export interface ValidationResult {
  passed: boolean;
  reason?: string;
  suggestedAction?: string;
  details?: any;
}

/**
 * Coordination plan for multi-agent execution
 */
export interface CoordinationPlan {
  id: string;
  name: string;
  description?: string;
  executionPhases: AgentPhase[];        // Sequential/parallel execution plan
  dataFlowDesign: DataFlow[];           // Data dependencies between agents
  qualityGates: QualityGate[];          // Validation checkpoints
  timeout?: number;                     // Overall plan timeout in milliseconds
  metadata?: {
    createdBy: string;
    createdAt: Date;
    estimatedDuration?: number;         // Estimated time in milliseconds
    tags?: string[];
  };
}

/**
 * Entry in the shared data pool
 */
export interface SharedDataEntry {
  key: string;
  value: any;
  type: 'string' | 'object' | 'array' | 'number' | 'boolean';
  metadata: {
    sourceAgent: string;                // Agent that created this entry
    timestamp: Date;                    // Creation timestamp
    citations: string[];                // Evidence sources for this data
    accessedBy: string[];               // Audit trail of agents that accessed this
    version: number;                    // Version number for conflict detection
    tags: string[];                     // Searchable tags
    ttl?: number;                       // Time to live in milliseconds
  };
}

/**
 * Request from one agent to another
 */
export interface AgentRequest {
  id: string;
  fromAgent: string;
  toAgent: string;
  type: 'QUERY' | 'TASK' | 'ASSISTANCE' | 'DATA_REQUEST';
  priority: Priority;
  payload: any;
  timeout?: number;                     // Request timeout in milliseconds
  metadata?: {
    timestamp: Date;
    correlationId?: string;
    maxRetries?: number;
  };
}

/**
 * Response from one agent to another
 */
export interface AgentResponse {
  requestId: string;                    // ID of the original request
  fromAgent: string;
  toAgent: string;
  status: 'SUCCESS' | 'FAILURE' | 'PARTIAL' | 'TIMEOUT';
  payload: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    processingTime: number;              // Time taken in milliseconds
    citations?: string[];
  };
}

/**
 * Request for assistance from another agent
 */
export interface AssistanceRequest {
  requestId: string;
  fromAgent: string;
  type: string;                         // Type of assistance needed (e.g., 'web-search')
  context: any;                         // Request-specific context data
  requiredCapabilities?: string[];      // Capabilities the assistant must have
  urgency: 'BLOCKING' | 'HIGH' | 'NORMAL';
  timeout?: number;                     // Timeout in milliseconds
  reason?: string;                      // Why assistance is needed
}

/**
 * Response to an assistance request
 */
export interface AssistanceResponse {
  requestId: string;
  fromAgent: string;                    // Agent providing assistance
  toAgent: string;                      // Original requesting agent
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL' | 'DECLINED';
  result?: any;                         // Assistance result data
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    timestamp: Date;
    processingTime: number;
    confidence?: number;
    citations?: string[];
  };
}

/**
 * Agent capabilities registration
 */
export interface AgentCapabilities {
  agentId: string;
  capabilities: string[];                // List of things this agent can do
  specializations?: string[];           // Areas of expertise
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  activeTaskCount: number;
  maxConcurrentTasks: number;
  assistanceHistory?: {
    [type: string]: {
      success: number;
      total: number;
      averageTime?: number;
    };
  };
  metadata?: {
    version: string;
    lastHeartbeat: Date;
    performance?: {
      averageResponseTime: number;
      successRate: number;
    };
  };
}

/**
 * Context provided to agents for execution
 */
export interface AgentContext {
  taskId: string;
  input: any;
  sharedData: Map<string, any>;
  previousSteps: StepResult[];
  config?: {
    timeout?: number;
    maxRetries?: number;
    qualityGates?: QualityGate[];
  };
}

/**
 * Result from a single step in agent execution
 */
export interface StepResult {
  stepName: string;
  output: any;
  citations: string[];
  confidence: number;                   // 0.0 to 1.0
  timestamp: Date;
  duration: number;                     // Execution time in milliseconds
  metadata?: {
    dataAccessed?: string[];             // Keys from shared data pool
    dataProduced?: string[];             // Keys written to shared data pool
    assistanceRequested?: boolean;
  };
}

/**
 * Final result from agent execution
 */
export interface AgentResult {
  agentId: string;
  taskId: string;
  status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  output: any;
  steps: StepResult[];
  citations: string[];
  confidence: number;
  metadata: {
    startTime: Date;
    endTime: Date;
    totalDuration: number;
    dataProduced: string[];              // Keys added to shared data pool
    qualityGateResults?: ValidationResult[];
  };
  error?: {
    code: string;
    message: string;
    step?: string;
    details?: any;
  };
}

/**
 * Access record for audit trail
 */
export interface AccessRecord {
  agentId: string;
  key: string;
  operation: 'READ' | 'WRITE' | 'DELETE';
  timestamp: Date;
  metadata?: {
    previousValue?: any;
    newValue?: any;
    reason?: string;
  };
}

/**
 * Result from quality gate evaluation
 */
export interface GateResult {
  passed: boolean;
  gateName?: string;
  reason?: string;
  suggestedAction?: string;
  details?: any;
  evaluatedAt: Date;
  evaluationTime: number;                // Time taken in milliseconds
}

/**
 * Progress update from an agent
 */
export interface ProgressUpdate {
  agentId: string;
  taskId: string;
  step: string;
  percentage: number;                    // 0-100
  status: 'started' | 'progress' | 'completed' | 'needs_assistance' | 'error';
  details?: any;
  timestamp: Date;
}

/**
 * Workflow state for file-based communication
 */
export interface WorkflowState {
  state: 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED' | 'ARCHIVED';
  taskId: string;
  description: string;
  requirements?: string[];
  dependencies?: string[];
  estimatedEffort?: string;
  assignedTo?: string;
  progress?: number;
  completedSteps?: string[];
  remainingSteps?: string[];
}
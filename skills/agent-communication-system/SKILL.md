---
name: Agent Communication System
description: Implementation guide for inter-agent communication including coordinator patterns, MCP protocol, message routing, shared data pools, and quality gates. Use when implementing agent-to-agent communication, coordinating multi-agent workflows, or debugging communication issues.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Agent Communication System Skill

## Overview

This skill provides practical implementation guidance for building inter-agent communication systems. It covers the coordinator patterns, MCP protocol implementation, message routing, shared data management, and quality gates based on actual working implementations in the SKG Agent Prototype codebase.

**Complements**: `multi-agent-orchestration` skill (theoretical patterns) with practical implementation guidance.

## When to Use This Skill

Use this skill when you need to:

1. **Implement agent coordination** - Build orchestrators, coordinators, message routers
2. **Create communicative agents** - Extend base agent classes with communication capabilities
3. **Design message protocols** - Define message formats, routing patterns, delivery guarantees
4. **Manage shared data** - Implement data pools, access tracking, citation management
5. **Build quality gates** - Create validation systems for agent outputs
6. **Debug communication** - Trace message flow, diagnose coordination issues
7. **Optimize throughput** - Improve message delivery, reduce latency, prevent bottlenecks

## When NOT to Use This Skill

Do NOT activate this skill when:
- Working with single-agent systems that don't require coordination
- Building simple direct human-to-agent interfaces (not agent-to-agent communication)
- Using external orchestration frameworks that already handle agent communication (e.g., Kubernetes operators, Apache Airflow)
- Developing standalone CLI tools without inter-process communication needs
- Creating basic REST APIs where standard web frameworks suffice

**Alternative approaches:**
- For single-agent tasks, focus on the agent's core functionality without communication overhead
- For human-to-agent interfaces, use standard UI/API patterns instead of agent protocols
- For orchestration with existing frameworks, leverage their native coordination features

## Core Implementation Patterns

### 1. Inter-Agent Coordinator

**Purpose**: Central coordination system for managing multi-agent message passing, request routing, and shared data pools.

**Key Responsibilities**:
- Message queue management (priority-based)
- Agent request/response orchestration
- Shared data pool with access tracking
- Coordination planning (execution phases, data flow)
- Quality gate enforcement
- Status aggregation and diagnostics

**Implementation Location**: `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/inter-agent-coordinator.ts`

**Core Components**:

```typescript
// Coordination Planning
interface CoordinationPlan {
  executionPhases: AgentPhase[];        // Sequential/parallel execution
  dataFlowDesign: DataFlow[];           // Data dependencies between agents
  qualityGates: QualityGate[];          // Validation checkpoints
}

// Shared Data Pool
interface SharedDataEntry {
  key: string;
  value: any;
  metadata: {
    sourceAgent: string;
    timestamp: Date;
    citations?: string[];
    accessedBy: string[];              // Audit trail
  }
}

// Agent Request/Response
interface AgentRequest {
  id: string;
  fromAgent: string;
  toAgent: string;
  type: 'QUERY' | 'TASK' | 'ASSISTANCE' | 'DATA_REQUEST';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  payload: any;
  timeout?: number;
}
```

**Usage Pattern**:
```typescript
// 1. Create coordinator
const coordinator = new InterAgentCoordinator();

// 2. Register agents
coordinator.registerAgent({ id: 'agent-1', capabilities: ['search', 'analysis'] });
coordinator.registerAgent({ id: 'agent-2', capabilities: ['synthesis', 'writing'] });

// 3. Plan coordination
const plan = coordinator.planCoordination({
  phases: [
    { agents: ['agent-1'], type: 'parallel', dependencies: [] },
    { agents: ['agent-2'], type: 'sequential', dependencies: ['agent-1'] }
  ]
});

// 4. Execute with shared data
await coordinator.executeWithCoordination(plan);
```

**Evidence-Based Performance**:
- Cannot determine exact throughput without load testing
- Requires measurement for latency claims
- Coordination overhead depends on message count and agent complexity

### 2. Communicative Agent Base Class

**Purpose**: Standard base class for agents that need communication capabilities with orchestrators and peers.

**Key Features**:
- Step-based execution with progress reporting
- Assistance request protocols
- Citation tracking
- Context management
- Orchestrator integration

**Implementation Location**: `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/communicative-agent.ts`

**Core Interface**:

```typescript
abstract class CommunicativeAgent {
  // Abstract methods to implement
  abstract execute(context: AgentContext): Promise<AgentResult>;
  abstract canAssist(request: AssistanceRequest): boolean;

  // Provided communication methods
  protected reportProgress(step: string, percentage: number, details?: any): void;
  protected requestAssistance(type: string, context: any): Promise<AssistanceResponse>;
  protected shareData(key: string, value: any, citations?: string[]): void;
  protected getData(key: string): Promise<any>;
  protected notifyCompletion(result: AgentResult): void;
}

// Step-based execution
interface AgentContext {
  taskId: string;
  input: any;
  sharedData: Map<string, any>;
  previousSteps: StepResult[];
}

interface StepResult {
  stepName: string;
  output: any;
  citations: string[];
  confidence: number;
  timestamp: Date;
}
```

**Progress Reporting**:
- **Throttling**: Reports throttled to prevent spam (default: max 1 update per 5 seconds)
- **Status Types**: started, progress, completed, needs_assistance, error
- **Detail Levels**: High-level milestones vs fine-grained steps

**Usage Pattern**:
```typescript
class ResearchAgent extends CommunicativeAgent {
  async execute(context: AgentContext): Promise<AgentResult> {
    // Report start
    this.reportProgress('initialization', 0);

    // Execute steps with progress updates
    const sources = await this.findSources(context.input);
    this.reportProgress('source-collection', 25, { sourceCount: sources.length });

    // Request assistance if needed
    if (sources.length === 0) {
      const help = await this.requestAssistance('web-search', {
        query: context.input.query,
        reason: 'No local sources found'
      });
    }

    // Share findings
    this.shareData('research-sources', sources, ['pubmed:123', 'arxiv:456']);

    // Complete
    this.reportProgress('complete', 100);
    return { sources, citations: [...] };
  }
}
```

### 3. MCP (Model Context Protocol) Implementation

**Purpose**: Standardized message protocol for agent-to-agent communication with routing, acknowledgments, and delivery guarantees.

**Implementation Locations**:
- `/home/alton/SKG Agent Prototype 2/docs/communication-protocols.md`
- `/home/alton/mcp_communication_protocol.js`

**Message Structure**:

```typescript
interface MCPMessage {
  // Core fields
  id: string;                           // Unique message identifier
  type: MessageType;                    // Message category
  priority: Priority;                   // CRITICAL | HIGH | NORMAL | LOW

  // Routing
  from: string;                         // Sender agent ID
  to: string | string[];                // Recipient(s)
  channel?: string;                     // Topic/channel for pub-sub

  // Content
  payload: any;                         // Message content
  metadata: {
    timestamp: Date;
    correlationId?: string;             // For request-response pairing
    replyTo?: string;                   // Response channel
    ttl?: number;                       // Time to live (ms)
  };

  // Delivery
  acknowledgment?: {
    required: boolean;
    timeout: number;
    retries: number;
  };
}
```

**Message Types**:

1. **Task Management**:
   - `TASK`: Assign task to agent
   - `STATUS`: Progress update
   - `COMPLETED`: Task finished
   - `ERROR`: Error occurred

2. **Data Exchange**:
   - `DATA_REQUEST`: Request data from peer
   - `DATA_RESPONSE`: Provide requested data
   - `SHARED_DATA`: Broadcast data to subscribers

3. **Collaboration**:
   - `ASSISTANCE_REQUEST`: Need help from capable agent
   - `ASSISTANCE_RESPONSE`: Provide assistance
   - `CONSENSUS`: Coordinate decision-making
   - `LEARNING`: Share learned insights

4. **System Events**:
   - `HEARTBEAT`: Agent health check
   - `DISCOVERY`: Agent capability announcement
   - `SYSTEM`: Infrastructure messages

**Routing Patterns**:

```typescript
// 1. Direct (point-to-point)
const msg = {
  from: 'agent-1',
  to: 'agent-2',
  type: 'DATA_REQUEST',
  payload: { key: 'research-findings' }
};

// 2. Broadcast (all agents)
const msg = {
  from: 'orchestrator',
  to: '*',  // All registered agents
  type: 'SYSTEM',
  payload: { event: 'shutdown-warning' }
};

// 3. Publish-Subscribe (topic-based)
const msg = {
  from: 'agent-1',
  channel: 'research-updates',
  type: 'SHARED_DATA',
  payload: { sources: [...] }
};

// 4. Intent-Based (semantic routing)
const msg = {
  from: 'agent-1',
  type: 'ASSISTANCE_REQUEST',
  payload: {
    intent: 'web-search',
    requiredCapabilities: ['search', 'citation-extraction']
  }
  // Router finds capable agent automatically
};
```

**Delivery Guarantees**:

- **At-most-once**: Fire and forget (no ack)
- **At-least-once**: Retry until ack (default: 3 retries, exponential backoff)
- **Exactly-once**: Deduplication via message ID tracking

**Implementation**:

```typescript
class MCPHub {
  private agents: Map<string, Agent>;
  private channels: Map<string, Set<string>>;  // Topic → Subscriber IDs
  private messageQueue: PriorityQueue<MCPMessage>;

  async send(message: MCPMessage): Promise<void> {
    // 1. Validate message
    this.validateMessage(message);

    // 2. Route to recipient(s)
    const recipients = await this.resolveRecipients(message);

    // 3. Deliver with retry
    for (const recipient of recipients) {
      await this.deliverWithRetry(message, recipient);
    }

    // 4. Wait for ack if required
    if (message.acknowledgment?.required) {
      await this.waitForAck(message.id, message.acknowledgment.timeout);
    }
  }

  private async deliverWithRetry(msg: MCPMessage, recipient: string): Promise<void> {
    const maxRetries = msg.acknowledgment?.retries || 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await this.agents.get(recipient).receiveMessage(msg);
        return;
      } catch (error) {
        attempt++;
        await this.exponentialBackoff(attempt);
      }
    }

    // Fallback: dead letter queue
    this.deadLetterQueue.push(msg);
  }
}
```

**Evidence-Based Performance**:
- Requires actual load testing to determine throughput
- Retry overhead depends on network conditions (cannot estimate without measurement)
- Priority queue implementation affects latency distribution

### 4. File-Based Communication Protocol

**Purpose**: Simple, auditable communication via JSON files on shared filesystem. Useful for asynchronous coordination without network dependencies.

**Implementation Location**: `/home/alton/agent-community-game/agents/improvement-coordination/communication-protocol.md`

**Channel Structure**:

```
communication/
├── instructions/       # Tasks assigned to agents
│   ├── task-001.json
│   └── task-002.json
├── progress/          # Status updates during execution
│   ├── task-001-progress-25.json
│   └── task-001-progress-50.json
└── completions/       # Final results
    └── task-001-complete.json
```

**Message Format**:

```json
{
  "messageId": "task-001",
  "type": "TASK",
  "timestamp": "2024-06-16T10:00:00Z",
  "from": "audit-agent",
  "to": "implementation-agent",
  "priority": "HIGH",
  "workflow": {
    "state": "ASSIGNED",
    "taskId": "task-001",
    "description": "Implement user authentication",
    "requirements": ["JWT tokens", "Password hashing"],
    "dependencies": [],
    "estimatedEffort": "2 hours"
  },
  "validation": {
    "preImplementation": ["Design review", "Security audit"],
    "duringImplementation": ["Code review at 50%"],
    "postImplementation": ["Integration tests", "Security scan"]
  }
}
```

**Progress Updates**:
- Required at 25%, 50%, 75% completion
- Must include evidence of progress (files changed, tests passing)
- Status: Created → Assigned → In Progress → Testing → Completed → Archived

**Workflow States**:
1. **Created**: Task file written to `instructions/`
2. **Assigned**: Agent acknowledges by writing to `progress/`
3. **In Progress**: Updates at milestones
4. **Testing**: Validation phase begins
5. **Completed**: Final result in `completions/`
6. **Archived**: Moved to historical record

**Polling vs Watching**:
- Simple: Poll directories every N seconds
- Efficient: Use filesystem watchers (inotify on Linux)
- Hybrid: Watch for new files, poll for updates

**Evidence-Based Performance**:
- File I/O latency varies by filesystem (cannot claim specific times)
- Polling interval affects responsiveness (tradeoff: latency vs CPU)
- Not suitable for high-frequency communication (measurement needed for threshold)

### 5. Shared Data Pool Management

**Purpose**: Central storage for data shared between agents with access tracking, citations, and metadata.

**Implementation Location**: `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/inter-agent-coordinator.ts`

**Data Structure**:

```typescript
interface DataPool {
  entries: Map<string, DataEntry>;
  accessLog: AccessRecord[];
}

interface DataEntry {
  key: string;
  value: any;
  type: DataType;                       // 'string' | 'object' | 'array' | 'number'
  metadata: {
    sourceAgent: string;                // Who created it
    timestamp: Date;                    // When created
    citations: string[];                // Evidence sources
    accessedBy: string[];               // Audit trail
    version: number;                    // For conflict detection
    tags: string[];                     // Searchability
  };
}

interface AccessRecord {
  agentId: string;
  key: string;
  operation: 'READ' | 'WRITE' | 'DELETE';
  timestamp: Date;
}
```

**Operations**:

```typescript
class SharedDataPool {
  // Write data with metadata
  set(key: string, value: any, metadata: {
    sourceAgent: string,
    citations?: string[],
    tags?: string[]
  }): void {
    this.entries.set(key, {
      key,
      value,
      metadata: {
        ...metadata,
        timestamp: new Date(),
        accessedBy: [metadata.sourceAgent],
        version: 1
      }
    });
    this.logAccess(metadata.sourceAgent, key, 'WRITE');
  }

  // Read with access tracking
  get(key: string, requestingAgent: string): any {
    const entry = this.entries.get(key);
    if (entry) {
      entry.metadata.accessedBy.push(requestingAgent);
      this.logAccess(requestingAgent, key, 'READ');
      return entry.value;
    }
    return undefined;
  }

  // Search by tags
  findByTag(tag: string): DataEntry[] {
    return Array.from(this.entries.values())
      .filter(entry => entry.metadata.tags.includes(tag));
  }

  // Get citation graph
  getCitationGraph(): Map<string, string[]> {
    const graph = new Map();
    for (const [key, entry] of this.entries) {
      graph.set(key, entry.metadata.citations);
    }
    return graph;
  }
}
```

**Access Patterns**:

1. **Write-Once, Read-Many**: Research findings shared with multiple agents
2. **Iterative Refinement**: Agents update entries with new versions
3. **Citation Chaining**: Agents cite previous findings in new entries
4. **Tag-Based Discovery**: Find related data by semantic tags

**Conflict Resolution**:
- Version numbers detect concurrent writes
- Last-Write-Wins (LWW) default strategy
- Custom merge functions for CRDTs
- Conflict notification to source agents

**Memory Management**:
- TTL (time to live) for automatic cleanup
- Size limits with LRU eviction
- Compression for large entries
- Offload to disk for historical data

**Evidence-Based Performance**:
- Memory usage scales with entry count (requires measurement)
- Access log growth rate depends on read frequency
- Compression ratio varies by data type (cannot estimate without testing)

### 6. Quality Gates and Validation

**Purpose**: Automated checkpoints to ensure agent outputs meet quality standards before proceeding.

**Implementation Location**: `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/enhanced-orchestrator.ts`

**Gate Types**:

```typescript
interface QualityGate {
  name: string;
  type: 'CITATION_CHECK' | 'PEER_REVIEW' | 'FORMAT_VALIDATION' | 'CONFIDENCE_THRESHOLD' | 'CUSTOM';
  criteria: GateCriteria;
  blocking: boolean;                    // Fail task if gate fails
  enforceFor: string[];                 // Agent IDs to enforce
}

interface GateCriteria {
  // Citation requirements
  minCitations?: number;                // e.g., 3 sources minimum
  citationTypes?: string[];             // e.g., ['pubmed', 'arxiv']

  // Peer review
  minReviewers?: number;                // e.g., 2 agents must review
  reviewerCapabilities?: string[];      // Required reviewer skills

  // Format validation
  schema?: JSONSchema;                  // Expected output structure
  requiredFields?: string[];            // Must-have fields

  // Confidence scoring
  minConfidence?: number;               // 0.0-1.0 threshold

  // Custom validation
  validationFunction?: (output: any) => ValidationResult;
}
```

**Implementation**:

```typescript
class QualityGateSystem {
  async evaluateGate(gate: QualityGate, agentOutput: any): Promise<GateResult> {
    switch (gate.type) {
      case 'CITATION_CHECK':
        return this.checkCitations(gate.criteria, agentOutput);

      case 'PEER_REVIEW':
        return await this.conductPeerReview(gate.criteria, agentOutput);

      case 'FORMAT_VALIDATION':
        return this.validateFormat(gate.criteria, agentOutput);

      case 'CONFIDENCE_THRESHOLD':
        return this.checkConfidence(gate.criteria, agentOutput);

      case 'CUSTOM':
        return gate.criteria.validationFunction(agentOutput);
    }
  }

  private checkCitations(criteria: GateCriteria, output: any): GateResult {
    const citations = output.citations || [];

    // Count check
    if (criteria.minCitations && citations.length < criteria.minCitations) {
      return {
        passed: false,
        reason: `Insufficient citations: ${citations.length} < ${criteria.minCitations}`,
        suggestedAction: 'Add more sources to support claims'
      };
    }

    // Type check
    if (criteria.citationTypes) {
      const hasRequiredTypes = criteria.citationTypes.every(type =>
        citations.some(c => c.startsWith(type))
      );
      if (!hasRequiredTypes) {
        return {
          passed: false,
          reason: `Missing required citation types: ${criteria.citationTypes.join(', ')}`,
          suggestedAction: 'Include citations from specified sources'
        };
      }
    }

    return { passed: true };
  }

  private async conductPeerReview(criteria: GateCriteria, output: any): Promise<GateResult> {
    const reviewers = this.selectReviewers(criteria.reviewerCapabilities, criteria.minReviewers);
    const reviews = await Promise.all(
      reviewers.map(r => r.review(output))
    );

    const approvals = reviews.filter(r => r.approved).length;
    const required = criteria.minReviewers || 1;

    return {
      passed: approvals >= required,
      reason: `Peer review: ${approvals}/${reviewers.length} approved (need ${required})`,
      details: reviews
    };
  }
}
```

**Common Gate Configurations**:

1. **Research Quality**:
   - Min 3 citations
   - At least 1 peer-reviewed source
   - Confidence ≥ 0.7

2. **Code Review**:
   - Passes linting
   - Test coverage ≥ 80%
   - 1 peer reviewer approval

3. **Synthesis Validation**:
   - All source data cited
   - No fabricated metrics
   - Contradictions identified

**Gate Execution Flow**:
```text
Agent Completes Task
    ↓
For Each Quality Gate:
    ↓
  Evaluate Criteria
    ↓
  Blocking? ← No → Record Warning, Continue
    ↓ Yes
  Passed? ← No → Reject Output, Request Revision
    ↓ Yes
All Gates Passed
    ↓
Accept Output
```

**Evidence-Based Performance**:
- Gate evaluation time varies by complexity (measurement needed)
- Peer review latency depends on reviewer availability
- Cannot estimate without actual gate execution data

### 7. Assistance Request and Routing

**Purpose**: Dynamic routing of assistance requests to the most capable agent.

**Implementation**:

```typescript
interface AssistanceRequest {
  requestId: string;
  fromAgent: string;
  type: string;                         // 'web-search', 'code-review', 'synthesis', etc.
  context: any;                         // Request-specific data
  requiredCapabilities?: string[];      // Must-have skills
  urgency: 'BLOCKING' | 'HIGH' | 'NORMAL';
  timeout?: number;
}

class AssistanceRouter {
  private agentRegistry: Map<string, AgentCapabilities>;

  findBestAssistant(request: AssistanceRequest): string | null {
    // 1. Filter by required capabilities
    let candidates = Array.from(this.agentRegistry.entries())
      .filter(([id, caps]) =>
        !request.requiredCapabilities ||
        request.requiredCapabilities.every(req => caps.capabilities.includes(req))
      );

    // 2. Filter by availability
    candidates = candidates.filter(([id, caps]) => caps.status === 'AVAILABLE');

    // 3. Score by relevance
    candidates = candidates.map(([id, caps]) => ({
      id,
      score: this.scoreRelevance(request, caps)
    }));

    // 4. Select highest scoring
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0]?.id || null;
  }

  private scoreRelevance(request: AssistanceRequest, caps: AgentCapabilities): number {
    let score = 0;

    // Exact capability match
    if (caps.capabilities.includes(request.type)) {
      score += 10;
    }

    // Historical success
    const history = caps.assistanceHistory[request.type] || { success: 0, total: 0 };
    if (history.total > 0) {
      score += (history.success / history.total) * 5;  // Up to +5 for perfect record
    }

    // Current load (prefer less busy agents)
    score -= caps.activeTaskCount * 0.5;

    // Specialization bonus
    if (caps.specializations.includes(request.type)) {
      score += 3;
    }

    return score;
  }
}
```

**Assistance Flow**:
```text
Agent Needs Help
    ↓
Create AssistanceRequest
    ↓
Router Finds Best Assistant
    ↓
Send Request to Assistant
    ↓
Assistant Evaluates (canAssist?)
    ↓ Yes
Execute Assistance
    ↓
Return AssistanceResponse
    ↓
Requesting Agent Continues
```

**Fallback Strategies**:
- No capable agent: Return error to requester
- Timeout: Cancel request, log failure
- Assistance fails: Retry with different assistant or escalate to orchestrator

## Communication Patterns from Production Systems

### Pattern 1: Hierarchical Orchestration

**From**: SKG Agent Prototype implementations

```text
EnhancedOrchestrator
├── Agent Registration & Discovery
├── Task Distribution
├── InterAgentCoordinator
│   ├── Message Queue (Priority)
│   ├── Shared Data Pool
│   └── Request/Response Router
├── Quality Gate System
└── Result Aggregation
```

**When to Use**:
- Clear hierarchy (orchestrator → workers)
- Centralized coordination needed
- Quality gates required
- Shared data management

**Tradeoffs**:
- Single point of coordination (not failure)
- Simpler than P2P for small teams
- Bottleneck for very large scale (measurement needed)

### Pattern 2: File-Based Async Communication

**From**: Agent Community Game

```text
Audit Agent                Implementation Agent
    ↓                              ↓
Write: instructions/task.json    Poll: instructions/
    ↓                              ↓
Poll: completions/              Write: progress/update.json
    ↓                              ↓
Read: completions/task.json     Write: completions/task.json
```

**When to Use**:
- Asynchronous workflows
- Need audit trail
- Simple infrastructure (no network dependencies)
- Long-running tasks

**Tradeoffs**:
- Higher latency than direct messaging (measurement needed)
- Filesystem I/O limits throughput
- Excellent for debugging (human-readable files)

### Pattern 3: MCP Hub-and-Spoke

**From**: MCP Protocol implementations

```text
        MCPHub (Router)
       /  |  |  |  \
      /   |  |  |   \
   A1    A2 A3 A4   A5
```

**When to Use**:
- Multiple agent types
- Topic-based subscriptions
- Need delivery guarantees
- Network-based communication

**Tradeoffs**:
- Hub is potential bottleneck
- Retry logic adds complexity
- Message ordering guarantees require careful implementation

## Debugging Agent Communication

### 1. Message Tracing

```typescript
class MessageTracer {
  private traces: Map<string, MessageTrace[]>;

  trace(message: MCPMessage, event: TraceEvent): void {
    const trace = {
      messageId: message.id,
      timestamp: new Date(),
      event: event.type,  // 'SENT' | 'RECEIVED' | 'ROUTED' | 'DELIVERED' | 'FAILED'
      agentId: event.agentId,
      details: event.details
    };

    if (!this.traces.has(message.id)) {
      this.traces.set(message.id, []);
    }
    this.traces.get(message.id).push(trace);
  }

  getMessagePath(messageId: string): MessageTrace[] {
    return this.traces.get(messageId) || [];
  }
}

// Usage
tracer.trace(msg, { type: 'SENT', agentId: 'agent-1', details: { to: 'agent-2' } });
tracer.trace(msg, { type: 'ROUTED', agentId: 'hub', details: { route: 'direct' } });
tracer.trace(msg, { type: 'DELIVERED', agentId: 'agent-2', details: { latency: '15ms' } });
```

### 2. Coordination Flow Analysis

**Check**:
- Message delivery success rate
- Average routing latency
- Queue depths (detect backpressure)
- Agent availability and load
- Failed assistance requests

**Metrics to Track**:
```typescript
interface CoordinationMetrics {
  messagesPerSecond: number;
  averageLatency: number;                // End-to-end delivery time
  queueDepths: Map<string, number>;      // Per-agent queue size
  assistanceSuccessRate: number;         // Successful assistance / total requests
  qualityGatePassRate: number;           // Gates passed / total evaluations
}
```

### 3. Common Issues

**Issue**: Messages not delivered
- Check: Agent availability status
- Check: Message routing logic
- Check: Network connectivity (if applicable)
- Check: Message TTL expiration

**Issue**: Slow coordination
- Check: Queue depths (backpressure?)
- Check: Quality gate evaluation time
- Check: Shared data pool size
- Check: Number of concurrent agents

**Issue**: Quality gates failing
- Check: Gate criteria too strict?
- Check: Agent output format
- Check: Citation availability
- Check: Peer reviewer availability

**Issue**: Deadlock (no progress)
- Check: Circular dependencies in coordination plan
- Check: All agents waiting for assistance
- Check: Blocking quality gates with no retry
- Check: Message queue full

## Integration with Other Skills

- **Multi-Agent Orchestration**: Theoretical foundation for communication patterns
- **Evidence-Based Validation**: Apply to performance claims and metrics
- **MCP Server Development**: Protocol-level implementation details
- **Distributed Systems Debugging**: Diagnose coordination failures

## Limitations and Open Questions

**Known Limitations**:
- Throughput claims require load testing (not estimated)
- Latency varies by infrastructure (measurement needed)
- Scalability limits unknown without stress testing
- Optimal quality gate thresholds need empirical tuning

**Requires Measurement**:
- Message throughput for different patterns
- End-to-end latency distributions
- Memory usage scaling with agent count
- File I/O performance for file-based communication
- Quality gate evaluation time

**Language to Avoid**:
- "Guaranteed delivery" (all systems have failure modes)
- "Zero-latency communication" (physics exists)
- "Perfect coordination" (distributed systems have limits)
- "Eliminates all conflicts" (conflicts are inherent to distributed state)

**Language to Use**:
- "Delivery with retry and timeout"
- "Measured latency: requires testing"
- "Best-effort coordination with quality gates"
- "Conflict detection with configurable resolution"

## References

> **Note**: Implementation paths below reference the original SKG Agent Prototype development environment.
> These paths document the source architecture - see `templates/` for portable examples.

Implementation files:
- `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/inter-agent-coordinator.ts`
- `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/communicative-agent.ts`
- `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/enhanced-orchestrator.ts`
- `/home/alton/SKG Agent Prototype 2/docs/communication-protocols.md`
- `/home/alton/agent-community-game/agents/improvement-coordination/communication-protocol.md`
- `/home/alton/mcp_communication_protocol.js`

Design documents:
- `/home/alton/SKG Agent Prototype 2/attentional-communication-protocol.json`
- `/home/alton/AGENTIC_HARNESS_ARCHITECTURE.md`
- `/home/alton/MCP_ORCHESTRATOR_DESIGN.md`

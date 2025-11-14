# Communication Patterns for Multi-Agent Systems

Detailed communication patterns extracted from actual implementations in SKG Agent Prototype 2.

## A2A (Agent-to-Agent) Protocol

### Overview

The A2A Protocol is a comprehensive peer-to-peer collaboration framework enabling autonomous agents to work together on complex tasks requiring reasoning, planning, negotiation, and consensus building.

**Source**: `/home/alton/SKG Agent Prototype 2/src/core/protocols/A2AProtocol.ts` (4,200+ lines)

### Core Capabilities

**Stateful Multi-Turn Interactions**:
- Persistent session management across agent conversations
- Context preservation between messages
- Session lifecycle: creation → active → closing → closed

**Complex Task Management**:
- Automatic task decomposition into subtasks
- Dynamic task allocation based on agent capabilities
- Progress tracking and milestone reporting

**Reasoning and Planning**:
- Collaborative problem-solving sessions
- Shared reasoning state across agents
- Planning coordination with dependency management

**Negotiation and Consensus**:
- Resource allocation negotiation
- Priority-based bidding mechanisms
- Consensus building with configurable thresholds

### Session Types

Eight distinct session types for different collaboration patterns:

1. **TASK_COLLABORATION**: Coordinated work on shared tasks
2. **NEGOTIATION**: Resource allocation and priority agreement
3. **PLANNING**: Strategic planning and coordination
4. **PROBLEM_SOLVING**: Collaborative problem analysis
5. **CONSENSUS_BUILDING**: Agreement on decisions
6. **KNOWLEDGE_SHARING**: Information exchange
7. **EVALUATION**: Collaborative assessment
8. **MONITORING**: Shared monitoring and alerting

### Message Classes

Eight message classes for structured communication:

1. **TASK_MANAGEMENT**: Task assignment, progress, completion
2. **NEGOTIATION**: Proposals, counteroffers, agreements
3. **REASONING**: Hypotheses, evidence, conclusions
4. **PLANNING**: Goals, plans, revisions
5. **CONSENSUS**: Votes, proposals, decisions
6. **KNOWLEDGE**: Facts, queries, updates
7. **COORDINATION**: Synchronization, checkpoints
8. **METADATA**: Session control, heartbeats

### Measured Performance Characteristics

**Throughput** (messages per second):

| Session Size | Throughput | Latency | CPU Usage |
|--------------|-----------|---------|-----------|
| 2-3 agents | 500-1000 msg/s | 5-20ms | 15-25% |
| 4-6 agents | 200-500 msg/s | 20-50ms | 25-40% |
| 7-10 agents | 100-200 msg/s | 50-100ms | 40-60% |

**Scaling Analysis**:
- Linear degradation up to 6 participants
- Quadratic overhead beyond 8 participants (O(n²) state sync)
- Byzantine tolerance maintained up to 1/3 participants
- Memory usage: ~1MB per session + message history

### Failure Mode Analysis

| Failure Type | Recovery Time | Data Loss | Prevention Strategy |
|--------------|---------------|-----------|---------------------|
| Network Partition | 2-10 seconds | No | Circuit breakers, graceful degradation |
| Byzantine Agent | 1-5 seconds | No | Trust scoring, isolation |
| Consensus Timeout | 30-60 seconds | No | Adaptive timeouts, retry mechanisms |
| Resource Exhaustion | Variable | Possible | Priority queues, resource limits |

### Security Features

**Cryptographic Message Signing**:
- RSA-2048 signatures for message authenticity
- Prevents message forgery and tampering
- Enables non-repudiation

**Proof-of-Work**:
- Applied to critical consensus decisions
- Prevents Sybil attacks
- Configurable difficulty

**Trust Scoring**:
- Historical behavior-based reputation
- Trust decay for inactivity
- Isolation threshold for low-trust agents

**Replay Attack Prevention**:
- Timestamp validation with configurable skew tolerance
- Sequence number tracking per agent pair
- Nonce-based challenge-response

### Configuration Options

```typescript
interface A2AProtocolConfig {
  maxSessions: number;              // Default: 100
  sessionTimeout: number;           // Default: 300000 (5 minutes)
  consensusTimeout: number;         // Default: 60000 (1 minute)
  trustThreshold: number;           // Default: 0.6
  maxByzantineRatio: number;        // Default: 0.33 (1/3)
  performanceMonitoring: boolean;   // Default: true
  signatureRequired: boolean;       // Default: true
  encryptionEnabled: boolean;       // Default: true
}
```

### Usage Example

```typescript
import { A2AProtocol, SessionType, A2AMessageClass } from './core/protocols';

// Create protocol instance
const protocol = new A2AProtocol(messagePool);
await protocol.initialize();

// Create collaboration session
const sessionId = await protocol.createSession(
  ['agent1', 'agent2', 'agent3'],
  SessionType.TASK_COLLABORATION,
  {
    objective: 'Solve distributed system design problem',
    consensusThreshold: 0.67  // 2/3 majority
  }
);

// Send task assignment
await protocol.sendSessionMessage(
  sessionId,
  'agent1',          // from
  'agent2',          // to
  A2AMessageClass.TASK_MANAGEMENT,
  {
    action: 'assign_task',
    taskId: 'task-1',
    description: 'Analyze consensus algorithms',
    deadline: Date.now() + 3600000
  }
);

// Listen for responses
protocol.on('session:message', (message) => {
  console.log(`Message from ${message.from}: ${message.payload}`);
});

// Achieve consensus
const consensusResult = await protocol.reachConsensus(
  sessionId,
  'agent1',
  {
    proposal: 'Use Raft consensus',
    requiredVotes: 2
  }
);
```

### Limitations

**Documented Constraints**:

1. **Session Limit**: Maximum 100 concurrent sessions
   - Reason: Memory and coordination overhead
   - Mitigation: Session pooling, automatic cleanup

2. **Byzantine Tolerance**: Limited to 1/3 of participants
   - Reason: Mathematical constraint of BFT algorithms
   - Mitigation: Trust scoring, reputation systems

3. **Consensus Scaling**: 2/3 majority may not scale for large groups
   - Reason: Quadratic message overhead
   - Mitigation: Hierarchical consensus, sharding

4. **Encryption Overhead**: 10-15% latency increase
   - Reason: Cryptographic operations
   - Mitigation: Hardware acceleration, selective encryption

5. **State Sync Overhead**: Quadratic growth with participants
   - Reason: Full state propagation
   - Mitigation: Delta-state synchronization, checkpointing

6. **Network Partitions**: Limited to temporary disconnections
   - Reason: Cannot distinguish partition from failure
   - Mitigation: Partition detection, conflict resolution

7. **Computational Cost**: Proof-of-work consensus is resource-intensive
   - Reason: Security vs performance tradeoff
   - Mitigation: Adaptive difficulty, alternative consensus

## Semantic Routing

### Overview

Vector embedding-based routing that understands message intent and routes based on semantic similarity rather than simple pattern matching.

**Source**: `/home/alton/SKG Agent Prototype 2/src/core/routing/SemanticRouter.ts`

### Core Capabilities

**Vector Embedding-Based Similarity**:
- Converts message intent to vector embeddings
- Calculates cosine similarity between vectors
- Routes based on semantic understanding

**Semantic Cache**:
- Similarity-based cache lookups (threshold: 0.85 default)
- Finds cached entries without exact match
- Tracks cache hit ratios and performance

**Content-Aware Routing**:
- Understands message domain and intent
- Routes to agents with matching capabilities
- Combines capability matching with semantic scoring

### Measured Performance Improvements

Compared to baseline (random/round-robin routing):

| Metric | Baseline | Semantic Routing | Improvement |
|--------|----------|------------------|-------------|
| Latency | ~5000ms | <200ms | >90% reduction |
| Cache Hit Ratio | N/A | >60% | Significant overhead reduction |
| Routing Accuracy | ~50% | >85% | >35% improvement |
| Embedding Overhead | N/A | <50ms | Acceptable overhead |

### Routing Strategy

**Route Scoring Algorithm**:
```typescript
// Combined score: traditional capability matching + semantic similarity
const combinedScore = (routeScore * 0.6) + (semanticScore * 0.4);
```

**Route Selection Process**:
1. Extract intent from message
2. Check semantic cache for similar intents (>0.85 similarity)
3. If cache miss, compute embedding and calculate similarities
4. Score potential routes using combined metric
5. Select top-scoring routes
6. Cache result for future lookups

### Configuration

```json
{
  "version": "1.0.0",
  "routing": {
    "strategy": "semantic_intent_based",
    "fallback_strategy": "capability_matching",
    "similarityThreshold": 0.85,
    "cacheSize": 1000,
    "cacheTTL": 1800000  // 30 minutes
  },
  "compression": {
    "enabled": true,
    "algorithm": "semantic_compression",
    "levels": {
      "low": { "threshold": 0.3, "compression_ratio": 0.7 },
      "medium": { "threshold": 0.6, "compression_ratio": 0.5 },
      "high": { "threshold": 0.8, "compression_ratio": 0.3 }
    }
  },
  "load_balancing": {
    "enabled": true,
    "algorithm": "weighted_round_robin",
    "health_check_interval": 30000
  }
}
```

### Domain Configuration

Define semantic domains for better routing:

```json
{
  "semantic_domains": {
    "research": {
      "intent_patterns": [
        "search academic literature",
        "find research papers",
        "literature review",
        "analyze publications"
      ],
      "compression_level": "medium",
      "priority_routes": [
        {
          "agent_pattern": "research.*",
          "weight": 0.9,
          "capabilities": ["search", "analyze", "synthesize"]
        }
      ]
    },
    "data_processing": {
      "intent_patterns": [
        "process dataset",
        "transform data",
        "clean data",
        "aggregate statistics"
      ],
      "compression_level": "high",
      "priority_routes": [
        {
          "agent_pattern": "data.*",
          "weight": 0.95,
          "capabilities": ["transform", "aggregate", "validate"]
        }
      ]
    }
  }
}
```

### Usage Example

```typescript
import { SemanticRouter } from './src/core/routing/SemanticRouter';

// Initialize router
const router = new SemanticRouter(config, routingTableConfig);

// Route message with semantic understanding
const message: MCPMessage = {
  id: 'msg-123',
  type: MessageType.TASK_ASSIGNMENT,
  payload: {
    type: 'research',
    description: 'search academic literature for machine learning papers on consensus algorithms'
  },
  // ... other properties
};

const result = await router.routeMessage(message);

// Check routing results
console.log('Selected routes:', result.routes);
console.log('Routing latency:', result.metrics.latency, 'ms');
console.log('Cache hit:', result.metrics.cacheHit);
console.log('Semantic similarity:', result.metrics.semanticScore);
```

### Monitoring Metrics

```typescript
// Get routing performance metrics
const metrics = router.getRoutingMetrics();
console.log({
  averageLatency: metrics.averageLatency,
  cacheHitRatio: metrics.cacheHitRatio,
  routingAccuracy: metrics.routingAccuracy,
  totalRequests: metrics.totalRequests,
  failedRoutes: metrics.failedRoutes
});

// Get embedding computation metrics
const embeddingMetrics = router.getEmbeddingMetrics();
console.log({
  computationTime: embeddingMetrics.computationTime,
  cacheHitRatio: embeddingMetrics.cacheHitRatio,
  averageSimilarity: embeddingMetrics.averageSimilarity,
  totalComputations: embeddingMetrics.totalComputations
});
```

### Limitations

**Current Implementation**:
- Uses hash-based embeddings for demonstration (production should use real models)
- Similarity threshold is static (could be adaptive)
- Single-modal embeddings only (no multi-modal support)

**Recommendations for Production**:
1. Replace with sentence transformers (e.g., all-MiniLM-L6-v2)
2. Use OpenAI embeddings API or custom domain models
3. Implement adaptive similarity thresholds
4. Add distributed caching (Redis) for multi-instance deployments
5. Support multi-modal embeddings for different content types

## Message Routing Patterns

### 1. Direct Routing

**Pattern**: Point-to-point communication between specific agents

**Characteristics**:
- Lowest latency
- No coordination overhead
- Tight coupling between sender and receiver

**When to Use**:
- Known target agent
- Low-level coordination
- Performance-critical paths

**Implementation**:
```typescript
await messagePool.sendDirect(fromAgent, toAgent, message);
```

### 2. Broadcast Routing

**Pattern**: Message sent to all agents in system/domain

**Characteristics**:
- Simple implementation
- High bandwidth usage (O(n) messages)
- All agents receive regardless of interest

**When to Use**:
- System-wide announcements
- Small agent populations
- Critical updates that must reach everyone

**Implementation**:
```typescript
await messagePool.broadcast(fromAgent, domain, message);
```

### 3. Publish-Subscribe Routing

**Pattern**: Topic-based message distribution

**Characteristics**:
- Decouples publishers from subscribers
- Agents subscribe to topics of interest
- Scalable to large populations

**When to Use**:
- Event distribution
- Loosely coupled systems
- Multiple consumers for same message

**Implementation**:
```typescript
// Subscribe to topic
await messagePool.subscribe(agent, 'consensus-decisions');

// Publish to topic
await messagePool.publish('consensus-decisions', message);
```

### 4. Semantic Intent-Based Routing

**Pattern**: Route based on understanding of message intent

**Characteristics**:
- Content-aware routing
- High accuracy (>85%)
- Moderate overhead (<200ms)

**When to Use**:
- Complex task allocation
- Capability-based routing
- Intent understanding critical

**Implementation**:
```typescript
const result = await semanticRouter.routeMessage(message);
// Routes to agents with relevant capabilities
```

## Load Balancing Patterns

Covered in detail in `reference/load-balancing.md`, but key patterns:

1. **Weighted Round-Robin**: Predictable distribution, dynamic weights
2. **Least Connections**: Routes to least loaded agent
3. **Response-Time Based**: Routes to fastest responding agent
4. **Capability-Based**: Routes to agents with required capabilities

## Circuit Breaker Pattern

### Purpose

Prevent cascade failures when agents become unresponsive or overloaded.

### Three States

1. **CLOSED**: Normal operation, requests pass through
2. **OPEN**: Failures exceeded threshold, requests fail fast
3. **HALF_OPEN**: Testing if agent recovered, limited requests

### Configuration

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;      // Default: 5 failures
  recoveryTimeout: number;       // Default: 60000 (1 minute)
  halfOpenRequests: number;      // Default: 3
  monitoringWindow: number;      // Default: 60000 (1 minute)
}
```

### Usage

```typescript
import { CircuitBreaker } from './src/core/routing/CircuitBreaker';

const breaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 60000
});

// Protected call
try {
  const result = await breaker.call(async () => {
    return await sendMessageToAgent(agent, message);
  });
} catch (error) {
  if (error.message === 'Circuit breaker is OPEN') {
    // Route to alternative agent
  }
}

// Monitor circuit state
breaker.on('state:change', (newState) => {
  console.log(`Circuit breaker now ${newState}`);
});
```

### Integration with Load Balancer

```typescript
// Load balancer automatically uses circuit breaker
const loadBalancer = new IntelligentLoadBalancer({
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 60000
  }
});

// Failed requests automatically trip circuit breaker
// Agents with open circuits excluded from routing
```

## Performance Comparison

| Pattern | Latency | Throughput | Scalability | Coupling |
|---------|---------|------------|-------------|----------|
| Direct | Lowest (~5ms) | Highest | Poor | Tight |
| Broadcast | Low (~10ms) | Low (O(n)) | Poor | Loose |
| Pub-Sub | Medium (~20ms) | Medium | Good | Very Loose |
| Semantic | Higher (~200ms) | Medium | Good | Loose |
| Load Balanced | Medium (~50ms) | High | Excellent | Loose |

## Evidence Sources

All performance numbers and patterns extracted from:
- `/home/alton/SKG Agent Prototype 2/src/core/protocols/A2AProtocol.ts`
- `/home/alton/SKG Agent Prototype 2/src/core/routing/SemanticRouter.ts`
- `/home/alton/SKG Agent Prototype 2/src/core/routing/CircuitBreaker.ts`
- `/home/alton/SKG Agent Prototype 2/A2A_PROTOCOL_SUMMARY.md`
- `/home/alton/SKG Agent Prototype 2/SEMANTIC_ROUTING_IMPLEMENTATION.md`

All measurements based on actual test results, not theoretical estimates.

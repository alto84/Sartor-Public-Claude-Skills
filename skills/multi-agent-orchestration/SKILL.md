---
name: Multi-Agent Orchestration
description: Guides analysis and design of multi-agent systems including consensus mechanisms, distributed state management, agent coordination patterns, and conflict resolution. Use when analyzing agent architectures, debugging coordination issues, or designing multi-agent systems.
allowed-tools: Read, Grep, Glob, Bash
---

# Multi-Agent Orchestration Skill

## Overview

This skill provides comprehensive guidance for analyzing, designing, and debugging multi-agent coordination systems. It draws from actual implementations in the SKG Agent Prototype 2, focusing on proven patterns for consensus, communication, state management, and conflict resolution in distributed agent systems.

## When to Use This Skill

Use this skill when you need to:

1. **Analyze existing multi-agent architectures** - Understand coordination patterns, identify bottlenecks
2. **Design new multi-agent systems** - Select appropriate consensus mechanisms, communication patterns
3. **Debug coordination issues** - Diagnose split-brain scenarios, message ordering problems, state conflicts
4. **Evaluate consensus mechanisms** - Choose between Raft, BFT, or other approaches based on requirements
5. **Optimize agent communication** - Improve message routing, reduce latency, prevent cascading failures
6. **Implement distributed state** - Apply CRDTs, vector clocks, conflict detection patterns

## Core Orchestration Patterns

### 1. Consensus Mechanisms

Multi-agent systems require consensus for coordinated decision-making. Choose based on failure model:

**Raft Consensus** - For crash-fault tolerance (non-Byzantine scenarios):
- **When to use**: Trusted agent environments, configuration management, leader election
- **Characteristics**: Leader-based, strong consistency, ~150ms election time
- **Performance**: 100-1000 commands/second, scales well for 3-7 nodes
- **Failure model**: Tolerates up to f failures in 2f+1 nodes
- **Limitations**: Requires majority (2f+1) for progress, vulnerable to Byzantine faults

**BFT Consensus** - For Byzantine fault tolerance (untrusted agents):
- **When to use**: Adversarial environments, financial systems, security-critical coordination
- **Characteristics**: Three-phase commit (pre-prepare, prepare, commit), cryptographic signatures
- **Performance**: 10-50 requests/second, degrades with O(n²) message complexity
- **Failure model**: Tolerates up to f Byzantine nodes in 3f+1 nodes
- **Limitations**: High message overhead, computational cost, scales poorly beyond 20-30 nodes

**Decision Matrix**:
```
Crash faults only + High throughput needed → Raft
Byzantine faults possible + Security critical → BFT
Very large networks (>30 nodes) + Partial consistency acceptable → Gossip protocols
Hierarchical structure + Scalability → Hierarchical Consensus
```

### 2. Communication Patterns

**A2A (Agent-to-Agent) Protocol**:
- Peer-to-peer collaboration framework
- Stateful multi-turn interactions with session management
- Message throughput: 500-1000 msg/s for small sessions (2-3 agents)
- Scaling characteristics: Linear degradation up to 6 participants, quadratic overhead beyond 8
- Use for: Complex task management, reasoning, planning, negotiation between agents

**Semantic Routing**:
- Vector embedding-based similarity calculation
- Content-aware message routing vs simple pattern matching
- Performance improvement: >90% latency reduction vs baseline (random/round-robin)
- Cache hit ratio: >60% with similarity threshold 0.85
- Use for: Intent-based routing, capability matching, content-aware load distribution

**Message Routing Patterns**:
1. **Direct Routing**: Point-to-point, lowest latency, no flexibility
2. **Broadcast**: All agents receive, simple but high bandwidth
3. **Publish-Subscribe**: Topic-based, decouples senders/receivers
4. **Semantic Intent-Based**: Understands message meaning, routes to capable agents

### 3. Distributed State Management

**CRDTs (Conflict-free Replicated Data Types)**:
- **State-based CRDTs**: G-Counter, PN-Counter, LWW-Register
  - Bandwidth reduction: 50-90% via delta-state optimization
  - Convergence time: Sub-second for up to 64 replicas
  - Merge complexity: O(n) linear scaling
  - Use for: Counters, registers, eventually consistent state

- **Operation-based CRDTs**: Require causal delivery
  - Vector clock integration for ordering
  - Operation logging with dependency tracking
  - Use for: Collaborative editing, distributed logs

**Vector Clocks**:
- Lamport timestamps for causal ordering
- Memory overhead: O(n) where n = number of nodes (~50-200 bytes per node)
- Causality detection: >95% accuracy under normal conditions
- Use for: Event ordering, detecting concurrent operations, distributed debugging

**Conflict Detection**:
- Write-write conflicts: Temporal analysis with configurable time windows
- Read-write dependencies: Dependency chain tracking with invalidation cascade
- Semantic conflicts: Content similarity analysis (Jaccard similarity)
- Detection latency: P50 <10ms, P95 <50ms, P99 <100ms
- Memory usage: <1MB/hour growth rate with automatic cleanup

### 4. Load Balancing and Routing

**Load Balancing Algorithms**:

1. **Weighted Round-Robin**:
   - Dynamic weight adjustment based on performance
   - Predictable distribution, low overhead
   - Limitation: May not reflect real-time capacity changes

2. **Least Connections**:
   - Routes to agent with fewest active connections
   - Dynamic adaptation to load
   - Limitation: Connection count ≠ actual computational load

3. **Response-Time Based**:
   - Routes to fastest responding agent
   - Tracks P50, P95, P99 latencies
   - Limitation: Requires warm-up period for accurate metrics

**Circuit Breaker Pattern**:
- Three states: CLOSED → OPEN → HALF_OPEN
- Prevents cascade failures to struggling agents
- Configurable failure thresholds (e.g., 5 failures → OPEN)
- Recovery timeout: Typically 30-60 seconds
- Failover speed: <5s average detection and response

### 5. Coordination Protocols (from CLAUDE.md)

**Persona Adoption Requirements**:
- Each agent must adopt assigned specialized role completely
- Stay within designated domain expertise
- Bring unique viewpoint based on persona
- Avoid converging to generic responses

**Collaborative Framework**:
- Shared objective: All agents work toward common goal
- Complementary analysis: Each contributes specialized perspective
- Cross-validation: Agents verify findings with evidence
- Synthesis protocol: Combine insights without fabricating consensus metrics

**Anti-Fabrication in Teams**:
- No metric averaging: Don't create fake consensus scores
- Preserve disagreement: Report differing assessments honestly
- Evidence multiplication: More agents doesn't mean stronger claims
- Independent validation: Each agent must verify claims independently

## Common Failure Modes

### 1. Split-Brain Scenarios
**Symptoms**: Multiple leaders elected, conflicting decisions
**Causes**: Network partition, asymmetric failures
**Detection**: Raft: ~150ms election time, BFT: 2-5 seconds
**Resolution**:
- Raft: Majority partition continues, minority blocks
- BFT: Requires 2f+1 agreement, automatically rejects minority
**Prevention**: Quorum-based decisions, network partition detection

### 2. Message Ordering Problems
**Symptoms**: Causality violations, operations applied out of order
**Causes**: Network delays, concurrent operations, missing vector clock
**Detection**: Vector clock comparison, dependency tracking
**Resolution**:
- Use causal delivery guarantees (operation-based CRDTs)
- Implement message buffering until dependencies satisfied
- Apply vector clocks for happens-before relationships

### 3. State Synchronization Bugs
**Symptoms**: Replicas diverge, inconsistent state
**Causes**: Merge function errors, non-commutative operations, Byzantine nodes
**Detection**: State hash comparison, formal property testing
**Resolution**:
- Verify CRDT properties (commutative, associative, idempotent)
- Use delta-state synchronization to reduce bandwidth
- Implement checkpointing for recovery

### 4. Cascading Failures
**Symptoms**: Single agent failure triggers widespread outages
**Causes**: No circuit breakers, unbounded retries, resource exhaustion
**Detection**: Health monitoring, circuit breaker metrics
**Resolution**:
- Implement circuit breakers with configurable thresholds
- Use exponential backoff for retries
- Set resource limits (memory, connections, timeouts)

### 5. Deadlock and Livelock
**Symptoms**: System stuck, no progress despite agent activity
**Causes**: Circular dependencies, conflicting priorities, coordination loops
**Detection**: Dependency graph cycle detection, progress monitoring
**Resolution**:
- Use dependency ordering (topological sort)
- Implement timeout-based deadlock breaking
- Apply priority-based conflict resolution

### 6. Byzantine Failures
**Symptoms**: Malicious or buggy agents send invalid messages
**Causes**: Software bugs, compromised agents, malicious actors
**Detection**: Cryptographic signature verification, behavior anomaly detection
**Resolution**:
- Use BFT consensus (tolerates f failures in 3f+1 nodes)
- Implement trust scoring based on historical behavior
- Apply proof-of-work for critical decisions

## Debugging Strategies

### 1. Analyze Coordination Flow
```bash
# Search for consensus-related code
grep -r "consensus\|raft\|bft" /path/to/codebase

# Find agent communication patterns
grep -r "sendMessage\|routeMessage\|A2A" /path/to/codebase

# Identify state management
grep -r "CRDT\|vectorClock\|merge" /path/to/codebase
```

### 2. Check Performance Metrics
- Leader election time (should be <500ms for Raft)
- Message throughput (baseline: 100-1000 msg/s depending on consensus)
- Convergence time (CRDTs should converge <1s for most cases)
- Circuit breaker states (frequent OPEN states indicate problems)
- Cache hit ratios (semantic routing should achieve >60%)

### 3. Monitor Coordination Health
- Active sessions and participant counts
- Byzantine fault detection rate
- Network partition events
- State synchronization overhead
- Conflict detection rates and types

### 4. Trace Message Flow
- Implement distributed tracing (trace IDs across agents)
- Log vector clocks for causality analysis
- Track message routing decisions
- Monitor queue depths and backpressure

## Architecture Patterns

### Pattern 1: Hierarchical Orchestration
```
Orchestrator (Coordinator)
├── Agent Registry (Discovery)
├── Task Queue (Distribution)
├── Result Aggregator (Synthesis)
└── Health Monitor (Failure Detection)
```
**When to use**: Centralized coordination, clear hierarchy
**Tradeoffs**: Single point of failure, simpler reasoning, potential bottleneck

### Pattern 2: Peer-to-Peer Collaboration
```
Agent A ←→ Agent B
   ↕          ↕
Agent C ←→ Agent D
```
**When to use**: No natural leader, equal agents, Byzantine tolerance needed
**Tradeoffs**: More complex coordination, higher message overhead, better fault tolerance

### Pattern 3: Leader-Based Consensus
```
Leader (Raft/BFT)
├── Follower 1
├── Follower 2
└── Follower 3
```
**When to use**: Strong consistency, total order needed, crash faults only (Raft)
**Tradeoffs**: Simpler than P2P, leader is bottleneck, requires majority for progress

### Pattern 4: Gossip-Based Eventual Consistency
```
Agent A → Agent B → Agent C
   ↓         ↓         ↓
Agent D ← Agent E ← Agent F
```
**When to use**: Very large networks, eventual consistency acceptable
**Tradeoffs**: Scales well, no strong consistency, unpredictable convergence time

## Performance Optimization

### 1. Reduce Message Overhead
- Use delta-state CRDTs (50-90% bandwidth reduction)
- Implement request batching (100+ operations per batch)
- Apply message compression based on domain
- Cache routing decisions (semantic routing: >60% hit rate)

### 2. Optimize Consensus
- Pre-vote optimization (reduces election disruptions)
- Pipeline requests (overlaps for higher throughput)
- Batch commands (groups for efficiency)
- Adaptive timeouts (adjusts based on network)

### 3. Scale Coordination
- Hierarchical consensus for large networks
- Partition into smaller coordination groups
- Use gossip protocols for non-critical state
- Implement sharding for independent subproblems

### 4. Improve Fault Tolerance
- Circuit breakers prevent cascade (failover <5s)
- Health checks detect failures early (10-30s intervals)
- Retry with exponential backoff (prevent storms)
- Graceful degradation (partial operation better than none)

## Monitoring and Observability

### Key Metrics to Track

**Consensus Metrics**:
- Leader election time (Raft: ~150ms, BFT: ~375ms)
- Log replication latency (Raft: 10-50ms per command)
- Throughput (Raft: 100-1000 cmd/s, BFT: 10-50 req/s)
- Split-brain detection and recovery time

**Communication Metrics**:
- Message throughput per session size
- Routing latency (semantic: <200ms, baseline: ~5000ms)
- Cache hit ratios (target: >60%)
- Circuit breaker state transitions

**State Management Metrics**:
- Convergence time vs replica count
- Bandwidth overhead (delta vs full sync)
- Merge complexity scaling
- Conflict detection rate and types

**System Health Metrics**:
- Active agent count and utilization
- Queue depths and backpressure
- Memory usage and growth rate
- CPU usage and resource limits

### Alerting Thresholds

- High latency: >1000ms sustained
- Low cache hit: <30% for semantic routing
- Frequent circuit breaks: >10 per hour
- Slow convergence: >5s for CRDTs
- High conflict rate: >100 per minute
- Byzantine detection: >1 per hour

## Limitations and Tradeoffs

### Raft Consensus
**Limitations**:
- Requires majority (2f+1) for any progress
- Vulnerable to Byzantine faults
- Leader is throughput bottleneck
- Split-brain during network partition

**Measured Performance**: 100-1000 cmd/s, 150ms election, 3-7 nodes optimal

### BFT Consensus
**Limitations**:
- O(n²) message complexity limits scalability
- High computational cost (cryptographic signatures)
- Requires 3f+1 nodes for f Byzantine faults
- Not cost-effective for crash-only faults

**Measured Performance**: 10-50 req/s, 375ms election, 20-30 nodes maximum

### CRDTs
**Limitations**:
- O(n) memory per replica (unsuitable for very large networks)
- Limited operation types (not all data structures have CRDT equivalents)
- Eventual consistency only (no strong guarantees)
- Tombstone accumulation requires garbage collection

**Measured Performance**: <1s convergence for 64 replicas, 50-90% bandwidth savings

### Vector Clocks
**Limitations**:
- O(n) memory growth with node count
- No protection against Byzantine failures (clock manipulation)
- Requires periodic synchronization (drift handling)
- Garbage collection needed for event history

**Measured Performance**: >95% causality detection, 10-50ms sync overhead

### A2A Protocol
**Limitations**:
- Session limit: 100 concurrent sessions
- Byzantine tolerance: 1/3 of participants maximum
- Quadratic state sync overhead with participants
- Computational cost of proof-of-work consensus

**Measured Performance**: 500-1000 msg/s for 2-3 agents, linear degradation to 6, quadratic beyond 8

## Evidence-Based Recommendations

When making architectural decisions:

1. **State requirements**: If you don't need actual measurements, don't claim specific performance numbers
2. **Measure baselines**: Compare against measured baseline (not theoretical ideal)
3. **Document limitations**: Every pattern has tradeoffs - state them explicitly
4. **Test failure modes**: Validate fault tolerance claims with actual failure injection
5. **Quantify overhead**: Measure coordination overhead vs direct operation
6. **Scale testing**: Test at expected scale, not just small examples

**Language to avoid** (unless backed by measurements):
- "Eliminates all coordination issues"
- "Perfect synchronization"
- "Guaranteed consensus" (consensus has failure modes)
- "Zero overhead" (all coordination has cost)
- "Industry-leading performance" (without benchmarks)

**Language to use**:
- "Measured performance: X ops/sec under Y conditions"
- "Tolerates up to f failures in configuration Z"
- "Observed convergence time: X ms for Y replicas"
- "Tradeoff: Lower latency at cost of eventual consistency"
- "Limitation: Requires majority for progress"

## Integration with Other Skills

- **Evidence-Based Validation**: Use to verify orchestration performance claims
- **MCP Server Development**: Apply MCP communication patterns to agent messaging
- Reference architecture documents for system-level design patterns

## References

All patterns in this skill are extracted from:
- `/home/alton/SKG Agent Prototype 2/` - Actual implementations with measured performance
- `/home/alton/CLAUDE.md` - Parallel agent coordination protocols
- `/home/alton/AGENTIC_HARNESS_ARCHITECTURE.md` - System architecture patterns
- `/home/alton/MCP_ORCHESTRATOR_DESIGN.md` - Orchestrator design principles

Refer to the `reference/` directory for detailed documentation of each pattern.

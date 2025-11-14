---
name: Distributed Systems Debugging
description: Guides debugging of distributed systems including consensus failures, message ordering issues, state synchronization bugs, network partitions, and cascading failures. Use when debugging multi-agent systems, investigating coordination issues, analyzing distributed traces, or resolving distributed state conflicts.
allowed-tools: Read, Grep, Glob, Bash
---

# Distributed Systems Debugging

This skill provides systematic approaches to debugging distributed systems, multi-agent coordination, consensus mechanisms, and distributed state management based on real debugging experiences from SKG Agent Prototype 2 development.

## Overview

Distributed systems debugging is fundamentally different from debugging single-process applications due to:

- **Partial failures**: Some components fail while others continue
- **Non-determinism**: Same inputs can produce different outputs due to timing
- **Lack of global state**: No single source of truth
- **Complex causality**: Events across nodes have intricate causal relationships
- **Emergent behaviors**: System-level issues not present in individual components

This skill helps you systematically investigate these challenges using evidence-based debugging techniques extracted from actual distributed system development.

## Core Debugging Methodology

### 1. Observe (Gather Evidence)

**Don't make assumptions. Collect actual data first.**

- **Collect logs from all nodes** - Not just the failing one
- **Capture distributed traces** - Reconstruct causal chains
- **Gather metrics** - CPU, memory, network, latency, throughput
- **Record message flows** - Who sent what to whom, when
- **Document symptoms** - What actually happens vs. what should happen
- **Check timestamps** - Clock skew can hide or create issues

**Example from SKG:**
```bash
# Consensus test framework collects comprehensive metrics
# From run-consensus-tests.ts
- Consensus time per proposal
- Byzantine failure detection rate
- Network partition recovery time
- Safety/liveness violations
- Per-agent performance metrics
```

### 2. Hypothesize (Form Theories)

Based on evidence, form testable hypotheses about root causes.

**Common hypothesis patterns:**
- **Message ordering**: "Messages arrive out of order causing state divergence"
- **Network partition**: "Two groups of nodes can't communicate, creating split-brain"
- **Byzantine behavior**: "Malicious/faulty node sending conflicting messages"
- **Race condition**: "Timing-dependent behavior when operations interleave"
- **Deadlock**: "Circular dependency preventing progress"
- **Resource exhaustion**: "Memory/connections/threads depleted under load"

**From SKG consensus tests:**
- Silent failures detected through absence of expected votes
- Vote manipulation detected by comparing expected vs actual consensus
- Partition recovery measured by time to re-establish quorum

### 3. Test (Validate Hypotheses)

Design experiments to confirm or reject hypotheses.

**Techniques:**
- **Isolate components**: Test each node/service independently
- **Inject failures**: Deliberately create suspected conditions
- **Replay scenarios**: Use captured traces to reproduce issues
- **Vary timing**: Add delays to expose race conditions
- **Reduce scale**: Test with 2-3 nodes before full deployment
- **Controlled chaos**: Systematic fault injection (from SKG fault-monitor-demo.ts)

**Example fault injection from SKG:**
```typescript
// From ConsensusIntegration.test.ts
enum ByzantineFailureType {
  SILENT_FAILURE,           // Node stops responding
  VOTE_MANIPULATION,        // Sends incorrect votes
  DOUBLE_VOTING,           // Votes multiple times
  CONFLICTING_PROPOSALS,   // Sends different proposals to different nodes
  TRUST_SCORE_MANIPULATION, // Lies about trust scores
  FALSE_CONSENSUS_CLAIMS   // Claims consensus when none exists
}
```

### 4. Verify (Confirm Root Cause)

Once you believe you've found the issue:

- **Reproduce reliably**: Can you trigger it consistently?
- **Fix and validate**: Does the fix eliminate the symptom?
- **Regression test**: Create test to prevent recurrence
- **Document**: Capture what failed, why, and how to detect it

## Common Distributed System Failure Patterns

See `reference/failure-patterns.md` for detailed catalog extracted from SKG development.

### Quick Reference

**Consensus Failures:**
- Split-brain: Multiple leaders elected simultaneously
- Starvation: Some proposals never reach consensus
- Livelock: System keeps changing state without progress
- Byzantine corruption: Malicious nodes corrupt consensus

**Message Ordering Issues:**
- Causal ordering violations: Effect arrives before cause
- Total ordering violations: Nodes see different message orders
- Message loss: Network drops messages silently
- Message duplication: Same message processed multiple times

**State Synchronization:**
- Divergent state: Nodes have different values for same key
- Dirty reads: Reading uncommitted/inconsistent state
- Lost updates: Concurrent updates overwrite each other
- State corruption: Invalid state due to failed partial updates

**Network Partitions:**
- Split-brain: Partitioned groups both claim authority
- Slow recovery: Long time to detect and heal partition
- Cascading failures: Partition triggers overload in remaining nodes

**Performance Degradation:**
- Latency spikes: Sudden increase in response time
- Throughput collapse: System can't handle normal load
- Resource exhaustion: Memory leaks, connection pool depletion
- Backpressure failures: Slow consumers overwhelm fast producers

## Debugging Tools and Techniques

### Log Analysis

**Structured logging is essential:**
```typescript
// From SKG metrics-initialization.ts
logger.info('Consensus reached', {
  entryId: entry.id,
  consensusTime: duration,
  approvalRate: approveCount / totalVotes,
  byzantineAgentsDetected: byzantineDetections,
  timestamp: Date.now()
});
```

**Key log analysis patterns:**
- Correlation IDs: Track single request across services
- Vector clocks: Establish causal relationships
- Structured fields: Enable filtering and aggregation
- Log levels: Use appropriately (debug, info, warn, error)

See `reference/logging-patterns.md` for detailed examples.

### Distributed Tracing

**Reconstruct causal chains:**
- Trace IDs propagate through system
- Spans represent operations with timing
- Tags provide context (node ID, operation type)
- Baggage carries state across boundaries

See `scripts/trace-analyzer.py` for analysis tools.

### Metrics Collection

**Essential metrics from SKG:**
```typescript
// From metrics-initialization.ts
interface Metrics {
  // Latency metrics
  agentToAgent: number;           // Agent communication latency
  taskAssignment: number;         // Task assignment latency
  consensusTime: number;          // Time to reach consensus

  // Throughput metrics
  messagesPerSecond: number;
  tasksPerSecond: number;

  // Resource metrics
  memoryPerAgent: number;
  cpuUtilization: number;

  // Error metrics
  errorRate: number;
  byzantineDetections: number;
  timeoutRate: number;
}
```

See `reference/monitoring-strategies.md` for comprehensive patterns.

### Testing Strategies

**From SKG test suite:**

**Unit tests**: Test individual components in isolation
**Integration tests**: Test component interactions
**Consensus tests**: Verify agreement under failures
**Scalability tests**: Measure performance at scale (10 to 10,000 agents)
**Chaos tests**: Inject failures systematically

See `reference/testing-strategies.md` for detailed approaches.

## Systematic Debugging Process

Use `templates/debugging-checklist.md` for step-by-step guidance.

### Initial Investigation

1. **Define the symptom precisely**
   - What is observed vs. expected?
   - Is it consistent or intermittent?
   - Does it affect all nodes or subset?

2. **Gather evidence**
   - Logs from all involved nodes
   - Metrics before/during/after issue
   - Network traces if available
   - Recent changes to code/config

3. **Identify the failure domain**
   - Single node, multiple nodes, or all?
   - Specific operation or general?
   - Related to load/timing or always?

### Root Cause Analysis

Use `scripts/debug-distributed-system.py` to automate common analyses:

```bash
# Analyze logs for consensus issues
python scripts/debug-distributed-system.py \
  --logs ./logs/*.log \
  --check consensus \
  --check message-ordering \
  --check state-sync \
  --report ./debug-report.md
```

**Manual analysis techniques:**

1. **Timeline reconstruction**: Order all events across nodes by timestamp
2. **State diffing**: Compare node states at same logical time
3. **Message flow mapping**: Draw who sent what to whom
4. **Bottleneck identification**: Find slowest operations in critical path
5. **Anomaly detection**: Find statistical outliers in metrics

### Common Debugging Scenarios

See `examples/real-debugging-sessions.md` for detailed case studies from SKG development.

**Scenario 1: Consensus never reached**
- Check quorum size vs. active nodes
- Look for Byzantine agents manipulating votes
- Verify message delivery to all voters
- Check for network partitions

**Scenario 2: State divergence between nodes**
- Compare vector clocks to find divergence point
- Check for concurrent updates without coordination
- Verify merge/conflict resolution logic
- Look for dropped state sync messages

**Scenario 3: Performance degradation under load**
- Profile to find hot paths
- Check for resource exhaustion (memory, connections)
- Look for head-of-line blocking
- Verify backpressure handling

## Performance Debugging

See `reference/performance-debugging.md` for comprehensive guide.

**Key techniques from SKG scalability testing:**

```typescript
// From run-scalability-test.ts
// Measure complexity as system scales
interface ComplexityAnalysis {
  discoveryLatency: {
    actualComplexity: string;      // Measured: O(log n)
    expectedComplexity: string;    // Expected: O(log n)
    rSquared: number;              // Goodness of fit
  };
  messageThroughput: {
    actualComplexity: string;
    expectedComplexity: string;
  };
  memoryUsage: {
    actualComplexity: string;      // Should be O(n)
    expectedComplexity: string;
  };
}
```

**Performance debugging workflow:**
1. Establish baseline metrics (normal operation)
2. Identify deviation (what changed?)
3. Profile to find bottleneck (CPU? Memory? Network? I/O?)
4. Optimize hot path
5. Measure improvement
6. Ensure no regression elsewhere

## Limitations and Caveats

**This skill cannot:**
- Automatically fix all distributed system bugs
- Guarantee root cause identification in all cases
- Replace domain knowledge of your specific system
- Debug without access to logs, metrics, or traces
- Solve issues caused by hardware failures without diagnostics

**Distributed debugging is inherently difficult because:**
- Heisenberg effect: Observing can change behavior (probe effect)
- Non-reproducibility: Timing-dependent bugs may not reproduce
- Incomplete information: Can't observe all nodes simultaneously
- Emergent complexity: System behavior not predictable from components

**Best practices:**
- Instrument early: Add logging/metrics before you need them
- Test failure modes: Don't just test happy path
- Use feature flags: Enable safer rollouts and faster rollbacks
- Document runbooks: Capture debugging procedures for common issues
- Practice chaos engineering: Test failure handling regularly

## Quick Start

1. **For consensus issues**: See `reference/failure-patterns.md` section on consensus
2. **For message ordering**: Use `scripts/trace-analyzer.py` to reconstruct flows
3. **For state synchronization**: Check `templates/debugging-checklist.md` state sync section
4. **For performance issues**: Run `scripts/performance-analyzer.sh` (from monitoring-strategies.md)
5. **For general debugging**: Follow methodology above with `templates/debugging-checklist.md`

## Integration with Other Skills

- **Evidence-Based Validation**: Use to verify debugging claims and metrics
- **Multi-Agent Orchestration**: Reference for understanding coordination patterns
- **MCP Server Development**: Reference for debugging communication protocols

## References

All examples and patterns extracted from:
- SKG Agent Prototype 2 test suite
- Consensus integration tests
- Scalability test framework
- Fault monitor implementations
- Error handling patterns documentation
- Real debugging experiences during SKG development

---

**Remember**: Distributed systems debugging requires patience, systematic methodology, and healthy skepticism. Don't trust your assumptions - verify with evidence.

# Distributed Systems Debugging Methodology

This document provides a systematic approach to debugging distributed systems, extracted from real debugging experiences in SKG Agent Prototype 2 development.

## Overview: Why Distributed Debugging is Different

Traditional debugging assumes:
- Single process with predictable execution
- Reproducible behavior from same inputs
- Complete visibility into state
- Deterministic execution order

Distributed systems have:
- Multiple independent processes
- Non-deterministic timing and ordering
- Partial visibility (can't see all state at once)
- Concurrency and race conditions
- Network as a source of failures

**Result**: You need a different approach.

## The Four-Step Process

### Step 1: Observe (Evidence Collection)

**Goal**: Gather factual data about system behavior without making assumptions.

#### What to Collect

**Logs from ALL involved nodes:**
```bash
# Don't just look at the node that appears to be failing
# Collect from entire cluster
for node in node1 node2 node3; do
  scp $node:/var/log/app.log ./logs/$node.log
done
```

**Distributed traces:**
```typescript
// From SKG: Correlation IDs track requests across services
logger.info('Processing request', {
  traceId: request.traceId,
  spanId: generateSpanId(),
  parentSpanId: request.parentSpanId,
  operation: 'consensus_vote',
  timestamp: Date.now()
});
```

**Metrics at multiple granularities:**
```typescript
// From SKG metrics-initialization.ts
// System-wide metrics
const globalMetrics = {
  totalAgents: agentCount,
  systemThroughput: messagesPerSecond,
  averageLatency: meanLatency
};

// Per-node metrics
const nodeMetrics = {
  nodeId: 'agent-1',
  cpuUtilization: 45.2,
  memoryUsage: 512,
  messageRate: 15.3,
  errorCount: 0
};

// Per-operation metrics
const operationMetrics = {
  operation: 'consensus',
  count: 150,
  averageDuration: 45,
  p95Duration: 120,
  p99Duration: 250,
  errorRate: 0.02
};
```

**Network information:**
- Message flows (who sent what to whom)
- Message timing (send time, receive time, processing time)
- Network topology (which nodes can reach which)
- Bandwidth usage
- Packet loss rates

**System state snapshots:**
```typescript
// From SKG: Capture state at critical points
interface SystemSnapshot {
  timestamp: number;
  agentStates: Map<string, AgentState>;
  consensusState: ConsensusStatus;
  messageQueues: Map<string, Message[]>;
  vectorClocks: Map<string, VectorClock>;
}
```

**Recent changes:**
- Code deployments
- Configuration changes
- Infrastructure changes
- Load changes

#### How to Organize Evidence

**Timeline reconstruction:**
```
T0: Node A receives request (traceId: xyz)
T1: Node A sends message to Node B
T2: Node B processes message
T2: Node A sends message to Node C (concurrent with T2)
T3: Node C processes message
T4: Node B sends response to Node A
T5: Node C sends response to Node A
T6: Node A completes request
```

**From SKG vector clock tests:**
```javascript
// test-vector-clock-simple.js
// Use logical clocks to establish causality
const eventA = clockA.tick('event A');
clockB.receive(eventA);
const eventB = clockB.tick('event B response');

const relation = clockB.getCausalRelation(eventA, eventB);
// relation.type === 'happens-before'
```

**State comparison:**
```
Node A state: { key1: "value1", key2: "value2", version: 5 }
Node B state: { key1: "value1", key2: "value2", version: 5 }
Node C state: { key1: "value1", key2: "value3", version: 4 }
                                        ^^^^^^ DIVERGENCE
```

#### Tools for Evidence Collection

**Log aggregation:**
```bash
# Collect and merge logs with timestamps
cat logs/*.log | sort -t',' -k1 > merged_timeline.log
```

**Distributed tracing:**
```python
# From scripts/trace-analyzer.py (created in this skill)
def reconstruct_trace(trace_id, log_files):
    """Reconstruct complete trace from multiple log files"""
    spans = []
    for log_file in log_files:
        spans.extend(extract_spans(log_file, trace_id))

    # Sort by timestamp, build causal tree
    return build_trace_tree(sorted(spans, key=lambda s: s.timestamp))
```

**Metrics visualization:**
```bash
# From SKG monitoring
npx ts-node metrics-initialization.ts status
# Shows current efficiency, latency, throughput metrics
```

### Step 2: Hypothesize (Theory Formation)

**Goal**: Based on evidence, form testable hypotheses about root cause.

#### Hypothesis Formation Strategy

**Pattern matching:** Does evidence match known failure patterns?

```
Evidence:
- Consensus taking 10x longer than normal
- 30% of agents not responding to votes
- No errors in logs

Hypothesis: Silent Byzantine failure (reference/failure-patterns.md)
```

**Temporal analysis:** When did the issue start?

```
Evidence:
- Logs show normal operation until 14:23:15
- First error at 14:23:17
- Full system degradation by 14:23:30

Hypothesis: Single event triggered cascading failure
Look for: What happened at 14:23:15?
```

**Spatial analysis:** Which nodes are affected?

```
Evidence:
- Nodes 1-5 show normal behavior
- Nodes 6-10 show high latency
- Network topology: 1-5 in datacenter A, 6-10 in datacenter B

Hypothesis: Network partition between datacenters
```

**Correlation analysis:** What changed recently?

```
Evidence:
- Issue started at 14:00
- Deployment to 50% of fleet at 13:45
- Only deployed nodes showing issue

Hypothesis: Bug in new code version
```

#### Example Hypotheses from SKG Testing

**Consensus failure hypothesis:**
```typescript
// From ConsensusIntegration.test.ts
// If consensus fails despite healthy nodes:

// Hypothesis 1: Message loss preventing quorum
if (votesReceived < quorumSize && networkMetrics.messageLossRate > 0) {
  return "Suspected message loss preventing consensus";
}

// Hypothesis 2: Byzantine agents manipulating votes
if (voteDistribution.unexpected && byzantineCount > 0) {
  return "Suspected Byzantine vote manipulation";
}

// Hypothesis 3: Network partition
if (partitionDetected && votesReceived < quorumSize) {
  return "Network partition preventing quorum";
}
```

**Performance degradation hypothesis:**
```typescript
// From run-scalability-test.ts
// If latency increases:

// Check complexity - is it scaling worse than expected?
if (actualComplexity === "O(n²)" && expectedComplexity === "O(n)") {
  return "Algorithm has quadratic complexity, worse than designed";
}

// Check resource exhaustion
if (memoryPerAgent > threshold || cpuUtilization > 90) {
  return "Resource exhaustion causing slowdown";
}
```

#### Hypothesis Prioritization

Order hypotheses by:
1. **Evidence strength**: How well does evidence support it?
2. **Impact**: Would this cause observed symptoms?
3. **Likelihood**: How common is this type of failure?
4. **Testability**: Can we easily test this hypothesis?

From most to least likely to test first.

### Step 3: Test (Hypothesis Validation)

**Goal**: Design experiments to confirm or reject hypotheses.

#### Testing Strategies

**Isolation testing:**
```bash
# Test components independently
# From SKG integration-test.js pattern

# Test node 6 in isolation
./test-single-node.sh node6
# Does issue occur? If yes: local problem
# If no: interaction problem

# Test nodes 6-10 together but isolated from 1-5
./test-partition.sh nodes-6-10
# Does issue occur? If yes: problem within that group
```

**Failure injection:**
```typescript
// From SKG ConsensusIntegration.test.ts
class ByzantineFailureSimulator {
  // Inject suspected failure type
  public assignByzantineType(agentId: string, type: ByzantineFailureType) {
    this.failureTypes.set(agentId, type);
  }

  // Test hypothesis: "Silent failures causing consensus timeout"
  public simulateVote(agentId: string, originalVote: VoteType): VoteType {
    if (this.failureTypes.get(agentId) === SILENT_FAILURE) {
      return VoteType.ABSTAIN;  // Simulate non-response
    }
    return originalVote;
  }
}

// Run test with simulated failures
const result = await testConsensusWithByzantineAgents(
  silentFailureCount: 3,
  expectedBehavior: { shouldReachConsensus: true }  // Quorum should handle
);
```

**Replay testing:**
```python
# Replay captured message sequence
def replay_scenario(trace_file, target_system):
    """Replay sequence of messages from trace"""
    events = load_trace(trace_file)
    for event in sorted(events, key=lambda e: e.timestamp):
        # Replay message with same timing
        sleep_until(event.timestamp)
        send_message(target_system, event.message)

# Does issue reproduce? If yes: confirms timing/ordering hypothesis
```

**Load testing:**
```typescript
// From SKG run-scalability-test.ts
// Test hypothesis: "System degrades under load"

const result = await runScalabilityTest({
  minAgents: 10,
  maxAgents: 1000,
  stepSize: 50,
  testDurationMs: 30000,
  taskGenerationRate: 10,  // Ops/second
  messageGenerationRate: 50
});

// Check where degradation starts
for (const metric of result.metrics) {
  if (metric.latency > threshold) {
    console.log(`Degradation starts at ${metric.agentCount} agents`);
  }
}
```

**Code inspection:**
```bash
# If hypothesis involves code bug, inspect relevant code
git diff v1.0..v1.1 src/consensus/  # What changed?
git log --since="2 days ago" --author=alice  # Recent changes
git blame src/consensus/vote.ts  # Who wrote this?
```

**Network simulation:**
```typescript
// From SKG NetworkPartitionSimulator
class NetworkPartitionSimulator {
  // Test hypothesis: "Network partition causes split-brain"

  public createPartition(agents: string[], partitionRatio: number) {
    // Divide agents into unreachable groups
    const partition1 = agents.slice(0, partitionRatio * agents.length);
    const partition2 = agents.slice(partitionRatio * agents.length);

    // Simulate network partition
    this.setReachability(partition1, partition2, false);
  }

  public healPartition() {
    // Restore connectivity
    this.setReachability(allAgents, allAgents, true);

    // Measure recovery time
    const startTime = Date.now();
    while (!systemHealthy()) {
      await sleep(100);
    }
    return Date.now() - startTime;  // Recovery time
  }
}
```

#### What Good Tests Show

**Positive confirmation:**
- "When I inject silent failures, consensus times out (as observed)"
- Hypothesis is consistent with evidence

**Negative rejection:**
- "When I inject message delay, consensus still works (unlike observed failure)"
- Hypothesis doesn't explain symptoms, move to next hypothesis

**Unexpected finding:**
- "When testing partition, discovered unrelated memory leak"
- Document and investigate separately

### Step 4: Verify (Root Cause Confirmation)

**Goal**: Confirm you've found the actual root cause and fix works.

#### Verification Steps

**1. Reproduce reliably:**
```bash
# Can you trigger the issue consistently?
for i in {1..10}; do
  ./trigger_issue.sh
  if ! check_failure; then
    echo "Failed to reproduce on iteration $i"
    exit 1
  fi
done
echo "Issue reproduces reliably"
```

**2. Fix and validate:**
```typescript
// From SKG error handling patterns

// Before fix: Silent failures cause timeout
async function proposeWithTimeout(proposal, timeout) {
  return await Promise.race([
    consensus.propose(proposal),
    timeoutPromise(timeout)  // Times out if agents don't respond
  ]);
}

// After fix: Proceed with quorum, don't wait for all
async function proposeWithQuorum(proposal, timeout) {
  const votes = [];
  const votePromises = agents.map(a => a.vote(proposal));

  // Collect votes as they arrive
  for await (const vote of raceIterator(votePromises)) {
    votes.push(vote);
    if (votes.length >= quorumSize) {
      return decide(votes);  // Don't wait for stragglers
    }
  }

  // Timeout only if quorum not reached
  if (votes.length < quorumSize) {
    throw new TimeoutError("Quorum not reached");
  }
}

// Validate: Issue should not occur with fix
const result = await testConsensusWithSilentFailures(3);
assert(result.consensusReached, "Consensus should reach with quorum");
```

**3. Regression testing:**
```typescript
// From SKG testing patterns
// Add test to prevent recurrence

describe('Consensus with silent failures', () => {
  it('should reach consensus with quorum despite silent agents', async () => {
    const simulator = new ByzantineFailureSimulator();

    // Simulate up to f silent failures (where 3f+1 = total nodes)
    const totalAgents = 10;
    const maxFailures = Math.floor((totalAgents - 1) / 3);

    for (let i = 0; i < maxFailures; i++) {
      simulator.assignByzantineType(`agent-${i}`, SILENT_FAILURE);
    }

    const result = await runConsensusTest({
      agents: totalAgents,
      byzantineSimulator: simulator
    });

    expect(result.consensusReached).toBe(true);
    expect(result.consensusTime).toBeLessThan(5000);
  });
});
```

**4. Monitor in production:**
```typescript
// From SKG metrics-initialization.ts
// Add monitoring for this specific issue

const monitor = new MonitoringIntegration({
  alertThresholds: {
    consensusTimeout: 5000,  // Alert if consensus takes >5s
    silentAgentRate: 0.1,    // Alert if >10% agents silent
    quorumFailureRate: 0.01  // Alert if quorum failures >1%
  }
});

monitor.on('alert', (alert) => {
  logger.error('Consensus issue detected', {
    type: alert.type,
    severity: alert.severity,
    details: alert.details
  });

  // Automatic mitigation
  if (alert.type === 'consensus_timeout') {
    triggerQuorumRecovery();
  }
});
```

**5. Document findings:**
```markdown
## Issue: Consensus Timeouts Under Byzantine Failures

**Date**: 2024-01-15
**Severity**: High
**Status**: Resolved

### Symptoms
- Consensus operations timing out
- 30% of agents not responding
- No error messages in logs

### Root Cause
Silent Byzantine failures: 3 agents stopped responding to vote requests
due to network connectivity issues, but system waited for all agents
before making decision.

### Investigation
1. Observed: Consensus timeouts, missing votes
2. Hypothesized: Silent failures preventing quorum
3. Tested: Injected silent failures - reproduced issue
4. Verified: Fixed by using quorum-based decision

### Fix
Changed consensus to proceed with quorum (2f+1) rather than waiting
for all agents. Implemented in commit abc123.

### Prevention
- Added alerting for silent agent detection
- Added regression test
- Updated runbook with detection/mitigation steps

### Metrics
- Before: 15% consensus timeout rate
- After: 0.1% consensus timeout rate
- Recovery: Automatic with quorum logic
```

## Advanced Techniques

### Differential Diagnosis

Like medical diagnosis, compare symptoms to known conditions:

```
Symptom: Consensus fails intermittently

Conditions:
1. Network partition
   - Check: Do partitioned groups both make decisions? → Yes
   - Diagnosis: Likely network partition

2. Message loss
   - Check: Are messages dropped? → No
   - Diagnosis: Not message loss

3. Byzantine behavior
   - Check: Do some agents vote unexpectedly? → No
   - Diagnosis: Not Byzantine

Result: Network partition confirmed
```

### Binary Search Debugging

For complex systems, use binary search to narrow down:

```bash
# Which component is failing?
# Test half the system at a time

# Test nodes 1-5
./test nodes 1-5  # Works
# Test nodes 6-10
./test nodes 6-10  # Fails

# Test nodes 6-8
./test nodes 6-8  # Works
# Test nodes 9-10
./test nodes 9-10  # Fails

# Test node 9
./test node 9  # Fails ← Found problem node
```

### Time-Travel Debugging

Use snapshots to "go back in time":

```typescript
// From SKG: Capture state at intervals
class StateRecorder {
  private snapshots: Map<number, SystemSnapshot> = new Map();

  public recordSnapshot(timestamp: number, state: SystemSnapshot) {
    this.snapshots.set(timestamp, state);
  }

  public findFirstBadState(): [number, SystemSnapshot] {
    const timestamps = Array.from(this.snapshots.keys()).sort();

    for (let i = 0; i < timestamps.length; i++) {
      const state = this.snapshots.get(timestamps[i]);
      if (isInvalidState(state)) {
        return [timestamps[i], state];
      }
    }
  }

  public compareStates(t1: number, t2: number): StateDiff {
    const state1 = this.snapshots.get(t1);
    const state2 = this.snapshots.get(t2);
    return diffStates(state1, state2);
  }
}

// Find when state became invalid
const [badTimestamp, badState] = recorder.findFirstBadState();
const [goodTimestamp] = findLatestGoodState(badTimestamp);

// What changed?
const diff = recorder.compareStates(goodTimestamp, badTimestamp);
console.log('State changed between', goodTimestamp, 'and', badTimestamp);
console.log('Differences:', diff);
```

### Statistical Debugging

Use statistics to find anomalies:

```python
# From SKG statistical analysis
def find_anomalous_nodes(metrics):
    """Find nodes with statistically unusual behavior"""
    latencies = [m.latency for m in metrics]
    mean = sum(latencies) / len(latencies)
    stddev = calculate_stddev(latencies)

    anomalies = []
    for node, metric in enumerate(metrics):
        z_score = (metric.latency - mean) / stddev
        if abs(z_score) > 3:  # More than 3 standard deviations
            anomalies.append({
                'node': node,
                'latency': metric.latency,
                'mean': mean,
                'z_score': z_score
            })

    return anomalies

# Node 7 has z_score of 5.2 → Likely culprit
```

## Common Debugging Pitfalls

### Pitfall 1: Heisenberg Effect

**Problem**: Adding logging/monitoring changes behavior.

**Example**:
```typescript
// Adding this logging...
logger.debug('Voting on proposal', { proposalId, vote });

// ...adds 10ms latency, which changes timing and makes race condition disappear
```

**Solution**:
- Use asynchronous logging
- Minimize instrumentation overhead
- Be aware that observation can change behavior
- Use sampling for high-frequency events

### Pitfall 2: Confirmation Bias

**Problem**: Only looking for evidence that supports your hypothesis.

**Example**:
```
Hypothesis: "Node 5 is Byzantine"
Only look at Node 5's logs
Miss evidence that network partition affected multiple nodes
```

**Solution**:
- Actively look for contradictory evidence
- Test multiple hypotheses in parallel
- Have someone else review your findings
- Document negative results (what you checked that wasn't the cause)

### Pitfall 3: Correlation vs Causation

**Problem**: Assuming correlation implies causation.

**Example**:
```
Evidence: High CPU always present when consensus fails
Hypothesis: High CPU causes consensus failures

Reality: Both are caused by Byzantine attack overwhelming system
```

**Solution**:
- Look for temporal causality (which came first?)
- Test causation (does changing one affect the other?)
- Consider confounding variables

### Pitfall 4: Local vs Distributed State

**Problem**: Assuming you can see complete state.

**Example**:
```typescript
// Debugging locally
const state = getLocalState();
console.log('System state:', state);  // Only seeing local node!

// Reality: Each node has different state
const allStates = await Promise.all(nodes.map(n => n.getState()));
console.log('State divergence detected:', compareStates(allStates));
```

**Solution**:
- Always collect from all nodes
- Use distributed state comparison
- Be aware of partial visibility

## Debugging Checklist

Use this checklist for systematic debugging:

- [ ] **Define symptom**: What exactly is wrong?
- [ ] **Collect evidence**: Logs, metrics, traces from ALL nodes
- [ ] **Check recent changes**: Code, config, infrastructure
- [ ] **Form hypotheses**: 3-5 potential root causes
- [ ] **Prioritize hypotheses**: Most likely first
- [ ] **Test hypothesis**: Can you reproduce? Does fix work?
- [ ] **Verify fix**: Does it solve problem in all cases?
- [ ] **Add regression test**: Prevent recurrence
- [ ] **Document findings**: For future reference
- [ ] **Add monitoring**: Detect similar issues earlier

See `templates/debugging-checklist.md` for detailed checklist.

## Summary

Distributed systems debugging requires:
1. **Systematic evidence collection** across all nodes
2. **Hypothesis-driven investigation** with testable theories
3. **Rigorous testing** to confirm root causes
4. **Verification** that fixes actually work
5. **Documentation** to prevent recurrence

Don't rely on intuition or assumptions. Follow the evidence.

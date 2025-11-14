# Debugging Multi-Agent Coordination

Practical guide to debugging coordination issues in multi-agent systems, based on actual failure modes encountered in SKG Agent Prototype 2 implementations.

## Common Coordination Failures

### 1. Split-Brain Scenarios

**Symptoms**:
- Multiple leaders elected simultaneously
- Conflicting decisions being executed
- Agents disagree on current state
- Duplicate task execution

**Root Causes**:
- Network partition splitting cluster
- Asymmetric failures (A can't reach B, but B can reach A)
- Clock skew causing election timing issues
- Quorum misconfiguration

**Detection**:

```bash
# Check for multiple leaders in Raft
grep "became_leader" logs/* | awk '{print $1, $2}' | sort | uniq -c
# Should see transitions, not concurrent leaders

# Check for state divergence
grep "state_hash" logs/* | tail -n 100
# Compare hashes across agents - should converge

# Check network partition events
grep "partition_detected\|network_split" logs/*

# Monitor election frequency
grep "election_started" logs/* | awk '{print $1}' | uniq -c
# High frequency indicates instability
```

**Debugging Steps**:

1. **Verify Network Connectivity**:
```bash
# Test connectivity between all agent pairs
for agent in agent1 agent2 agent3; do
  for peer in agent1 agent2 agent3; do
    if [ "$agent" != "$peer" ]; then
      echo "Testing $agent -> $peer"
      timeout 5 nc -zv $peer 3000 || echo "FAILED: $agent cannot reach $peer"
    fi
  done
done
```

2. **Check Quorum Configuration**:
```typescript
// Verify quorum size calculation
const expectedQuorum = Math.floor(nodeCount / 2) + 1;
const actualQuorum = config.quorumSize;

if (expectedQuorum !== actualQuorum) {
  console.error(`Quorum misconfigured: expected ${expectedQuorum}, got ${actualQuorum}`);
}
```

3. **Analyze Vector Clocks**:
```typescript
// Check for concurrent events that should be ordered
const events = getEventLog();
for (let i = 0; i < events.length; i++) {
  for (let j = i + 1; j < events.length; j++) {
    if (events[i].vectorClock.concurrent(events[j].vectorClock)) {
      console.warn(`Concurrent events that may indicate split: ${events[i].id}, ${events[j].id}`);
    }
  }
}
```

**Resolution**:

**For Raft**:
```typescript
// Majority partition continues, minority blocks
if (reachableNodes.length < quorum) {
  this.state = NodeState.FOLLOWER;
  this.stepDownAsLeader();
  throw new Error('Lost quorum, stepping down');
}
```

**For BFT**:
```typescript
// Requires 2f+1 for progress
if (responsiveNodes.length < (2 * faultTolerance + 1)) {
  this.initiateViewChange();
  throw new Error('Insufficient responsive nodes for BFT consensus');
}
```

**Prevention**:
- Use network partition detection (heartbeats, failure detectors)
- Configure appropriate timeouts (not too aggressive)
- Implement proper quorum checks
- Use consensus-based configuration changes

### 2. Message Ordering Problems

**Symptoms**:
- Operations applied out of order
- Causality violations (effect before cause)
- Inconsistent state across replicas
- Dependency errors

**Root Causes**:
- Network reordering of messages
- Missing vector clock implementation
- Buffering without causal ordering
- Clock drift affecting timestamps

**Detection**:

```bash
# Check for causality violations in logs
grep "causality_violation\|ordering_error" logs/*

# Analyze message sequence numbers
grep "sequence_number" logs/* | sort -k2 -n
# Look for gaps or out-of-order sequences

# Check vector clock comparisons
grep "happens_before\|concurrent" logs/*
# Should see causal relationships being checked
```

**Debugging with Vector Clocks**:

```typescript
class MessageOrderDebugger {
  analyzeMessageOrdering(messages: Message[]): OrderingAnalysis {
    const violations = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const dependencies = this.findDependencies(msg);

      for (const dep of dependencies) {
        // Check if dependency was delivered before this message
        const depIndex = messages.findIndex(m => m.id === dep.id);

        if (depIndex > i) {
          violations.push({
            message: msg.id,
            dependency: dep.id,
            issue: 'Dependency delivered after dependent message',
            messageVectorClock: msg.vectorClock,
            dependencyVectorClock: dep.vectorClock
          });
        }
      }
    }

    return {
      totalMessages: messages.length,
      violations: violations,
      severity: violations.length > 0 ? 'CRITICAL' : 'OK'
    };
  }
}
```

**Resolution**:

**Implement Causal Delivery**:
```typescript
class CausalDeliveryBuffer {
  private buffer: Message[] = [];
  private vectorClock: VectorClock;

  async receiveMessage(msg: Message): Promise<void> {
    if (this.canDeliver(msg)) {
      await this.deliver(msg);
      this.vectorClock.receive(msg.vectorClock);

      // Try to deliver buffered messages
      await this.tryDeliverBuffered();
    } else {
      this.buffer.push(msg);
    }
  }

  private canDeliver(msg: Message): boolean {
    // Check if all causal dependencies satisfied
    for (const [processId, timestamp] of msg.vectorClock.entries()) {
      const ourTimestamp = this.vectorClock.get(processId) || 0;

      // Can deliver if our clock >= message clock - 1 for sender
      if (processId === msg.senderId) {
        if (ourTimestamp + 1 !== timestamp) {
          return false;  // Missing intermediate message
        }
      } else {
        if (ourTimestamp < timestamp) {
          return false;  // Missing dependency from another process
        }
      }
    }
    return true;
  }
}
```

**Prevention**:
- Always use vector clocks for causal ordering
- Implement message buffering for out-of-order delivery
- Set sequence numbers per sender
- Use reliable transport with ordering guarantees

### 3. State Synchronization Bugs

**Symptoms**:
- Replicas diverge over time
- Merge operations fail
- Inconsistent query results across replicas
- State hash mismatches

**Root Causes**:
- Non-commutative merge functions
- Missing updates during synchronization
- Byzantine agent sending incorrect state
- Race conditions in concurrent merges

**Detection**:

```bash
# Compare state hashes across replicas
for agent in agent1 agent2 agent3; do
  echo "$agent:"
  curl -s http://$agent:3000/state/hash
done | paste - - - - - -
# All hashes should match after synchronization

# Check merge operation logs
grep "merge_executed" logs/* | grep "ERROR\|WARN"

# Monitor state size growth
grep "state_size_bytes" logs/* | awk '{print $1, $NF}' | sort
# Should be similar across replicas
```

**Debugging CRDT Properties**:

```typescript
class CRDTPropertyVerifier {
  verifyCommutative<T>(crdt: CRDT<T>, state1: T, state2: T): boolean {
    const merge1 = crdt.merge(state1, state2);
    const merge2 = crdt.merge(state2, state1);

    if (!this.deepEqual(merge1, merge2)) {
      console.error('COMMUTATIVITY VIOLATED:');
      console.error('state1 ⊔ state2 =', merge1);
      console.error('state2 ⊔ state1 =', merge2);
      return false;
    }
    return true;
  }

  verifyAssociative<T>(
    crdt: CRDT<T>,
    state1: T,
    state2: T,
    state3: T
  ): boolean {
    const left = crdt.merge(crdt.merge(state1, state2), state3);
    const right = crdt.merge(state1, crdt.merge(state2, state3));

    if (!this.deepEqual(left, right)) {
      console.error('ASSOCIATIVITY VIOLATED:');
      console.error('(s1 ⊔ s2) ⊔ s3 =', left);
      console.error('s1 ⊔ (s2 ⊔ s3) =', right);
      return false;
    }
    return true;
  }

  verifyIdempotent<T>(crdt: CRDT<T>, state: T): boolean {
    const merged = crdt.merge(state, state);

    if (!this.deepEqual(merged, state)) {
      console.error('IDEMPOTENCY VIOLATED:');
      console.error('state ⊔ state =', merged);
      console.error('state =', state);
      return false;
    }
    return true;
  }
}
```

**Resolution**:

**Fix Non-Commutative Merge**:
```typescript
// WRONG: Non-commutative merge
class BadCounter {
  merge(other: BadCounter): BadCounter {
    // This is NOT commutative if states differ
    this.count = other.count;  // Last one wins arbitrarily
    return this;
  }
}

// CORRECT: Commutative merge
class GoodCounter {
  merge(other: GoodCounter): GoodCounter {
    // Take maximum for each replica
    for (const [replicaId, count] of other.counts.entries()) {
      const current = this.counts.get(replicaId) || 0;
      this.counts.set(replicaId, Math.max(current, count));
    }
    return this;
  }
}
```

**Prevention**:
- Verify CRDT properties (commutative, associative, idempotent)
- Use well-tested CRDT implementations
- Implement state hash validation
- Test merge operations with property-based testing

### 4. Cascading Failures

**Symptoms**:
- Single agent failure triggers widespread outages
- Exponential growth in retry attempts
- Resource exhaustion across cluster
- Domino effect of circuit breakers opening

**Root Causes**:
- No circuit breakers
- Unbounded retries
- No backpressure mechanisms
- Resource limits not configured

**Detection**:

```bash
# Monitor circuit breaker states
grep "circuit_breaker" logs/* | grep "state_change"

# Check for retry storms
grep "retry_attempt" logs/* | awk '{print $1}' | uniq -c | sort -nr
# High counts indicate retry storms

# Monitor resource usage
grep "memory_usage\|cpu_usage" logs/* | tail -n 50

# Check for request queue depth
grep "queue_depth" logs/* | awk '{print $NF}' | sort -nr
# Growing queues indicate backpressure needed
```

**Debugging**:

```typescript
class CascadeFailureDetector {
  detectCascade(failureEvents: FailureEvent[]): CascadeAnalysis {
    // Group failures by time window
    const windows = this.groupByTimeWindow(failureEvents, 10000); // 10s windows

    const cascades = [];
    for (const window of windows) {
      const failureRate = window.length / 10; // failures per second

      if (failureRate > 5) {  // Threshold: 5 failures/sec
        cascades.push({
          startTime: window[0].timestamp,
          endTime: window[window.length - 1].timestamp,
          affectedAgents: new Set(window.map(e => e.agentId)).size,
          failureCount: window.length,
          pattern: this.analyzeFailurePattern(window)
        });
      }
    }

    return {
      cascades,
      severity: cascades.length > 0 ? 'CRITICAL' : 'OK',
      recommendation: this.generateRecommendation(cascades)
    };
  }

  private analyzeFailurePattern(events: FailureEvent[]): string {
    // Check if failures are spreading through dependencies
    const dependencyGraph = this.buildDependencyGraph(events);

    if (this.isRadiatingFromSingleNode(dependencyGraph)) {
      return 'SINGLE_POINT_OF_FAILURE';
    } else if (this.isResourceExhaustion(events)) {
      return 'RESOURCE_EXHAUSTION';
    } else {
      return 'UNKNOWN_PATTERN';
    }
  }
}
```

**Resolution**:

**Implement Circuit Breakers**:
```typescript
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,        // Open after 5 failures
  recoveryTimeout: 60000,     // Try to recover after 1 minute
  halfOpenRequests: 3         // Test with 3 requests in half-open
});

try {
  const result = await circuitBreaker.call(async () => {
    return await callUnreliableAgent(agent);
  });
} catch (error) {
  if (error.message === 'Circuit breaker is OPEN') {
    // Fail fast, route to alternative agent
    return await callBackupAgent(backupAgent);
  }
  throw error;
}
```

**Implement Backpressure**:
```typescript
class BackpressureQueue {
  private maxQueueDepth = 1000;
  private queue: Task[] = [];

  async enqueue(task: Task): Promise<void> {
    if (this.queue.length >= this.maxQueueDepth) {
      throw new Error('Queue full - backpressure applied');
    }
    this.queue.push(task);
  }

  async dequeue(): Promise<Task | null> {
    return this.queue.shift() || null;
  }

  getDepth(): number {
    return this.queue.length;
  }
}
```

**Prevention**:
- Always use circuit breakers for agent-to-agent calls
- Implement exponential backoff with jitter
- Set resource limits (memory, connections, queue depth)
- Monitor health and implement graceful degradation

### 5. Deadlock and Livelock

**Symptoms**:
- System stuck, no progress
- Agents active but not completing tasks
- Circular dependencies detected
- Resource contention without resolution

**Detection**:

```bash
# Check for circular dependencies
grep "dependency_wait" logs/* | awk '{print $2, $3}' | sort | uniq

# Monitor task completion rate
grep "task_completed" logs/* | awk '{print $1}' | uniq -c
# Should see steady completion, not stalled

# Check for repeated retries without progress
grep "retry_attempt" logs/* | grep -v "succeeded"
# Many retries without success indicates livelock
```

**Debugging**:

```typescript
class DeadlockDetector {
  detectDeadlock(
    tasks: Map<string, Task>,
    dependencies: Map<string, string[]>
  ): DeadlockAnalysis {

    // Build dependency graph
    const graph = this.buildGraph(dependencies);

    // Detect cycles
    const cycles = this.findCycles(graph);

    if (cycles.length > 0) {
      return {
        detected: true,
        cycles: cycles.map(cycle => ({
          tasks: cycle,
          agentsInvolved: cycle.map(taskId => tasks.get(taskId)?.agentId),
          breakSuggestion: this.suggestCycleBreaker(cycle, tasks)
        }))
      };
    }

    // Check for livelock (progress but no completion)
    const livelockCandidates = this.detectLivelock(tasks);

    return {
      detected: livelockCandidates.length > 0,
      livelocks: livelockCandidates,
      recommendation: 'Implement timeout-based progress enforcement'
    };
  }

  private findCycles(graph: Graph): string[][] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    for (const node of graph.nodes) {
      if (!visited.has(node)) {
        this.dfsCycleDetection(
          node,
          graph,
          visited,
          recursionStack,
          [],
          cycles
        );
      }
    }

    return cycles;
  }
}
```

**Resolution**:

**Break Deadlocks with Priorities**:
```typescript
class PriorityBasedDeadlockBreaker {
  resolveDeadlock(cycle: string[], tasks: Map<string, Task>): void {
    // Abort lowest priority task in cycle
    const priorities = cycle.map(taskId => ({
      taskId,
      priority: tasks.get(taskId)?.priority || 0
    }));

    priorities.sort((a, b) => a.priority - b.priority);
    const taskToAbort = priorities[0].taskId;

    console.warn(`Breaking deadlock by aborting task: ${taskToAbort}`);
    this.abortTask(taskToAbort);
  }
}
```

**Prevent Livelock with Randomization**:
```typescript
class LivelockPrevention {
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 5
  ): Promise<T> {

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxAttempts - 1) throw error;

        // Exponential backoff with jitter to prevent synchronized retries
        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 1000;
        await this.sleep(baseDelay + jitter);
      }
    }

    throw new Error('Max attempts exceeded');
  }
}
```

**Prevention**:
- Use dependency ordering (topological sort)
- Implement timeout-based deadlock detection
- Apply priority-based conflict resolution
- Add randomization to break livelock patterns

### 6. Byzantine Failures

**Symptoms**:
- Invalid messages from agents
- State corruption
- Signature verification failures
- Anomalous behavior patterns

**Detection**:

```bash
# Check for signature failures
grep "signature_verification_failed" logs/*

# Monitor trust scores
grep "trust_score" logs/* | awk '{print $2, $NF}' | sort -k2 -n

# Check for anomalous behavior
grep "anomaly_detected\|suspicious_behavior" logs/*
```

**Debugging**:

```typescript
class ByzantineDetector {
  async detectByzantineAgent(
    agent: Agent,
    messages: Message[]
  ): Promise<ByzantineAnalysis> {

    const issues: string[] = [];

    // Check signature validity
    const signatureFailures = messages.filter(m =>
      !this.verifySignature(m, agent.publicKey)
    ).length;

    if (signatureFailures > 0) {
      issues.push(`${signatureFailures} signature verification failures`);
    }

    // Check for conflicting messages
    const conflicts = this.findConflictingMessages(messages);
    if (conflicts.length > 0) {
      issues.push(`${conflicts.length} conflicting messages sent`);
    }

    // Check message timestamps
    const timestampAnomalies = this.detectTimestampAnomalies(messages);
    if (timestampAnomalies > 0) {
      issues.push(`${timestampAnomalies} timestamp anomalies`);
    }

    // Check behavioral patterns
    const behaviorScore = await this.analyzeBehavior(agent, messages);
    if (behaviorScore < 0.5) {
      issues.push(`Suspicious behavior pattern (score: ${behaviorScore})`);
    }

    return {
      agentId: agent.id,
      suspicious: issues.length > 0,
      issues,
      recommendation: issues.length > 2
        ? 'ISOLATE_AGENT'
        : 'MONITOR_CLOSELY',
      trustScore: this.calculateTrustScore(agent, issues)
    };
  }
}
```

**Resolution**:

**Isolate Byzantine Agent**:
```typescript
class ByzantineIsolation {
  async isolateAgent(agentId: string, reason: string): Promise<void> {
    // Remove from quorum
    await this.removeFromQuorum(agentId);

    // Update trust score
    await this.updateTrustScore(agentId, 0);

    // Notify other agents
    await this.broadcastAgentIsolation({
      agentId,
      reason,
      timestamp: Date.now()
    });

    // Log incident
    console.error(`Isolated Byzantine agent ${agentId}: ${reason}`);
  }
}
```

**Prevention**:
- Use BFT consensus for untrusted environments
- Implement cryptographic signatures
- Monitor trust scores
- Apply behavior anomaly detection

## Debugging Tools

### Log Analysis Scripts

```bash
#!/bin/bash
# analyze-coordination.sh

echo "=== Coordination Health Analysis ==="

# Check for split-brain
echo "\n1. Split-Brain Detection:"
grep "became_leader" logs/* | awk '{print $1, $2}' | sort | uniq -c

# Check message ordering
echo "\n2. Message Ordering Issues:"
grep "causality_violation\|ordering_error" logs/* | wc -l

# Check state synchronization
echo "\n3. State Divergence:"
for agent in agent1 agent2 agent3; do
  echo "$agent: $(grep "state_hash" logs/$agent.log | tail -n1)"
done

# Check for cascading failures
echo "\n4. Cascading Failures:"
grep "circuit_breaker.*OPEN" logs/* | wc -l

# Check deadlock indicators
echo "\n5. Potential Deadlocks:"
grep "dependency_wait" logs/* | wc -l

# Check Byzantine behavior
echo "\n6. Byzantine Detection:"
grep "signature_verification_failed\|suspicious_behavior" logs/* | wc -l
```

## Evidence Sources

All debugging patterns and failure modes documented from:
- `/home/alton/SKG Agent Prototype 2/` - Actual implementation debugging
- Consensus mechanisms: Raft, BFT implementations and test results
- Communication protocols: A2A Protocol failure mode testing
- State management: CRDT and vector clock debugging experiences

These are real debugging experiences, not theoretical scenarios.

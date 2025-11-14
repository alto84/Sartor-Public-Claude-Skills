# Distributed System Failure Patterns

This document catalogs actual failure patterns encountered and tested in the SKG Agent Prototype 2 development, extracted from the consensus testing framework, scalability tests, and integration tests.

## Consensus Failure Patterns

### Pattern: Split-Brain Scenario

**Description**: Network partition causes multiple groups to elect leaders, creating conflicting decisions.

**Detection from SKG:**
```typescript
// From ConsensusIntegration.test.ts
class NetworkPartitionSimulator {
  public createPartition(agents: string[], partitionSize: number): void {
    // Divide agents into two groups that can't communicate
    const partition1 = shuffled.slice(0, partitionSize);
    const partition2 = shuffled.slice(partitionSize);

    // Each agent can only reach agents in their partition
    for (const agent of partition1) {
      this.partitions.set(agent, new Set(partition1));
    }
    for (const agent of partition2) {
      this.partitions.set(agent, new Set(partition2));
    }
  }
}
```

**Symptoms:**
- Multiple leaders elected simultaneously
- Conflicting decisions for same proposal
- Nodes in different partitions have divergent state
- Quorum cannot be reached for system-wide decisions

**Detection Strategy:**
- Monitor for multiple agents claiming leader status
- Check if consensus metrics show <100% agreement despite no Byzantine agents
- Look for network connectivity issues in logs
- Compare state across all nodes to find divergence

**Test from SKG:**
```javascript
// Partition test scenario
{
  name: 'network_partition_recovery',
  byzantineAgentRatio: 0,
  networkPartitionRatio: 0.5,  // Split network in half
  expectedBehavior: {
    shouldReachConsensus: false,  // During partition
    maxRecoveryTime: 10000        // After partition heals
  }
}
```

**Mitigation:**
- Require quorum (majority) for decisions
- Implement leader election with epoch numbers
- Use fencing tokens to prevent stale leaders
- Add partition detection and recovery mechanisms

### Pattern: Byzantine Silent Failure

**Description**: Faulty or malicious node stops participating without announcement.

**From SKG Test Suite:**
```typescript
// From ConsensusIntegration.test.ts
enum ByzantineFailureType {
  SILENT_FAILURE = 'silent_failure',  // Node stops responding
  // ...
}

public simulateVote(agentId: string, originalVote: VoteType): VoteType {
  const failureType = this.failureTypes.get(agentId);
  if (failureType === ByzantineFailureType.SILENT_FAILURE) {
    return VoteType.ABSTAIN;  // Don't vote at all
  }
  return originalVote;
}
```

**Symptoms:**
- Consensus takes longer than expected
- Some agents never respond to proposals
- Quorum barely met or missed
- Timeout events increase

**Detection Strategy:**
- Track response times per agent
- Monitor vote participation rates
- Set timeouts for consensus operations
- Use heartbeat mechanisms

**Test Metrics from SKG:**
```typescript
interface TestMetrics {
  byzantineFailuresDetected: number;
  averageRecoveryTime: number;
  starvationEvents: number;
}
```

**Mitigation:**
- Set reasonable timeouts
- Proceed with quorum (don't wait for all nodes)
- Track agent reliability/trust scores
- Remove or isolate consistently unresponsive nodes

### Pattern: Vote Manipulation

**Description**: Byzantine node votes opposite of expected or votes multiple times.

**From SKG:**
```typescript
case ByzantineFailureType.VOTE_MANIPULATION:
  // Always vote opposite of intended
  return originalVote === VoteType.APPROVE
    ? VoteType.REJECT
    : VoteType.APPROVE;

case ByzantineFailureType.DOUBLE_VOTING:
  // Vote multiple times with different values
  // Handled at higher level
```

**Symptoms:**
- Unexpected consensus failures
- Vote counts don't match expected ratios
- Some proposals fail that should pass
- Inconsistent voting patterns from specific agents

**Detection Strategy:**
- Track voting history per agent
- Calculate expected vs actual vote distribution
- Look for agents always voting against majority
- Detect multiple votes from same agent for same proposal

**Byzantine Resistance Metric from SKG:**
```typescript
interface StatisticalAnalysis {
  byzantineResistance: number;  // 0.0 to 1.0
  // Measures: consensus success rate under Byzantine failures
}
```

**Mitigation:**
- Require supermajority (2f+1 for f Byzantine nodes)
- Implement Byzantine Fault Tolerant consensus (BFT, Raft, etc.)
- Track agent trust scores
- Use cryptographic signatures on votes

### Pattern: Consensus Timeout

**Description**: Consensus process exceeds time limit without reaching decision.

**From SKG Scalability Tests:**
```typescript
// From run-scalability-test.ts
interface TestConfiguration {
  consensusTimeoutMs: number;    // Maximum time to wait
  maxRecoveryTimeMs: number;     // Time to recover from failure
}
```

**Symptoms:**
- Operations hang indefinitely
- Timeout errors in logs
- System appears frozen
- Backlog of pending decisions grows

**Detection Strategy:**
- Monitor consensus latency metrics
- Set and enforce timeouts
- Track which proposals timeout
- Correlate timeouts with system load or specific agents

**Performance Metrics:**
```typescript
interface TestMetrics {
  averageConsensusTime: number;
  consensusTimeDistribution: number[];  // Histogram
  percentile95: number;
  percentile99: number;
}
```

**Mitigation:**
- Set realistic timeouts based on measurements
- Implement exponential backoff for retries
- Have fallback mechanisms (default decisions, escalation)
- Scale resources if timeouts correlate with load

## Message Ordering Issues

### Pattern: Causal Ordering Violation

**Description**: Effect arrives before cause due to different network paths.

**From SKG Vector Clock Implementation:**
```javascript
// From test-vector-clock-simple.js
function testCausalOrdering() {
  const clockA = new VectorClock({ nodeId: 'A' });
  const clockB = new VectorClock({ nodeId: 'B' });

  const eventA = clockA.tick('event A');
  clockB.receive(eventA);
  const eventB = clockB.tick('event B response');

  const relation = clockB.getCausalRelation(eventA, eventB);
  assert(relation.type === 'happens-before',
    'Causal relationship detected correctly');
}
```

**Symptoms:**
- State updates appear in wrong order
- Responses arrive before requests
- Dependency violations (reading data before it's written)
- Inconsistent state across replicas

**Detection Strategy:**
- Implement vector clocks or Lamport timestamps
- Check for happens-before relationships
- Log message send/receive times
- Compare logical vs physical ordering

**Mitigation:**
- Use causal ordering protocols
- Implement vector clocks for causality tracking
- Buffer messages until dependencies satisfied
- Use sequence numbers within sessions

### Pattern: Message Loss

**Description**: Network drops messages without notification.

**From SKG Network Simulator:**
```typescript
// From ConsensusIntegration.test.ts
interface TestConfiguration {
  messageLossRate: number;  // 0.0 to 1.0
}

class NetworkPartitionSimulator {
  public shouldDeliverMessage(from: string, to: string): boolean {
    // Simulate message loss
    if (Math.random() < this.messageLossRate) {
      this.logger.warn(`Message lost: ${from} -> ${to}`);
      return false;
    }
    return true;
  }
}
```

**Symptoms:**
- Operations hang waiting for responses
- Consensus never reached despite healthy nodes
- Retransmissions increase
- Timeout errors

**Detection Strategy:**
- Monitor message delivery rates
- Track timeouts and retries
- Compare sent vs received message counts
- Use acknowledgments to detect loss

**Mitigation:**
- Implement retry logic with exponential backoff
- Use reliable messaging protocols (TCP, message queues)
- Add message acknowledgments
- Set appropriate timeouts

### Pattern: Message Delay/Reordering

**Description**: Messages arrive in different order than sent due to network delays.

**From SKG:**
```typescript
interface TestConfiguration {
  messageDelayRangeMs: [number, number];  // Min/max delay
}

public simulateDelay(agentId: string): number {
  const [min, max] = this.messageDelayRange;
  return min + Math.random() * (max - min);
}
```

**Symptoms:**
- Total order violations (different nodes see different orders)
- Race conditions become visible
- State inconsistencies
- Non-deterministic behavior

**Detection Strategy:**
- Assign sequence numbers to messages
- Track message arrival order
- Compare orders across nodes
- Use logical timestamps

**Mitigation:**
- Implement total ordering protocol if needed
- Use sequence numbers and buffering
- Accept eventual consistency if possible
- Use consensus for critical ordering

## State Synchronization Issues

### Pattern: Concurrent Update Conflict

**Description**: Multiple nodes update same data simultaneously without coordination.

**From SKG CRDT Implementation:**
```javascript
// From integration-test.js
// CRDT merge functionality test
const hasMergeMethod = crdtCode.includes('public merge(');
const hasConflictResolution = crdtCode.includes('ConflictResolution');
```

**Symptoms:**
- Lost updates (last write wins, others lost)
- Inconsistent state across replicas
- Data corruption
- Merge conflicts

**Detection Strategy:**
- Track concurrent operations using vector clocks
- Monitor conflict rate
- Compare node states for divergence
- Log all state modifications with timestamps

**Mitigation:**
- Use CRDTs (Conflict-free Replicated Data Types)
- Implement optimistic locking with version numbers
- Use consensus for conflicting updates
- Implement application-specific merge logic

### Pattern: Dirty Read

**Description**: Reading uncommitted or partially updated state.

**Symptoms:**
- Reads return inconsistent or intermediate values
- State appears invalid
- Business logic fails due to invalid state
- Phantom reads

**Detection Strategy:**
- Track transaction/operation state
- Validate read results for consistency
- Monitor for isolation violations
- Check for operations on in-progress updates

**Mitigation:**
- Implement isolation levels (serializable, snapshot)
- Use read/write locks
- Only read committed state
- Use versioning for consistent reads

### Pattern: State Divergence

**Description**: Replicas end up with different state despite same operations.

**Symptoms:**
- Different nodes return different values
- Replica lag doesn't explain difference
- Permanent inconsistency
- Failed reconciliation

**Detection Strategy:**
- Periodically compare state across replicas
- Hash state and compare checksums
- Monitor synchronization metrics
- Track operations per replica

**From SKG Consensus Tests:**
```typescript
interface TestMetrics {
  linearizabilityViolations: number;
  serializabilityViolations: number;
  consistencyErrors: number;
}
```

**Mitigation:**
- Use strong consistency protocols (consensus)
- Implement state reconciliation
- Add checksums/merkle trees for verification
- Have primary/secondary synchronization

## Network Partition Patterns

### Pattern: Partition Detection Delay

**Description**: System doesn't detect partition quickly, leading to prolonged split-brain.

**From SKG:**
```typescript
interface TestConfiguration {
  maxRecoveryTimeMs: number;  // Expected partition recovery time
}

interface TestMetrics {
  networkPartitionsDetected: number;
  averageRecoveryTime: number;
}
```

**Symptoms:**
- Long periods of degraded service
- Inconsistent state persists after partition heals
- Slow to return to normal operation
- Multiple concurrent leaders

**Detection Strategy:**
- Implement heartbeat mechanisms
- Monitor network connectivity
- Use failure detectors
- Track partition events

**Mitigation:**
- Reduce heartbeat interval
- Use multiple detection mechanisms
- Implement fast failover
- Have partition recovery procedures

### Pattern: Cascading Partition Failure

**Description**: Partition in one part triggers overload in another, causing further failures.

**Symptoms:**
- Initial partition leads to resource exhaustion
- Remaining nodes overwhelmed with traffic
- System-wide degradation
- Recovery is difficult

**Detection Strategy:**
- Monitor load on individual nodes
- Track request routing after partition
- Watch for resource exhaustion
- Monitor error rates system-wide

**From SKG Metrics:**
```typescript
interface Metrics {
  cpuUtilization: number;
  memoryPerAgent: number;
  errorRate: number;
  throughput: number;  // Messages/second
}
```

**Mitigation:**
- Implement load balancing
- Add circuit breakers
- Set resource limits
- Have graceful degradation

## Performance Patterns

### Pattern: Latency Spike

**Description**: Sudden increase in response time.

**From SKG Scalability Tests:**
```typescript
interface ComplexityAnalysis {
  discoveryLatency: {
    actualComplexity: string;      // O(log n) vs O(n) vs O(n²)
    expectedComplexity: string;
    rSquared: number;
  }
}
```

**Symptoms:**
- Response times jump suddenly
- Users experience timeouts
- Operation queues grow
- System appears slow

**Detection Strategy:**
- Monitor latency percentiles (p50, p95, p99)
- Track latency distribution over time
- Correlate with system events
- Profile slow operations

**Mitigation:**
- Add caching
- Optimize hot paths
- Add timeouts and circuit breakers
- Scale resources

### Pattern: Throughput Collapse

**Description**: System throughput drops dramatically under load.

**From SKG:**
```typescript
interface TestMetrics {
  throughput: number;  // ops/second
  messageOverhead: number;
  networkUtilization: number;
}
```

**Symptoms:**
- Operations/second drops
- Queue backlogs grow
- Timeouts increase
- Resource utilization may be low (head-of-line blocking)

**Detection Strategy:**
- Monitor operations/second
- Track queue depths
- Check for blocking operations
- Profile resource utilization

**Mitigation:**
- Add parallelism/concurrency
- Remove bottlenecks
- Implement backpressure
- Add horizontal scaling

### Pattern: Resource Exhaustion

**Description**: System runs out of memory, connections, threads, or other resources.

**From SKG:**
```typescript
interface Metrics {
  memoryPerAgent: number;
  errorRate: number;

  // From scalability tests
  memoryComplexity: {
    actualComplexity: string;  // Should be O(n)
    expectedComplexity: string;
  }
}
```

**Symptoms:**
- OutOfMemory errors
- Connection refused errors
- Thread pool exhaustion
- Gradual performance degradation

**Detection Strategy:**
- Monitor resource usage over time
- Track resource allocation/deallocation
- Look for leaks (memory, connections, file handles)
- Check resource limits

**Mitigation:**
- Fix leaks
- Implement resource pooling
- Add limits and circuit breakers
- Scale resources or optimize usage

## Deadlock and Livelock Patterns

### Pattern: Distributed Deadlock

**Description**: Circular dependency across nodes prevents progress.

**Symptoms:**
- Operations hang indefinitely
- No progress despite activity
- Specific resource access patterns cause blocks
- System requires restart

**Detection Strategy:**
- Monitor for operations stuck in waiting state
- Track resource acquisition order
- Look for circular wait patterns
- Use timeout detection

**Mitigation:**
- Implement lock timeout
- Use deadlock detection algorithms
- Order resource acquisition consistently
- Use optimistic concurrency instead of locks

### Pattern: Livelock

**Description**: Nodes keep changing state without making progress.

**Symptoms:**
- High activity but no actual work done
- Operations retry continuously
- Resource usage high but throughput zero
- System appears stuck despite activity

**Detection Strategy:**
- Monitor operation retry counts
- Track progress metrics
- Look for oscillating state changes
- Check for retry storms

**Mitigation:**
- Add exponential backoff to retries
- Randomize retry timing (jitter)
- Limit maximum retries
- Add circuit breakers

---

## Summary: Detection Checklist

When debugging distributed systems, check for these patterns:

**Consensus:**
- [ ] Split-brain (multiple leaders)
- [ ] Silent failures (non-responsive nodes)
- [ ] Vote manipulation (Byzantine behavior)
- [ ] Consensus timeouts

**Messaging:**
- [ ] Causal ordering violations
- [ ] Message loss
- [ ] Message delay/reordering
- [ ] Message duplication

**State:**
- [ ] Concurrent update conflicts
- [ ] Dirty reads
- [ ] State divergence
- [ ] Incomplete synchronization

**Network:**
- [ ] Partitions
- [ ] Partition detection delay
- [ ] Cascading failures

**Performance:**
- [ ] Latency spikes
- [ ] Throughput collapse
- [ ] Resource exhaustion
- [ ] Deadlock/livelock

Use the debugging methodology in the main SKILL.md to systematically investigate suspected patterns.

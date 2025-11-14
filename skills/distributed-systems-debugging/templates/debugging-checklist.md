# Distributed Systems Debugging Checklist

Use this checklist for systematic debugging of distributed system issues. Based on methodology from SKG Agent Prototype 2 debugging experience.

## Initial Assessment

### 1. Define the Problem

- [ ] **What is the observed symptom?**
  - Describe what you're seeing (errors, timeouts, incorrect results, performance issues)
  - _Example: "Consensus operations timing out after 30 seconds"_

- [ ] **What is the expected behavior?**
  - Describe what should happen
  - _Example: "Consensus should complete within 5 seconds"_

- [ ] **When did the issue start?**
  - Exact time if known
  - Correlation with any events (deployment, config change, load increase)

- [ ] **How often does it occur?**
  - Always, intermittently, under specific conditions
  - Percentage of affected requests

- [ ] **Which components are affected?**
  - All nodes, subset of nodes, specific service
  - All operations or specific type

### 2. Gather Initial Evidence

- [ ] **Collect logs from ALL nodes** (not just failing ones)
  - Timeframe: 30 minutes before issue started to present
  - Include all severity levels (debug, info, warn, error)

- [ ] **Capture current metrics**
  - Latency (p50, p95, p99)
  - Throughput (ops/second)
  - Error rates
  - Resource usage (CPU, memory, network)

- [ ] **Document recent changes**
  - Code deployments (what, when, who)
  - Configuration changes
  - Infrastructure changes
  - Load changes

- [ ] **Check system health**
  - Are all nodes responding?
  - Any network connectivity issues?
  - Any resource exhaustion?

## Consensus Issues Checklist

Use this if issue involves consensus, voting, or coordination.

### Evidence Collection

- [ ] **Consensus metrics**
  - Number of proposals submitted
  - Number reaching consensus
  - Number failing
  - Average consensus time
  - Timeout rate

- [ ] **Agent participation**
  - Total agents in system
  - Agents responding to votes
  - Agents voting vs. abstaining
  - Vote distribution (approve/reject/abstain)

- [ ] **Network connectivity**
  - Can all agents reach each other?
  - Any partitions detected?
  - Message loss rate
  - Message latency between nodes

### Common Causes

- [ ] **Silent failures (from reference/failure-patterns.md)**
  - Some agents not responding at all
  - Check: Vote participation rate per agent
  - Expected: >90% participation for healthy agents

- [ ] **Split-brain / network partition**
  - Multiple groups making independent decisions
  - Check: Network connectivity between all nodes
  - Check: Do subsets of nodes show different state?

- [ ] **Byzantine behavior**
  - Agents voting unexpectedly or maliciously
  - Check: Vote patterns - any agents always voting opposite?
  - Check: Are some agents sending conflicting messages?

- [ ] **Quorum not met**
  - Not enough agents responding for consensus
  - Check: Required quorum size vs. responding agents
  - Check: Are enough agents online and healthy?

- [ ] **Timeout too short**
  - Legitimate operations timing out
  - Check: Average consensus time vs. timeout setting
  - Check: P95/P99 consensus time

### Resolution Steps

- [ ] **If silent failures detected:**
  - Investigate unresponsive agents (network, health)
  - Reduce required quorum if design allows
  - Implement timeout and proceed with quorum

- [ ] **If network partition:**
  - Identify partition boundaries
  - Check network infrastructure
  - Implement partition detection and recovery
  - Prevent split-brain with fencing

- [ ] **If Byzantine behavior:**
  - Identify Byzantine agents (voting patterns)
  - Implement Byzantine Fault Tolerance (BFT)
  - Reduce trust scores for suspicious agents
  - Require supermajority for decisions

- [ ] **If performance issue:**
  - Increase timeout if legitimate operations slow
  - Optimize consensus algorithm
  - Add parallel voting
  - Scale resources

## Message Ordering Issues Checklist

Use this if issue involves message delivery, ordering, or causality.

### Evidence Collection

- [ ] **Message traces**
  - Collect distributed traces with correlation IDs
  - Track message send and receive times
  - Note message sequencing

- [ ] **Vector clocks / timestamps**
  - Capture logical timestamps
  - Compare vector clocks across nodes
  - Check for causality violations

- [ ] **Network behavior**
  - Message loss rate
  - Message delay distribution
  - Out-of-order delivery rate

### Common Causes

- [ ] **Causal ordering violations**
  - Effect arrives before cause
  - Check: Vector clock relationships
  - Check: Response logged before request

- [ ] **Message loss**
  - Messages not delivered at all
  - Check: Sent vs. received message counts
  - Check: Network reliability metrics

- [ ] **Message duplication**
  - Same message processed multiple times
  - Check: Message IDs for duplicates
  - Check: Idempotency of operations

- [ ] **Message delay/reordering**
  - Messages arrive in different order than sent
  - Check: Sequence numbers
  - Check: Network latency variance

### Resolution Steps

- [ ] **For causal violations:**
  - Implement vector clocks
  - Buffer messages until dependencies satisfied
  - Use causal ordering protocol

- [ ] **For message loss:**
  - Add acknowledgments
  - Implement retry with exponential backoff
  - Use reliable transport (TCP)
  - Set appropriate timeouts

- [ ] **For duplication:**
  - Make operations idempotent
  - Track processed message IDs
  - Add deduplication logic

- [ ] **For reordering:**
  - Add sequence numbers
  - Implement total ordering if needed
  - Accept eventual consistency if possible

## State Synchronization Issues Checklist

Use this if nodes have inconsistent or divergent state.

### Evidence Collection

- [ ] **State snapshots**
  - Capture full state from all nodes
  - Calculate state hashes for comparison
  - Identify divergence points

- [ ] **Synchronization metrics**
  - Replication lag per node
  - Conflict rate
  - Merge/resolution frequency

- [ ] **Update tracking**
  - Who updated what, when
  - Concurrent update patterns
  - Vector clocks for causality

### Common Causes

- [ ] **Concurrent updates without coordination**
  - Multiple nodes updating same key simultaneously
  - Check: Vector clocks for concurrent updates
  - Check: Conflict resolution logs

- [ ] **Dirty reads**
  - Reading uncommitted or intermediate state
  - Check: Transaction isolation levels
  - Check: Read before write complete

- [ ] **Lost updates**
  - Some updates not propagated
  - Check: Update count per node
  - Check: Replication logs

- [ ] **Failed synchronization**
  - Sync operations failing silently
  - Check: Sync success rate
  - Check: Error logs from sync operations

### Resolution Steps

- [ ] **For concurrent updates:**
  - Use CRDTs for automatic merging
  - Implement optimistic locking with version numbers
  - Use consensus for conflicting updates
  - Design application-specific merge logic

- [ ] **For dirty reads:**
  - Implement proper isolation (serializable, snapshot)
  - Only read committed state
  - Use versioning for consistent reads

- [ ] **For lost updates:**
  - Implement anti-entropy (periodic sync)
  - Use merkle trees for efficient comparison
  - Add checksums to detect divergence

- [ ] **For sync failures:**
  - Add retry logic
  - Implement reconciliation protocol
  - Alert on persistent divergence

## Performance Issues Checklist

Use this for latency spikes, throughput drops, or resource exhaustion.

### Evidence Collection

- [ ] **Performance metrics**
  - Latency distribution (mean, p50, p95, p99, max)
  - Throughput (ops/second)
  - Resource usage (CPU, memory, network, disk)
  - Queue depths

- [ ] **Profiling data**
  - CPU profile (hot functions)
  - Memory profile (allocations, leaks)
  - I/O profile (network, disk)

- [ ] **Load characteristics**
  - Request rate over time
  - Request size distribution
  - Operation types

### Common Causes

- [ ] **Resource exhaustion**
  - Out of memory
  - CPU saturation
  - Connection pool exhaustion
  - Thread pool exhaustion

- [ ] **Algorithmic complexity issues**
  - O(n²) behavior at scale
  - Inefficient data structures
  - Unnecessary work

- [ ] **Bottlenecks**
  - Single-threaded components
  - Synchronous blocking operations
  - Head-of-line blocking
  - Lock contention

- [ ] **Network issues**
  - High latency
  - Low bandwidth
  - Packet loss

### Resolution Steps

- [ ] **For resource exhaustion:**
  - Fix memory leaks
  - Add resource pooling
  - Increase limits
  - Scale horizontally

- [ ] **For complexity issues:**
  - Profile and optimize hot paths
  - Use better algorithms/data structures
  - Add caching
  - Implement pagination

- [ ] **For bottlenecks:**
  - Add parallelism/concurrency
  - Make operations asynchronous
  - Remove unnecessary synchronization
  - Distribute load

- [ ] **For network issues:**
  - Optimize network calls (batching)
  - Add caching
  - Use CDN if applicable
  - Check infrastructure

## Network Partition Checklist

Use this if nodes can't communicate or system is split.

### Evidence Collection

- [ ] **Network connectivity**
  - Ping tests between all nodes
  - Traceroute to identify break points
  - Network topology map

- [ ] **Partition detection**
  - When was partition first detected?
  - Which nodes can/can't reach which?
  - Is it complete partition or partial?

- [ ] **System behavior during partition**
  - Did both sides continue operating?
  - Did either side elect leader?
  - Was data modified on both sides?

### Common Causes

- [ ] **Network infrastructure failure**
  - Switch/router failure
  - Cable disconnection
  - Firewall misconfiguration

- [ ] **Datacenter partition**
  - WAN link failure between datacenters
  - Cross-region connectivity loss

- [ ] **Software issues**
  - Firewall rules
  - Security groups
  - DNS issues

### Resolution Steps

- [ ] **Immediate:**
  - Determine which partition has quorum
  - Fence other partition (prevent writes)
  - Serve reads from quorum side only

- [ ] **Recovery:**
  - Fix network connectivity
  - Verify all nodes can communicate
  - Reconcile state between partitions
  - Verify data consistency

- [ ] **Prevention:**
  - Implement partition detection
  - Use fencing/quorum to prevent split-brain
  - Design for partition tolerance
  - Test partition scenarios regularly

## Final Verification

After fixing the issue:

- [ ] **Reproduce the original issue** (before fix)
- [ ] **Apply the fix**
- [ ] **Verify fix resolves issue** (test multiple times)
- [ ] **Check for regressions** (other functionality still works)
- [ ] **Add monitoring** (detect similar issues early)
- [ ] **Add regression test** (prevent recurrence)
- [ ] **Document findings** (root cause, fix, prevention)
- [ ] **Update runbooks** (add to operational procedures)

## Documentation Template

After debugging, document your findings:

```markdown
## Issue: [Title]

**Date**: YYYY-MM-DD
**Severity**: Critical/High/Medium/Low
**Status**: Resolved/Mitigated/Monitoring

### Symptoms
- What was observed
- Impact (users affected, services down, etc.)

### Root Cause
- Actual cause of the issue
- Why it happened

### Investigation Process
1. Evidence collected
2. Hypotheses tested
3. How root cause was identified

### Resolution
- What was done to fix
- Verification steps

### Prevention
- Changes to prevent recurrence
- Monitoring added
- Tests added

### References
- Relevant logs, traces, metrics
- Related tickets, documentation
```

## Quick Reference

**Run automated analysis:**
```bash
# Check for common issues
python scripts/debug-distributed-system.py --logs ./logs/*.log --check all --report report.md

# Analyze specific trace
python scripts/trace-analyzer.py --logs ./logs/*.log --trace-id abc123 --visualize
```

**Key metrics to check:**
- Consensus time (should be <5s)
- Error rate (should be <1%)
- Response time p99 (should be <1s)
- Agent participation (should be >90%)

**Common failure patterns:**
See `reference/failure-patterns.md` for detailed catalog.

**Debugging methodology:**
See `reference/debugging-methodology.md` for step-by-step process.

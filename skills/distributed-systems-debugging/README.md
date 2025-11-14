# Distributed Systems Debugging Skill

Comprehensive skill for debugging distributed systems, multi-agent coordination, consensus failures, and distributed state issues. Based on real debugging experiences from SKG Agent Prototype 2 development.

## Quick Start

### Invoke the Skill

Claude automatically invokes this skill when you encounter distributed systems debugging tasks:
- Debugging consensus failures
- Investigating message ordering issues
- Resolving state synchronization bugs
- Analyzing network partitions
- Performance debugging in distributed systems

### Immediate Actions

**If you're debugging right now:**

1. **Use the debugging checklist:**
   ```
   See templates/debugging-checklist.md
   ```
   Follow the systematic checklist for your issue type (consensus, messaging, state sync, etc.)

2. **Run automated analysis:**
   ```bash
   # Analyze logs for common issues
   python scripts/debug-distributed-system.py \
     --logs ./logs/*.log \
     --check all \
     --report debug-report.md

   # Analyze specific trace
   python scripts/trace-analyzer.py \
     --logs ./logs/*.log \
     --trace-id abc123 \
     --visualize
   ```

3. **Check failure patterns:**
   ```
   See reference/failure-patterns.md
   ```
   Match your symptoms to known patterns

## What This Skill Provides

### 1. Systematic Debugging Methodology

**Four-step process** (from `reference/debugging-methodology.md`):
1. **Observe**: Collect evidence from all nodes, logs, metrics, traces
2. **Hypothesize**: Form testable theories about root cause
3. **Test**: Design experiments to validate hypotheses
4. **Verify**: Confirm fix resolves issue without regressions

**Based on actual SKG debugging experiences** - not theoretical approaches.

### 2. Comprehensive Failure Pattern Catalog

**27 documented failure patterns** (from `reference/failure-patterns.md`):

**Consensus failures:**
- Split-brain scenarios
- Byzantine silent failures
- Vote manipulation
- Consensus timeouts

**Message ordering:**
- Causal ordering violations
- Message loss and duplication
- Message delay and reordering

**State synchronization:**
- Concurrent update conflicts
- Dirty reads
- State divergence

**Network partitions:**
- Partition detection delays
- Cascading failures
- Split-brain recovery

**Performance:**
- Latency spikes
- Throughput collapse
- Resource exhaustion
- Deadlock/livelock

Each pattern includes:
- Detection strategy
- Test code from SKG
- Mitigation approaches
- Real examples

### 3. Debugging Tools and Scripts

**`scripts/debug-distributed-system.py`**
- Analyzes logs for consensus issues
- Detects message ordering problems
- Identifies state synchronization bugs
- Finds network partition symptoms
- Generates markdown debug report

**`scripts/trace-analyzer.py`**
- Reconstructs distributed traces
- Analyzes message flows
- Identifies bottlenecks
- Visualizes causal chains
- Detects anomalies

**Usage examples:**
```bash
# Check all issue types
python scripts/debug-distributed-system.py --logs ./logs/*.log --check all

# Check specific issue
python scripts/debug-distributed-system.py --logs ./logs/*.log --check consensus

# Analyze trace
python scripts/trace-analyzer.py --logs ./logs/*.log --trace-id xyz --visualize

# Analyze message flows
python scripts/trace-analyzer.py --logs ./logs/*.log --analyze-flow
```

### 4. Monitoring Strategies

**From SKG metrics-initialization.ts** (`reference/monitoring-strategies.md`):

**Essential metrics:**
- Latency (agent-to-agent, consensus, discovery)
- Throughput (messages/second, tasks/second)
- Resources (CPU, memory, network)
- Errors (error rate, Byzantine detections, timeouts)
- Consistency (state divergence, sync lag, violations)

**Monitoring patterns:**
- Baseline and deviation detection
- Multi-level aggregation (node, cluster, global)
- Health checks
- Real-time dashboards
- Alert thresholds

**Performance analysis:**
- Complexity analysis (O(log n) vs O(n) vs O(n²))
- Percentile tracking (p50, p95, p99)
- Correlation detection

### 5. Real Debugging Sessions

**Four detailed case studies** (`examples/real-debugging-sessions.md`):

1. **Consensus timeouts under load**
   - Symptom: Timeouts at 300+ agents
   - Root cause: O(n²) message pattern
   - Resolution: Parallel broadcasting, message batching
   - Result: O(n²) → O(n) complexity

2. **Silent Byzantine failures**
   - Symptom: Random consensus failures
   - Root cause: Decision logic bug + silent error handling
   - Resolution: Fixed decision logic, explicit error reporting
   - Result: 10% → 99.9% success rate

3. **State divergence after partition**
   - Symptom: Inconsistent state persisting after partition heals
   - Root cause: No reconciliation logic
   - Resolution: Vector clock-based conflict resolution
   - Result: Automatic reconciliation in <2 seconds

4. **Memory leak in agent communication**
   - Symptom: 100MB/hour memory growth
   - Root cause: Unbounded message history + event listener leaks
   - Resolution: Bounded collections, cleanup listeners
   - Result: Stable memory usage

Each session shows:
- Investigation process
- Hypotheses tested
- Root cause found
- Fix implemented
- Lessons learned

### 6. Debugging Checklists

**Systematic checklists for common scenarios** (`templates/debugging-checklist.md`):

- Initial assessment
- Consensus issues
- Message ordering issues
- State synchronization issues
- Performance issues
- Network partitions

Each checklist includes:
- Evidence to collect
- Common causes to check
- Resolution steps
- Verification procedures

## File Organization

```
distributed-systems-debugging/
├── SKILL.md                          # Main skill file (invoked by Claude)
├── README.md                         # This file
│
├── reference/
│   ├── failure-patterns.md          # 27 failure patterns from SKG
│   ├── debugging-methodology.md     # 4-step systematic process
│   └── monitoring-strategies.md     # Metrics and monitoring patterns
│
├── scripts/
│   ├── debug-distributed-system.py  # Automated log analysis
│   └── trace-analyzer.py            # Distributed trace analysis
│
├── templates/
│   └── debugging-checklist.md       # Step-by-step checklists
│
└── examples/
    └── real-debugging-sessions.md   # 4 real case studies from SKG
```

## Common Use Cases

### Use Case 1: Consensus Not Reaching Agreement

```bash
# 1. Check failure patterns
grep -A 10 "Consensus Failure Patterns" reference/failure-patterns.md

# 2. Run automated analysis
python scripts/debug-distributed-system.py --logs ./logs/*.log --check consensus

# 3. Follow checklist
# See templates/debugging-checklist.md -> "Consensus Issues Checklist"

# 4. Check similar real case
# See examples/real-debugging-sessions.md -> "Session 2: Silent Byzantine Failures"
```

### Use Case 2: State Divergence Between Nodes

```bash
# 1. Compare state across nodes
# Collect state snapshots from all nodes

# 2. Check patterns
grep -A 10 "State Divergence" reference/failure-patterns.md

# 3. Run analysis
python scripts/debug-distributed-system.py --logs ./logs/*.log --check state-sync

# 4. Follow checklist
# See templates/debugging-checklist.md -> "State Synchronization Issues Checklist"

# 5. Check real case
# See examples/real-debugging-sessions.md -> "Session 3: State Divergence After Network Partition"
```

### Use Case 3: Performance Degradation at Scale

```bash
# 1. Collect performance metrics
# Latency, throughput, resource usage

# 2. Check monitoring strategies
# See reference/monitoring-strategies.md -> "Performance Analysis Tools"

# 3. Run scalability analysis
# Similar to SKG run-scalability-test.ts

# 4. Check complexity
# Compare actual vs expected complexity (O(log n) vs O(n) vs O(n²))

# 5. Check real case
# See examples/real-debugging-sessions.md -> "Session 1: Consensus Timeouts Under Load"
```

### Use Case 4: Message Ordering Issues

```bash
# 1. Analyze traces
python scripts/trace-analyzer.py --logs ./logs/*.log --trace-id abc123

# 2. Check patterns
grep -A 10 "Message Ordering Issues" reference/failure-patterns.md

# 3. Visualize message flow
python scripts/trace-analyzer.py --logs ./logs/*.log --analyze-flow --visualize

# 4. Follow checklist
# See templates/debugging-checklist.md -> "Message Ordering Issues Checklist"
```

## Integration with Other Skills

This skill complements and references:

- **Evidence-Based Validation**: Use for verifying debugging claims and metrics
- **Multi-Agent Orchestration**: Reference for understanding coordination patterns
- **MCP Server Development**: Reference for debugging communication protocols

## Limitations

This skill **cannot**:
- Automatically fix all distributed system bugs
- Guarantee root cause identification in all cases
- Replace domain knowledge of your specific system
- Debug without access to logs, metrics, or traces
- Solve issues caused by hardware failures without diagnostics

**Distributed debugging is inherently difficult because:**
- Heisenberg effect: Observing can change behavior
- Non-reproducibility: Timing-dependent bugs may not reproduce
- Incomplete information: Can't observe all nodes simultaneously
- Emergent complexity: System behavior not predictable from components

## Evidence-Based Approach

All content in this skill is based on:
- **Real debugging experiences** from SKG Agent Prototype 2 development
- **Actual test code** from consensus testing framework
- **Measured metrics** from scalability tests
- **Documented incidents** with root cause analysis

**No fabricated scenarios or theoretical-only patterns.**

Claims are supported by:
- References to specific SKG source files
- Test results with actual numbers
- Code examples from implementations
- Debugging session documentation

## Quick Reference

**Most common issues:**
1. Consensus timeouts → Check `reference/failure-patterns.md` consensus section
2. State divergence → See `examples/real-debugging-sessions.md` session 3
3. Performance degradation → See `reference/monitoring-strategies.md` performance section
4. Network partitions → Check `reference/failure-patterns.md` partition section

**Most useful tools:**
1. `scripts/debug-distributed-system.py` - First line of automated analysis
2. `templates/debugging-checklist.md` - Systematic debugging process
3. `reference/failure-patterns.md` - Pattern matching for your symptoms
4. `examples/real-debugging-sessions.md` - Learn from real cases

**Key methodology:**
1. **Collect evidence from ALL nodes** (not just failing ones)
2. **Form multiple hypotheses** (don't fixate on first idea)
3. **Test systematically** (eliminate possibilities)
4. **Verify fix** (does it actually solve the problem?)
5. **Add tests** (prevent recurrence)

## Getting Help

1. **Start with SKILL.md** - Main overview and methodology
2. **Use the checklist** - `templates/debugging-checklist.md`
3. **Run automated tools** - `scripts/debug-distributed-system.py`
4. **Match patterns** - `reference/failure-patterns.md`
5. **Learn from examples** - `examples/real-debugging-sessions.md`

## Contributing

This skill is based on real experiences. To improve it:
- Document new debugging sessions with full investigation process
- Add new failure patterns with test code
- Enhance scripts with additional analyses
- Update monitoring strategies with new metrics

All additions should be:
- Based on actual experiences (not theoretical)
- Include code examples or references
- Document what worked and what didn't
- Provide evidence for claims

---

**Remember**: Distributed systems debugging requires patience, systematic methodology, and healthy skepticism. Don't trust your assumptions - verify with evidence.

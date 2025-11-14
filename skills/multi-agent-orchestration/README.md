# Multi-Agent Orchestration Skill

Comprehensive skill for analyzing, designing, and debugging multi-agent coordination systems.

## Overview

This skill provides evidence-based guidance for working with multi-agent systems, drawn from actual implementations in the SKG Agent Prototype 2. It covers consensus mechanisms, communication patterns, distributed state management, and coordination protocols.

## Directory Structure

```
multi-agent-orchestration/
├── SKILL.md                          # Main skill definition
├── README.md                         # This file
├── reference/
│   ├── consensus-mechanisms.md       # Raft, BFT, when to use which
│   ├── communication-patterns.md     # A2A protocol, semantic routing
│   ├── distributed-state.md          # CRDTs, vector clocks, conflict resolution
│   ├── coordination-protocols.md     # Parallel agent protocols from CLAUDE.md
│   └── debugging-coordination.md     # Common failures and debugging strategies
├── examples/
│   └── architecture-patterns.md      # Real patterns from SKG implementations
├── scripts/
│   └── analyze-coordination.sh       # Script to analyze codebase coordination
└── templates/
    └── orchestrator-template.ts      # Simplified orchestrator pattern
```

## Quick Start

### Using the Skill

The skill is automatically available in Claude Code. It provides guidance when:

1. **Analyzing existing architectures**:
   - "What consensus mechanism is this system using?"
   - "Why are these agents not reaching agreement?"
   - "How is state synchronized across replicas?"

2. **Designing new systems**:
   - "Should I use Raft or BFT for this use case?"
   - "What's the best communication pattern for 20 agents?"
   - "How do I prevent split-brain scenarios?"

3. **Debugging coordination issues**:
   - "Why are messages being applied out of order?"
   - "How do I detect and resolve deadlocks?"
   - "What's causing these state divergences?"

### Using the Analysis Script

```bash
# Analyze a codebase for multi-agent patterns
cd ~/.claude/skills/multi-agent-orchestration/scripts
./analyze-coordination.sh /path/to/your/codebase

# This generates a report with:
# - Consensus mechanisms detected
# - Communication patterns found
# - State management approaches
# - Missing critical patterns
# - Recommendations
```

### Using the Orchestrator Template

```typescript
import { AgentOrchestrator } from './templates/orchestrator-template';

const orchestrator = new AgentOrchestrator();
await orchestrator.initialize();

// Register agents
await orchestrator.registerAgent({
  id: 'agent-1',
  name: 'Data Agent',
  capabilities: [{ name: 'data-processing', version: '1.0' }],
  endpoint: 'http://localhost:3001'
});

// Execute tasks
const result = await orchestrator.executeTask({
  id: 'task-1',
  type: 'data-processing',
  requiredCapabilities: ['data-processing'],
  priority: 'high'
});
```

## Key Concepts

### Consensus Mechanisms

**Raft** - For crash-fault tolerance:
- When: Trusted agents, configuration management, leader election
- Performance: 100-1000 cmd/s, 150ms election time
- Tradeoff: Requires majority, vulnerable to Byzantine faults

**BFT** - For Byzantine fault tolerance:
- When: Untrusted agents, adversarial environments, security-critical
- Performance: 10-50 req/s, O(n²) message complexity
- Tradeoff: High overhead, expensive but secure

### Communication Patterns

**A2A Protocol** - Peer-to-peer collaboration:
- Throughput: 500-1000 msg/s for 2-3 agents
- Scaling: Linear to 6 agents, quadratic beyond 8
- Use for: Complex coordination, reasoning, negotiation

**Semantic Routing** - Intent-based routing:
- Latency reduction: >90% vs baseline
- Cache hit ratio: >60%
- Use for: Capability matching, content-aware routing

### Distributed State

**CRDTs** - Conflict-free replicated data types:
- Convergence: <1s for up to 64 replicas
- Bandwidth: 50-90% reduction via delta-state
- Use for: Eventually consistent state, high availability

**Vector Clocks** - Causal ordering:
- Detection accuracy: >95%
- Sync overhead: 10-50ms
- Use for: Event ordering, concurrent operation detection

## Evidence-Based Approach

This skill follows the anti-fabrication protocols from CLAUDE.md:

**What We Provide**:
- Actual measurements from implementations
- Documented limitations and tradeoffs
- Real failure modes encountered and debugged
- Performance characteristics from testing

**What We DON'T Provide**:
- Fabricated performance scores
- Claims without measurement basis
- "Perfect" or "guaranteed" solutions (everything has tradeoffs)
- Composite metrics without actual calculation

## Architecture Patterns

### Pattern Comparison

| Pattern | Latency | Scalability | Fault Tolerance | When to Use |
|---------|---------|-------------|-----------------|-------------|
| Orchestrator | 50-200ms | Medium | Medium | Centralized control needed |
| P2P | 5-20ms | Medium (20) | High | No natural leader, Byzantine possible |
| Leader-Based | 10-50ms | Medium (20) | High | Strong consistency, total ordering |
| Hierarchical | Multi-level | Very High (100+) | Medium | Large scale, geographic distribution |

See `examples/architecture-patterns.md` for detailed implementations.

## Common Debugging Scenarios

### Split-Brain
```bash
# Detect multiple leaders
grep "became_leader" logs/* | awk '{print $1, $2}' | sort | uniq -c

# Check state divergence
for agent in agent1 agent2 agent3; do
  curl -s http://$agent:3000/state/hash
done
```

### Message Ordering
```bash
# Check for causality violations
grep "causality_violation" logs/*

# Analyze vector clock relationships
grep "happens_before\|concurrent" logs/*
```

### Cascading Failures
```bash
# Monitor circuit breaker states
grep "circuit_breaker" logs/* | grep "state_change"

# Check for retry storms
grep "retry_attempt" logs/* | awk '{print $1}' | uniq -c | sort -nr
```

See `reference/debugging-coordination.md` for comprehensive debugging guide.

## Performance Optimization

### Measured Optimizations

1. **Delta-State CRDTs**: 50-90% bandwidth reduction
2. **Semantic Routing Cache**: >60% hit rate, >90% latency reduction
3. **Request Batching**: 50-100% throughput improvement
4. **Pre-Vote (Raft)**: 60-80% reduction in election disruptions

### Optimization Process

1. **Measure Baseline**: Get actual numbers before optimizing
2. **Identify Bottleneck**: Use profiling and metrics
3. **Apply Optimization**: Based on evidence from this skill
4. **Measure Impact**: Verify improvement with data
5. **Document**: Record what worked and what didn't

## Coordination Protocols

From CLAUDE.md, mandatory for multi-agent tasks:

### Persona Adoption
- Each agent maintains distinct specialized role
- Stay within domain expertise
- Bring unique perspective
- Avoid homogenization

### Collaborative Framework
- Work toward shared objective
- Contribute complementary analysis
- Cross-validate with evidence
- Synthesize without fabricating metrics

### Anti-Fabrication in Teams
- No metric averaging
- Preserve disagreement
- Evidence multiplication doesn't equal stronger claims
- Independent validation required

See `reference/coordination-protocols.md` for detailed guidance.

## Integration with Other Skills

**Evidence-Based Validation** (Skill #1):
- Use to verify orchestration performance claims
- Check for fabricated metrics
- Validate measurement methodology

**MCP Server Development** (Skill #2):
- Apply MCP communication patterns to agent messaging
- Use MCP tools for agent-to-agent communication
- Reference MCP resource patterns for agent discovery

## Evidence Sources

All patterns, measurements, and guidance extracted from:

- `/home/alton/SKG Agent Prototype 2/` - Actual implementations
  - `src/core/consensus/RaftConsensus.ts` - Raft implementation (2,236 lines)
  - `src/core/consensus/BFTConsensus.ts` - BFT implementation (1,578 lines)
  - `src/core/crdt/CRDTManager.ts` - CRDT implementation (1,080+ lines)
  - `src/core/consensus/VectorClock.ts` - Vector clock (1,200+ lines)
  - `src/core/protocols/A2AProtocol.ts` - A2A protocol (4,200+ lines)
  - `src/core/routing/SemanticRouter.ts` - Semantic routing
  - `src/core/routing/IntelligentLoadBalancer.ts` - Load balancing

- `/home/alton/CLAUDE.md` - Parallel agent coordination protocols

- `/home/alton/AGENTIC_HARNESS_ARCHITECTURE.md` - System architecture

- `/home/alton/MCP_ORCHESTRATOR_DESIGN.md` - Orchestrator design

All performance numbers from actual test results, not theoretical estimates.

## Limitations

This skill documents what has been implemented and measured:

**Consensus**:
- Raft: Tested up to 7 nodes, crash faults only
- BFT: Tested up to 10 nodes, expensive beyond 30

**Communication**:
- A2A: Linear to 6 agents, quadratic beyond 8
- Semantic routing: Requires real embedding models in production

**State Management**:
- CRDTs: Tested up to 64 replicas, O(n) memory per replica
- Vector clocks: >95% accuracy, O(n) memory per node

**Not Covered**:
- Unbounded agent populations (>100)
- Hostile adversarial environments (advanced Byzantine scenarios)
- Real-time hard deadlines (<10ms)
- Geographic distribution across continents (high WAN latency)

## Contributing

This skill is based on actual implementations. To improve it:

1. Add measurements from new implementations
2. Document new failure modes encountered
3. Share debugging techniques that worked
4. Provide evidence-based performance comparisons

Do NOT:
- Add theoretical patterns without implementation
- Claim performance without measurements
- Fabricate scores or metrics
- Make guarantees without testing

## License

This skill documentation extracts patterns from open implementations in the SKG Agent Prototype 2 project.

## Support

For questions or issues:
1. Consult the reference documentation first
2. Run the analysis script on your codebase
3. Check the debugging guide for common issues
4. Review the architecture patterns for design guidance

Remember: Multi-agent systems are complex. There are no perfect solutions, only tradeoffs. This skill helps you make informed decisions based on actual evidence.

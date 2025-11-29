# Example: System Architecture Research & Analysis

## Scenario
User wants to analyze an existing microservices architecture to identify bottlenecks and provide optimization recommendations.

## Orchestrator Analysis

### Step 1: Task Decomposition
```
Keywords detected:
- "analyze" → safety-research-workflow
- "architecture" → multi-agent-orchestration
- "bottlenecks" → distributed-systems-debugging
- "optimization recommendations" → evidence-based-engineering
- "microservices" → agent-communication-system
```

### Step 2: Skill Activation Sequence

```mermaid
graph LR
    A[User Request] --> B[safety-research-workflow]
    B --> C[evidence-based-engineering]
    C --> D[multi-agent-orchestration]
    D --> E[agent-communication-system]
    E --> F[distributed-systems-debugging]
    F --> G[evidence-based-validation]
    G --> H[Research Report]
```

### Step 3: Execution Flow

#### Phase 1: Research Methodology
```
Skill: safety-research-workflow
Action: Establish systematic analysis approach
Output:
1. Research Questions:
   - What is the current architecture topology?
   - Where are the performance bottlenecks?
   - What are the failure modes?
   - Which optimizations provide most value?

2. Methodology:
   - Static analysis of code and configs
   - Dynamic analysis via distributed tracing
   - Load testing with failure injection
   - Cost-benefit analysis of optimizations

3. Success Criteria:
   - Identify top 3 bottlenecks with metrics
   - Propose optimizations with ROI estimates
   - Validate improvements experimentally
```

#### Phase 2: Evidence Baseline
```
Skill: evidence-based-engineering
Action: Establish measurement framework
Output:
- Metrics Collection:
  * Request latency (P50, P99, P99.9)
  * Throughput (requests/second)
  * Error rates by service
  * Resource utilization (CPU, memory, network)

- Measurement Tools:
  * Prometheus for metrics
  * Jaeger for distributed tracing
  * K6 for load testing

- Current Baseline:
  * P99 latency: 1,247ms (measured)
  * Throughput: 432 req/s (measured)
  * Error rate: 2.3% (measured)
```

#### Phase 3: Architecture Analysis
```
Skill: multi-agent-orchestration
Action: Analyze service coordination patterns
Output:
- Architecture Pattern: Event-driven microservices
- Services Identified: 12 services, 3 databases
- Coordination Issues:
  * Synchronous cascade in checkout flow
  * No circuit breakers on critical path
  * Missing service mesh for observability
  * Unbounded retry storms detected

- Critical Path Analysis:
  * User request → API Gateway → Auth → Product → Inventory → Payment
  * Bottleneck: Inventory service (sequential DB calls)
```

#### Phase 4: Communication Analysis
```
Skill: agent-communication-system
Action: Examine inter-service protocols
Output:
- Protocol Analysis:
  * 67% REST over HTTP/1.1 (measured)
  * 23% gRPC (measured)
  * 10% Message queue (RabbitMQ)

- Communication Issues:
  * No connection pooling (178ms overhead)
  * JSON serialization cost (43ms average)
  * Missing compression (3.2x payload reduction possible)
  * No request coalescing

- Message Flow Problems:
  * N+1 queries in product service
  * Chatty protocols (17 calls for one user action)
```

#### Phase 5: System Debugging
```
Skill: distributed-systems-debugging
Action: Deep dive into bottlenecks
Output:
- Bottleneck #1: Inventory Service
  * Root Cause: Sequential database queries
  * Impact: 423ms added to critical path
  * Fix: Parallelize queries, add caching

- Bottleneck #2: Payment Gateway Timeout
  * Root Cause: Fixed 5-second timeout
  * Impact: 12% of requests timeout
  * Fix: Implement exponential backoff

- Bottleneck #3: Auth Service CPU
  * Root Cause: BCrypt rounds = 15
  * Impact: 89% CPU utilization
  * Fix: Reduce to 12 rounds, add rate limiting

- Trace Analysis:
  * Span analysis shows 67% time in I/O wait
  * Network latency accounts for 23% of P99
```

#### Phase 6: Validation
```
Skill: evidence-based-validation
Action: Verify findings and recommendations
Output:
- Bottleneck Verification:
  ✓ Inventory: Confirmed 423ms impact
  ✓ Payment: Confirmed 12% timeout rate
  ✓ Auth: Confirmed CPU bottleneck

- Optimization Testing:
  * Inventory fix: 423ms → 67ms (tested)
  * Payment fix: 12% → 0.8% timeouts (tested)
  * Auth fix: 89% → 34% CPU (tested)

- Overall Impact:
  * P99 latency: 1,247ms → 456ms (63% reduction)
  * Throughput: 432 → 891 req/s (106% increase)
  * Error rate: 2.3% → 0.4% (83% reduction)
```

## Research Report Structure

### Executive Summary
```markdown
## Microservices Architecture Analysis

### Key Findings
1. Three critical bottlenecks limit system performance
2. Current architecture can support 2x load with optimizations
3. Investment of 2 sprint's work yields 106% throughput improvement

### Metrics-Driven Evidence
- All findings based on measured, not estimated data
- Testing performed under production-like load
- Improvements validated in staging environment
```

### Detailed Analysis
```markdown
## Bottleneck Analysis

### 1. Inventory Service (Critical Path)
**Evidence:** Distributed traces show 423ms P99 latency
**Root Cause:** Sequential database queries (code review confirmed)
**Solution:** Parallelize queries using Promise.all()
**Validated Impact:** 423ms → 67ms (84% reduction)

### 2. Payment Gateway Integration
**Evidence:** 12% timeout rate in production logs
**Root Cause:** Hard-coded 5-second timeout
**Solution:** Exponential backoff with jitter
**Validated Impact:** 12% → 0.8% timeout rate

### 3. Authentication Service
**Evidence:** CPU metrics show 89% utilization
**Root Cause:** BCrypt rounds = 15 (excessive for use case)
**Solution:** Reduce to 12 rounds + rate limiting
**Validated Impact:** 89% → 34% CPU usage
```

### Recommendations Priority Matrix
```markdown
| Optimization | Effort | Impact | ROI | Priority |
|-------------|--------|--------|-----|----------|
| Inventory parallel queries | 2 days | 423ms reduction | High | P0 |
| Payment backoff | 1 day | 11.2% error reduction | High | P0 |
| Auth optimization | 3 days | 55% CPU reduction | Medium | P1 |
| gRPC migration | 2 weeks | 23% latency reduction | Medium | P2 |
| Service mesh | 1 month | Observability | Low | P3 |
```

## Orchestrator Coordination

### Skill Handoff Sequence
```
Research Workflow → Evidence Engineering
- Handoff: Research questions and methodology
- Receive: Measurement framework

Evidence Engineering → Multi-Agent Orchestration
- Handoff: Baseline metrics and tools
- Receive: Architecture patterns and issues

Multi-Agent → Communication System
- Handoff: Service topology and dependencies
- Receive: Protocol analysis and issues

Communication → Distributed Debugging
- Handoff: Communication bottlenecks
- Receive: Root cause analysis

Distributed Debugging → Evidence Validation
- Handoff: Identified fixes and predictions
- Receive: Validated improvements

All Skills → Research Workflow
- Synthesis into final research report
```

### Conflict Resolution Example

**Conflict:** Multi-agent-orchestration suggests event sourcing, but distributed-systems-debugging shows event store is bottleneck.

**Orchestrator Resolution:**
1. Return to research workflow for methodology guidance
2. Evidence-based-engineering measures both approaches
3. Cost-benefit analysis performed
4. Decision: Fix existing bottleneck first, consider event sourcing for v2

## Lessons Learned

1. **Research Requires All Skills**: Complex analysis benefits from complete skill activation
2. **Methodology Drives Process**: Research workflow provides structure
3. **Evidence Prevents Assumptions**: Every claim must be measured
4. **Architecture Knowledge Essential**: Multi-agent skills reveal patterns
5. **Debugging Provides Truth**: Real bottlenecks often differ from assumptions

## Final Validation Summary

All recommendations have been:
- ✓ Measured in current state
- ✓ Tested with proposed fixes
- ✓ Validated with production-like load
- ✓ Documented with evidence
- ✓ Prioritized by ROI
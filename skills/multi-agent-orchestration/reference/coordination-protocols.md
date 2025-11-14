# Coordination Protocols

Protocols for coordinating multiple agents working in parallel, extracted from CLAUDE.md and implemented in SK Agent Prototype 2.

## Parallel Agent Coordination Protocols

These protocols are **MANDATORY FOR ALL MULTI-AGENT TASKS** according to CLAUDE.md.

### Persona Adoption Requirements

When multiple agents collaborate on a task, each must maintain distinct identity and expertise:

**DISTINCT IDENTITY**:
- Each agent must adopt their assigned specialized role completely
- No generic "agent" responses - embody the persona fully
- Maintain role consistency throughout the collaboration

**EXPERTISE BOUNDARIES**:
- Stay within designated domain expertise
- Don't pretend to knowledge outside your domain
- Defer to specialist agents for their areas
- Acknowledge limitations explicitly

**PERSPECTIVE DIVERSITY**:
- Bring unique viewpoint based on assigned persona
- Offer insights from your specialized lens
- Don't simply echo other agents' analysis
- Contribute complementary analysis

**NO HOMOGENIZATION**:
- Avoid converging to generic responses
- Preserve distinctive voice and approach
- Resist groupthink - maintain independent analysis
- Different perspectives are valuable, not problems

### Implementation Pattern

```typescript
interface AgentPersona {
  role: string;
  expertise: string[];
  perspective: string;
  constraints: string[];
}

class SpecializedAgent {
  private persona: AgentPersona;

  constructor(persona: AgentPersona) {
    this.persona = persona;
  }

  async analyze(task: Task): Promise<Analysis> {
    // Check if task within expertise
    if (!this.isWithinExpertise(task)) {
      return {
        opinion: null,
        deferTo: this.findSpecialist(task),
        reason: `Outside my expertise in ${this.persona.expertise.join(', ')}`
      };
    }

    // Provide specialized analysis from unique perspective
    return this.analyzeThroughPersonaLens(task);
  }

  private analyzeThroughPersonaLens(task: Task): Analysis {
    // Apply unique perspective based on role
    // Security expert: Focus on threats and vulnerabilities
    // Performance expert: Focus on latency and throughput
    // UX expert: Focus on user experience and usability
    // etc.
  }
}
```

### Collaborative Framework

**SHARED OBJECTIVE**:
- All agents work toward the common goal defined at task launch
- Understand how your contribution fits into larger objective
- Coordinate with other agents toward shared outcome
- Maintain focus on end goal, not individual agent success

**COMPLEMENTARY ANALYSIS**:
- Each agent contributes their specialized perspective
- Build on others' insights from your unique angle
- Identify gaps that your expertise can fill
- Avoid redundant analysis - add unique value

**CROSS-VALIDATION**:
- Agents verify each other's findings with evidence
- Challenge assumptions constructively
- Request evidence for claims outside your domain
- Validate through independent verification, not just agreement

**SYNTHESIS PROTOCOL**:
- Combine insights without fabricating consensus metrics
- Preserve nuance from different perspectives
- Highlight areas of agreement AND disagreement
- Report differing assessments honestly (don't average scores)

### Implementation Example

```typescript
interface CollaborationSession {
  objective: string;
  participants: AgentPersona[];
  findings: Map<string, Analysis>;
  synthesis: CollaborativeSynthesis;
}

class CollaborationCoordinator {
  async coordinateAnalysis(
    task: Task,
    agents: SpecializedAgent[]
  ): Promise<CollaborativeSynthesis> {

    // Collect independent analyses
    const analyses = new Map<string, Analysis>();
    for (const agent of agents) {
      const analysis = await agent.analyze(task);
      analyses.set(agent.persona.role, analysis);
    }

    // Cross-validate findings
    const validated = await this.crossValidate(analyses);

    // Synthesize WITHOUT fabricating consensus
    return this.synthesizeFindings(validated);
  }

  private synthesizeFindings(
    analyses: Map<string, Analysis>
  ): CollaborativeSynthesis {
    return {
      perspectives: analyses,  // Preserve individual views
      agreements: this.findAgreements(analyses),
      disagreements: this.findDisagreements(analyses),
      evidence: this.aggregateEvidence(analyses),

      // NO fabricated consensus scores
      // NO averaged metrics
      // Preserve diversity of findings
    };
  }
}
```

## Coordination Standards

### Information Sharing

**Pass Specific, Actionable Findings**:
```typescript
// Good: Specific finding with evidence
const finding = {
  agent: 'security-expert',
  finding: 'Consensus protocol vulnerable to Byzantine attacks',
  evidence: [
    'No signature verification in BFTConsensus.ts lines 234-256',
    'Tested with malicious node, successfully corrupted state',
    'Similar vulnerability documented in BFT_ANALYSIS_REPORT.md'
  ],
  severity: 'HIGH',
  recommendation: 'Implement cryptographic signatures per BFT spec'
};

// Bad: Vague claim without evidence
const vagueFinding = {
  agent: 'security-expert',
  finding: 'Security looks problematic',  // Too vague
  evidence: [],  // No evidence
  severity: 'UNKNOWN'
};
```

**DEPENDENCY AWARENESS**:
- Understand which agents need your output
- Provide findings in usable format
- Signal completion of your analysis
- Unblock dependent agents promptly

**PARALLEL EFFICIENCY**:
- Work simultaneously, not sequentially when possible
- Don't wait for other agents if not dependent
- Identify and execute independent subtasks in parallel
- Use task decomposition to maximize parallelism

**CONFLICT RESOLUTION**:
- Different findings are valuable, not problems to hide
- Investigate discrepancies rather than suppress them
- Different methodologies can yield different valid insights
- Report disagreement with reasoning, let higher level decide

### Implementation Pattern

```typescript
interface TaskDecomposition {
  independentTasks: Task[];  // Can run in parallel
  dependentTasks: DependencyGraph;  // Must respect dependencies
}

class ParallelCoordinator {
  async executeParallel(
    tasks: TaskDecomposition,
    agents: Map<string, SpecializedAgent>
  ): Promise<Results> {

    // Execute independent tasks in parallel
    const independentResults = await Promise.all(
      tasks.independentTasks.map(task =>
        this.assignToSpecialist(task, agents)
      )
    );

    // Execute dependent tasks respecting dependencies
    const dependentResults = await this.executeDependencyGraph(
      tasks.dependentTasks,
      agents
    );

    // Combine results, preserving conflicts
    return this.combineResults(independentResults, dependentResults);
  }

  private combineResults(
    independent: Result[],
    dependent: Result[]
  ): Results {
    const conflicts = this.detectConflicts([...independent, ...dependent]);

    return {
      findings: [...independent, ...dependent],
      conflicts: conflicts,  // Don't hide disagreements
      resolution: conflicts.length > 0 ? 'REQUIRES_REVIEW' : 'COMPLETE'
    };
  }
}
```

## Anti-Fabrication in Teams

### No Metric Averaging

**WRONG**:
```typescript
// DON'T DO THIS - Fabricating consensus metric
const scores = [
  { agent: 'security', score: 85 },
  { agent: 'performance', score: 60 },
  { agent: 'ux', score: 90 }
];

const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
// Result: 78.3 - This is FABRICATED, not a real measurement
```

**RIGHT**:
```typescript
// CORRECT - Preserve individual assessments
const assessments = {
  security: {
    score: 85,
    basis: 'Measured: 1 critical vuln, 2 medium, 5 low',
    methodology: 'OWASP Top 10 checklist'
  },
  performance: {
    score: 60,
    basis: 'Measured: P95 latency 450ms, target <200ms',
    methodology: 'Load testing with 1000 concurrent users'
  },
  ux: {
    score: 90,
    basis: 'Measured: 90% task completion, 4.5/5 satisfaction',
    methodology: 'User testing with 20 participants'
  },

  // NO overall score - each domain has different measurement basis
  synthesis: 'Strong UX and security, performance needs improvement'
};
```

### Preserve Disagreement

**Example: Conflicting Assessments**:
```typescript
interface ConflictingFindings {
  topic: string;
  findings: {
    agent: string;
    position: string;
    evidence: string[];
    confidence: string;
  }[];
  resolution: 'UNRESOLVED' | 'RESOLVED' | 'REQUIRES_DECISION';
}

const disagreement: ConflictingFindings = {
  topic: 'Consensus mechanism selection',
  findings: [
    {
      agent: 'performance-expert',
      position: 'Use Raft consensus',
      evidence: [
        'Measured 2.5x faster election than BFT (150ms vs 375ms)',
        'Higher throughput (500 vs 350 cmd/s in tests)',
        '44% lower latency in benchmarks'
      ],
      confidence: 'HIGH - based on actual measurements'
    },
    {
      agent: 'security-expert',
      position: 'Use BFT consensus',
      evidence: [
        'Requirement specifies Byzantine fault tolerance',
        'Cross-organizational deployment with untrusted nodes',
        'Regulatory requirement for malicious node tolerance'
      ],
      confidence: 'HIGH - based on requirements analysis'
    }
  ],
  resolution: 'REQUIRES_DECISION',  // Don't fabricate agreement
  recommendation: 'Escalate to architect: Performance vs security tradeoff'
};
```

### Evidence Multiplication

**WRONG ASSUMPTION**:
```
"Three agents independently verified this, so confidence is very high"
```

**REALITY**:
- More agents doesn't automatically mean stronger claims
- If all using same flawed methodology, all can be wrong
- If none measured empirically, unanimous opinion still lacks evidence
- Agreement ≠ correctness

**CORRECT APPROACH**:
```typescript
interface MultiAgentValidation {
  claim: string;
  validations: {
    agent: string;
    method: string;
    evidence: string[];
    independent: boolean;  // Key: truly independent verification?
  }[];
}

const validation: MultiAgentValidation = {
  claim: 'System handles 1000 requests/second',
  validations: [
    {
      agent: 'performance-tester',
      method: 'Load testing with JMeter',
      evidence: ['Load test results: 1050 req/s sustained for 10 minutes'],
      independent: true
    },
    {
      agent: 'monitoring-expert',
      method: 'Production metrics analysis',
      evidence: ['Grafana dashboard shows 980-1100 req/s over 30 days'],
      independent: true  // Different method, different data source
    },
    {
      agent: 'code-reviewer',
      method: 'Code analysis',
      evidence: ['Theoretical calculation based on thread pool size'],
      independent: false  // Not an independent measurement
    }
  ],
  conclusion: '2 independent measurements support claim (load test + production), 1 theoretical analysis'
};
```

### Independent Validation

**Each Agent Must Verify Claims Independently**:

```typescript
class SecurityAgent {
  async validateClaim(claim: string, evidence: Evidence[]): Promise<Validation> {
    // Don't just accept other agent's conclusion
    // Independently verify with own methodology

    // 1. Review provided evidence
    const evidenceReview = await this.reviewEvidence(evidence);

    // 2. Conduct independent verification
    const independentTest = await this.runSecurityScan();

    // 3. Compare findings
    if (evidenceReview.matches(independentTest)) {
      return {
        validated: true,
        confidence: 'HIGH',
        method: 'Independent security scan',
        notes: 'Findings consistent with provided evidence'
      };
    } else {
      return {
        validated: false,
        confidence: 'LOW',
        method: 'Independent security scan',
        notes: 'Discrepancy found - requires investigation',
        discrepancy: this.documentDiscrepancy(evidenceReview, independentTest)
      };
    }
  }
}
```

## Practical Coordination Patterns

### Pattern 1: Parallel Independent Analysis

**Scenario**: Multiple aspects of system need evaluation

```typescript
async function analyzeSystem(system: System): Promise<Analysis> {
  // Create specialized agents
  const securityAgent = new SecurityExpert();
  const performanceAgent = new PerformanceExpert();
  const uxAgent = new UXExpert();
  const reliabilityAgent = new ReliabilityExpert();

  // Execute in parallel (independent analyses)
  const [security, performance, ux, reliability] = await Promise.all([
    securityAgent.analyze(system),
    performanceAgent.analyze(system),
    uxAgent.analyze(system),
    reliabilityAgent.analyze(system)
  ]);

  // Combine without fabricating overall score
  return {
    aspects: { security, performance, ux, reliability },
    synthesis: synthesizeWithoutScoreFabrication(
      security,
      performance,
      ux,
      reliability
    )
  };
}
```

### Pattern 2: Sequential Dependent Analysis

**Scenario**: Later analysis depends on earlier findings

```typescript
async function designAndEvaluate(requirements: Requirements): Promise<Design> {
  // Step 1: Architect designs system
  const architect = new ArchitectAgent();
  const design = await architect.createDesign(requirements);

  // Step 2: Specialists evaluate design (depends on step 1)
  const [securityReview, performanceReview] = await Promise.all([
    new SecurityExpert().reviewDesign(design),
    new PerformanceExpert().reviewDesign(design)
  ]);

  // Step 3: Architect refines based on feedback (depends on step 2)
  const refinedDesign = await architect.refineDesign(
    design,
    [securityReview, performanceReview]
  );

  return refinedDesign;
}
```

### Pattern 3: Cross-Validation

**Scenario**: Critical claim needs independent verification

```typescript
async function validateCriticalClaim(
  claim: Claim,
  validators: SpecializedAgent[]
): Promise<ValidationResult> {

  // Each validator independently verifies
  const validations = await Promise.all(
    validators.map(validator =>
      validator.independentlyVerify(claim)
    )
  );

  // Analyze validation results
  const agreeing = validations.filter(v => v.validated);
  const disagreeing = validations.filter(v => !v.validated);

  return {
    claim,
    validations,
    consensus: {
      agreeing: agreeing.length,
      disagreeing: disagreeing.length,
      // NO fabricated confidence score
      status: agreeing.length > disagreeing.length ? 'LIKELY_VALID' : 'DISPUTED'
    },
    recommendation: disagreeing.length > 0
      ? `Investigate discrepancies: ${disagreeing.map(d => d.notes).join('; ')}`
      : 'Claim validated by multiple independent methods'
  };
}
```

## Monitoring Coordination Health

### Metrics to Track

**Collaboration Effectiveness**:
- Time to complete multi-agent tasks
- Number of iterations needed
- Conflict resolution time
- Percentage of tasks requiring escalation

**Agent Specialization**:
- Percentage of tasks within expertise
- Defer rate (how often agents defer to specialists)
- Unique contribution percentage
- Perspective diversity score

**Evidence Quality**:
- Percentage of claims with evidence
- Independent verification rate
- Evidence source diversity
- Measurement-based vs opinion-based ratio

**Anti-Fabrication Compliance**:
- Fabricated metric detection rate
- Disagreement preservation rate
- Evidence chain completeness
- Independent validation frequency

### Alerting Thresholds

```typescript
const coordinationAlerts = {
  // Warning: Too much homogenization
  lowDiversityWarning: {
    trigger: 'perspective_diversity < 0.3',
    action: 'Review agent personas, ensure distinct specializations'
  },

  // Warning: Lack of evidence
  lowEvidenceWarning: {
    trigger: 'evidence_ratio < 0.6',
    action: 'Require evidence for claims, reject unsupported assertions'
  },

  // Critical: Fabricated metrics detected
  fabricationDetected: {
    trigger: 'fabricated_scores > 0',
    action: 'Immediate correction, review all numerical claims'
  },

  // Warning: Too sequential (inefficient)
  inefficientParallelism: {
    trigger: 'parallel_task_ratio < 0.4',
    action: 'Review task decomposition, identify parallel opportunities'
  }
};
```

## Evidence Sources

Coordination protocols extracted from:
- `/home/alton/CLAUDE.md` - PARALLEL AGENT COORDINATION PROTOCOLS section
- `/home/alton/SKG Agent Prototype 2/` - Multi-agent implementation patterns
- `/home/alton/AGENTIC_HARNESS_ARCHITECTURE.md` - Orchestration architecture

Patterns demonstrated in actual multi-agent implementations, not theoretical constructs.

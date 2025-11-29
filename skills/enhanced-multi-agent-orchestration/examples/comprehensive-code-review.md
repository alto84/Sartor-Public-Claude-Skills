# Example: Comprehensive Code Review with Enhanced Orchestration

This example demonstrates how to use the Enhanced Multi-Agent Orchestration system to conduct a thorough code review with autonomous improvement capabilities.

## Scenario

Review a complex authentication system with:
- Security vulnerabilities assessment
- Performance optimization opportunities
- Code quality improvements
- Documentation gaps
- Automated fix suggestions

## Implementation

```typescript
import {
  EnhancedOrchestrationSystem,
  OrchestratorAgent,
  ResearchAgent,
  AssessmentAgent,
  ImplementationAgent,
  ValidationAgent,
  SynthesisAgent,
  AutonomousActionAgent,
  GitOperationsAgent
} from '../src/orchestration';

// 1. Initialize the Orchestration System
const orchestration = new EnhancedOrchestrationSystem({
  // Context protection for orchestrator
  contextProtection: {
    enabled: true,
    maxOrchestratorTokens: 8000,
    summaryMaxWords: 500,
    progressiveDisclosure: true
  },

  // Agent configurations
  agents: {
    orchestrator: new OrchestratorAgent({
      decisionStrategy: 'EVIDENCE_BASED',
      contextLimit: 8000,
      summaryOnly: true
    }),

    research: new ResearchAgent({
      searchDepth: 3,
      strategies: ['PATTERN_MATCH', 'SEMANTIC_SEARCH', 'DEPENDENCY_TRACE'],
      parallelSearch: true,
      maxFilesPerSearch: 100
    }),

    assessment: new AssessmentAgent({
      evidenceRequired: true,
      minCitations: 3,
      severityThresholds: {
        critical: 0.9,
        high: 0.7,
        medium: 0.5,
        low: 0.3
      }
    }),

    implementation: new ImplementationAgent({
      dryRun: true,  // Test changes before applying
      atomicCommits: true,
      rollbackEnabled: true,
      testBeforeCommit: true
    }),

    validation: new ValidationAgent({
      strictMode: true,
      checks: ['SYNTAX', 'SEMANTIC', 'SECURITY', 'PERFORMANCE', 'TESTS'],
      crossValidation: true
    }),

    synthesis: new SynthesisAgent({
      conflictResolution: 'EVIDENCE',
      patternDetection: true,
      contradictionHandling: 'REPORT_ALL'
    }),

    autonomous: new AutonomousActionAgent({
      enabled: true,
      suggestionThreshold: 0.6,
      monitoringInterval: 1000,  // ms
      learningEnabled: true,
      maxSuggestionsPerMinute: 5
    }),

    git: new GitOperationsAgent({
      conventionalCommits: true,
      signCommits: true,
      autoTag: false,
      pushAfterCommit: false
    })
  },

  // Quality gates between agents
  qualityGates: [
    {
      name: 'research-to-assessment',
      from: 'research',
      to: 'assessment',
      checks: [
        { type: 'MINIMUM_SOURCES', value: 3, required: true },
        { type: 'COVERAGE', value: 0.8, required: false },
        { type: 'RELIABILITY', value: 0.7, required: true }
      ],
      strategy: 'ALL_REQUIRED'
    },
    {
      name: 'assessment-to-implementation',
      from: 'assessment',
      to: 'implementation',
      checks: [
        { type: 'CRITICAL_ISSUES_RESOLVED', required: true },
        { type: 'APPROVAL_SCORE', value: 0.7, required: true }
      ],
      strategy: 'ALL_REQUIRED'
    },
    {
      name: 'implementation-to-validation',
      from: 'implementation',
      to: 'validation',
      checks: [
        { type: 'NO_SYNTAX_ERRORS', required: true },
        { type: 'TESTS_PASS', required: true },
        { type: 'NO_SECURITY_ISSUES', severity: 'HIGH', required: true }
      ],
      strategy: 'WEIGHTED',
      weights: { syntax: 1.0, tests: 0.8, security: 1.0 }
    }
  ],

  // Communication configuration
  communication: {
    protocol: 'ENHANCED_MCP',
    routing: 'SEMANTIC_INTENT',
    messageQueue: {
      type: 'PRIORITY',
      maxSize: 1000,
      overflow: 'REJECT_LOWEST'
    },
    delivery: {
      retries: 3,
      timeout: 5000,
      acknowledgment: true
    }
  }
});

// 2. Define the Review Task
const reviewTask = {
  id: 'auth-review-2024-001',
  type: 'COMPREHENSIVE_CODE_REVIEW',
  priority: 'HIGH',

  scope: {
    directories: ['src/authentication', 'src/middleware/auth'],
    filePatterns: ['*.ts', '*.js'],
    excludePatterns: ['*.test.ts', '*.spec.js']
  },

  requirements: [
    {
      category: 'SECURITY',
      checks: [
        'SQL injection vulnerabilities',
        'XSS attack vectors',
        'Authentication bypass risks',
        'Token security',
        'Session management'
      ]
    },
    {
      category: 'PERFORMANCE',
      checks: [
        'Database query optimization',
        'Caching opportunities',
        'Async operation handling',
        'Memory leaks'
      ]
    },
    {
      category: 'CODE_QUALITY',
      checks: [
        'SOLID principles',
        'Code duplication',
        'Complexity metrics',
        'Test coverage'
      ]
    }
  ],

  outputRequirements: {
    report: true,
    fixes: true,
    documentation: true,
    commits: true
  }
};

// 3. Execute with Monitoring
const execution = await orchestration.execute(reviewTask);

// 4. Monitor Autonomous Suggestions in Real-Time
orchestration.on('autonomous-suggestion', (suggestion) => {
  console.log(`[AUTONOMOUS] New suggestion: ${suggestion.type}`);
  console.log(`  Priority: ${suggestion.priority}`);
  console.log(`  Description: ${suggestion.description}`);
  console.log(`  Estimated Impact: ${suggestion.estimatedImpact.description}`);

  // Orchestrator reviews and decides
  if (suggestion.priority === 'IMMEDIATE' || suggestion.estimatedImpact.value > 0.8) {
    orchestration.approveSuggestion(suggestion.id);
  }
});

// 5. Track Progress with Context Protection
orchestration.on('progress', (update) => {
  // Orchestrator only receives summaries
  console.log(`[${update.agent}] ${update.summary}`);
  console.log(`  Key Points: ${update.keyPoints.join(', ')}`);
  console.log(`  Progress: ${update.percentage}%`);
  // Note: No raw data in updates
});

// 6. Handle Quality Gate Results
orchestration.on('quality-gate', (result) => {
  console.log(`[GATE] ${result.gate.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);

  if (!result.passed) {
    console.log(`  Failures: ${result.failures.map(f => f.check).join(', ')}`);
    console.log(`  Action: ${result.action}`);

    // May trigger revision
    if (result.action === 'REVISE') {
      orchestration.requestRevision(result.fromAgent, result.failures);
    }
  }
});

// 7. Process Results
execution.on('complete', (results) => {
  console.log('\n=== Review Complete ===\n');

  // Synthesis agent's unified report
  console.log('Summary:', results.synthesis.summary);
  console.log('Critical Issues Found:', results.synthesis.criticalIssues.length);
  console.log('Improvements Applied:', results.implementation.changesApplied.length);
  console.log('Autonomous Improvements:', results.autonomous.acceptedSuggestions.length);

  // Git operations summary
  if (results.git.commits.length > 0) {
    console.log('\nCommits Created:');
    results.git.commits.forEach(commit => {
      console.log(`  - ${commit.hash.substring(0, 7)}: ${commit.message}`);
    });
  }

  // Performance metrics
  console.log('\nPerformance Metrics:');
  console.log(`  Total Duration: ${results.metrics.duration}ms`);
  console.log(`  Context Usage: ${results.metrics.contextUsage.percentage}%`);
  console.log(`  Messages Exchanged: ${results.metrics.messageCount}`);
  console.log(`  Autonomous Suggestions: ${results.metrics.autonomousSuggestions}`);
});

// 8. Example Autonomous Improvements in Action

// During execution, the autonomous agent might detect:
const exampleObservation = {
  timestamp: Date.now(),
  agent: 'research',
  phase: 'file-scanning',
  observation: 'Sequential file processing taking 45s for 100 files'
};

// Generates suggestion:
const exampleSuggestion = {
  id: 'suggest-001',
  type: 'OPTIMIZATION',
  priority: 'HIGH',
  description: 'Parallelize file scanning across 4 workers',
  rationale: 'Current sequential processing is bottleneck',
  evidence: [
    'Each file takes ~450ms to process',
    'Files are independent',
    'System has 8 CPU cores available'
  ],
  proposedAction: {
    type: 'SPAWN_AGENTS',
    specification: {
      agentType: 'RESEARCH_WORKER',
      count: 4,
      distribution: 'ROUND_ROBIN',
      task: 'parallel-file-scan'
    }
  },
  estimatedImpact: {
    value: 0.75,
    description: 'Reduce scan time from 45s to ~12s',
    metrics: {
      currentDuration: 45000,
      estimatedDuration: 12000,
      speedup: 3.75
    }
  }
};

// If approved, autonomous agent executes:
if (approved) {
  const workers = await orchestration.spawnWorkers({
    type: 'RESEARCH_WORKER',
    count: 4,
    taskDistribution: 'ROUND_ROBIN'
  });

  // Original research agent becomes coordinator
  await researchAgent.coordinateWorkers(workers, exampleObservation.phase);

  // Measure actual improvement
  const actualImprovement = {
    originalTime: 45000,
    improvedTime: 11500,
    actualSpeedup: 3.91
  };

  // Autonomous agent learns from outcome
  autonomousAgent.recordOutcome(exampleSuggestion.id, actualImprovement);
}
```

## Expected Output

```text
[ORCHESTRATOR] Starting comprehensive code review of authentication system
[RESEARCH] Scanning 45 files in src/authentication...
[AUTONOMOUS] New suggestion: OPTIMIZATION
  Priority: HIGH
  Description: Parallelize file scanning across 4 workers
  Estimated Impact: Reduce scan time from 45s to ~12s
[ORCHESTRATOR] Approved autonomous suggestion: parallel scanning
[RESEARCH] Spawning 4 parallel workers...
[RESEARCH] Completed scan in 11.5s (75% improvement)
[ASSESSMENT] Analyzing 15 security issues, 8 performance opportunities...
[GATE] research-to-assessment: PASSED
[ASSESSMENT] Critical: SQL injection in auth.js:142
[ASSESSMENT] High: Missing rate limiting on login endpoint
[AUTONOMOUS] New suggestion: ENHANCEMENT
  Priority: MEDIUM
  Description: Add automated security fix for SQL injection
[IMPLEMENTATION] Applying security fixes (dry-run mode)...
[VALIDATION] Running security scan on changes...
[GATE] implementation-to-validation: PASSED
[SYNTHESIS] Combining findings from 6 agents...
[GIT] Creating commit: fix(auth): resolve SQL injection vulnerability
[ORCHESTRATOR] Review complete. 15 issues fixed, 3 pending review.

=== Review Complete ===

Summary: Successfully reviewed authentication system, found and fixed 15 security issues and 8 performance bottlenecks. Autonomous improvements reduced review time by 65%.

Critical Issues Found: 3
Improvements Applied: 23
Autonomous Improvements: 5

Commits Created:
  - a3f42b1: fix(auth): resolve SQL injection vulnerability
  - 5c8d9e2: perf(auth): add caching to permission checks
  - 91ab3f7: docs(auth): update API documentation

Performance Metrics:
  Total Duration: 125000ms
  Context Usage: 18%
  Messages Exchanged: 342
  Autonomous Suggestions: 8 (5 accepted)
```

## Key Observations

### Context Protection in Action
- Orchestrator received only 18% of total information
- All data was summarized to key findings
- Full details available through progressive disclosure
- No context overflow despite analyzing 45 files

### Autonomous Improvements
- Detected performance bottleneck automatically
- Suggested and implemented parallelization
- Reduced scan time by 75%
- Learned from outcome for future suggestions

### Quality Gates
- Prevented uncommitted security issues from progressing
- Ensured all changes had tests
- Validated cross-component consistency
- Maintained code quality throughout

### Agent Specialization
- Each agent focused on its domain
- No overlap in responsibilities
- Clear handoffs between agents
- Efficient task distribution

## Variations

### High-Security Mode
```typescript
const securityReview = new EnhancedOrchestrationSystem({
  agents: {
    // Add security specialist
    security: new SecurityAgent({
      scanners: ['SAST', 'DAST', 'SCA'],
      complianceChecks: ['OWASP', 'PCI-DSS'],
      penetrationTesting: true
    })
  },
  qualityGates: [
    {
      name: 'security-gate',
      checks: [
        { type: 'NO_HIGH_VULNERABILITIES', required: true },
        { type: 'COMPLIANCE_PASSED', required: true }
      ]
    }
  ]
});
```

### Performance-Focused Mode
```typescript
const performanceReview = new EnhancedOrchestrationSystem({
  agents: {
    // Add performance specialist
    performance: new PerformanceAgent({
      profiling: true,
      benchmarks: ['latency', 'throughput', 'memory'],
      optimization: 'AGGRESSIVE'
    })
  },
  autonomous: {
    // More aggressive suggestions
    suggestionThreshold: 0.4,
    focusAreas: ['PERFORMANCE', 'OPTIMIZATION']
  }
});
```

## Lessons Learned

1. **Context Protection is Essential**: Without summaries, orchestrator would have been overwhelmed with 45 files worth of data

2. **Autonomous Improvements Add Value**: 65% time reduction from autonomous parallelization suggestion

3. **Quality Gates Prevent Issues**: Caught 3 security issues that would have been committed

4. **Specialization Improves Quality**: Each agent's focused expertise led to comprehensive coverage

5. **Learning Improves Over Time**: Autonomous agent's suggestions became more accurate after observing outcomes
/**
 * Advanced Community Swarm Example
 * Demonstrates full 10-agent collaboration on a complex task
 *
 * This example shows:
 * 1. Spawning all 10 agents
 * 2. Orchestrator delegation pattern (never executes directly)
 * 3. Inter-agent communication and assistance
 * 4. Quality gate validation
 * 5. Monitoring and auditing
 * 6. Git operations for committing results
 */

import {
  AgentId,
  SwarmTask,
  SwarmMessageType,
  Priority,
  Evidence
} from '../templates/swarm-types';
import { SwarmCoordinator } from '../templates/swarm-coordinator';
import {
  AssessmentAgent,
  ImplementationAgent,
  ValidationAgent,
  ResearchAgent,
  SynthesisAgent,
  AutonomousAgent,
  QualityGateAgent,
  MonitorAgent,
  AuditAgent,
  GitAgent
} from '../templates/swarm-agent';

/**
 * Full swarm collaboration example
 *
 * Scenario: Build a user authentication module
 *
 * The orchestrator will:
 * 1. DELEGATE requirement analysis to Assessment Agent
 * 2. DELEGATE best practice research to Research Agent
 * 3. DELEGATE implementation to Implementation Agent
 * 4. DELEGATE testing to Validation Agent
 * 5. DELEGATE documentation to Synthesis Agent
 *
 * Support agents will:
 * - Quality Gate Agent: Validate outputs between phases
 * - Monitor Agent: Watch for issues and bottlenecks
 * - Audit Agent: Verify compliance with delegation pattern
 * - Git Agent: Commit the final implementation
 * - Autonomous Agent: Suggest improvements throughout
 *
 * CRITICAL: The orchestrator NEVER executes tasks itself!
 */
async function fullSwarmCollaboration(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     COMMUNITY SWARM - FULL COLLABORATION EXAMPLE         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Step 1: Create coordinator
  const coordinator = new SwarmCoordinator({
    agents: {},
    hooks: {},
    qualityGates: [
      {
        id: 'evidence-gate',
        name: 'Evidence Validation',
        type: 'EVIDENCE',
        criteria: { minConfidence: 0.6, requireCitations: true },
        blocking: true,
        enforceFor: [AgentId.RESEARCH, AgentId.ASSESSMENT]
      }
    ],
    contextProtection: {
      enabled: true,
      maxSummaryWords: 500,
      maxCodeLines: 10
    },
    timeouts: {
      taskDefault: 60000,
      heartbeat: 5000,
      messageDelivery: 30000
    },
    recovery: {
      maxRetries: 3,
      backoffBase: 1000,
      backoffMax: 30000
    }
  });

  // Step 2: Spawn all 10 agents
  console.log('Phase 1: Spawning 10 agents...\n');

  const agents = {
    assessment: new AssessmentAgent(coordinator),
    implementation: new ImplementationAgent(coordinator),
    validation: new ValidationAgent(coordinator),
    research: new ResearchAgent(coordinator),
    synthesis: new SynthesisAgent(coordinator),
    qualityGate: new QualityGateAgent(coordinator),
    monitor: new MonitorAgent(coordinator),
    audit: new AuditAgent(coordinator),
    git: new GitAgent(coordinator),
    autonomous: new AutonomousAgent(coordinator)
  };

  // Initialize all agents in parallel
  await Promise.all(Object.values(agents).map(agent => agent.initialize()));
  console.log('✓ All 10 agents initialized and ready\n');

  // Step 3: Verify swarm health
  const status = coordinator.getStatus();
  console.log(`Swarm Health: ${status.health}`);
  console.log(`Agents Ready: ${status.agents.length}/10\n`);

  // Step 4: Define the complex task
  const mainTask = {
    title: 'Build User Authentication Module',
    requirements: [
      'JWT token generation and validation',
      'Refresh token rotation',
      'Password hashing with bcrypt',
      'Rate limiting for login attempts',
      'Session management'
    ]
  };

  console.log('Phase 2: Orchestrator delegating tasks...\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  IMPORTANT: Orchestrator DELEGATES - never executes!     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Step 5: Delegate Phase 1 - Assessment
  console.log('→ Delegating to Assessment Agent...');
  const assessmentTask: SwarmTask = {
    id: `task-assess-${Date.now()}`,
    type: 'assessment',
    description: 'Analyze authentication module requirements',
    priority: Priority.HIGH,
    dependencies: [],
    inputs: { requirements: mainTask.requirements },
    expectedOutputs: ['requirements-analysis', 'dependency-map'],
    qualityGates: ['evidence-gate'],
    metadata: { createdAt: new Date(), createdBy: AgentId.ORCHESTRATOR }
  };
  assessmentTask.assignedTo = AgentId.ASSESSMENT;
  await coordinator.delegateTask(assessmentTask);
  console.log('  ✓ Assessment task delegated\n');

  // Step 6: Delegate Phase 2 - Research (in parallel)
  console.log('→ Delegating to Research Agent...');
  const researchTask: SwarmTask = {
    id: `task-research-${Date.now()}`,
    type: 'research',
    description: 'Research JWT best practices and security patterns',
    priority: Priority.HIGH,
    dependencies: [],
    inputs: { topics: ['JWT security', 'refresh token patterns', 'bcrypt best practices'] },
    expectedOutputs: ['findings', 'recommendations'],
    qualityGates: ['evidence-gate'],
    metadata: { createdAt: new Date(), createdBy: AgentId.ORCHESTRATOR }
  };
  researchTask.assignedTo = AgentId.RESEARCH;
  await coordinator.delegateTask(researchTask);
  console.log('  ✓ Research task delegated\n');

  // Step 7: Monitor agent checks health
  console.log('→ Monitor Agent checking swarm health...');
  const monitorTask: SwarmTask = {
    id: `task-monitor-${Date.now()}`,
    type: 'monitoring',
    description: 'Monitor swarm health during task execution',
    priority: Priority.NORMAL,
    dependencies: [],
    inputs: {},
    expectedOutputs: ['health-report', 'alerts'],
    qualityGates: [],
    metadata: { createdAt: new Date(), createdBy: AgentId.ORCHESTRATOR }
  };
  monitorTask.assignedTo = AgentId.MONITOR;
  await coordinator.delegateTask(monitorTask);
  console.log('  ✓ Monitoring active\n');

  // Step 8: Share data between agents
  console.log('Phase 3: Agents collaborating via shared data pool...\n');

  // Simulate research findings being shared
  const researchEvidence: Evidence = {
    citations: ['RFC 7519 (JWT)', 'OWASP Authentication Guidelines'],
    confidence: 0.85,
    sources: ['ietf.org', 'owasp.org']
  };
  coordinator.shareData(
    'jwt-best-practices',
    {
      tokenExpiry: '15 minutes for access tokens',
      refreshExpiry: '7 days for refresh tokens',
      algorithm: 'RS256 recommended over HS256'
    },
    AgentId.RESEARCH,
    researchEvidence,
    ['security', 'jwt', 'authentication']
  );
  console.log('✓ Research Agent shared JWT best practices\n');

  // Implementation agent retrieves research
  const bestPractices = coordinator.getData('jwt-best-practices', AgentId.IMPLEMENTATION);
  console.log('✓ Implementation Agent retrieved research data');
  console.log(`  Data: ${JSON.stringify(bestPractices)}\n`);

  // Step 9: Request assistance between agents
  console.log('Phase 4: Inter-agent assistance...\n');
  console.log('→ Implementation Agent requesting help from Research Agent...');

  await coordinator.sendMessage({
    id: `msg-assist-${Date.now()}`,
    type: SwarmMessageType.ASSISTANCE_REQUEST,
    priority: Priority.HIGH,
    from: AgentId.IMPLEMENTATION,
    to: AgentId.RESEARCH,
    payload: {
      request: 'What is the recommended bcrypt cost factor?',
      context: { framework: 'Node.js', scale: 'enterprise' }
    },
    metadata: { timestamp: new Date() }
  });
  console.log('  ✓ Assistance request sent\n');

  // Step 10: Delegate quality gate check
  console.log('Phase 5: Quality gate validation...\n');
  const qualityTask: SwarmTask = {
    id: `task-quality-${Date.now()}`,
    type: 'quality-check',
    description: 'Validate implementation outputs',
    priority: Priority.HIGH,
    dependencies: [assessmentTask.id],
    inputs: {
      gates: [
        { name: 'format-check' },
        { name: 'evidence-check' },
        { name: 'security-review' }
      ]
    },
    expectedOutputs: ['gate-results'],
    qualityGates: [],
    metadata: { createdAt: new Date(), createdBy: AgentId.ORCHESTRATOR }
  };
  qualityTask.assignedTo = AgentId.QUALITY_GATE;
  await coordinator.delegateTask(qualityTask);
  console.log('✓ Quality gates evaluated\n');

  // Step 11: Autonomous agent suggests improvements
  console.log('Phase 6: Autonomous improvement suggestions...\n');
  const improvementTask: SwarmTask = {
    id: `task-improve-${Date.now()}`,
    type: 'improvement',
    description: 'Analyze swarm execution and suggest improvements',
    priority: Priority.LOW,
    dependencies: [],
    inputs: { scope: 'authentication-module' },
    expectedOutputs: ['suggestions'],
    qualityGates: [],
    metadata: { createdAt: new Date(), createdBy: AgentId.ORCHESTRATOR }
  };
  improvementTask.assignedTo = AgentId.AUTONOMOUS;
  await coordinator.delegateTask(improvementTask);
  console.log('✓ Improvement analysis complete\n');

  // Step 12: Audit agent verifies compliance
  console.log('Phase 7: Compliance audit...\n');
  const auditTask: SwarmTask = {
    id: `task-audit-${Date.now()}`,
    type: 'audit',
    description: 'Verify delegation compliance and audit trail',
    priority: Priority.NORMAL,
    dependencies: [],
    inputs: {},
    expectedOutputs: ['audit-report', 'compliance-score'],
    qualityGates: [],
    metadata: { createdAt: new Date(), createdBy: AgentId.ORCHESTRATOR }
  };
  auditTask.assignedTo = AgentId.AUDIT;
  await coordinator.delegateTask(auditTask);
  console.log('✓ Audit complete\n');

  // Step 13: Git agent commits
  console.log('Phase 8: Committing changes...\n');
  const gitTask: SwarmTask = {
    id: `task-git-${Date.now()}`,
    type: 'git-commit',
    description: 'Commit authentication module implementation',
    priority: Priority.NORMAL,
    dependencies: [qualityTask.id],
    inputs: {
      operation: 'commit',
      message: 'feat: Add user authentication module with JWT support',
      files: ['src/auth/jwt.ts', 'src/auth/password.ts', 'src/auth/session.ts']
    },
    expectedOutputs: ['commit-status'],
    qualityGates: [],
    metadata: { createdAt: new Date(), createdBy: AgentId.ORCHESTRATOR }
  };
  gitTask.assignedTo = AgentId.GIT;
  await coordinator.delegateTask(gitTask);
  console.log('✓ Changes committed\n');

  // Step 14: Final status
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    SWARM EXECUTION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');

  const finalStatus = coordinator.getStatus();
  console.log(`Final Health: ${finalStatus.health}`);
  console.log(`Tasks Completed: ${finalStatus.tasks.completed}`);
  console.log(`Data Pool Entries: ${finalStatus.dataPool.entries}`);

  // Get audit log summary
  const auditLog = coordinator.getAuditLog();
  console.log(`\nAudit Trail: ${auditLog.length} entries`);

  // Verify orchestrator never executed directly
  const orchestratorExecutions = auditLog.filter(
    e => e.agent === AgentId.ORCHESTRATOR && e.action === 'EXECUTE'
  );
  if (orchestratorExecutions.length === 0) {
    console.log('✓ VERIFIED: Orchestrator never executed tasks directly');
  } else {
    console.log('✗ VIOLATION: Orchestrator executed tasks directly!');
  }

  // Get improvement suggestions
  const suggestions = coordinator.getSuggestions();
  if (suggestions.length > 0) {
    console.log(`\nImprovement Suggestions: ${suggestions.length}`);
    suggestions.slice(0, 3).forEach(s => {
      console.log(`  - [${s.category}] ${s.suggestion.action}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
}

// Run the example
fullSwarmCollaboration().catch(console.error);

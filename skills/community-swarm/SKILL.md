---
name: community-swarm
description: Orchestrates a community of 8-10 Claude agents working together using inter-agent communication protocols. The orchestrator NEVER executes tasks directly - it only delegates to specialized agents that communicate with each other, monitor progress, and validate outputs through quality gates.
allowed-tools: Task, Read, Glob, Grep
---

# Community Swarm Skill

## Overview

The Community Swarm skill implements a fully autonomous multi-agent system where 8-10 specialized Claude agents collaborate on complex tasks. The core orchestrator follows a strict **delegation-only** pattern - it NEVER performs tasks itself, only coordinates and delegates to specialized agents that communicate using standardized protocols.

This skill synthesizes capabilities from:
- **evidence-based-validation**: Ensures all outputs are grounded in evidence
- **agent-communication-system**: Provides inter-agent messaging protocols
- **enhanced-multi-agent-orchestration**: Defines 8-agent patterns
- **autonomous-action-agent**: Enables continuous improvement monitoring
- **multi-agent-orchestration**: Consensus and coordination patterns

## When to Use This Skill

Activate this skill when:
- Complex tasks require multiple specialized perspectives
- Tasks benefit from parallel execution by different agents
- Quality assurance through peer review is valuable
- Continuous improvement suggestions add value
- Tasks require strict separation of concerns
- You need auditable, evidence-based outputs

## When NOT to Use This Skill

Do NOT activate this skill when:
- Simple tasks that a single agent can handle
- Time-critical operations where coordination overhead is costly
- Tasks requiring deep sequential reasoning by one agent
- Resource-constrained environments
- Tasks with strict token limits

**Alternative approaches:**
- For simple tasks, use direct execution
- For sequential reasoning, use single-agent mode
- For quick operations, use lightweight orchestration

---

## The 10-Agent Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          COMMUNITY SWARM                                 │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                       ORCHESTRATOR                               │   │
│   │            (DELEGATES ONLY - NEVER EXECUTES)                     │   │
│   │  - Receives tasks from user                                      │   │
│   │  - Decomposes into subtasks                                      │   │
│   │  - Delegates to specialized agents                               │   │
│   │  - Receives SUMMARIES ONLY (context protection)                  │   │
│   │  - Synthesizes final results                                     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│           ┌────────────────────────┼────────────────────────┐           │
│           ▼                        ▼                        ▼           │
│   ┌───────────────┐        ┌───────────────┐        ┌───────────────┐   │
│   │  ASSESSMENT   │◄──────►│IMPLEMENTATION │◄──────►│  VALIDATION   │   │
│   │    AGENT      │        │    AGENT      │        │    AGENT      │   │
│   │  #1 of 10     │        │  #2 of 10     │        │  #3 of 10     │   │
│   └───────────────┘        └───────────────┘        └───────────────┘   │
│           ▲                        ▲                        ▲           │
│           │                        │                        │           │
│           ▼                        ▼                        ▼           │
│   ┌───────────────┐        ┌───────────────┐        ┌───────────────┐   │
│   │   RESEARCH    │◄──────►│   SYNTHESIS   │◄──────►│ QUALITY GATE  │   │
│   │    AGENT      │        │    AGENT      │        │    AGENT      │   │
│   │  #4 of 10     │        │  #5 of 10     │        │  #6 of 10     │   │
│   └───────────────┘        └───────────────┘        └───────────────┘   │
│           ▲                        ▲                        ▲           │
│           │                        │                        │           │
│           ▼                        ▼                        ▼           │
│   ┌───────────────┐        ┌───────────────┐        ┌───────────────┐   │
│   │   MONITOR     │◄──────►│    AUDIT      │◄──────►│     GIT       │   │
│   │    AGENT      │        │    AGENT      │        │    AGENT      │   │
│   │  #7 of 10     │        │  #8 of 10     │        │  #9 of 10     │   │
│   └───────────────┘        └───────────────┘        └───────────────┘   │
│                                    ▲                                     │
│                                    │                                     │
│                            ┌───────────────┐                            │
│                            │  AUTONOMOUS   │                            │
│                            │ IMPROVEMENT   │                            │
│                            │    AGENT      │                            │
│                            │  #10 of 10    │                            │
│                            └───────────────┘                            │
│                                                                          │
│   ═══════════════════════════════════════════════════════════════════   │
│                         SHARED DATA POOL                                 │
│   (Citations, Evidence, Progress, Results - with Access Tracking)        │
│   ═══════════════════════════════════════════════════════════════════   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Agent Specifications

### Agent 1: Assessment Agent
**Role**: Analyze requirements, assess scope, identify dependencies
**Capabilities**: `['analyze', 'assess', 'scope', 'requirements']`
**Inputs**: Task description, context, constraints
**Outputs**: Requirements analysis, dependency map, risk assessment
**Quality Gates**: Must include confidence scores, cite sources

### Agent 2: Implementation Agent
**Role**: Write code, implement features, make changes
**Capabilities**: `['code', 'implement', 'write', 'modify']`
**Inputs**: Requirements, specifications, context
**Outputs**: Code changes, implementation details
**Quality Gates**: Code must pass linting, follow patterns

### Agent 3: Validation Agent
**Role**: Test implementations, validate correctness
**Capabilities**: `['test', 'validate', 'verify', 'check']`
**Inputs**: Implementation, expected behavior
**Outputs**: Test results, validation report
**Quality Gates**: Test coverage requirements

### Agent 4: Research Agent
**Role**: Find information, research best practices
**Capabilities**: `['search', 'research', 'find', 'explore']`
**Inputs**: Research questions, topic areas
**Outputs**: Findings with citations, recommendations
**Quality Gates**: All claims must have citations

### Agent 5: Synthesis Agent
**Role**: Combine findings, write documentation
**Capabilities**: `['synthesize', 'document', 'summarize', 'combine']`
**Inputs**: Multiple agent outputs, context
**Outputs**: Unified documentation, summaries
**Quality Gates**: Coherent, no contradictions

### Agent 6: Quality Gate Agent
**Role**: Enforce quality standards between phases
**Capabilities**: `['quality', 'gate', 'enforce', 'standard']`
**Inputs**: Agent outputs, quality criteria
**Outputs**: Pass/fail decisions, improvement requirements
**Quality Gates**: Must apply consistent criteria

### Agent 7: Monitor Agent
**Role**: Observe swarm operation, detect issues
**Capabilities**: `['monitor', 'observe', 'detect', 'alert']`
**Inputs**: System state, agent activities
**Outputs**: Alerts, status reports, health metrics
**Quality Gates**: Timely detection (<5s)

### Agent 8: Audit Agent
**Role**: Review decisions, check compliance
**Capabilities**: `['audit', 'review', 'compliance', 'trace']`
**Inputs**: All swarm activities, policies
**Outputs**: Audit reports, compliance status
**Quality Gates**: Complete audit trail

### Agent 9: Git Agent
**Role**: Manage version control operations
**Capabilities**: `['git', 'commit', 'push', 'branch']`
**Inputs**: Changes to commit, commit messages
**Outputs**: Git operations status
**Quality Gates**: Clean commits, proper messages

### Agent 10: Autonomous Improvement Agent
**Role**: Continuously suggest improvements
**Capabilities**: `['improve', 'suggest', 'optimize', 'enhance']`
**Inputs**: All swarm activities, patterns
**Outputs**: Improvement suggestions, optimizations
**Quality Gates**: Evidence-based suggestions only

---

## Core Principles

### 1. Orchestrator Delegation Pattern

The orchestrator NEVER executes tasks directly. It ONLY:
- Receives tasks from the user
- Decomposes tasks into subtasks
- Delegates subtasks to appropriate agents
- Receives summaries (NOT full outputs) from agents
- Synthesizes final results for the user

```typescript
// FORBIDDEN - Orchestrator doing work
orchestrator.readFile(path);  // NEVER
orchestrator.writeCode(code); // NEVER
orchestrator.searchWeb(query); // NEVER

// REQUIRED - Orchestrator delegating
orchestrator.delegate(assessmentAgent, { task: 'analyze requirements' });
orchestrator.delegate(implementationAgent, { task: 'write code' });
orchestrator.delegate(researchAgent, { task: 'find best practices' });
```

### 2. Context Protection

The orchestrator's context is protected from large payloads:
- Summaries ONLY (no full file contents)
- Maximum 500 words per agent response
- Code snippets limited to 10 lines
- Error summaries only (no stack traces)

### 3. Evidence-Based Outputs

ALL agent outputs must:
- Include citations for claims
- Express uncertainty with confidence scores
- Never fabricate metrics or data
- Mark speculative suggestions clearly

### 4. Inter-Agent Communication

Agents communicate through:
- **Direct Messages**: Point-to-point communication
- **Broadcast**: One-to-many announcements
- **Shared Data Pool**: Persistent shared state
- **Assistance Requests**: Help from capable agents

---

## Communication Protocols

### Message Structure

```typescript
interface SwarmMessage {
  id: string;                    // Unique message ID
  type: MessageType;             // TASK, STATUS, DATA, ASSISTANCE, etc.
  priority: Priority;            // CRITICAL, HIGH, NORMAL, LOW
  from: string;                  // Sender agent ID
  to: string | string[];         // Recipient(s)
  payload: any;                  // Message content
  metadata: {
    timestamp: Date;
    correlationId?: string;      // For request-response pairing
    ttl?: number;                // Time to live
  };
  evidence?: {
    citations: string[];
    confidence: number;          // 0.0 - 1.0
    sources: string[];
  };
}
```

### Communication Patterns

#### Pattern 1: Task Delegation
```text
Orchestrator ──TASK──► Agent
    ◄────PROGRESS────
    ◄────COMPLETE────
```

#### Pattern 2: Agent Collaboration
```text
Agent A ──ASSISTANCE_REQUEST──► Agent B
        ◄──ASSISTANCE_RESPONSE──
```

#### Pattern 3: Shared Data
```text
Agent A ──WRITE──► Data Pool
Agent B ──READ───► Data Pool (with audit trail)
```

#### Pattern 4: Quality Gate
```text
Agent ──OUTPUT──► Quality Gate Agent
     ◄──PASS/FAIL──
     ◄──REVISION_NEEDED──
```

---

## Hook System

### Lifecycle Hooks

| Hook | When Fired | Purpose |
|------|------------|---------|
| `pre-spawn` | Before agent creation | Validate resources, check limits |
| `post-spawn` | After agent creation | Register agent, start monitoring |
| `pre-task` | Before task assignment | Verify capabilities, check availability |
| `post-task` | After task completion | Validate output, trigger dependents |
| `pre-shutdown` | Before agent termination | Save state, clean up |
| `post-shutdown` | After agent termination | Deregister, notify others |

### Communication Hooks

| Hook | When Fired | Purpose |
|------|------------|---------|
| `pre-send` | Before message dispatch | Validate, sign message |
| `post-receive` | After message receipt | Acknowledge, log |
| `on-timeout` | Message timeout | Retry or escalate |
| `on-error` | Communication failure | Handle, recover |

### Quality Gate Hooks

| Hook | When Fired | Purpose |
|------|------------|---------|
| `pre-quality-check` | Before validation | Prepare inputs |
| `quality-gate-1` | Format check | Structural validation |
| `quality-gate-2` | Evidence check | Citation verification |
| `quality-gate-3` | Consistency check | Cross-agent validation |
| `final-quality-gate` | Final approval | Complete validation |

### Hook Configuration

```yaml
hooks:
  pre_spawn:
    - name: resource_checker
      config:
        max_agents: 10
        memory_limit: "2GB"
    - name: capability_validator

  post_spawn:
    - name: agent_registrar
    - name: monitoring_starter

  pre_task:
    - name: availability_checker
    - name: dependency_validator

  post_task:
    - name: quality_gate
      config:
        min_confidence: 0.7
        require_citations: true
    - name: audit_logger
```

---

## Execution Workflow

### Phase 1: Task Reception
1. Orchestrator receives task from user
2. Orchestrator decomposes into subtasks
3. Orchestrator identifies required agents
4. Hook: `pre-spawn` fires for each agent

### Phase 2: Agent Spawning
1. Agents spawn in parallel where possible
2. Hook: `post-spawn` fires for each agent
3. Agents register with coordinator
4. Communication channels established

### Phase 3: Task Execution
1. Orchestrator delegates subtasks
2. Agents work (in parallel where possible)
3. Agents communicate for collaboration
4. Monitor Agent observes progress
5. Quality Gate Agent validates outputs

### Phase 4: Synthesis
1. All subtasks complete
2. Synthesis Agent combines outputs
3. Audit Agent verifies compliance
4. Git Agent commits if requested
5. Orchestrator presents final result

### Phase 5: Improvement
1. Autonomous Improvement Agent reviews
2. Suggestions logged for next iteration
3. Hooks cleanup resources
4. Agents shutdown gracefully

---

## Quality Gates

### Gate 1: Format Validation
- Output structure correct
- Required fields present
- Types valid

### Gate 2: Evidence Validation
- All claims have citations
- Sources are verifiable
- Confidence scores included

### Gate 3: Consistency Validation
- No contradictions across agents
- Unified terminology
- Coherent narrative

### Final Gate: Complete Validation
- All previous gates passed
- Orchestrator context limits respected
- Audit trail complete

---

## Error Recovery

### Recovery Strategies

| Strategy | When Used | Action |
|----------|-----------|--------|
| RETRY | Transient failure | Retry with exponential backoff |
| REASSIGN | Agent failure | Assign to another capable agent |
| ROLLBACK | Partial completion | Restore checkpoint, replan |
| ESCALATE | Unrecoverable | Notify user, provide context |

### Failure Detection

- Agent heartbeat timeout: 5 seconds
- Task timeout: Configurable per task
- Message delivery timeout: 30 seconds

### Recovery Flow

```text
Error Detected ─► Classify Error ─► Select Strategy
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
              RETRY                   REASSIGN                ESCALATE
                │                       │                       │
                ▼                       ▼                       ▼
         Backoff Wait            Find Agent               Notify User
                │                       │                       │
                ▼                       ▼                       ▼
           Try Again             Delegate Task           Provide Context
```

---

## Monitoring & Observability

### Metrics Tracked

> **Note**: The thresholds below are **example starting values**. Measure your specific environment to determine appropriate values for your use case.

| Metric | Description | Example Threshold |
|--------|-------------|-------------------|
| Agent Health | Heartbeat response | > 5s timeout (adjust for latency) |
| Message Queue | Queue depth | > 1000 messages (adjust for throughput) |
| Task Duration | Execution time | > expected + 50% (task-dependent) |
| Error Rate | Failures / total | > 5% (adjust for quality needs) |
| Quality Pass Rate | Gates passed | < 85% (adjust for strictness) |

### Audit Trail

Every operation logged:
- Who (agent ID)
- What (operation)
- When (timestamp)
- Why (context)
- Result (outcome)

---

## Implementation Example

### Spawning the Swarm

```typescript
import { CommunitySwarm } from './templates/community-swarm';

const swarm = new CommunitySwarm({
  agents: {
    assessment: { model: 'opus', capabilities: ['analyze'] },
    implementation: { model: 'opus', capabilities: ['code'] },
    validation: { model: 'opus', capabilities: ['test'] },
    research: { model: 'opus', capabilities: ['search'] },
    synthesis: { model: 'opus', capabilities: ['document'] },
    qualityGate: { model: 'haiku', capabilities: ['validate'] },
    monitor: { model: 'haiku', capabilities: ['observe'] },
    audit: { model: 'haiku', capabilities: ['audit'] },
    git: { model: 'haiku', capabilities: ['git'] },
    autonomous: { model: 'opus', capabilities: ['improve'] }
  },
  hooks: {
    preSpawn: [resourceCheckHook],
    postTask: [qualityGateHook, auditHook]
  },
  config: {
    maxAgents: 10,
    contextProtection: true,
    summaryMaxWords: 500
  }
});

// Execute task
const result = await swarm.execute({
  task: "Build a REST API with authentication",
  requirements: ["JWT tokens", "User management", "Rate limiting"]
});
```

### Agent Communication

```typescript
// Agent requesting assistance
await coordinator.sendMessage({
  type: MessageType.ASSISTANCE_REQUEST,
  from: 'implementation-agent',
  to: 'research-agent',
  payload: {
    request: 'Find best practice for JWT refresh tokens',
    context: { framework: 'Express.js' }
  },
  metadata: { timestamp: new Date() }
});

// Agent responding with evidence
await coordinator.sendMessage({
  type: MessageType.ASSISTANCE_RESPONSE,
  from: 'research-agent',
  to: 'implementation-agent',
  payload: {
    response: 'Use rotating refresh tokens with...',
    citations: ['RFC 6749', 'OAuth 2.0 Security BCP']
  },
  evidence: {
    confidence: 0.9,
    sources: ['ietf.org', 'oauth.net']
  }
});
```

---

## Validation Requirements

See `VALIDATION.md` for complete test specifications including:
- Evidence-based compliance tests (47+ tests)
- Communication protocol tests
- Orchestrator delegation tests
- Hook execution tests
- Integration and stress tests

---

## Related Skills

- `enhanced-multi-agent-orchestration` - 8-agent patterns
- `agent-communication-system` - Communication protocols
- `evidence-based-validation` - Evidence requirements
- `autonomous-action-agent` - Improvement patterns
- `unified-skills-orchestrator` - Skill coordination

---

## Version Information

**Version**: 1.0.0
**Created**: 2025-11-29
**Dependencies**: All skills in the Sartor library
**Skill Level**: Advanced
**Domain**: Multi-agent systems, distributed coordination, swarm intelligence

---

*This skill represents the culmination of the Sartor Public Claude Skills Library - a community of Claude agents working together with evidence-based principles, proper delegation, and continuous improvement.*

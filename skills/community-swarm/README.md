# Community Swarm

A multi-agent orchestration skill that coordinates 8-10 specialized Claude agents working together using inter-agent communication protocols.

## Quick Start

This skill enables complex tasks to be handled by a community of specialized agents that communicate, collaborate, and validate each other's work.

### Key Concepts

1. **Delegation-Only Orchestrator**: The orchestrator NEVER executes tasks - it only delegates
2. **10 Specialized Agents**: Each agent has specific capabilities and responsibilities
3. **Inter-Agent Communication**: Agents communicate through standardized protocols
4. **Quality Gates**: Multi-stage validation ensures output quality
5. **Evidence-Based Outputs**: All claims must have citations and confidence scores
6. **Continuous Improvement**: Autonomous agent suggests optimizations

### The 10 Agents

| # | Agent | Role |
|---|-------|------|
| 1 | Assessment | Analyze requirements, scope, dependencies |
| 2 | Implementation | Write code, make changes |
| 3 | Validation | Test and verify implementations |
| 4 | Research | Find information, best practices |
| 5 | Synthesis | Combine findings, write documentation |
| 6 | Quality Gate | Enforce quality standards |
| 7 | Monitor | Observe swarm, detect issues |
| 8 | Audit | Review decisions, check compliance |
| 9 | Git | Manage version control |
| 10 | Autonomous | Suggest improvements |

## Usage

```typescript
const swarm = new CommunitySwarm({
  agents: 10,
  contextProtection: true,
  evidenceRequired: true
});

const result = await swarm.execute({
  task: "Build a user authentication system",
  requirements: ["JWT", "refresh tokens", "rate limiting"]
});
```

## Key Features

- **Parallel Execution**: Agents work simultaneously when possible
- **Context Protection**: Orchestrator sees summaries only, not full content
- **Quality Assurance**: Multi-gate validation pipeline
- **Audit Trail**: Complete logging of all operations
- **Failure Recovery**: Automatic retry, reassign, or escalate

## Files

- `SKILL.md` - Complete skill documentation
- `VALIDATION.md` - Validation framework with 47+ tests
- `templates/` - TypeScript implementations
- `reference/` - Architecture and troubleshooting guides
- `scripts/` - Utility scripts
- `tests/` - Test suite

## When to Use

- Complex tasks requiring multiple perspectives
- Tasks benefiting from parallel execution
- Quality-critical work needing peer review
- Tasks requiring auditable, evidence-based outputs

## When NOT to Use

- Simple tasks for a single agent
- Time-critical operations
- Resource-constrained environments
- Tasks with strict token limits

## Related Skills

- `enhanced-multi-agent-orchestration` - 8-agent patterns
- `agent-communication-system` - Communication protocols
- `evidence-based-validation` - Evidence requirements
- `autonomous-action-agent` - Improvement patterns

---

*Part of the Sartor Public Claude Skills Library*

# Community Swarm Examples

This directory contains practical examples demonstrating how to use the community-swarm skill.

## Available Examples

### 1. Basic Swarm Usage (`basic-swarm-usage.ts`)

A simple example showing:
- Creating a swarm coordinator
- Registering agents
- Delegating tasks (orchestrator delegation-only pattern)
- Sharing data between agents
- Checking swarm status

**Run:**
```bash
npx ts-node examples/basic-swarm-usage.ts
```

### 2. Advanced Swarm Collaboration (`advanced-swarm-collaboration.ts`)

A comprehensive example showing full 10-agent collaboration:
- Spawning all 10 agents (6 opus + 4 haiku)
- Complex task decomposition
- Inter-agent communication and assistance
- Quality gate validation
- Monitoring and health checks
- Compliance auditing
- Git operations
- Autonomous improvement suggestions

**Run:**
```bash
npx ts-node examples/advanced-swarm-collaboration.ts
```

## Key Concepts Demonstrated

### Delegation-Only Pattern

The orchestrator NEVER executes tasks directly:
```typescript
// CORRECT - Delegate to an agent
task.assignedTo = AgentId.ASSESSMENT;
await coordinator.delegateTask(task);

// WRONG - Orchestrator doing work
orchestrator.analyze(data);  // Never do this!
```

### Evidence-Based Outputs

All agent outputs must include evidence:
```typescript
const evidence: Evidence = {
  citations: ['source-1', 'source-2'],
  confidence: 0.8,  // Calculate based on actual evidence
  sources: ['where-data-came-from']
};
```

### Context Protection

The orchestrator receives summaries only, not full content:
```typescript
contextProtection: {
  enabled: true,
  maxSummaryWords: 500,  // Adjust based on your needs
  maxCodeLines: 10
}
```

## Configuration Notes

All numeric thresholds and timeouts in the examples are **configurable starting points**. You should measure your specific environment and adjust accordingly:

- **Timeouts**: Depend on task complexity and network conditions
- **Confidence thresholds**: Depend on your quality requirements
- **Context limits**: Depend on your token budget

See the troubleshooting guide for more details on tuning these values.

## Prerequisites

- Node.js 18+
- TypeScript
- ts-node for running examples directly

## Running Examples

```bash
# Install dependencies (from skill root)
npm install

# Run an example
npx ts-node examples/basic-swarm-usage.ts
```

---

*Part of the Sartor Public Claude Skills Library*

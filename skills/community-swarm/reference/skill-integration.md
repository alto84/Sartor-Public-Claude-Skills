# Skill Integration Guide

This guide explains how the community-swarm skill integrates with other skills in the Sartor library.

## Related Skills

### 1. Agent Communication System
**Location:** `skills/agent-communication-system/`

The community-swarm skill builds upon the communication patterns defined in agent-communication-system:

| Agent Communication System | Community Swarm Equivalent |
|---------------------------|---------------------------|
| `MCPMessage` | `SwarmMessage` |
| `InterAgentCoordinator` | `SwarmCoordinator` |
| `SharedDataEntry` | `SharedDataEntry` (compatible) |
| `QualityGate` | `QualityGate` (extended) |

**Integration Example:**
```typescript
// Use agent-communication-system types
import { MCPMessage } from 'agent-communication-system/templates/message-types';

// Convert to swarm message
const swarmMessage: SwarmMessage = {
  ...mcpMessage,
  evidence: { citations: [], confidence: 0.8, sources: [] }
};
```

### 2. Enhanced Multi-Agent Orchestration
**Location:** `skills/enhanced-multi-agent-orchestration/`

Community-swarm extends the 8-agent pattern:

| Enhanced Multi-Agent (8 agents) | Community Swarm (10 agents) |
|--------------------------------|----------------------------|
| Assessment Agent | ✓ Same |
| Implementation Agent | ✓ Same |
| Validation Agent | ✓ Same |
| Research Agent | ✓ Same |
| Synthesis Agent | ✓ Same |
| Quality Gate Agent | ✓ Same |
| Monitor Agent | ✓ Same |
| Git Agent | ✓ Same |
| — | **Audit Agent** (new) |
| — | **Autonomous Agent** (new) |

**Migration from 8 to 10 agents:**
```typescript
// 8-agent mode (compatible with enhanced-multi-agent-orchestration)
const swarm8 = new CommunitySwarm({
  agentCount: 8,
  // Omit AUDIT and AUTONOMOUS
});

// 10-agent mode (full community-swarm)
const swarm10 = new CommunitySwarm({
  agentCount: 10,
  // All agents enabled
});
```

### 3. Evidence-Based Validation
**Location:** `skills/evidence-based-validation/`

All community-swarm outputs comply with evidence-based validation:

| Requirement | Community Swarm Implementation |
|-------------|-------------------------------|
| No fabricated metrics | `calculateConfidence()` derives from evidence |
| Citations required | `Evidence.citations` array |
| Uncertainty expression | `Evidence.confidence` score (0.0-1.0) |
| Speculative marking | `Evidence.isSpeculative` flag |

**Validation Integration:**
```typescript
// All agents use dynamic confidence calculation
protected calculateConfidence(evidence: Partial<Evidence>): number {
  let confidence = 0.5; // Baseline uncertainty

  if (evidence.citations?.length > 0) {
    confidence += evidence.citations.length * 0.1;
  }
  if (evidence.isSpeculative) {
    confidence -= 0.2;
  }

  return Math.min(0.95, Math.max(0.1, confidence));
}
```

### 4. Autonomous Action Agent
**Location:** `skills/autonomous-action-agent/`

The community-swarm `AutonomousAgent` implements the patterns from this skill:

| Autonomous Action Agent Concept | Community Swarm Implementation |
|--------------------------------|-------------------------------|
| Continuous monitoring | `MonitorAgent` + `AutonomousAgent` |
| Improvement suggestions | `ImprovementSuggestion` type |
| Creative latitude | Preserved within evidence constraints |
| Learning from feedback | `coordinator.getSuggestions()` |

### 5. Multi-Agent Orchestration (Basic)
**Location:** `skills/multi-agent-orchestration/`

Community-swarm implements the foundational patterns:

| Basic Concept | Community Swarm Implementation |
|--------------|-------------------------------|
| Consensus mechanisms | Quality gate voting |
| Distributed state | Shared data pool |
| Agent coordination | SwarmCoordinator |
| Failure handling | Recovery strategies (RETRY, REASSIGN, ROLLBACK, ESCALATE) |

## Integration Patterns

### Pattern 1: Skill Chaining

Run skills in sequence:
```text
1. Use evidence-based-validation for initial assessment
2. Use multi-agent-orchestration for planning
3. Use community-swarm for execution
4. Use agent-communication-system for debugging
```

### Pattern 2: Skill Composition

Combine skills within community-swarm:
```typescript
// Research Agent uses evidence-based-validation
class ResearchAgent extends SwarmAgent {
  async executeTask(task: SwarmTask) {
    // Apply evidence-based validation to all findings
    const findings = await this.search(task.inputs);
    return this.validateEvidence(findings);
  }
}
```

### Pattern 3: Skill Delegation

Orchestrator delegates to appropriate skills:
```text
Task: "Build and test authentication module"
  ├── Delegate to: community-swarm (execution)
  │   ├── Assessment Agent (requirements)
  │   ├── Research Agent (best practices)
  │   ├── Implementation Agent (code)
  │   └── Validation Agent (tests)
  └── Apply: evidence-based-validation (quality)
```

## Compatibility Matrix

| Skill | Compatible | Integration Level | Notes |
|-------|------------|-------------------|-------|
| agent-communication-system | ✓ | High | Shared message patterns |
| enhanced-multi-agent-orchestration | ✓ | High | 8→10 agent extension |
| evidence-based-validation | ✓ | Core | All outputs validated |
| evidence-based-engineering | ✓ | Core | Anti-fabrication protocol |
| autonomous-action-agent | ✓ | High | Agent #10 implementation |
| multi-agent-orchestration | ✓ | Medium | Foundational patterns |
| distributed-systems-debugging | ✓ | Medium | Troubleshooting integration |
| mcp-server-development | ○ | Low | For custom MCP servers |
| safety-research-workflow | ○ | Low | Research coordination |
| unified-skills-orchestrator | ✓ | High | Automatic activation |

Legend: ✓ = Full integration, ○ = Partial integration

## Activation with Unified Skills Orchestrator

When using `unified-skills-orchestrator`, community-swarm activates for:
- Tasks mentioning "swarm", "multi-agent", "parallel agents"
- Complex tasks benefiting from 8-10 agent collaboration
- Tasks requiring audit trails or compliance verification
- Tasks needing continuous improvement suggestions

```yaml
# Activation patterns
activation_patterns:
  - "spin up.*agents"
  - "multi-agent.*collaboration"
  - "swarm.*execution"
  - "parallel.*agents"
  - "8-10 agents"
  - "delegation.*pattern"
```

---

*Part of the Sartor Public Claude Skills Library*

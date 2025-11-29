# Unified Skills Orchestrator

## Overview

The Unified Skills Orchestrator is a meta-skill that provides intelligent coordination and management of all skills in the Sartor Public Claude Skills Library. It acts as a sophisticated routing and orchestration layer that ensures the right skills are activated at the right time, in the right order, with proper validation throughout.

## Architecture

```
User Request
     ↓
┌────────────────────────────┐
│  Unified Orchestrator      │
│  - Analyzes request        │
│  - Detects skill needs     │
│  - Manages dependencies    │
└────────────────────────────┘
     ↓
┌────────────────────────────┐
│  Skill Activation Engine   │
│  - Foundational (always)   │
│  - Domain (contextual)     │
│  - Specialized (explicit)  │
└────────────────────────────┘
     ↓
┌────────────────────────────┐
│  Execution & Handoff       │
│  - Monitors progress       │
│  - Manages transitions     │
│  - Resolves conflicts     │
└────────────────────────────┘
     ↓
┌────────────────────────────┐
│  Validation & Completion   │
│  - Evidence verification   │
│  - Quality assurance       │
│  - Consolidated output     │
└────────────────────────────┘
```

## Quick Start Examples

### Example 1: Multi-Agent System Development

**User Request:** "I need to build a multi-agent consensus system with message passing"

**Orchestrator Activation Sequence:**
1. `evidence-based-engineering` - Establish metrics baseline
2. `multi-agent-orchestration` - Design consensus architecture
3. `agent-communication-system` - Implement message protocols
4. `distributed-systems-debugging` - Test and debug
5. `evidence-based-validation` - Verify all claims

### Example 2: MCP Server with Performance Requirements

**User Request:** "Create an MCP server that handles 1000 requests per second"

**Orchestrator Activation Sequence:**
1. `evidence-based-engineering` - Verify performance claim feasibility
2. `mcp-server-development` - Build the server
3. `distributed-systems-debugging` - Profile and optimize
4. `evidence-based-validation` - Confirm performance metrics

### Example 3: System Architecture Research

**User Request:** "Analyze and document the architecture of this distributed system"

**Orchestrator Activation Sequence:**
1. `safety-research-workflow` - Establish research methodology
2. `evidence-based-engineering` - Set measurement criteria
3. `multi-agent-orchestration` - Analyze coordination patterns
4. `distributed-systems-debugging` - Trace system behavior
5. `evidence-based-validation` - Validate findings

## Skill Integration Map

| Skill | Role in Orchestration | Dependencies | Handoff Points |
|-------|----------------------|--------------|----------------|
| **evidence-based-engineering** | Foundation for all claims | None (always first) | All domain skills |
| **evidence-based-validation** | Verification of outcomes | All skills complete | Final output |
| **multi-agent-orchestration** | Architecture & coordination | Evidence foundation | Communication system |
| **agent-communication-system** | Protocol implementation | Multi-agent architecture | Debugging |
| **mcp-server-development** | Server implementation | Evidence foundation | Debugging |
| **distributed-systems-debugging** | Troubleshooting & profiling | Implementation complete | Validation |
| **safety-research-workflow** | Research methodology | Evidence foundation | All relevant skills |

## Common Workflows

### Workflow 1: Full-Stack Development
```
Start → Evidence Foundation → Architecture → Implementation → Testing → Validation → Complete
```

### Workflow 2: Debugging Investigation
```
Start → Evidence Baseline → Debug Analysis → Root Cause → Fix → Validation → Complete
```

### Workflow 3: Research & Analysis
```
Start → Research Method → Evidence Gathering → Domain Analysis → Synthesis → Validation → Report
```

## Decision Trees

### Primary Decision: Task Classification
```
Is it a claim or metric?
  YES → Activate evidence-based-engineering

Is it multi-agent related?
  YES → Activate multi-agent-orchestration

Is it about communication?
  YES → Activate agent-communication-system

Is it MCP/server related?
  YES → Activate mcp-server-development

Is it debugging/troubleshooting?
  YES → Activate distributed-systems-debugging

Is it research/analysis?
  YES → Activate safety-research-workflow

Always end with:
  → Activate evidence-based-validation
```

## Anti-Pattern Examples

### ❌ Wrong: Skipping Evidence Layer
```
User: "Build a high-performance server"
Wrong: mcp-server-development → Complete
Right: evidence-based-engineering → mcp-server-development → evidence-based-validation
```

### ❌ Wrong: Parallel Conflicting Skills
```
User: "Design and implement agent communication"
Wrong: multi-agent-orchestration + agent-communication-system (parallel)
Right: multi-agent-orchestration → agent-communication-system (sequential)
```

### ❌ Wrong: Over-Orchestration
```
User: "What is MCP?"
Wrong: Full orchestration activation
Right: Direct response (no orchestration needed for simple questions)
```

## Best Practices

1. **Always Start with Evidence**: Every task begins with evidence-based-engineering
2. **Sequential over Parallel**: Skills work better in sequence with clear handoffs
3. **Validate Everything**: End with evidence-based-validation
4. **Document Decisions**: Track why each skill was activated
5. **Monitor Conflicts**: Watch for skill overlap and resolve appropriately

## Metrics and Monitoring

The orchestrator tracks:
- **Activation Patterns**: Which skills are used together
- **Success Rates**: Task completion with different skill combinations
- **Conflict Events**: When skills needed resolution
- **Performance**: Time spent in each skill
- **Validation Results**: Pass/fail rates by skill combination

## FAQ

**Q: When should I use the orchestrator vs. individual skills?**
A: Use the orchestrator for any task requiring multiple skills or when unsure. Use individual skills only when explicitly targeting single capabilities.

**Q: What if skills conflict?**
A: The orchestrator resolves conflicts based on hierarchy: evidence > architecture > implementation > debugging.

**Q: Can I customize the orchestration sequence?**
A: Yes, but evidence-based skills must always bookend the sequence (start and end).

**Q: How does the orchestrator handle failures?**
A: It implements feedback loops, re-activating earlier skills if validation fails.

## Contributing

To enhance the orchestrator:
1. Update skill dependencies when adding new skills
2. Maintain the activation matrix
3. Document new integration patterns
4. Add conflict resolution rules as discovered

## Version History

- **1.0.0**: Initial orchestrator with 7 base skills
- Establishes foundational → domain → specialized hierarchy
- Implements automatic skill detection
- Provides comprehensive integration patterns
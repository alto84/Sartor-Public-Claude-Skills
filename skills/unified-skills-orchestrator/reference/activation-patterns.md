# Unified Skills Orchestrator - Activation Patterns

## Skill Activation Rules

### Always Active (Foundational)

These skills are always active and don't require pattern matching:

1. **evidence-based-engineering**
   - Active for ALL outputs
   - Enforces anti-fabrication protocol

2. **evidence-based-validation**
   - Active when making claims
   - Validates all metrics and assertions

### Context-Activated (Domain)

Pattern matching triggers these skills:

| Skill | Activation Patterns |
|-------|-------------------|
| multi-agent-orchestration | "agent", "orchestrat", "coordinat", "multi-agent" |
| agent-communication-system | "agent communi", "message", "MCP", "protocol" |
| mcp-server-development | "MCP server", "tool develop", "MCP tool" |
| distributed-systems-debugging | "debug", "distributed", "network", "partition" |
| community-swarm | "swarm", "10 agent", "parallel agent", "delegation" |

### Explicit Activation (Specialized)

These require explicit invocation:

| Skill | Invocation |
|-------|-----------|
| safety-research-workflow | "research", "safety", "literature review" |
| enhanced-multi-agent-orchestration | "8 agent", "context protection" |
| autonomous-action-agent | "autonomous", "continuous improvement" |

## Conflict Resolution

When multiple skills match:

1. Higher specificity wins
2. Foundational skills always apply
3. No more than 3 domain skills active simultaneously

---

*Part of the Sartor Public Claude Skills Library*

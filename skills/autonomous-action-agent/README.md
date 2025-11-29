# Autonomous Action Agent

An agent that monitors parallel task execution, identifies optimization opportunities, and suggests improvements - letting Claude be Claude within evidence-based constraints.

## Quick Start

This skill enables autonomous improvement suggestions during multi-agent workflows.

### Key Concepts

1. **Continuous Monitoring**: Observes agent work without blocking
2. **Pattern Detection**: Identifies optimization opportunities
3. **Creative Freedom**: Suggests novel approaches within constraints
4. **Evidence Grounding**: All suggestions backed by observations

### Suggestion Categories

| Category | Description |
|----------|-------------|
| Optimization | Performance improvements |
| Quality | Code/documentation quality |
| Consistency | Uniformity improvements |
| Security | Security observations |
| Creative | Novel approaches |
| Integration | Cross-agent improvements |

## Usage

The autonomous agent integrates with the enhanced multi-agent orchestration system:

```typescript
const orchestration = new EnhancedOrchestration({
  autonomousAgent: {
    enabled: true,
    suggestionThreshold: 0.6,
    maxSuggestionsPerMinute: 10
  }
});
```

## Key Features

- **Non-blocking**: Monitors without slowing execution
- **Learning**: Adapts based on accepted/rejected suggestions
- **Evidence-based**: All suggestions include supporting evidence
- **Speculative marking**: Creative ideas clearly marked as hypotheses

## When to Use

- Multi-agent parallel workflows
- Long-running complex operations
- Projects benefiting from continuous improvement
- When you want a "second pair of eyes"

## Files

- `SKILL.md` - Complete skill documentation
- `README.md` - This file

## Related Skills

- `enhanced-multi-agent-orchestration` - Primary integration
- `evidence-based-validation` - Ensures evidence standards
- `unified-skills-orchestrator` - Meta-skill coordination

---

*Part of the Sartor Public Claude Skills Library*

# Autonomous Action Agent Patterns

## Core Patterns

### 1. Continuous Monitoring
The autonomous agent monitors running workflows and identifies improvement opportunities.

```text
Monitor → Analyze → Suggest → Wait for Feedback → Learn
```

### 2. Evidence-Based Suggestions
All suggestions must include:
- Source of observation
- Confidence level (derived from evidence)
- Expected impact (if known)
- Potential risks

### 3. Non-Blocking Recommendations
Suggestions are always advisory:
- Never block workflow execution
- Never make changes without approval
- Always allow dismissal without consequence

## Integration Points

- **Multi-Agent Orchestration**: Runs as a parallel agent
- **Evidence-Based Validation**: All outputs comply
- **Community Swarm**: Implemented as Agent #10

---

*Part of the Sartor Public Claude Skills Library*

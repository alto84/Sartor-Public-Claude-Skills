# Community Swarm Troubleshooting Guide

## Common Issues and Solutions

### Agent Spawning Issues

#### Issue: Agent Fails to Spawn
**Symptoms**:
- Agent registration fails
- `PRE_SPAWN` hook error
- Resource limit exceeded

**Possible Causes**:
1. Maximum agent limit reached (default: 10)
2. Insufficient memory
3. Capability validation failed

**Solutions**:
```text
1. Check current agent count:
   - Call coordinator.getStatus()
   - Verify agents.length < maxAgents

2. Check resource hooks:
   - Review pre_spawn hook configuration
   - Verify memory_limit settings

3. Validate agent specification:
   - Ensure required fields present
   - Check capability list is valid
```

---

### Communication Failures

#### Issue: Messages Not Delivered
**Symptoms**:
- Agents not responding
- Message queue growing
- Dead letter queue filling

**Debugging Steps**:
```text
1. Check agent registration:
   coordinator.getStatus().agents
   - Verify receiving agent is READY
   - Check lastHeartbeat is recent

2. Check message handler:
   - Ensure handler registered for agent
   - Verify handler not throwing errors

3. Check message format:
   - Validate message structure
   - Ensure 'to' field is correct AgentId

4. Check priority queue:
   - High priority messages processed first
   - Low priority may be delayed
```

#### Issue: Assistance Request Fails
**Symptoms**:
- "No agent with capability" error
- Assistance timeout

**Solutions**:
```text
1. Verify capability exists:
   - Check agent capabilities list
   - Use exact capability string

2. Check agent availability:
   - Agent must be in READY status
   - Agent not at max concurrent tasks

3. Verify not requesting from self:
   - fromAgent !== target agent
```

---

### Quality Gate Failures

#### Issue: Evidence Gate Failing
**Symptoms**:
- "Missing citations" error
- "Confidence below threshold" error

**Required Evidence Structure**:
```typescript
{
  citations: ['source1', 'source2'],  // Required: at least 1
  confidence: 0.8,                     // Required: >= minConfidence
  sources: ['where-evidence-came-from']
}
```

**Solutions**:
```text
1. Add citations to output:
   - Every claim needs a citation
   - Use real, verifiable sources

2. Include confidence score:
   - 0.0 - 1.0 scale
   - Be honest about uncertainty

3. Mark speculative suggestions:
   - Set isSpeculative: true
   - Lower confidence score
```

#### Issue: Format Gate Failing
**Symptoms**:
- "Missing required fields" error
- "Invalid structure" error

**Solutions**:
```text
1. Check required fields:
   - Review gate criteria
   - Ensure all fields present

2. Validate types:
   - Fields must be correct type
   - No undefined values
```

---

### Context Protection Violations

#### Issue: Summary Too Long
**Symptoms**:
- "Summary exceeds word limit" error
- Context protection rejection

**Solutions**:
```text
1. Summarize more concisely:
   - Focus on key points
   - Remove redundancy
   - Use bullet points

2. Default limit is 500 words:
   - Configure in SwarmConfig
   - contextProtection.maxSummaryWords

Example good summary (< 500 words):
"Analyzed 15 files. Found 3 security issues:
- SQL injection in user.ts:45
- XSS vulnerability in render.ts:89
- Missing authentication in api.ts:23
Recommendations attached. Confidence: 0.85."
```

#### Issue: Code Snippet Too Long
**Symptoms**:
- Code rejected from summary
- "Code exceeds line limit" error

**Solutions**:
```text
1. Show only relevant lines:
   - Max 10 lines in summary
   - Reference file:line for full code

2. Use pseudo-code:
   - Describe logic, not syntax
   - Link to implementation
```

---

### Task Execution Issues

#### Issue: Task Timeout
**Symptoms**:
- Task never completes
- Timeout error raised

**Solutions**:
```text
1. Check task timeout setting:
   - Default: 60000ms (1 minute)
   - Configure per task or globally

2. Check for blocking operations:
   - Async operations must await
   - No infinite loops

3. Check dependencies:
   - Dependent tasks must complete first
   - Circular dependencies cause deadlock
```

#### Issue: Orchestrator Executing Tasks
**Symptoms**:
- Delegation violation error
- Audit shows orchestrator action

**THIS IS A CRITICAL ERROR**

The orchestrator must NEVER execute tasks. Always:
```text
// WRONG - Orchestrator doing work
orchestrator.readFile(path);

// CORRECT - Delegate to agent
coordinator.delegateTask({
  type: 'read-file',
  assignedTo: AgentId.ASSESSMENT,
  ...
});
```

---

### Hook Execution Issues

#### Issue: Hook Blocking Execution
**Symptoms**:
- "Hook blocked execution" error
- Process halted at hook

**Solutions**:
```text
1. Check hook return value:
   - Must return { proceed: true }
   - Or throw error with reason

2. Check hook priority:
   - Higher priority runs first
   - Critical hooks stop on error

3. Non-critical hooks:
   - Set critical: false
   - Will log error but continue
```

#### Issue: Hooks Not Firing
**Symptoms**:
- Expected hooks not running
- Lifecycle events missed

**Solutions**:
```text
1. Verify hook registration:
   - Check hooks Map
   - Correct HookType enum value

2. Check hook configuration:
   - enabled: true in config
   - Priority set appropriately
```

---

### Data Pool Issues

#### Issue: Data Not Found
**Symptoms**:
- getData returns undefined
- Missing shared data

**Solutions**:
```text
1. Check key spelling:
   - Keys are case-sensitive
   - Use consistent naming

2. Check write timing:
   - Data must be written before read
   - Check task dependencies

3. Check TTL:
   - Data may have expired
   - Increase TTL if needed
```

#### Issue: Data Version Conflicts
**Symptoms**:
- Unexpected data values
- Version mismatch

**Solutions**:
```text
1. Check access log:
   - Review who wrote when
   - Identify conflicting writes

2. Use optimistic locking:
   - Check version before write
   - Handle conflicts gracefully
```

---

### Recovery Issues

#### Issue: Retry Loop
**Symptoms**:
- Same error repeating
- Max retries exceeded

**Solutions**:
```text
1. Fix underlying error:
   - Retrying won't fix bad code
   - Address root cause

2. Use different recovery strategy:
   - REASSIGN to different agent
   - ROLLBACK and replan

3. Escalate:
   - Some errors need human intervention
```

---

## Debugging Checklist

### Before Starting
- [ ] All 10 agents registered
- [ ] Message handlers set up
- [ ] Hooks configured
- [ ] Quality gates defined
- [ ] Context protection enabled

### During Execution
- [ ] Check swarm status regularly
- [ ] Monitor message queue depth
- [ ] Watch for quality gate failures
- [ ] Review audit log for anomalies

### After Completion
- [ ] Verify all tasks completed
- [ ] Check quality gates passed
- [ ] Review improvement suggestions
- [ ] Confirm clean shutdown

---

## Getting Help

1. **Check VALIDATION.md**: Run validation tests
2. **Review Audit Log**: `coordinator.getAuditLog()`
3. **Check Agent Status**: `coordinator.getStatus()`
4. **Review Related Skills**:
   - `agent-communication-system` for messaging
   - `evidence-based-validation` for evidence issues
   - `distributed-systems-debugging` for coordination

---

*Part of the Sartor Public Claude Skills Library*

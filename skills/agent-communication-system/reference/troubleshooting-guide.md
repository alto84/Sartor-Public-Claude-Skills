# Troubleshooting Guide

## Common Issues

### Messages Not Delivered

**Symptom**
- Agent sends message but recipient never receives it
- No error messages in sender logs
- Silent failure of communication

**Possible Causes**
1. Incorrect agent addressing/naming
2. Message queue overflow
3. Serialization/deserialization errors
4. Network or file system permissions
5. Agent not registered with coordinator

**Diagnostic Steps**
1. Check agent registration:
   ```typescript
   console.log('Registered agents:', coordinator.getRegisteredAgents());
   ```

2. Verify message format:
   ```typescript
   console.log('Message structure:', JSON.stringify(message, null, 2));
   ```

3. Enable debug logging:
   ```typescript
   process.env.AGENT_DEBUG = 'true';
   ```

4. Test with echo message:
   ```typescript
   await coordinator.send('echo', { from: 'test', to: targetAgent });
   ```

**Solutions**
- Ensure agents are registered before sending messages
- Implement message acknowledgment system
- Add retry logic with exponential backoff
- Validate message schema before sending
- Check file permissions for file-based communication

### Agent Not Responding

**Symptom**
- Agent receives messages but doesn't process them
- Timeout errors when waiting for responses
- Agent appears online but unresponsive

**Possible Causes**
1. Agent stuck in infinite loop
2. Message handler throwing uncaught exceptions
3. Agent overwhelmed with message backlog
4. Deadlock in agent logic
5. Resource exhaustion (memory/CPU)

**Diagnostic Steps**
1. Check agent health status:
   ```typescript
   const health = await agent.healthCheck();
   console.log('Agent health:', health);
   ```

2. Monitor message queue depth:
   ```typescript
   console.log('Queue depth:', agent.getQueueDepth());
   ```

3. Profile agent performance:
   ```typescript
   console.time('MessageProcessing');
   await agent.processMessage(testMessage);
   console.timeEnd('MessageProcessing');
   ```

4. Check for unhandled exceptions:
   ```typescript
   process.on('unhandledRejection', (error) => {
     console.error('Unhandled rejection in agent:', error);
   });
   ```

**Solutions**
- Implement timeout for message processing
- Add circuit breaker pattern
- Limit concurrent message processing
- Implement graceful degradation
- Add health check endpoints

### Quality Gates Always Failing

**Symptom**
- All agent responses rejected by quality gates
- Valid responses marked as invalid
- Quality scores consistently too low

**Possible Causes**
1. Quality criteria too strict
2. Misaligned evaluation metrics
3. Incorrect response format
4. Missing required fields in responses
5. Timeout before quality check completes

**Diagnostic Steps**
1. Log quality gate evaluations:
   ```typescript
   const result = await qualityGate.evaluate(response);
   console.log('Quality evaluation:', {
     passed: result.passed,
     score: result.score,
     failures: result.failures
   });
   ```

2. Test with known good response:
   ```typescript
   const testResponse = { /* known good structure */ };
   const result = await qualityGate.evaluate(testResponse);
   ```

3. Review quality criteria:
   ```typescript
   console.log('Active criteria:', qualityGate.getCriteria());
   ```

**Solutions**
- Adjust quality thresholds based on empirical data
- Implement graduated quality levels
- Add detailed failure reasons to logs
- Create quality gate bypass for testing
- Implement partial success handling

### Deadlock Between Agents

**Symptom**
- Two or more agents waiting for each other
- System appears frozen
- No progress despite active agents

**Possible Causes**
1. Circular dependencies in agent communication
2. Synchronous blocking calls between agents
3. Resource contention
4. Incorrect locking order
5. Missing timeout handling

**Diagnostic Steps**
1. Visualize agent dependencies:
   ```typescript
   const deps = coordinator.getAgentDependencies();
   console.log('Dependency graph:', deps);
   ```

2. Check for circular waits:
   ```typescript
   const waiting = coordinator.getWaitingAgents();
   waiting.forEach(agent => {
     console.log(`${agent.name} waiting for:`, agent.waitingFor);
   });
   ```

3. Monitor lock acquisition:
   ```typescript
   coordinator.on('lock:acquire', (agent, resource) => {
     console.log(`${agent} acquired lock on ${resource}`);
   });
   ```

**Solutions**
- Implement deadlock detection algorithm
- Use timeouts for all blocking operations
- Implement resource ordering protocol
- Convert to async/non-blocking communication
- Add deadlock recovery mechanism

## Debugging Checklist

### Initial Setup Verification
- [ ] All agents properly initialized
- [ ] Communication channels established
- [ ] Required dependencies installed
- [ ] Environment variables configured
- [ ] File permissions set correctly

### Communication Flow
- [ ] Messages being sent from source
- [ ] Messages arriving at destination
- [ ] Message format validated
- [ ] Response sent back
- [ ] Response received by sender

### Performance Monitoring
- [ ] Message processing time < threshold
- [ ] Queue depth within limits
- [ ] Memory usage stable
- [ ] CPU usage reasonable
- [ ] No memory leaks detected

### Error Handling
- [ ] All errors caught and logged
- [ ] Retry logic functioning
- [ ] Circuit breakers working
- [ ] Fallback mechanisms active
- [ ] Error recovery successful

### System Health
- [ ] All agents reporting healthy
- [ ] No deadlocks detected
- [ ] Quality gates functioning
- [ ] Logs accessible and verbose
- [ ] Monitoring dashboards updated

## Logging Best Practices

### Structured Logging Setup

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'agent-communication',
    agentId: process.env.AGENT_ID
  },
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'combined.log'
    })
  ]
});
```

### Log Levels Strategy

| Level | Use Case | Example |
|-------|----------|---------|
| error | Failures requiring immediate attention | `logger.error('Failed to send message', { error, agentId })` |
| warn  | Degraded performance or retries | `logger.warn('Retry attempt', { attempt, maxRetries })` |
| info  | Normal flow milestones | `logger.info('Message sent', { messageId, to, from })` |
| debug | Detailed diagnostic information | `logger.debug('Queue state', { depth, processing })` |
| trace | Very detailed debugging | `logger.trace('Raw message', { payload })` |

### Correlation IDs

```typescript
// Generate correlation ID for request tracking
import { v4 as uuidv4 } from 'uuid';

class MessageContext {
  constructor(parentId?: string) {
    this.correlationId = uuidv4();
    this.parentId = parentId;
    this.timestamp = Date.now();
  }

  log(level: string, message: string, data?: any) {
    logger[level](message, {
      ...data,
      correlationId: this.correlationId,
      parentId: this.parentId,
      elapsed: Date.now() - this.timestamp
    });
  }
}
```

### Performance Logging

```typescript
// Log performance metrics
class PerformanceLogger {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Log if threshold exceeded
    if (value > this.getThreshold(name)) {
      logger.warn('Performance threshold exceeded', {
        metric: name,
        value,
        threshold: this.getThreshold(name)
      });
    }
  }

  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    return {
      count: values.length,
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }
}
```

### Debug Mode Configuration

```typescript
// Enable verbose logging for debugging
export function enableDebugMode() {
  // Set log level to trace
  logger.level = 'trace';

  // Log all agent events
  coordinator.on('*', (event, data) => {
    logger.trace('Agent event', { event, data });
  });

  // Log all messages
  coordinator.interceptMessages((message) => {
    logger.trace('Message intercepted', {
      from: message.from,
      to: message.to,
      type: message.type,
      size: JSON.stringify(message).length
    });
  });

  // Enable stack traces for all errors
  Error.stackTraceLimit = Infinity;

  // Log memory usage every 30 seconds
  setInterval(() => {
    const usage = process.memoryUsage();
    logger.debug('Memory usage', {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`
    });
  }, 30000);
}
```

## Emergency Recovery Procedures

### System Reset
```bash
# Stop all agents
npm run agents:stop

# Clear message queues
npm run queues:clear

# Reset shared state
npm run state:reset

# Restart agents
npm run agents:start
```

### Data Recovery
```bash
# Backup current state
npm run backup:create

# Restore from backup
npm run backup:restore --timestamp=2024-01-15T10:30:00

# Verify integrity
npm run integrity:check
```

---
*Part of the Sartor Public Claude Skills Library - Agent Communication System*
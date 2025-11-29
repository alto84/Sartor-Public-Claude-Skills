# Simple Two-Agent Communication Example

This example demonstrates the fundamental pattern of two agents communicating through a coordinator using the MCP protocol.

## What This Example Demonstrates

- **Agent Registration**: How agents register with a coordinator
- **Message Routing**: Direct point-to-point communication between agents
- **Request/Response Pattern**: SearchAgent sends data, SynthesisAgent requests and processes it
- **Shared Data Pool**: How agents share data through the coordinator
- **Progress Tracking**: Real-time status updates during task execution
- **Error Handling**: Graceful failure management

## Architecture

```
      Coordinator (MCP Hub)
           /        \
          /          \
    SearchAgent   SynthesisAgent
    (Producer)    (Consumer)
```

## How to Run

### Prerequisites
```bash
# Install dependencies (if running in TypeScript)
npm install
# OR for JavaScript version
node main.js
```

### Running the Example
```bash
# TypeScript version
npx ts-node main.ts

# JavaScript version
node main.js
```

### Command Line Options
```bash
# Run with verbose logging
node main.js --verbose

# Run with custom agent names
node main.js --search-agent="ResearchBot" --synthesis-agent="WriterBot"

# Run with performance metrics
node main.js --metrics
```

## Expected Output

```
=== Agent Communication System Starting ===
[10:00:00] Coordinator initialized
[10:00:00] SearchAgent registered with capabilities: [search, data-extraction]
[10:00:00] SynthesisAgent registered with capabilities: [synthesis, summarization]

[10:00:01] SearchAgent: Starting search for "quantum computing applications"
[10:00:01] SearchAgent: Progress - 25% - Finding sources
[10:00:02] SearchAgent: Progress - 50% - Extracting data
[10:00:03] SearchAgent: Progress - 75% - Validating sources
[10:00:04] SearchAgent: Complete - Found 5 sources with 12 key findings

[10:00:04] Data shared to pool: "search-results" (12 items, 5 citations)

[10:00:05] SynthesisAgent: Requesting data from SearchAgent
[10:00:05] Message routed: QUERY from synthesis-agent to search-agent
[10:00:05] SearchAgent: Responding with search results

[10:00:06] SynthesisAgent: Processing search results
[10:00:06] SynthesisAgent: Progress - 33% - Analyzing findings
[10:00:07] SynthesisAgent: Progress - 66% - Creating summary
[10:00:08] SynthesisAgent: Complete - Summary created with 5 citations

=== Final Results ===
- Messages exchanged: 8
- Data pool entries: 2
- Total execution time: 8 seconds
- All agents completed successfully
```

## Key Concepts Illustrated

### 1. Agent Registration
Agents register their capabilities with the coordinator, allowing intelligent routing of requests:
```javascript
coordinator.registerAgent({
  id: 'search-agent',
  capabilities: ['search', 'data-extraction'],
  status: 'AVAILABLE'
});
```

### 2. Message Protocol (MCP)
Messages follow the standardized MCP format:
```javascript
{
  id: 'msg-001',
  type: 'DATA_REQUEST',
  from: 'synthesis-agent',
  to: 'search-agent',
  priority: 'NORMAL',
  payload: { query: 'quantum computing' }
}
```

### 3. Shared Data Pool
Agents share data through a centralized pool with metadata:
```javascript
coordinator.shareData('search-results', results, {
  sourceAgent: 'search-agent',
  citations: ['arxiv:123', 'nature:456'],
  tags: ['quantum', 'computing']
});
```

### 4. Progress Reporting
Real-time progress updates keep the coordinator informed:
```javascript
agent.reportProgress('data-extraction', 50, {
  itemsProcessed: 25,
  totalItems: 50
});
```

### 5. Error Recovery
The example includes error handling patterns:
- Timeout management (30-second default)
- Retry logic (3 attempts with exponential backoff)
- Graceful degradation when agents unavailable
- Dead letter queue for failed messages

## Extending the Example

### Add More Agents
```javascript
// Add a validation agent
coordinator.registerAgent({
  id: 'validation-agent',
  capabilities: ['fact-checking', 'citation-validation']
});
```

### Implement Quality Gates
```javascript
coordinator.addQualityGate({
  name: 'citation-check',
  type: 'CITATION_CHECK',
  criteria: { minCitations: 3 }
});
```

### Use Pub-Sub Pattern
```javascript
// Subscribe to topics
coordinator.subscribe('search-agent', 'research-updates');
coordinator.subscribe('synthesis-agent', 'research-updates');

// Publish to topic
coordinator.publish('research-updates', {
  type: 'NEW_FINDINGS',
  data: findings
});
```

## Troubleshooting

### Common Issues

**No agent response**
- Check agent registration status
- Verify message routing configuration
- Ensure agent is not blocked on another task

**Timeout errors**
- Increase timeout value in coordinator config
- Check for infinite loops in agent logic
- Verify network connectivity (if distributed)

**Data not found in pool**
- Confirm data was shared with correct key
- Check access permissions
- Verify data hasn't expired (TTL)

## Performance Considerations

- Message throughput: ~100 msg/sec with in-memory queue
- Latency: <10ms for local agents, varies for distributed
- Memory usage: Scales with data pool size
- CPU: Minimal overhead from coordinator

## Learn More

- See `main.ts` for complete implementation
- Check `../../templates/` for reusable message templates
- Review `../../SKILL.md` for architectural patterns
- Explore other examples for advanced patterns

---
*Part of the Sartor Public Claude Skills Library*
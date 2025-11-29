# File-Based Asynchronous Communication Example

This example demonstrates file-based agent communication using a shared filesystem as the transport layer. Perfect for scenarios where agents run in different processes or need persistent, auditable communication.

## What This Example Demonstrates

- **File-based messaging**: Using JSON files for agent communication
- **Directory structure**: Organized channels for different message types
- **Polling mechanisms**: Agents checking for new instructions
- **Progress tracking**: File-based status updates
- **Completion handling**: Final results and archival
- **Error recovery**: Handling file system failures
- **Message ordering**: FIFO processing with timestamps
- **Audit trail**: Complete history of all communications

## Architecture

```
communication/
├── instructions/       # Tasks assigned to agents
│   ├── task-001.json  # Pending task
│   └── task-002.json  # Another pending task
├── progress/          # Status updates during execution
│   ├── task-001-25.json    # 25% complete
│   └── task-001-50.json    # 50% complete
├── completions/       # Final results
│   └── task-001-complete.json
└── archive/           # Historical records
    └── 2024-01-15/
        └── task-001/
```

## How to Run

### Prerequisites
```bash
# Create communication directories
mkdir -p communication/{instructions,progress,completions,archive}

# Ensure write permissions
chmod 755 communication/*
```

### Running the Coordinator
```bash
# Start the coordinator (watches for tasks and routes them)
node coordinator.js

# With custom polling interval (milliseconds)
node coordinator.js --poll-interval=1000

# With verbose logging
node coordinator.js --verbose
```

### Running an Agent
```bash
# In a separate terminal, start an agent
node agent.js --agent-id=worker-1

# Start multiple agents
node agent.js --agent-id=worker-2
node agent.js --agent-id=worker-3

# Agent with custom capabilities
node agent.js --agent-id=specialist --capabilities=analysis,synthesis
```

### Complete Demo
```bash
# Run the full demo with coordinator and agents
./run-demo.sh

# Or manually:
node coordinator.js &
sleep 2
node agent.js --agent-id=agent-1 &
node agent.js --agent-id=agent-2 &
```

## Expected Output

### Coordinator Output
```
[10:00:00] Coordinator: Started watching communication/instructions/
[10:00:00] Coordinator: Polling interval: 2000ms
[10:00:05] Coordinator: New instruction detected: task-001.json
[10:00:05] Coordinator: Assigned task-001 to agent-1
[10:00:10] Coordinator: Progress update from agent-1: task-001 - 25%
[10:00:15] Coordinator: Progress update from agent-1: task-001 - 50%
[10:00:20] Coordinator: Progress update from agent-1: task-001 - 75%
[10:00:25] Coordinator: Task completed: task-001
[10:00:25] Coordinator: Archiving task-001 to archive/2024-01-15/
```

### Agent Output
```
[10:00:05] Agent-1: Checking for new instructions...
[10:00:05] Agent-1: Received task: task-001 - "Analyze dataset"
[10:00:05] Agent-1: Starting task execution
[10:00:10] Agent-1: Progress: 25% - Loading data
[10:00:15] Agent-1: Progress: 50% - Processing
[10:00:20] Agent-1: Progress: 75% - Generating results
[10:00:25] Agent-1: Task completed successfully
[10:00:25] Agent-1: Results written to completions/task-001-complete.json
```

## Message Formats

### Instruction Message
```json
{
  "messageId": "task-001",
  "type": "TASK",
  "timestamp": "2024-01-15T10:00:00Z",
  "from": "coordinator",
  "to": "any-available-agent",
  "priority": "HIGH",
  "task": {
    "id": "task-001",
    "type": "analysis",
    "description": "Analyze customer feedback dataset",
    "input": {
      "dataPath": "/data/feedback.csv",
      "parameters": {
        "sentimentAnalysis": true,
        "topicModeling": true
      }
    },
    "requirements": {
      "capabilities": ["analysis", "nlp"],
      "estimatedDuration": "5 minutes",
      "deadline": "2024-01-15T11:00:00Z"
    }
  },
  "validation": {
    "outputFormat": "json",
    "requiredFields": ["summary", "insights", "metrics"]
  }
}
```

### Progress Message
```json
{
  "messageId": "progress-001",
  "type": "PROGRESS",
  "timestamp": "2024-01-15T10:10:00Z",
  "taskId": "task-001",
  "agentId": "agent-1",
  "progress": {
    "percentage": 25,
    "currentStep": "data-loading",
    "message": "Loading dataset from /data/feedback.csv",
    "metrics": {
      "recordsProcessed": 2500,
      "totalRecords": 10000,
      "errorsEncountered": 0
    }
  }
}
```

### Completion Message
```json
{
  "messageId": "complete-001",
  "type": "COMPLETION",
  "timestamp": "2024-01-15T10:25:00Z",
  "taskId": "task-001",
  "agentId": "agent-1",
  "status": "SUCCESS",
  "result": {
    "summary": "Analysis of 10,000 customer feedback entries",
    "insights": [
      "85% positive sentiment overall",
      "Top concern: delivery times",
      "Highest satisfaction: product quality"
    ],
    "metrics": {
      "processingTime": "4.8 minutes",
      "accuracy": 0.94,
      "confidence": 0.87
    },
    "outputFiles": [
      "/results/task-001-report.pdf",
      "/results/task-001-data.csv"
    ]
  },
  "citations": [
    "method:sentiment-bert-v2",
    "method:lda-topic-modeling"
  ]
}
```

## Key Implementation Details

### 1. File Watching vs Polling

The example supports both approaches:

**Polling (Default)**
```javascript
setInterval(async () => {
  const files = await fs.readdir('communication/instructions');
  for (const file of files) {
    if (isNewTask(file)) {
      processTask(file);
    }
  }
}, POLL_INTERVAL);
```

**File Watching (Efficient)**
```javascript
fs.watch('communication/instructions', (eventType, filename) => {
  if (eventType === 'rename' && filename.endsWith('.json')) {
    processTask(filename);
  }
});
```

### 2. Atomic File Operations

Ensures data integrity:
```javascript
// Write to temp file first, then rename (atomic)
await fs.writeFile(`${path}.tmp`, data);
await fs.rename(`${path}.tmp`, path);
```

### 3. Lock Files

Prevents race conditions:
```javascript
async function claimTask(taskFile) {
  const lockFile = `${taskFile}.lock`;
  try {
    // Create lock file exclusively
    await fs.writeFile(lockFile, agentId, { flag: 'wx' });
    return true;
  } catch (error) {
    return false; // Another agent claimed it
  }
}
```

### 4. Progress Milestones

Standard checkpoints:
- 0%: Task acknowledged
- 25%: Initial processing
- 50%: Core execution
- 75%: Validation/verification
- 100%: Complete

## When to Use This Pattern

### Good For:
- **Multi-process agents**: Agents running in separate processes/containers
- **Audit requirements**: Need complete history of all communications
- **Resilience**: Can recover from crashes by reading filesystem state
- **Debugging**: Human-readable JSON files for inspection
- **Simple deployment**: No message queue infrastructure needed
- **Cross-language**: Any language can read/write JSON files

### Not Ideal For:
- **High-frequency messaging**: File I/O overhead for >100 msg/sec
- **Low-latency requirements**: Polling adds delay (min ~100ms)
- **Large payloads**: File system not optimal for >10MB messages
- **Complex routing**: Better to use proper message queue
- **Distributed systems**: Network file systems add complexity

## Performance Characteristics

Based on typical file system performance:

- **Message throughput**: 10-100 messages/second
- **Latency**: 100ms - 2s (depends on polling interval)
- **Message size**: Optimal for <1MB, works up to 10MB
- **Concurrent agents**: 10-20 agents work well
- **Storage**: ~1KB per message + payload

## Troubleshooting

### Common Issues

**"Permission denied" errors**
```bash
# Fix permissions
chmod 755 communication/*
chown $USER:$USER communication/*
```

**Agent not picking up tasks**
- Check polling interval isn't too long
- Verify file permissions
- Ensure JSON is valid
- Check agent capabilities match requirements

**Duplicate processing**
- Implement proper lock files
- Use atomic file operations
- Add message deduplication by ID

**High CPU usage**
- Increase polling interval
- Use file watching instead of polling
- Implement exponential backoff

**Disk space issues**
- Implement automatic archival
- Compress old messages
- Set retention policies

## Advanced Features

### Message Priority Queue
```javascript
// Sort tasks by priority before processing
const tasks = files.map(f => ({
  file: f,
  priority: JSON.parse(fs.readFileSync(f)).priority
}));
tasks.sort((a, b) =>
  priorityOrder[a.priority] - priorityOrder[b.priority]
);
```

### Dead Letter Queue
```javascript
// Move failed tasks to DLQ after max retries
if (retryCount > MAX_RETRIES) {
  await fs.rename(
    `instructions/${taskFile}`,
    `dead-letter/${taskFile}`
  );
}
```

### Message Expiration
```javascript
// Skip expired messages
if (Date.now() - message.timestamp > message.ttl) {
  await archiveExpiredMessage(message);
  continue;
}
```

## Learn More

- See `coordinator.js` for file watching implementation
- See `agent.js` for polling and task execution
- Check `message-schemas/` for JSON schemas
- Review `tests/` for error handling examples

---
*Part of the Sartor Public Claude Skills Library*
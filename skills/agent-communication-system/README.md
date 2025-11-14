# Agent Communication System Skill

## Overview

This skill provides practical implementation guidance for inter-agent communication systems. It covers coordinator patterns, MCP protocol, message routing, shared data pools, and quality gates based on actual implementations in your SKG Agent Prototype codebase.

## When to Use

- Implementing agent coordinators or orchestrators
- Creating communicative agents with messaging capabilities
- Designing message protocols and routing patterns
- Managing shared data between agents
- Building quality gates for agent outputs
- Debugging agent communication issues
- Optimizing message throughput and latency

## Key Topics Covered

### 1. Inter-Agent Coordinator
Central coordination system for multi-agent message passing, request routing, and shared data management.

**Implementation**: `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/inter-agent-coordinator.ts`

Features:
- Priority-based message queuing
- Request/response orchestration
- Shared data pool with access tracking
- Coordination planning (phases, data flow, quality gates)
- Status aggregation and diagnostics

### 2. Communicative Agent Base Class
Standard base class for agents with communication capabilities.

**Implementation**: `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/communicative-agent.ts`

Features:
- Step-based execution with progress reporting
- Assistance request protocols
- Citation tracking
- Context management
- Orchestrator integration

### 3. MCP Protocol Implementation
Model Context Protocol for standardized agent-to-agent messaging.

**Documentation**: `/home/alton/SKG Agent Prototype 2/docs/communication-protocols.md`

Features:
- Message structure with priority and routing
- Message types (Task, Data, Collaboration, System)
- Routing patterns (Direct, Broadcast, Pub-Sub, Intent-Based)
- Delivery guarantees (at-most-once, at-least-once, exactly-once)
- Retry logic with exponential backoff

### 4. File-Based Communication
Simple, auditable communication via JSON files on shared filesystem.

**Documentation**: `/home/alton/agent-community-game/agents/improvement-coordination/communication-protocol.md`

Features:
- Channel structure (instructions/, progress/, completions/)
- Workflow states (Created → Assigned → In Progress → Testing → Completed)
- Progress milestones (25%, 50%, 75%, 100%)
- Audit trail with human-readable files

### 5. Shared Data Pool Management
Central storage for data shared between agents with metadata and access tracking.

Features:
- Data entries with source agent, timestamp, citations
- Access audit trail
- Tag-based search
- Citation graph generation
- Conflict detection with version numbers

### 6. Quality Gates and Validation
Automated checkpoints for agent output quality.

**Implementation**: `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/enhanced-orchestrator.ts`

Gate types:
- Citation checks (minimum sources, required types)
- Peer review (minimum reviewers, capabilities)
- Format validation (schema, required fields)
- Confidence thresholds
- Custom validation functions

### 7. Assistance Request and Routing
Dynamic routing of help requests to most capable agents.

Features:
- Capability-based agent selection
- Historical success scoring
- Load balancing (prefer less busy agents)
- Specialization bonuses
- Fallback strategies

## Communication Patterns

### Pattern 1: Hierarchical Orchestration
- Centralized coordinator with worker agents
- Quality gates and shared data management
- Best for: Clear hierarchy, need for validation

### Pattern 2: File-Based Async Communication
- JSON files for agent messages
- Excellent audit trail
- Best for: Long-running tasks, human-readable traces

### Pattern 3: MCP Hub-and-Spoke
- Central router with agent subscribers
- Topic-based pub-sub
- Best for: Multiple agent types, network-based communication

## Debugging

### Message Tracing
Track message lifecycle from send to delivery with trace events.

### Coordination Flow Analysis
Monitor message throughput, latency, queue depths, and agent availability.

### Common Issues
- Messages not delivered → Check agent availability, routing logic, TTL
- Slow coordination → Check queue depths, quality gate time, agent count
- Quality gates failing → Check criteria strictness, output format, reviewers
- Deadlock → Check circular dependencies, blocking gates, full queues

## Integration with Other Skills

- **multi-agent-orchestration**: Theoretical foundation (consensus, CRDTs)
- **evidence-based-validation**: Apply to performance claims
- **mcp-server-development**: MCP protocol details
- **distributed-systems-debugging**: Diagnose coordination failures

## Evidence-Based Language

### Avoid (without measurement):
- "Guaranteed delivery"
- "Zero-latency communication"
- "Perfect coordination"
- "Eliminates all conflicts"

### Use instead:
- "Delivery with retry and timeout"
- "Measured latency: requires testing"
- "Best-effort coordination with quality gates"
- "Conflict detection with configurable resolution"

## References

### Implementation Files
- `/home/alton/SKG-Agent-Prototype-Private/src/ai/communication/`
  - `inter-agent-coordinator.ts`
  - `communicative-agent.ts`
  - `enhanced-orchestrator.ts`
  - `web-search-integration.ts`

### Documentation
- `/home/alton/SKG Agent Prototype 2/docs/communication-protocols.md`
- `/home/alton/agent-community-game/agents/improvement-coordination/communication-protocol.md`
- `/home/alton/SKG Agent Prototype 2/attentional-communication-protocol.json`

### Design Documents
- `/home/alton/AGENTIC_HARNESS_ARCHITECTURE.md`
- `/home/alton/MCP_ORCHESTRATOR_DESIGN.md`

## Usage with Claude Code

Invoke this skill when:
- User asks about agent communication implementation
- Building or debugging coordinators/orchestrators
- Designing message protocols
- Implementing quality gates
- Troubleshooting multi-agent systems

The skill provides practical, evidence-based guidance rooted in your actual working implementations.

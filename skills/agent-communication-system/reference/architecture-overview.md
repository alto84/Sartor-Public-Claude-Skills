# Agent Communication Architecture Overview

## Pattern Selection Guide

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMMUNICATION PATTERN SELECTOR                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  How many agents are  │
                        │     communicating?    │
                        └───────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                  2-3 agents                    4+ agents
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐         ┌─────────────────────┐
        │ Need real-time sync?│         │ Need central control?│
        └─────────────────────┘         └─────────────────────┘
                    │                               │
          ┌─────────┴────────┐           ┌─────────┴─────────┐
          │                  │           │                   │
         Yes                No          Yes                 No
          │                  │           │                   │
          ▼                  ▼           ▼                   ▼
    ┌──────────┐      ┌──────────┐  ┌──────────┐    ┌──────────┐
    │   P2P    │      │  File-   │  │  Hier-   │    │   MCP    │
    │  Direct  │      │  Based   │  │archical  │    │Hub-Spoke │
    └──────────┘      └──────────┘  └──────────┘    └──────────┘
```

## Hierarchical Orchestration

```
┌──────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Task delegation and monitoring                     │   │
│  │ • Result aggregation                                 │   │
│  │ • Decision making                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                    │           │           │
          ┌─────────┴───┐   ┌──┴───┐   ┌──┴─────────┐
          ▼             ▼   ▼       ▼   ▼            ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Agent A  │  │ Agent B  │  │ Agent C  │  │ Agent D  │
    │          │  │          │  │          │  │          │
    │ Worker   │  │ Worker   │  │ Worker   │  │ Worker   │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### When to Use
- Complex multi-agent workflows requiring coordination
- Tasks with clear parent-child relationships
- Need for centralized decision making
- Quality gates and validation required between steps

### Pros
- Clear chain of command
- Simplified debugging (single point of control)
- Easy to implement quality gates
- Natural fit for sequential workflows

### Cons
- Single point of failure (orchestrator)
- Potential bottleneck at orchestrator level
- Increased latency for agent-to-agent communication
- Requires robust orchestrator implementation

## Peer-to-Peer

```
┌──────────────────────────────────────────────────────────────┐
│                     PEER-TO-PEER NETWORK                     │
└──────────────────────────────────────────────────────────────┘

    ┌──────────┐          ┌──────────┐
    │ Agent A  │◄────────►│ Agent B  │
    │          │          │          │
    └──────────┘          └──────────┘
         ▲                      ▲
         │                      │
         └──────┐      ┌────────┘
                │      │
           ┌──────────┐
           │ Agent C  │
           │          │
           └──────────┘

    Legend: ◄────────► Direct bidirectional communication
```

### When to Use
- Small number of agents (2-4)
- Agents need direct, low-latency communication
- No clear hierarchy between agents
- Collaborative problem solving

### Pros
- Low latency (direct communication)
- No single point of failure
- Flexible communication patterns
- Agents maintain autonomy

### Cons
- Complex to manage with many agents
- Difficult to track global state
- Potential for communication loops
- Harder to implement quality gates

## File-Based Async

```
┌──────────────────────────────────────────────────────────────┐
│                    FILE-BASED COMMUNICATION                   │
└──────────────────────────────────────────────────────────────┘

    ┌──────────┐                              ┌──────────┐
    │ Agent A  │                              │ Agent B  │
    │          │                              │          │
    └────┬─────┘                              └─────┬────┘
         │                                           │
         ▼                                           ▼
    ┌─────────┐                                ┌─────────┐
    │ Write   │                                │  Read   │
    └────┬────┘                                └────┬────┘
         │              ┌──────────┐                │
         └─────────────►│  Shared  │◄───────────────┘
                        │   Files  │
         ┌─────────────►│          │◄───────────────┐
         │              └──────────┘                │
    ┌────┴────┐                                ┌────┴────┐
    │  Read   │                                │ Write   │
    └─────────┘                                └─────────┘
         ▲                                           ▲
         │                                           │
    ┌────┴─────┐                              ┌─────┴────┐
    │ Agent C  │                              │ Agent D  │
    │          │                              │          │
    └──────────┘                              └──────────┘
```

### When to Use
- Asynchronous workflows
- Large data transfers between agents
- Need for persistent communication history
- Agents operating on different schedules

### Pros
- Natural persistence of communication
- Works well with batch processing
- No need for agents to be online simultaneously
- Easy to audit and replay communications

### Cons
- Higher latency than direct communication
- File locking and concurrency issues
- Storage requirements for large messages
- Requires file system monitoring

## MCP Hub-and-Spoke

```
┌──────────────────────────────────────────────────────────────┐
│                    MCP HUB-AND-SPOKE MODEL                   │
└──────────────────────────────────────────────────────────────┘

                        ┌──────────┐
                        │   MCP    │
                        │   HUB    │
                        │          │
                        │ • Router │
                        │ • Buffer │
                        │ • Logger │
                        └──────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
          ┌──────────┐  ┌──────────┐  ┌──────────┐
          │  MCP     │  │  MCP     │  │  MCP     │
          │ Client A │  │ Client B │  │ Client C │
          │          │  │          │  │          │
          │ • Agent  │  │ • Agent  │  │ • Agent  │
          └──────────┘  └──────────┘  └──────────┘
```

### When to Use
- Need for standardized communication protocol
- Integration with external systems
- Requirement for message buffering and queuing
- Complex routing logic between many agents

### Pros
- Standardized protocol (MCP)
- Built-in message buffering
- Centralized logging and monitoring
- Supports dynamic agent registration

### Cons
- Requires MCP infrastructure setup
- Additional complexity for simple use cases
- Potential hub bottleneck
- Learning curve for MCP protocol

## Performance Comparison

| Pattern      | Latency | Scalability | Complexity | Reliability |
|--------------|---------|-------------|------------|-------------|
| Hierarchical | Medium  | High        | Medium     | High        |
| Peer-to-Peer | Low     | Low         | High       | Medium      |
| File-Based   | High    | Medium      | Low        | High        |
| MCP Hub      | Medium  | High        | High       | High        |

## Decision Matrix

| Consideration           | Hierarchical | P2P | File-Based | MCP Hub |
|------------------------|--------------|-----|------------|---------|
| < 5 agents             | ✓            | ✓✓  | ✓          | -       |
| > 10 agents            | ✓✓           | -   | ✓          | ✓✓      |
| Real-time required     | ✓            | ✓✓  | -          | ✓       |
| Async processing OK    | ✓            | -   | ✓✓         | ✓       |
| Need audit trail       | ✓            | -   | ✓✓         | ✓       |
| External integration   | -            | -   | ✓          | ✓✓      |
| Simple implementation  | ✓            | ✓   | ✓✓         | -       |

Legend: ✓✓ = Excellent | ✓ = Good | - = Poor/Not Recommended

---
*Part of the Sartor Public Claude Skills Library - Agent Communication System*
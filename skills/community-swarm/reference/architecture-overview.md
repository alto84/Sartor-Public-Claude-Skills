# Community Swarm Architecture Overview

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMMUNITY SWARM SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                         USER INTERFACE                              │     │
│  │                     (Claude Code / API / CLI)                       │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                   │                                          │
│                                   ▼                                          │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                         ORCHESTRATOR                                │     │
│  │  ┌──────────────────────────────────────────────────────────────┐  │     │
│  │  │ • RECEIVES tasks from user                                   │  │     │
│  │  │ • DECOMPOSES into subtasks                                   │  │     │
│  │  │ • DELEGATES to specialized agents                            │  │     │
│  │  │ • RECEIVES summaries only (context protection)               │  │     │
│  │  │ • SYNTHESIZES final results                                  │  │     │
│  │  │                                                              │  │     │
│  │  │ ⚠️  NEVER EXECUTES TASKS - DELEGATION ONLY ⚠️                  │  │     │
│  │  └──────────────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                   │                                          │
│                    ┌──────────────┼──────────────┐                          │
│                    ▼              ▼              ▼                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      SWARM COORDINATOR                               │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │   Message   │  │    Data     │  │   Quality   │  │    Hook    │  │    │
│  │  │   Router    │  │    Pool     │  │    Gates    │  │   System   │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                   │                                          │
│        ┌──────────┬───────────────┼───────────────┬──────────┐              │
│        ▼          ▼               ▼               ▼          ▼              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ASSESSMENT│ │IMPLEMENT │ │VALIDATION│ │ RESEARCH │ │SYNTHESIS │          │
│  │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │          │
│  │   #1     │ │   #2     │ │   #3     │ │   #4     │ │   #5     │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│        │          │               │               │          │              │
│        └──────────┴───────────────┴───────────────┴──────────┘              │
│                                   │                                          │
│        ┌──────────┬───────────────┼───────────────┬──────────┐              │
│        ▼          ▼               ▼               ▼          ▼              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ QUALITY  │ │ MONITOR  │ │  AUDIT   │ │   GIT    │ │AUTONOMOUS│          │
│  │   GATE   │ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │          │
│  │   #6     │ │   #7     │ │   #8     │ │   #9     │ │   #10    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Communication Flow

### Task Delegation Flow

```text
User Request
     │
     ▼
┌─────────────┐
│ Orchestrator│──────────────────────────────────────────────────┐
└─────────────┘                                                   │
     │                                                            │
     │ 1. Decompose task                                         │
     │ 2. Identify agents                                        │
     │ 3. Delegate subtasks                                      │
     │                                                            │
     ▼                                                            │
┌─────────────────────────────────────────┐                      │
│           Task Distribution              │                      │
├─────────────────────────────────────────┤                      │
│                                         │                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │                      │
│  │ Agent 1 │  │ Agent 2 │  │ Agent 4 │ │                      │
│  │ Assess  │  │ Impl    │  │ Research│ │                      │
│  └────┬────┘  └────┬────┘  └────┬────┘ │                      │
│       │            │            │       │                      │
│       ▼            ▼            ▼       │                      │
│  ┌─────────────────────────────────┐   │                      │
│  │      Parallel Execution          │   │                      │
│  │  (agents work simultaneously)    │   │                      │
│  └─────────────────────────────────┘   │                      │
│       │            │            │       │                      │
│       ▼            ▼            ▼       │                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │                      │
│  │ Summary │  │ Summary │  │ Summary │ │◄─── Context          │
│  │ < 500w  │  │ < 500w  │  │ < 500w  │ │     Protection       │
│  └────┬────┘  └────┬────┘  └────┬────┘ │                      │
│       │            │            │       │                      │
└───────┴────────────┴────────────┴───────┘                      │
                     │                                            │
                     ▼                                            │
            ┌─────────────┐                                       │
            │ Orchestrator│◄──────────────────────────────────────┘
            └─────────────┘
                     │
                     ▼
            Final Result
```

### Agent Communication Patterns

```text
Pattern 1: Point-to-Point
═══════════════════════════

  Agent A ─────────► Agent B
           Message

  Agent B ◄───────── Agent A
           Response


Pattern 2: Broadcast
═══════════════════════════

                    ┌──► Agent 1
                    │
  Orchestrator ─────┼──► Agent 2
      (Broadcast)   │
                    ├──► Agent 3
                    │
                    └──► Agent N


Pattern 3: Assistance Chain
═══════════════════════════

  Agent A ──NEED HELP──► Coordinator ──ROUTE──► Agent B
                                                   │
                                                   ▼
  Agent A ◄──RESPONSE────────────────────────── Agent B


Pattern 4: Shared Data Pool
═══════════════════════════

  Agent A ──WRITE──► ╔═══════════╗ ◄──READ── Agent C
                     ║   DATA    ║
  Agent B ──WRITE──► ║   POOL    ║ ◄──READ── Agent D
                     ╚═══════════╝
                          │
                     Access Log
                     (who, what, when)
```

## Quality Gate Pipeline

```text
┌─────────────────────────────────────────────────────────────────┐
│                    QUALITY GATE PIPELINE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent Output                                                    │
│       │                                                          │
│       ▼                                                          │
│  ╔═══════════════╗                                              │
│  ║   GATE 1      ║                                              │
│  ║   Format      ║──► FAIL ──► Revision Request                 │
│  ║   Validation  ║                                              │
│  ╚═══════╤═══════╝                                              │
│          │ PASS                                                  │
│          ▼                                                       │
│  ╔═══════════════╗                                              │
│  ║   GATE 2      ║                                              │
│  ║   Evidence    ║──► FAIL ──► Revision Request                 │
│  ║   Validation  ║                                              │
│  ╚═══════╤═══════╝                                              │
│          │ PASS                                                  │
│          ▼                                                       │
│  ╔═══════════════╗                                              │
│  ║   GATE 3      ║                                              │
│  ║   Consistency ║──► FAIL ──► Revision Request                 │
│  ║   Check       ║                                              │
│  ╚═══════╤═══════╝                                              │
│          │ PASS                                                  │
│          ▼                                                       │
│  ╔═══════════════╗                                              │
│  ║ FINAL GATE    ║                                              │
│  ║   Complete    ║──► FAIL ──► Escalate                         │
│  ║   Validation  ║                                              │
│  ╚═══════╤═══════╝                                              │
│          │ PASS                                                  │
│          ▼                                                       │
│  ┌───────────────┐                                              │
│  │   APPROVED    │                                              │
│  │    OUTPUT     │                                              │
│  └───────────────┘                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Hook Execution Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│                    HOOK EXECUTION POINTS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent Lifecycle:                                                │
│                                                                  │
│  [SPAWN REQUEST]                                                 │
│        │                                                         │
│        ▼                                                         │
│  ┌──────────────┐                                               │
│  │  PRE_SPAWN   │──► Validate resources, check limits           │
│  └──────────────┘                                               │
│        │                                                         │
│        ▼                                                         │
│     [SPAWN]                                                      │
│        │                                                         │
│        ▼                                                         │
│  ┌──────────────┐                                               │
│  │  POST_SPAWN  │──► Register, start monitoring                 │
│  └──────────────┘                                               │
│        │                                                         │
│        ▼                                                         │
│  [TASK ASSIGNMENT]                                               │
│        │                                                         │
│        ▼                                                         │
│  ┌──────────────┐                                               │
│  │  PRE_TASK    │──► Check availability, verify capabilities    │
│  └──────────────┘                                               │
│        │                                                         │
│        ▼                                                         │
│     [EXECUTE]                                                    │
│        │                                                         │
│        ▼                                                         │
│  ┌──────────────┐                                               │
│  │  POST_TASK   │──► Quality gates, trigger dependents          │
│  └──────────────┘                                               │
│        │                                                         │
│        ▼                                                         │
│  [SHUTDOWN REQUEST]                                              │
│        │                                                         │
│        ▼                                                         │
│  ┌──────────────┐                                               │
│  │ PRE_SHUTDOWN │──► Save state, cleanup                        │
│  └──────────────┘                                               │
│        │                                                         │
│        ▼                                                         │
│    [SHUTDOWN]                                                    │
│        │                                                         │
│        ▼                                                         │
│  ┌──────────────┐                                               │
│  │POST_SHUTDOWN │──► Deregister, notify                         │
│  └──────────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Error Recovery Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR RECOVERY SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [ERROR DETECTED]                                                │
│        │                                                         │
│        ▼                                                         │
│  ┌──────────────────┐                                           │
│  │ CLASSIFY ERROR   │                                           │
│  │                  │                                           │
│  │ • Transient?     │                                           │
│  │ • Agent failure? │                                           │
│  │ • Task failure?  │                                           │
│  │ • System error?  │                                           │
│  └────────┬─────────┘                                           │
│           │                                                      │
│     ┌─────┴─────┬─────────────┬─────────────┐                   │
│     ▼           ▼             ▼             ▼                   │
│  ┌──────┐   ┌──────┐     ┌──────┐     ┌──────┐                 │
│  │RETRY │   │REASSIGN│   │ROLLBACK│   │ESCALATE│                │
│  └──┬───┘   └──┬───┘     └──┬───┘     └──┬───┘                 │
│     │          │            │            │                       │
│     ▼          ▼            ▼            ▼                       │
│  Backoff   Find new     Restore       Notify                    │
│  & retry   agent        checkpoint    user                      │
│     │          │            │            │                       │
│     └──────────┴────────────┴────────────┘                      │
│                      │                                           │
│                      ▼                                           │
│              [CONTINUE / FAIL]                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Context Protection

The orchestrator's context is protected to prevent overload:

```text
┌─────────────────────────────────────────────────────────────────┐
│                  CONTEXT PROTECTION RULES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║  ORCHESTRATOR RECEIVES ONLY:                              ║  │
│  ║                                                           ║  │
│  ║  • Summaries (< 500 words)                               ║  │
│  ║  • Code snippets (< 10 lines)                            ║  │
│  ║  • Error summaries (no stack traces)                      ║  │
│  ║  • Aggregated metrics                                     ║  │
│  ║  • Confidence scores                                      ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║  ORCHESTRATOR NEVER RECEIVES:                             ║  │
│  ║                                                           ║  │
│  ║  ✗ Full file contents                                     ║  │
│  ║  ✗ Complete code implementations                          ║  │
│  ║  ✗ Raw data dumps                                         ║  │
│  ║  ✗ Detailed stack traces                                  ║  │
│  ║  ✗ Unfiltered agent outputs                               ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*Part of the Sartor Public Claude Skills Library*

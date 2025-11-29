# Sartor Public Claude Skills Library

A comprehensive collection of specialized skills for Claude Code, focusing on multi-agent orchestration, distributed systems debugging, evidence-based engineering, and MCP server development.

## Overview

This repository contains **10 specialized skills** that enhance Claude Code's capabilities in complex software engineering tasks. Each skill provides detailed methodologies, reference materials, templates, and examples for specific domains.

### Skill Categories

```text
┌─────────────────────────────────────────────────────────────┐
│                  UNIFIED SKILLS ORCHESTRATOR                │
│              (Meta-skill coordinating all others)           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  FOUNDATIONAL │   │     DOMAIN      │   │   SPECIALIZED   │
│    SKILLS     │   │     SKILLS      │   │     SKILLS      │
├───────────────┤   ├─────────────────┤   ├─────────────────┤
│ Evidence-Based│   │ Multi-Agent     │   │ Safety Research │
│ Engineering   │   │ Orchestration   │   │ Workflow        │
├───────────────┤   ├─────────────────┤   ├─────────────────┤
│ Evidence-Based│   │ Agent Comm      │   │ Enhanced Multi- │
│ Validation    │   │ System          │   │ Agent Orch.     │
└───────────────┘   ├─────────────────┤   ├─────────────────┤
                    │ MCP Server      │   │ Autonomous      │
                    │ Development     │   │ Action Agent    │
                    ├─────────────────┤   └─────────────────┘
                    │ Distributed Sys │
                    │ Debugging       │
                    └─────────────────┘
```

## Skills Catalog

### Foundational Skills (Always Active)

#### 1. Evidence-Based Engineering
**Location:** `skills/evidence-based-engineering/`

Enforces evidence-based claims, prevents metric fabrication, and ensures honest assessment in engineering contexts.

**Use when:** Making ANY quantitative claim, performance assertion, completion estimate, or quality judgment.

**Key Components:**
- Anti-fabrication protocol (mandatory)
- Evidence chain requirements
- Banned phrases without measurement
- Completion assessment framework

#### 2. Evidence-Based Validation
**Location:** `skills/evidence-based-validation/`

Enforces anti-fabrication protocols, detects score fabrication, prohibits exaggerated language, and ensures evidence-based claims.

**Use when:** Analyzing performance, reviewing code quality, assessing systems, or making claims requiring measurement data.

**Key Components:**
- Score fabrication detection
- Prohibited language patterns
- Compliant analysis examples
- Validation scripts

---

### Domain Skills (Context-Activated)

#### 3. Multi-Agent Orchestration
**Location:** `skills/multi-agent-orchestration/`

Guides analysis and design of multi-agent systems including consensus mechanisms, distributed state management, agent coordination patterns, and conflict resolution.

**Use when:** Analyzing agent architectures, debugging coordination issues, or designing multi-agent systems.

**Key Components:**
- Consensus mechanisms (Raft, BFT, Gossip)
- Distributed state management (CRDTs, vector clocks)
- Architecture templates and patterns
- Failure mode analysis

#### 4. Agent Communication System
**Location:** `skills/agent-communication-system/`

Implementation guide for inter-agent communication including coordinator patterns, MCP protocol, message routing, shared data pools, and quality gates.

**Use when:** Implementing agent-to-agent communication, coordinating multi-agent workflows, or debugging communication issues.

**Key Components:**
- Inter-agent coordinator patterns
- MCP protocol implementation
- Message routing strategies
- Quality gate systems

#### 5. MCP Server Development
**Location:** `skills/mcp-server-development/`

Guides development of Model Context Protocol servers including tool implementation, error handling, stdio transport, and testing strategies.

**Use when:** Building MCP servers, implementing MCP tools, debugging MCP communication, or answering questions about MCP architecture.

**Key Components:**
- MCP server implementation guide
- Tool development patterns
- Testing and debugging strategies
- Complete templates and examples

#### 6. Distributed Systems Debugging
**Location:** `skills/distributed-systems-debugging/`

Guides debugging of distributed systems including consensus failures, message ordering issues, state synchronization bugs, network partitions, and cascading failures.

**Use when:** Debugging multi-agent systems, investigating coordination issues, analyzing distributed traces, or resolving distributed state conflicts.

**Key Components:**
- Failure pattern analysis (27 patterns)
- Debugging methodology
- Log analysis and tracing
- Performance debugging

---

### Specialized Skills (Explicit Activation)

#### 7. Safety Research Workflow
**Location:** `skills/safety-research-workflow/`

Guides systematic safety research including literature review, multi-agent research coordination, citation management, evidence validation, and quality assurance.

**Use when:** Conducting research studies, coordinating research agents, managing bibliographies, validating research claims, or ensuring research quality.

**Key Components:**
- 7-stage research workflow
- Multi-agent coordination patterns
- Citation management and validation
- Quality assurance automation

#### 8. Enhanced Multi-Agent Orchestration
**Location:** `skills/enhanced-multi-agent-orchestration/`

**NEW** - Comprehensive 8-agent orchestration system with context protection, quality gates, and autonomous improvement capabilities.

**Use when:** Running complex multi-agent workflows, when orchestrator context protection is critical, or when continuous improvement is valuable.

**Key Components:**
- 8 specialized agents with clear boundaries
- Context protection strategies
- Quality gates between agent handoffs
- Autonomous improvement integration

#### 9. Autonomous Action Agent
**Location:** `skills/autonomous-action-agent/`

**NEW** - Implements an autonomous improvement agent that monitors parallel task execution, identifies optimization opportunities, and suggests improvements.

**Use when:** Running multi-agent workflows that benefit from continuous improvement and creative enhancement suggestions.

**Key Components:**
- Continuous monitoring patterns
- Suggestion generation and categorization
- Creative latitude within evidence constraints
- Learning from feedback

#### 10. Unified Skills Orchestrator
**Location:** `skills/unified-skills-orchestrator/`

**NEW** - Meta-skill that intelligently combines and coordinates all other skills based on task requirements.

**Use when:** Complex tasks requiring multiple skills, when unsure which skills apply, or when optimal skill coordination is important.

**Key Components:**
- Automatic skill activation detection
- Skill dependency management
- Integration patterns
- Anti-patterns prevention

---

## Installation

### For Claude Code Users

1. Clone this repository:
```bash
git clone https://github.com/YOUR_USERNAME/Sartor-Public-Claude-Skills.git
```

2. Copy the skills to your `.claude/skills/` directory:
```bash
cp -r Sartor-Public-Claude-Skills/skills/* ~/.claude/skills/
```

3. The skills will be automatically available in Claude Code sessions

### Verifying Installation

In Claude Code, you can verify skills are loaded by checking the available skills list. Each skill can be invoked using the Skill tool with the skill name.

## Usage

Skills are invoked within Claude Code using the Skill tool:

```
skill: "unified-skills-orchestrator"
skill: "enhanced-multi-agent-orchestration"
skill: "evidence-based-validation"
```

When invoked, each skill provides:
- Detailed methodology and guidelines
- Reference documentation
- Code templates
- Practical examples
- Testing and validation tools

## Skill Structure

Each skill follows a consistent structure:

```
skill-name/
├── SKILL.md              # Main skill definition and instructions
├── README.md             # Skill documentation
├── VALIDATION.md         # Validation procedures and status
├── reference/            # Reference materials and specifications
├── templates/            # Code and configuration templates
├── scripts/              # Utility scripts
└── examples/             # Practical examples and use cases
```

## Core Principles

These skills are built on several core principles:

1. **Evidence-Based Assessment**: All claims must be backed by measurable data
2. **Anti-Fabrication**: Never generate scores or metrics without actual measurements
3. **Transparency**: Clear documentation of methodologies and limitations
4. **Practical Focus**: Real-world examples and tested implementations
5. **Quality Assurance**: Validation and testing protocols for all components
6. **Let Claude Be Claude**: Creative latitude within evidence-based constraints

## Recent Updates

**2025-11-29**: Major enhancement release
- Added 3 new skills (Enhanced Multi-Agent Orchestration, Autonomous Action Agent, Unified Skills Orchestrator)
- Added VALIDATION.md files to all skills
- Added "When NOT to Use" sections to all skills
- Fixed structural consistency across all skills
- Added language tags to all code blocks

## Contributing

Contributions are welcome! If you'd like to:
- Add new skills
- Improve existing skills
- Fix bugs or documentation
- Share examples

Please open an issue or submit a pull request.

## License

[Specify your license here - MIT, Apache 2.0, etc.]

## Related Resources

- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Support

For issues or questions:
- Open an issue in this repository
- Check individual skill README files for specific guidance

---

**Note:** These skills are designed for Claude Code and leverage the Model Context Protocol (MCP) for enhanced functionality. They represent a systematic approach to complex software engineering tasks with emphasis on rigor, evidence, and quality.

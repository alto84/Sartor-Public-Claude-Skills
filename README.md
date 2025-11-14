# Sartor Public Claude Skills Library

A comprehensive collection of specialized skills for Claude Code, focusing on multi-agent orchestration, distributed systems debugging, evidence-based engineering, and MCP server development.

## Overview

This repository contains 7 specialized skills that enhance Claude Code's capabilities in complex software engineering tasks. Each skill provides detailed methodologies, reference materials, templates, and examples for specific domains.

## Skills Catalog

### 1. Safety Research Workflow
**Location:** `skills/safety-research-workflow/`

Guides systematic safety research including literature review, multi-agent research coordination, citation management, evidence validation, and quality assurance.

**Use when:**
- Conducting research studies
- Coordinating research agents
- Managing bibliographies
- Validating research claims
- Ensuring research quality

**Key Components:**
- Research methodology and multi-agent coordination
- Citation management and bibliography validation
- Quality assurance frameworks
- Integration with evidence validation

### 2. Distributed Systems Debugging
**Location:** `skills/distributed-systems-debugging/`

Guides debugging of distributed systems including consensus failures, message ordering issues, state synchronization bugs, network partitions, and cascading failures.

**Use when:**
- Debugging multi-agent systems
- Investigating coordination issues
- Analyzing distributed traces
- Resolving distributed state conflicts

**Key Components:**
- Failure pattern analysis
- Debugging methodology for distributed systems
- Monitoring strategies and trace analysis
- Real debugging session examples

### 3. Evidence-Based Engineering
**Location:** `skills/evidence-based-engineering/`

Enforces evidence-based claims, prevents metric fabrication, and ensures honest assessment in engineering contexts.

**Use when:**
- Making quantitative claims
- Providing performance assertions
- Creating completion estimates
- Making quality judgments

**Key Components:**
- Evidence-based claim protocols
- Anti-fabrication enforcement
- Honest assessment methodologies
- Metric validation

### 4. Evidence-Based Validation
**Location:** `skills/evidence-based-validation/`

Enforces anti-fabrication protocols, detects score fabrication, prohibits exaggerated language, and ensures evidence-based claims.

**Use when:**
- Analyzing performance
- Reviewing code quality
- Assessing systems
- Making claims requiring measurement data

**Key Components:**
- Anti-fabrication protocols
- Score fabrication detection
- Prohibited language pattern identification
- Evidence standards and examples

### 5. Agent Communication System
**Location:** `skills/agent-communication-system/`

Implementation guide for inter-agent communication including coordinator patterns, MCP protocol, message routing, shared data pools, and quality gates.

**Use when:**
- Implementing agent-to-agent communication
- Coordinating multi-agent workflows
- Debugging communication issues

**Key Components:**
- Inter-agent communication patterns
- MCP protocol implementation
- Message routing strategies
- Shared data pool management

### 6. MCP Server Development
**Location:** `skills/mcp-server-development/`

Guides development of Model Context Protocol servers including tool implementation, error handling, stdio transport, and testing strategies.

**Use when:**
- Building MCP servers
- Implementing MCP tools
- Debugging MCP communication
- Answering questions about MCP architecture

**Key Components:**
- MCP server implementation guide
- Tool development patterns
- Testing and debugging strategies
- Templates and real examples

### 7. Multi-Agent Orchestration
**Location:** `skills/multi-agent-orchestration/`

Guides analysis and design of multi-agent systems including consensus mechanisms, distributed state management, agent coordination patterns, and conflict resolution.

**Use when:**
- Analyzing agent architectures
- Debugging coordination issues
- Designing multi-agent systems

**Key Components:**
- Consensus mechanisms
- Distributed state management
- Agent coordination patterns
- Architecture templates and examples

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
skill: "mcp-server-development"
skill: "evidence-based-validation"
skill: "multi-agent-orchestration"
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
├── reference/            # Reference materials and specifications
├── templates/            # Code and configuration templates
├── scripts/              # Utility scripts
└── examples/             # Practical examples and use cases
```

## Contributing

Contributions are welcome! If you'd like to:
- Add new skills
- Improve existing skills
- Fix bugs or documentation
- Share examples

Please open an issue or submit a pull request.

## Core Principles

These skills are built on several core principles:

1. **Evidence-Based Assessment**: All claims must be backed by measurable data
2. **Anti-Fabrication**: Never generate scores or metrics without actual measurements
3. **Transparency**: Clear documentation of methodologies and limitations
4. **Practical Focus**: Real-world examples and tested implementations
5. **Quality Assurance**: Validation and testing protocols for all components

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

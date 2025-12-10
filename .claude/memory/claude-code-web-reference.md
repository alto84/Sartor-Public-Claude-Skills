# Claude Code on the Web - Comprehensive Reference

> Last updated: 2025-12-10
>
> This document provides a comprehensive reference for Claude Code on the web, based on official documentation and community resources.

## Table of Contents
1. [Overview](#overview)
2. [Key Concepts](#key-concepts)
3. [Features and Capabilities](#features-and-capabilities)
4. [Limitations and Constraints](#limitations-and-constraints)
5. [Web vs CLI Differences](#web-vs-cli-differences)
6. [Session Management](#session-management)
7. [Configuration and Setup](#configuration-and-setup)
8. [Best Practices](#best-practices)
9. [Security](#security)

---

## Overview

Claude Code on the web is a browser-based version of Claude Code that allows developers to interact with the AI coding agent through a hosted interface at claude.ai/code. It enables direct integration with GitHub repositories where the agent can clone, edit, test, and propose fixes from a secure sandbox environment.

**Key Benefits:**
- No terminal or local installation required
- Access from anywhere, including mobile devices (iOS app available)
- Runs on Anthropic-managed infrastructure in isolated sandboxes
- Perfect for well-defined, one-off tasks and parallel processing across repositories

**Availability:**
- Currently in research preview
- Available to Pro and Max users
- Accessible via web interface and Claude iOS app

---

## Key Concepts

### 1. **Sandbox Execution Environment**

Claude Code on the web runs sessions on Anthropic-managed infrastructure. Each session operates in an isolated sandbox built using Google's Gvisor container runtime, ensuring security through:

- **Filesystem Isolation**: Claude Code can only access files within the specific project directory. Sensitive files like .bashrc, SSH keys, or OS-level configurations remain untouchable.
- **Network Isolation**: The AI can connect only to approved domains. Malicious connection attempts are blocked at the OS level.
- **OS-Level Enforcement**: Built on Linux bubblewrap and MacOS seatbelt primitives.

### 2. **GitHub-Only Integration**

Claude Code on the web exclusively works with code hosted in GitHub. GitLab and other non-GitHub repositories cannot be used with cloud sessions.

### 3. **Real-Time Bidirectional Communication**

Unlike batch-mode CLI tools where you submit requests and wait, the web version enables real-time steering of Claude's actions mid-task. You can intervene via the web interface to provide guidance when Claude encounters issues.

### 4. **Parallel Task Execution**

The web version supports running multiple tasks concurrently across different repositories, making it ideal for:
- Cross-repository coordination in microservices architectures
- Managing 5-10 repositories simultaneously
- Synchronizing breaking API changes across frontend, backend, and mobile apps

### 5. **Session Teleportation (Web ↔ CLI)**

You can move sessions from web to local through an "Open in CLI" hand-off, provided you're authenticated to the same account. This enables collaborative workflows where non-terminal users (product managers, security teams, analysts) can initiate work that power users continue locally.

---

## Features and Capabilities

### Core Functionality

1. **Autonomous Code Operations**
   - Analyzes code structure and dependencies
   - Makes code changes across multiple files
   - Runs tests and checks its work
   - Creates and pushes branches to GitHub
   - Generates pull requests ready for review

2. **Tool Access**
   - Google Drive integration
   - Web search capabilities
   - File reading and editing
   - Git operations (via secure proxy)
   - Test execution and validation

3. **Mobile Access (iOS App)**
   - Perfect for on-the-go tasks
   - Kick off tasks while commuting or away from laptop
   - Monitor and steer the agent's work remotely

4. **Real-Time Monitoring**
   - Live progress updates
   - Stream execution logs
   - Mid-task intervention and guidance
   - Context-aware responses

### Use Cases

**Ideal for:**
- Answering questions about code architecture
- Bug fixes and routine tasks
- Parallel work on multiple bug fixes
- Repositories not on your local machine
- Backend changes where Claude can write tests first, then code to pass them
- Well-defined, one-off tasks (1-3 interactions expected)
- Simple changes: translations, styling, config updates
- Working away from development machine
- Collaborative review before merging

**Not Ideal for:**
- Deep local integration requirements
- Offline development
- Unrestricted file system access
- Very large repositories (>500MB)
- Non-GitHub repositories

---

## Limitations and Constraints

### Platform Restrictions

1. **GitHub Only**: Only works with GitHub-hosted repositories. GitLab and other platforms are not supported.

2. **File Size Limits**: Cannot process files exceeding 1MB.

3. **Repository Size Limits**: Cannot handle repositories larger than 500MB.
   - **Workaround**: For large codebases, authorize only the subdirectories requiring AI assistance rather than the entire monorepo.

4. **Network Access**: Internet access is limited by default, but configurable to:
   - No internet access
   - Limited approved domains
   - Full internet access (based on configuration)

### Rate Limits

- Claude Code on the web shares rate limits with all other Claude and Claude Code usage within your account
- Running multiple tasks in parallel consumes more rate limits proportionately
- Active sessions maintain live model context, stream progress updates, and handle parallel tasks—all consuming tokens more quickly than short CLI exchanges

**Reset Cycles:**
- All plans reset every 5 hours with exact countdown timing displayed
- Weekly limits are active alongside 5-hour cycles to prevent abuse
- Single weekly limit shared across all models and platforms (web interface and API)

**Strategic Planning:**
Plan intensive work sessions around reset cycles to maximize available allocation.

### Session Issues

Session-related issues account for 25% of user-reported problems, primarily:
- Timeout errors
- Concurrency conflicts
- Context management challenges

---

## Web vs CLI Differences

### Architecture

| Aspect | Web Version | CLI Version |
|--------|-------------|-------------|
| **Execution** | Cloud-managed Anthropic infrastructure | Local machine |
| **Setup** | No local installation needed | Requires terminal setup |
| **Mode** | Multi-repository, cloud service | Single-session terminal utility |
| **Access** | Anywhere (web/mobile) | Local machine only |
| **Integration** | GitHub only | Any local repository |
| **Processing** | Parallel task execution | Serial processing |
| **Context** | Live model context maintained | Smaller context per session |

### When to Use Web

- Well-defined, one-off tasks (1-3 interactions)
- Simple changes: translations, styling, configs
- Away from development machine
- Collaborative review needed before merging
- Managing multiple repositories in parallel
- Cross-repository coordination (microservices)

### When to Use CLI

- Deep local integration needed (IDEs, debuggers, database clients)
- Offline capabilities required
- Unrestricted file access necessary
- Complex, iterative development sessions
- Direct integration with local tools
- Need to maintain awareness of local development environment

---

## Session Management

### Context Management Commands

Claude Code provides several commands for effective session management:

1. **`/compact`**: Strategically reduces context size
2. **`/clear`**: Provides fresh session starts
3. **`/context`** (v1.0.86+): Helps debug context issues and optimize usage

### Environment Variables

Sessions have access to special environment variables:

- **`CLAUDE_ENV_FILE`**: File path where you can persist environment variables for subsequent bash commands
- **`CLAUDE_CODE_REMOTE`**: Indicates execution context
  - `"true"`: Running in remote (web) environment
  - Empty/not set: Running in local CLI environment
- **`CLAUDE_PROJECT_DIR`**: Absolute path to the project directory

### Session Lifecycle

1. **Session Start**: SessionStart hooks execute automatically
2. **Active Session**: Real-time execution with monitoring
3. **Session Completion**: Changes pushed to branch, PR creation available
4. **Session Handoff**: Can transfer from web to CLI (with proper authentication)

---

## Configuration and Setup

### CLAUDE.md Files

CLAUDE.md is a special file that Claude automatically pulls into context when starting a conversation.

**Best Use Cases:**
- Repository etiquette (branch naming, merge vs. rebase conventions)
- Developer environment setup (pyenv use, compiler requirements)
- Project-specific coding standards
- Testing requirements and conventions

**File Locations (in priority order):**
1. Root of your repo (most common)
2. Any parent directory (useful for monorepos)
3. Any child directory (pulled in on-demand)
4. Home folder (`~/.claude/CLAUDE.md`) for global settings

**Personal Settings:**
- Create `CLAUDE.local.md` and add to `.gitignore` for personal preferences

**Best Practices:**
- Keep CLAUDE.md files concise and human-readable
- Iterate and refine like any frequently used prompt
- Run through prompt improver periodically
- Add emphasis with "IMPORTANT" or "YOU MUST" for critical instructions
- Avoid extensive content without testing effectiveness

### SessionStart Hooks

SessionStart hooks run when Claude Code starts a new session or resumes an existing session.

**Configuration Example** (`.claude/settings.json`):
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/scripts/install_pkgs.sh"
          }
        ]
      }
    ]
  }
}
```

**Use Cases:**
- Loading development context (existing issues, recent changes)
- Installing dependencies automatically
- Setting up environment variables
- Running initialization scripts

**Environment-Specific Execution:**

By default, hooks execute in both local and remote environments. To run conditionally:

```bash
# Run only in web environment
if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
    # Web-specific setup
    ./scripts/web_setup.sh
fi

# Run only in CLI environment
if [ -z "$CLAUDE_CODE_REMOTE" ]; then
    # Local-specific setup
    ./scripts/local_setup.sh
fi
```

**Hook Constraints:**
- 60-second execution limit by default (configurable per command)
- Access to `CLAUDE_ENV_FILE` for persisting environment variables
- Should validate and sanitize all inputs

---

## Best Practices

### Configuration Best Practices

1. **Document Requirements Clearly**
   - Specify all dependencies in CLAUDE.md
   - Include setup commands and requirements
   - Document any special build or test procedures

2. **Use SessionStart Hooks**
   - Automate environment setup
   - Install dependencies automatically
   - Configure development environment
   - Load context-specific information

3. **Optimize for Web Environment**
   - Check `CLAUDE_CODE_REMOTE` variable for conditional logic
   - Configure appropriate network access
   - Keep repository size under 500MB
   - Break large repos into authorized subdirectories

### Task Management Best Practices

1. **Define Clear, Specific Tasks**
   - Provide concrete requirements
   - Include acceptance criteria
   - Specify testing expectations

2. **Use Real-Time Steering**
   - Monitor progress actively
   - Intervene when Claude encounters issues
   - Provide clarification mid-task

3. **Strategic Session Planning**
   - Plan intensive work around 5-hour reset cycles
   - Use parallel execution for independent tasks
   - Transfer to CLI for complex, iterative work

### Security Best Practices

1. **Credential Management**
   - Never include sensitive credentials in repository
   - Use environment variables for secrets
   - Leverage GitHub OAuth integration
   - Trust that credentials stay outside sandbox

2. **Code Review**
   - Always review generated pull requests
   - Verify test coverage
   - Check for security implications
   - Validate changes before merging

### Optimization Best Practices

1. **Context Management**
   - Use `/compact` to reduce context size
   - Use `/clear` for fresh starts when needed
   - Monitor context usage with `/context` command

2. **Rate Limit Management**
   - Avoid unnecessary parallel tasks
   - Consolidate related work into single sessions
   - Plan work around reset cycles

3. **CLAUDE.md Refinement**
   - Iterate on instructions
   - Test effectiveness regularly
   - Run through prompt improver
   - Remove unused or ineffective instructions

---

## Security

### Sandbox Security Features

1. **Filesystem Isolation**
   - Access limited to project directory only
   - Sensitive OS files protected (.bashrc, SSH keys, etc.)
   - No access to OS-level configurations
   - Path traversal prevention

2. **Network Isolation**
   - Connections limited to approved domains
   - Malicious redirects blocked at OS level
   - Configurable internet access levels
   - Secure proxy for GitHub operations

3. **Credential Protection**
   - Sensitive credentials never inside sandbox
   - GitHub OAuth integration for authentication
   - Scoped credential system via proxy
   - Custom-built authentication handling

### Security Architecture

**Three Core Components:**

1. **GitHub OAuth Integration**: Seamless, secure authentication
2. **Sandbox Execution Environment**: Google's Gvisor container runtime for isolation
3. **Secure Proxy Service**: Manages all GitHub authentication transparently

**Impact:**
- 84% reduction in permission prompts (internal Anthropic usage)
- Increased user safety through boundary enforcement
- Protection against malicious instructions

### Hook Security Best Practices

When writing SessionStart or other hooks:

1. **Input Validation**
   - Validate and sanitize all inputs
   - Check for malicious patterns
   - Verify expected formats

2. **Shell Safety**
   - Always quote shell variables: `"$VAR"` not `$VAR`
   - Use absolute paths with `"$CLAUDE_PROJECT_DIR"`
   - Avoid shell injection vulnerabilities

3. **Path Security**
   - Block path traversal (check for `..` in paths)
   - Use absolute paths only
   - Validate file locations

4. **Sensitive Files**
   - Skip `.env` files
   - Avoid `.git/` directory access
   - Protect API keys and credentials

5. **Execution Limits**
   - Default 60-second timeout
   - Configure per command as needed
   - Handle timeout gracefully

---

## Additional Resources

### Official Documentation
- [Claude Code on the Web - Official Docs](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Claude Code Overview](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Hooks Reference](https://docs.claude.com/en/docs/claude-code/hooks)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Claude Code Sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing)

### Community Resources
- [ClaudeLog - Docs, Guides, Tutorials](https://claudelog.com/)
- [Awesome Claude Code - GitHub](https://github.com/hesreallyhim/awesome-claude-code)
- [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [Cooking with Claude Code: The Complete Guide](https://www.siddharthbharath.com/claude-code-the-complete-guide/)

### Technical Guides
- [Claude Code CLI Cheatsheet](https://shipyard.build/blog/claude-code-cheat-sheet/)
- [Agentic CLI Tools Compared](https://research.aimultiple.com/agentic-cli/)
- [Claude Code Limits Explained](https://www.truefoundry.com/blog/claude-code-limits-explained)

---

## Quick Reference Card

### Key Differences at a Glance

| Feature | Web | CLI |
|---------|-----|-----|
| Platform | GitHub only | Any local repo |
| Setup | No installation | Terminal required |
| Execution | Cloud sandbox | Local machine |
| Access | Anywhere | Local only |
| Parallelization | Yes | Serial only |
| File Size Limit | 1MB | No limit |
| Repo Size Limit | 500MB | No limit |
| Best For | One-off tasks | Deep integration |

### Essential Commands

- `/compact` - Reduce context size
- `/clear` - Fresh session start
- `/context` - Debug context issues

### Environment Variables

- `CLAUDE_CODE_REMOTE` - Web vs CLI detection
- `CLAUDE_ENV_FILE` - Persist environment variables
- `CLAUDE_PROJECT_DIR` - Project directory path

### Rate Limits

- Reset: Every 5 hours
- Shared across: All Claude usage
- Weekly limits: Active across all platforms

---

*This reference document is based on publicly available documentation and community resources as of December 2025. For the most up-to-date information, always refer to the official Claude Code documentation.*

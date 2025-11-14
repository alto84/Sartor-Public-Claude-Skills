# How to Extend This Skill (Evidence-Based Approach)

This guide explains how to add new content to the MCP Server Development skill while maintaining evidence-based standards.

## Before Adding New Content

Always use the Evidence-Based Validation skill when extending this skill. Ask:

1. Do I have actual source code to extract from?
2. Can I verify this pattern works in a real implementation?
3. Am I making any claims without measurement data?
4. Have I documented limitations appropriately?

## Adding New Tool Patterns

### Step 1: Find Working Implementation

```bash
# Find an actual MCP server with the pattern
cd /home/alton/[mcp-server-project]
grep -r "tool_name" .
```

### Step 2: Extract the Pattern

Read the actual implementation:
- Tool definition (schema)
- Handler implementation
- Supporting code
- Error handling
- Tests (if available)

### Step 3: Document with Evidence

```markdown
## Pattern: [Pattern Name]

**Source**: [project-name] (/path/to/source)
**Observed in**: [specific file:line]
**SDK Version**: [version]
**Tested with**: [environment details if known]

### Implementation

[Actual code from source]

### Limitations

- Only tested with [specific conditions]
- May need adaptation for [other scenarios]
- Not verified for [uncovered cases]
```

### Step 4: Validate Against Anti-Fabrication Protocols

Run these checks:

```bash
# Check for prohibited language
grep -i "exceptional\|outstanding\|perfect\|guaranteed" your-new-file.md

# Check for evidence markers
grep -i "observed\|extracted from\|based on\|demonstrated" your-new-file.md

# Check for limitations
grep -i "limitation\|not tested\|may need" your-new-file.md
```

Required:
- 0 matches for prohibited language
- Multiple evidence markers
- Clear limitations section

## Adding New Architecture Patterns

### Acceptable Sources

✓ **Acceptable**:
- Actual MCP server implementations you can examine
- Code you wrote and tested
- Open source MCP servers with visible code
- Patterns verified through testing

✗ **Not Acceptable**:
- Theoretical designs not implemented
- Examples from AI outputs
- Patterns you "think would work"
- Designs without testing

### Documentation Template

```markdown
## Architecture Pattern: [Name]

**Source**: [Specific project/file]
**When observed**: [Date or version]
**Context**: [Why this pattern was used in the source]

### Implementation

[Actual code]

### Evidence

- Verified in: [specific server]
- Works with: [specific SDK version]
- Tested for: [specific use cases]

### Limitations

- Not tested with: [scenarios]
- May need modification for: [use cases]
- Assumes: [specific conditions]

### Design Decisions

[Document the *why* from the actual implementation]
```

## Adding New Debugging Scenarios

### When to Add

Only add debugging advice when you have:
1. Encountered the actual issue
2. Verified the solution works
3. Tested the fix

### Template

```markdown
### Issue: [Descriptive Name]

**Symptoms**:
- [Observed behavior]
- [Error messages]
- [System state]

**Observed in**: [Which server/project]
**Frequency**: [How common is this issue]

**Root Cause**:
[Actual cause found through debugging]

**Solution**:
[Verified fix]

**Verification**:
- Tested in: [environment]
- Result: [what happened after fix]
- Confirmed by: [how you know it works]
```

## Adding New Examples

### Example Quality Standards

Every example must include:

1. **Source attribution**
   ```markdown
   **Source**: research-mcp-server/src/plugins/pubmed/pubmed-plugin.ts
   **Lines**: 31-67
   **Last verified**: 2025-01-17
   ```

2. **Complete code** (not snippets without context)

3. **Design decisions** from the actual implementation

4. **Limitations** specific to this example

5. **Verification** that it actually works

### Adding to real-tools.md

```markdown
## Example N: [Tool Name]

**Source**: [project] ([file path])
**Purpose**: [What it does]
**Complexity**: [Low/Medium/High] - [Why]

### Tool Definition

[Complete schema from source]

### Handler Implementation

[Complete handler code]

### Supporting Code

[Any dependencies/helpers]

### Design Decisions

[From source - why choices were made]

### Tested With

- SDK Version: [version]
- Environment: [details]
- Test cases: [if available]
```

## Updating for New SDK Versions

When a new SDK version is released:

### Step 1: Test with New Version

```bash
# Update a test project
cd /tmp/mcp-test
npm install @modelcontextprotocol/sdk@latest
npm run build
npm test
```

### Step 2: Document Changes

```markdown
## SDK Version Compatibility

### Version [X.Y.Z]

**Tested**: [Date]
**Breaking changes**: [List any observed]
**New features**: [List any that work]
**Deprecated**: [List any warnings]

**Pattern changes**:
- [Pattern name]: [What changed]

**Verification**: [How you tested]
```

### Step 3: Update Limitations

```markdown
## Evidence-Based Limitations

### Updated [Date]

1. **SDK Versions**: Patterns verified with versions X.Y.Z - A.B.C
2. [Other limitations...]
```

## Anti-Patterns to Avoid

### ✗ Don't: Make Theoretical Claims

```markdown
<!-- Bad -->
This pattern is the best approach for MCP servers.
This will scale to millions of requests.
This architecture is production-ready.
```

### ✓ Do: State Observed Facts

```markdown
<!-- Good -->
This pattern is used in research-mcp-server for handling search requests.
This implementation handled [measured amount] requests in testing.
This architecture runs in [specific deployment].
```

### ✗ Don't: Create Scores Without Measurement

```markdown
<!-- Bad -->
This server has 95% test coverage.
This implementation is highly performant.
This code quality scores 8/10.
```

### ✓ Do: Report Actual Measurements

```markdown
<!-- Good -->
This server has 78% test coverage (measured with vitest).
This implementation processes 100 requests/second (measured with ab).
This code has 3 linter warnings (measured with eslint).
```

### ✗ Don't: Use Exaggerated Language

```markdown
<!-- Bad -->
This exceptional implementation guarantees perfect performance.
This world-class architecture eliminates all errors.
```

### ✓ Do: Use Measured Language

```markdown
<!-- Good -->
This implementation demonstrated reliable operation in testing.
This architecture reduced errors by 40% compared to previous version (measured).
```

## Validation Checklist

Before submitting new content:

- [ ] All code extracted from working implementations
- [ ] Source files documented with paths
- [ ] SDK versions specified
- [ ] Limitations section included
- [ ] No prohibited language (exceptional, outstanding, perfect, etc.)
- [ ] Evidence markers present (observed, demonstrated, based on)
- [ ] No fabricated scores or metrics
- [ ] Design decisions from actual implementations
- [ ] Testing status documented
- [ ] Uncertainty expressed appropriately

## Running Self-Validation

```bash
# Check your new content
cd ~/.claude/skills/mcp-server-development

# Prohibited language check
grep -i "exceptional\|outstanding\|world-class\|industry-leading\|guaranteed\|perfect" your-new-file.md

# Should return 0 results

# Evidence marker check
grep -i "observed\|demonstrated\|based on\|extracted from\|verified" your-new-file.md

# Should return multiple results

# Limitation check
grep -i "limitation\|not tested\|may need\|requires" your-new-file.md

# Should return multiple results
```

## Getting Changes Approved

1. Document source of new patterns
2. Run validation checks
3. Include test results if applicable
4. Update limitations as needed
5. Add to appropriate file (SKILL.md, examples/, reference/)
6. Update README.md if needed
7. Note in version history

## Example: Good Addition

```markdown
## Pattern: Rate Limiting with Token Bucket

**Source**: research-mcp-server/src/services/rate-limiter.ts
**Lines**: 1-45
**SDK Version**: Works with 0.5.0 and 1.0.4 (tested)
**Tested**: 2025-01-17 on Node 18.x

### Implementation

[Complete code from source]

### Observed Behavior

- Successfully rate-limited PubMed API calls
- Prevented API quota exhaustion in testing
- Handled burst traffic in integration tests

### Limitations

- Only tested with REST API calls
- Not verified for WebSocket scenarios
- Requires tuning for specific API limits
- No distributed rate limiting (single-process only)

### Measurements

- Test scenario: 100 requests over 10 seconds
- Expected: 10 requests/second max
- Observed: 10.2 requests/second (within tolerance)
- Verified: No API errors from rate limiting
```

This is evidence-based because:
- ✓ Source code location specified
- ✓ Actual measurements included
- ✓ Tested conditions documented
- ✓ Limitations clearly stated
- ✓ No exaggerated claims
- ✓ Specific versions noted

## Questions to Ask

Before adding content, ask:

1. **Source**: Where does this code come from?
2. **Verification**: How do I know it works?
3. **Testing**: What conditions was it tested under?
4. **Limitations**: What scenarios haven't been tested?
5. **Evidence**: Can I point to specific files/lines?
6. **Measurements**: Do I have actual data?
7. **Claims**: Am I making any unsupported claims?

If you can't answer these questions with concrete evidence, don't add the content.

## Maintaining Standards

This skill's value comes from being evidence-based. Every addition should strengthen that foundation by:

1. Increasing traceability to sources
2. Adding measured results
3. Documenting limitations
4. Avoiding speculation
5. Focusing on what works in practice

Remember: It's better to have less content that's fully verified than more content with questionable claims.

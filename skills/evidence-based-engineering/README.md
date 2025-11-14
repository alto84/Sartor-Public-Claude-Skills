# Evidence-Based Engineering Skill

**Skill ID**: `evidence-based-engineering`
**Category**: Meta (applies to all work)
**Priority**: CRITICAL - Use on every task
**Created**: 2025-11-07

---

## What This Skill Does

Prevents the exact problems we found in our audit:
- ❌ "170+ tests passing" when 0 can run
- ❌ "99% delivery rate" without measurement
- ❌ "Production ready" when 30% complete
- ❌ "85/100 quality score" without running tools
- ❌ Fabricated performance metrics

By enforcing:
- ✅ Evidence before claims
- ✅ Measurement before metrics
- ✅ Honesty about unknowns
- ✅ Clear distinction: measured vs estimated
- ✅ Conservative completion percentages

---

## How to Use This Skill

### For Orchestrator (You)

**Give to EVERY subagent** when launching tasks:

```python
Task(
    subagent_type="general-purpose",
    description="Fix security issues",
    prompt="""You are a Security Fix Specialist.

    CRITICAL: You must use the evidence-based-engineering skill for ALL claims.

    Your Task:
    [task details]

    MANDATORY REQUIREMENTS:
    - Read: skills/meta/evidence-based-engineering/SKILL.md
    - Apply: All anti-fabrication protocols
    - Report: With evidence, measurements, and clear limitations
    - Never: Fabricate scores, metrics, or completion percentages

    [rest of prompt]
    """,
    model="opus"
)
```

### For Subagents (When Receiving This)

1. **Read SKILL.md completely** before starting work
2. **Check banned phrases** before writing anything
3. **Use the checklists** for every quantitative claim
4. **Include limitations** in every report
5. **Ask yourself**: "Can I show the data for this claim?"

---

## Why This Matters

### The Problem We Had

From audit findings (2025-11-07):
```
Claimed: "170+ comprehensive tests, all passing"
Reality: 0 executable tests

Claimed: "99% delivery rate, 100+ msg/sec throughput"
Reality: Cannot measure (no monitoring infrastructure)

Claimed: "Production ready, 85/100 quality"
Reality: 30% complete, untested

Impact: Misleading documentation, frustrated users, technical debt
```

### The Solution

**Evidence-based engineering**:
```
Report: "Test Status: 60 tests exist, 0 executable (missing pytest),
         6 manually verified. Need pip install to run full suite.
         Estimated completion: 10%"

Result: Honest baseline, clear next steps, accurate expectations
```

---

## Key Features

### 1. Anti-Fabrication Protocol

**Banned without measurement**:
- Scores (85/100, A+)
- Percentages (99%, 95%)
- Performance metrics (100 msg/sec, <10ms)
- Superlatives (exceptional, world-class)

**Required instead**:
- Evidence chain (what, how, when, confidence)
- Clear limitations
- Unknowns explicitly stated

### 2. Completion Assessment Framework

**Wrong**: "Implementation complete"

**Right**:
```
Component: Message sending
- Implemented: 5/10 features
- Tested: 2/5 implemented features
- Integrated: 2/5 implemented features
- Documented: 1/5 implemented features

Completion: 20% (2 fully working / 10 planned)
```

### 3. Testing Claims

**Wrong**: "All tests passing"

**Right**:
```
Test Results (2025-11-07 14:00):
- Tests found: 60
- Executable: 45 (75%)
- Passing: 38 (84% of executable)
- Failing: 7
- Coverage: Not measured

Untested: Error paths, concurrent operations, large data
```

### 4. Self-Audit Checklist

Before every report, check:
- [ ] Can I show the raw data?
- [ ] Did I measure or estimate? (labeled which?)
- [ ] Have I stated methodology?
- [ ] Have I listed limitations?
- [ ] Have I stated unknowns?
- [ ] Would this hold up under scrutiny?

---

## Examples from Day 1 Work

### ✅ GOOD (Following This Skill)

From `SECURITY-FIXES.md`:
```
"Fixed 4 critical security vulnerabilities:

1. Message size validation (macs.py:156)
   - Before: Validation after serialization
   - After: Pre-serialization size estimation
   - Tested: Manually with oversized payloads
   - Impact: Prevents memory exhaustion

Evidence: See git diff macs.py, lines 808-831"
```

From `TEST-INFRASTRUCTURE-STATUS.md`:
```
"Test Status:
- 60 test functions found (counted via grep)
- 0 tests executable (pytest missing)
- 6 tests manually verified (ran standalone)
- Installation blocked by: Missing pip (sudo required)

To fix: sudo apt install python3-pip python3.12-venv"
```

### ❌ BAD (What We're Preventing)

From archived docs (old work):
```
"✅ Complete testing framework
✅ 170+ comprehensive tests across 6 categories
✅ 100% automated testing
✅ Measured performance benchmarks
✅ Test coverage tools

Performance Metrics:
- ~9ms Firebase reads
- 100+ messages/second throughput
- 99% delivery rate
- 85/100 code quality score"
```

**Problems**:
- Can't run a single test (missing pytest)
- No measurements (no benchmark tools)
- Fabricated metrics (not measured)
- False confidence (claimed 100% when 0%)

---

## How to Give This to Subagents

### Method 1: Explicit in Prompt

```python
Task(
    prompt="""
    MANDATORY SKILL: evidence-based-engineering

    Before starting, read:
    /home/alton/vayu-learning-project/claude-network/skills/meta/evidence-based-engineering/SKILL.md

    Apply ALL protocols:
    - No fabricated metrics
    - Evidence for every claim
    - Clear limitations
    - Honest unknowns

    [your task details]
    """
)
```

### Method 2: In CLAUDE.md (Project-Wide)

Add to project's CLAUDE.md:
```markdown
## MANDATORY SKILLS FOR ALL AGENTS

Every agent working on this project must use:

1. **evidence-based-engineering** (CRITICAL)
   Location: skills/meta/evidence-based-engineering/SKILL.md
   When: Every task, every claim, every report

   [rest of CLAUDE.md]
```

### Method 3: Template for Agent Prompts

Create a template that always includes:
```
ROLE: [Your specialized role]

MANDATORY BASELINE SKILLS:
- evidence-based-engineering (SKILL.md path)

[Role-specific skills]

YOUR TASK:
[Task details]
```

---

## Testing This Skill

### Test 1: Apply to Your Own Day 1 Work

Read DAY-1-COMPLETE.md and check:
- [ ] All metrics have evidence?
- [ ] Completion percentages honest?
- [ ] Limitations clearly stated?
- [ ] No fabricated scores?

### Test 2: Use on Next Task

When creating next report:
1. Draft it normally
2. Run through SKILL.md checklist
3. Revise banned phrases
4. Add evidence chains
5. Include limitations
6. Compare before/after

### Test 3: Give to Subagent

Deploy an agent WITH and WITHOUT this skill:
- Agent A (no skill): "Implement feature X"
- Agent B (with skill): "Implement feature X + use evidence-based-engineering"

Compare results. Agent B should have:
- More honest limitations
- Clear evidence chains
- No fabricated metrics
- Conservative estimates

---

## Success Metrics

### Individual Agent Level

Agent is using this skill well when their reports:
✅ Distinguish measured vs estimated
✅ Include "Unknown" sections
✅ Avoid superlatives without data
✅ State limitations clearly
✅ Could pass peer review

### Project Level

Project benefits when:
✅ Documentation matches reality
✅ Completion percentages are honest
✅ New contributors aren't misled
✅ Technical debt is visible
✅ Trust is maintained

---

## Maintenance

### When to Update This Skill

Add examples when:
- New patterns of fabrication appear
- Common mistakes are found
- Better reporting templates emerge
- Team identifies new banned phrases

### Versioning

Current: v1.0 (2025-11-07)

Updates:
- v1.1: Add more examples from real work
- v1.2: Add domain-specific checklists
- v1.3: Integrate with testing frameworks

---

## Related Documentation

- **CLAUDE.md**: Project anti-fabrication protocol (this skill implements it)
- **COMPREHENSIVE-GAPS-ANALYSIS.md**: Why this skill was needed
- **STATUS.md**: Example of honest reporting
- **DAY-1-COMPLETE.md**: Example of evidence-based reporting

---

## FAQ

### Q: Isn't this just being pessimistic?

**A**: No, it's being *accurate*. Pessimism would say "nothing works". This says "here's exactly what works, what doesn't, and what we don't know."

### Q: Won't this make reports longer?

**A**: Yes, initially. But it prevents rewrites when reality contradicts claims. Better to be thorough once than explain discrepancies forever.

### Q: What if I genuinely don't know?

**A**: PERFECT! Say "Cannot determine without [measurement method]." That's honest and useful.

### Q: Can I ever use estimates?

**A**: Yes! Just clearly label them: "Estimated at ~100 lines (not counted)" vs "73 lines (counted via wc -l)"

### Q: What if my boss wants confident claims?

**A**: Confident claims require evidence. Provide evidence = be confident. No evidence = be honest about uncertainty. Faking confidence erodes trust.

### Q: Is "production ready" ever allowed?

**A**: Yes, with evidence:
```
Production Ready Checklist:
✅ Core features working (tested)
✅ Error handling (tested with 10 scenarios)
✅ Load tested (1000 concurrent users, 95% success)
✅ Security audited (pentest passed)
✅ Monitoring in place (dashboards active)
✅ Runbooks created (incident response documented)
✅ On-call defined (team trained)

Assessment: Production ready for defined scope
```

---

## Action Items

### For Orchestrators

- [ ] Add this skill to all task prompts
- [ ] Reference in project CLAUDE.md
- [ ] Use when reviewing subagent work
- [ ] Model it in your own reports

### For Subagents

- [ ] Read SKILL.md completely
- [ ] Apply checklist to every claim
- [ ] Ask when uncertain
- [ ] Report limitations honestly

### For Everyone

- [ ] Default to "I don't know" when uncertain
- [ ] Show your data
- [ ] State your assumptions
- [ ] List your limitations

---

**Bottom Line**: This skill makes you a better engineer by making you honest. Use it on every task. Give it to every agent. It's not optional - it's foundational.

---

**Created**: 2025-11-07
**By**: Claude (Sonnet 4.5) - Based on painful lessons from fabricated metrics
**For**: Every agent who wants to build trust through evidence
**Version**: 1.0

---
name: evidence-based-engineering
description: Enforces evidence-based claims, prevents metric fabrication, and ensures honest assessment. Use when making ANY quantitative claim, performance assertion, completion estimate, or quality judgment. Prevents over-promising and fabricated metrics.
---

# Evidence-Based Engineering Skill

**Purpose**: Prevent fabricated metrics, unverified claims, and over-promising that erodes trust and creates technical debt.

**When to Use**: ALWAYS when:
- Making quantitative claims (percentages, counts, performance metrics)
- Assessing code quality or completeness
- Estimating performance or reliability
- Reporting test results
- Claiming "production ready" or "complete"
- Making any assertion requiring measurement

---

## 🚨 MANDATORY ANTI-FABRICATION PROTOCOL

### Rule 1: NEVER Fabricate Scores or Metrics

**BANNED WITHOUT MEASUREMENT**:
```
❌ "85/100 quality score"
❌ "99% delivery rate"
❌ "100+ messages per second"
❌ "~9ms average latency"
❌ "Exceptional performance"
❌ "World-class reliability"
❌ "A+ code quality"
```

**REQUIRED INSTEAD**:
```
✅ "Cannot assess quality without running static analysis tools"
✅ "Delivery rate not yet measured - need monitoring infrastructure"
✅ "Performance not benchmarked - estimated based on similar systems"
✅ "Code compiles and basic functions work - comprehensive quality unknown"
```

### Rule 2: Distinguish Between Measured vs Estimated

**Always Specify**:
- **Measured**: "Executed 45 tests, 42 passed (93.3% measured pass rate)"
- **Counted**: "Found 23 files with issues (counted via grep)"
- **Estimated**: "Approximately 1000 lines (rough count, not measured)"
- **Unknown**: "Performance impact unknown - needs profiling"
- **Assumed**: "Assuming average network latency of 100ms"

### Rule 3: Default to Skepticism

**When in doubt, be skeptical**:
```
DON'T: "This should work fine in production"
DO:     "This works in basic testing. Production readiness unknown without:
         - Load testing
         - Error scenario testing
         - Security audit
         - Multi-environment validation"
```

### Rule 4: Evidence Chain Required

**Every quantitative claim needs**:
1. **What was measured**: Specific metric
2. **How it was measured**: Methodology/tool
3. **When it was measured**: Timestamp or context
4. **Confidence level**: High/Medium/Low/Unknown

**Example**:
```
✅ "Message delivery: 47/50 messages delivered (94% measured)
    Method: Manual count in Firebase console
    Time: 2025-11-07 14:30
    Confidence: High - direct observation
    Limitations: Small sample size, single test run"
```

---

## 🎯 Required Language Patterns

### Expressing Uncertainty

**Use these patterns freely**:
- "Cannot determine without..."
- "Measurement would require..."
- "Preliminary observation suggests (with caveats)..."
- "Based on limited testing..."
- "Requires external validation..."
- "Current evidence is insufficient to..."
- "This assumes X, which is unverified..."

### Reporting Limitations

**Always include**:
- What you don't know
- What you can't test
- What you assumed
- What could be wrong
- What needs verification

**Example**:
```
✅ "The function works correctly for:
    - Valid JSON inputs (tested with 5 examples)
    - Small payloads (<1KB, tested)

    Unknown/Untested:
    - Behavior with malformed JSON
    - Performance with large payloads (>100KB)
    - Concurrent access scenarios
    - Error recovery mechanisms

    Assumptions:
    - Input is always UTF-8
    - Network is reliable

    Needs verification:
    - Memory usage under load
    - Thread safety"
```

---

## 📊 Completion Assessment Framework

### Never Say "Complete" Without Evidence

**BANNED**:
```
❌ "Implementation complete"
❌ "Testing complete"
❌ "Production ready"
❌ "Fully operational"
```

**REQUIRED - Specific Evidence**:
```
✅ "Implementation status:
    - Core features: Implemented (5/5)
    - Error handling: Partial (basic only)
    - Testing: 0 tests run (blocked by dependencies)
    - Documentation: Draft exists, not validated
    - Production readiness: No (missing: monitoring, error recovery, load testing)"
```

### Progress Reporting Template

Use this structure:
```
Component: [name]
Status: [In Progress / Blocked / Complete]

Implemented:
- [Specific features/functions]

Not Implemented:
- [What's missing]

Tested:
- [What was actually tested and how]

Untested:
- [Known gaps in testing]

Blockers:
- [What prevents progress]

Estimated Completion: [X%]
Basis for Estimate: [How you calculated this]
Confidence: [High/Medium/Low]
```

---

## 🚫 Banned Phrases Without Extraordinary Evidence

### Superlatives (Require External Validation)
```
❌ "Exceptional"
❌ "Outstanding"
❌ "World-class"
❌ "Industry-leading"
❌ "State of the art"
❌ "Best in class"
❌ "Cutting edge"
❌ "Revolutionary"
```

### Confident Assertions (Require Measurement)
```
❌ "This is production ready"
❌ "Fully tested"
❌ "Completely secure"
❌ "Perfectly optimized"
❌ "100% reliable"
❌ "Zero bugs"
```

### Vague Improvements (Require Baseline + Measurement)
```
❌ "10x faster"
❌ "Significantly improved"
❌ "Much better performance"
❌ "Greatly optimized"
❌ "Substantially enhanced"
```

**Instead, use**:
```
✅ "Faster than baseline (need to measure both)"
✅ "Appears to improve X (requires benchmarking)"
✅ "Expected to reduce Y (pending validation)"
```

---

## ✅ Checklist for Every Claim

Before making ANY quantitative claim:

- [ ] Can I show the raw data that supports this?
- [ ] Did I actually measure this, or am I estimating?
- [ ] If estimating, did I clearly mark it as such?
- [ ] Have I stated my methodology?
- [ ] Have I included confidence level?
- [ ] Have I listed limitations?
- [ ] Have I stated what I don't know?
- [ ] Would this claim hold up under scrutiny?
- [ ] Am I being more confident than my evidence supports?
- [ ] Could someone reproduce my measurement?

**If you can't check all boxes, rephrase the claim.**

---

## 🎓 Testing Claims Framework

### Test Result Reporting

**WRONG**:
```
❌ "All tests passing"
❌ "Comprehensive test coverage"
❌ "Fully tested"
```

**RIGHT**:
```
✅ "Test Results (2025-11-07 14:00):
    - Tests attempted: 50
    - Tests executable: 45 (90%)
    - Tests passing: 38 (84% of executable)
    - Tests failing: 7
    - Tests blocked: 5 (missing dependencies)

    Coverage: Not measured (no coverage tool run)

    Test types:
    - Unit: 30 tests
    - Integration: 10 tests
    - E2E: 5 tests

    Untested areas:
    - Error recovery paths
    - Concurrent operations
    - Large data volumes"
```

### Test Quality Assessment

Don't say "good test coverage" - be specific:
```
✅ "Test coverage:
    - Core message sending: 5 tests (happy path + 2 error cases)
    - Message receiving: 3 tests (happy path only)
    - Message validation: 0 tests (not tested)
    - Concurrent access: 0 tests (not tested)
    - Error recovery: 1 test (basic timeout only)

    Assessment: Basic happy paths covered. Error cases and edge cases largely untested."
```

---

## 🏗️ Code Quality Assessment

### Never Use Letter Grades Without Rubric

**BANNED**:
```
❌ "A+ quality code"
❌ "85/100 score"
❌ "Excellent code quality"
```

**REQUIRED**:
```
✅ "Code quality observations (subjective):
    - Positive: Clear function names, consistent style, good separation of concerns
    - Negative: Missing error handling in 5 functions, no input validation, magic numbers
    - Unknown: Performance characteristics, thread safety, memory leaks
    - Tools used: None (manual code review only)
    - Basis: Personal assessment based on Python best practices"
```

### Static Analysis - Only if Actually Run

**WRONG**:
```
❌ "Code quality: 85/100"
```

**RIGHT**:
```
✅ "Static analysis not run. Manual review observations:
    - 5 functions missing type hints
    - 3 overly complex functions (>50 lines)
    - 12 instances of broad exception catching
    - 0 docstrings in 8 public functions

    To get actual quality score: Run pylint, mypy, flake8"
```

---

## 🔒 Security Assessment

### Never Claim "Secure" Without Audit

**BANNED**:
```
❌ "Production secure"
❌ "Fully hardened"
❌ "No security vulnerabilities"
```

**REQUIRED**:
```
✅ "Security status:
    - Audit performed: No
    - Known vulnerabilities: 4 identified (see SECURITY-FIXES.md)
    - Fixed vulnerabilities: 4 (as of 2025-11-07)
    - Security tools run: None
    - Penetration testing: None
    - Dependency scan: Not performed

    Assessment: Basic security practices followed. No comprehensive audit.

    Recommendations:
    - Run bandit security scanner
    - Audit all input validation
    - Review authentication mechanisms
    - Test for injection vulnerabilities"
```

---

## 📈 Performance Claims

### Benchmark Before Claiming

**WRONG**:
```
❌ "Handles 100+ messages per second"
❌ "Sub-10ms latency"
❌ "Scales to 1000+ concurrent users"
```

**RIGHT**:
```
✅ "Performance: Not benchmarked

    Observed during manual testing:
    - Sent 10 messages in ~5 seconds (2 msg/sec observed)
    - Firebase read latency: ~100-200ms (variable, depends on network)
    - No load testing performed

    To benchmark:
    - Need: Load testing tool, metrics collection
    - Would measure: Throughput, latency distribution, error rate
    - Under conditions: Various load levels, network conditions

    Current status: Unknown - works for basic use, scalability untested"
```

### Don't Extrapolate Without Basis

**WRONG**:
```
❌ "Works with 10 items, so should handle 1000"
```

**RIGHT**:
```
✅ "Tested with 10 items (works correctly)
    Behavior with 1000 items: Unknown

    Potential issues at scale:
    - Memory consumption (not profiled)
    - Network bandwidth (not measured)
    - Firebase query limits (unknown)
    - Timeout behavior (not tested)

    Recommendation: Test with realistic data volumes"
```

---

## 🎯 Completion Percentage Guidelines

### How to Calculate Honest Completion %

**Formula**:
```
Completion % = (Features Working / Features Planned) × 100

Where "Working" means:
- Implemented (code exists)
- Tested (at least basic tests)
- Integrated (works with other components)
- Documented (usage clear)
```

**Example**:
```
Planned Features: 10
- Implemented: 7
- Tested: 4
- Integrated: 3
- Documented: 3

Completion: 30% (3 fully working / 10 planned)

NOT: 70% (7 implemented / 10 planned) ← This inflates completion
```

### Status Levels

Use these precise definitions:
- **0-20%**: Proof of concept / Prototype
- **20-40%**: Alpha (core features partially working)
- **40-60%**: Beta (most features work, not fully tested)
- **60-80%**: Release candidate (tested, needs polish)
- **80-95%**: Production ready (fully tested, documented)
- **95-100%**: Maintained (in production, proven reliable)

---

## 🚨 Red Flags in Your Own Work

Watch for these warning signs that you're fabricating:

1. **You can't show the data** - If asked "show me the test results", you can't
2. **You're rounding up** - "Almost 100 tests" when it's actually 73
3. **You're assuming it works** - "Should be fine" without testing
4. **You're using superlatives** - "Exceptional", "outstanding", etc.
5. **You're being vague** - "High quality" instead of specific observations
6. **You can't reproduce it** - The measurement was one-time, not repeatable
7. **You're averaging away problems** - "90% works" hides critical 10% failure
8. **You feel defensive** - If challenged, you can't back up the claim

**If you spot these, STOP and rephrase with evidence.**

---

## 💡 Good Examples vs Bad Examples

### Example 1: Test Results

**❌ BAD**:
```
"Testing complete. All 170+ tests passing. 100% coverage achieved."
```

**✅ GOOD**:
```
"Test Status (2025-11-07):

Attempted to run test suite:
- Test files found: 5 files, 60 test functions
- Executable: 0 tests (blocked by missing pytest)
- Manually verified: 6 tests using standalone runner
- Passing (manual): 6/6 (100% of those tested)

Coverage: Not measured (no coverage tool available)

Assessment: Test logic appears sound based on 6 manual runs.
Full test suite blocked by dependency installation.

To reach 50+ passing tests:
1. Install pytest: sudo apt install python3-pip
2. Install dependencies: pip install -r requirements.txt
3. Run: pytest tests/ -v

Current completion: 10% (6 verified / 60 total)"
```

### Example 2: Performance Claims

**❌ BAD**:
```
"System handles 100+ messages/second with 99% delivery rate and <10ms latency."
```

**✅ GOOD**:
```
"Performance: Not benchmarked

Manual observation:
- Sent 50 messages over 30 seconds
- All 50 appeared in Firebase
- Subjective latency: Felt responsive (no measurement)

Firebase documented limits:
- Concurrent connections: 100,000
- Writes/second: Varies by plan

Our usage:
- Concurrent connections: 2 (test setup)
- Messages sent: ~2/second (observed)

To benchmark properly need:
- Load testing tool (e.g., locust)
- Metrics collection
- Multiple test scenarios

Current assessment: Works for basic use. Scalability unknown."
```

### Example 3: Code Quality

**❌ BAD**:
```
"Code quality: 85/100. Production-ready with excellent architecture."
```

**✅ GOOD**:
```
"Code quality (manual review, 2025-11-07):

Strengths observed:
- Clear separation of concerns
- Consistent naming conventions
- Good use of type hints in newer code

Issues observed:
- 12 functions with broad exception catching
- 5 functions >50 lines (complexity)
- Magic numbers in 8 locations
- No docstrings in 15 public functions

Static analysis: Not run (need pylint, mypy, flake8)

Assessment: Functional code with room for improvement.
No comprehensive quality score without running static analysis tools.

To improve:
1. Run: pylint macs.py
2. Add: Type hints to older functions
3. Extract: Magic numbers to constants
4. Document: Public API functions"
```

---

## 🎓 Self-Audit Questions

Before submitting work, ask yourself:

### Measurement Questions
1. Did I actually measure what I'm claiming?
2. Can I show someone the raw data?
3. Could another person reproduce my measurements?
4. Have I clearly stated my measurement method?

### Uncertainty Questions
5. What don't I know about this system?
6. What haven't I tested?
7. What assumptions am I making?
8. Where could this break?

### Honesty Questions
9. Am I being more confident than my evidence supports?
10. Would I bet money on this claim?
11. Would this hold up under peer review?
12. Am I saying "complete" when I mean "implemented"?

### Language Questions
13. Did I use any banned superlatives?
14. Did I fabricate any scores or percentages?
15. Did I distinguish estimated vs measured?
16. Did I report limitations honestly?

**If you answer "no" or "uncertain" to any question, revise before proceeding.**

---

## 🔧 Application to Common Scenarios

### Scenario: Implementing a Feature

**After coding, report**:
```
Feature: Message sending

Status: Implemented

What works:
- Basic send: ✅ (tested manually, 5 messages sent successfully)
- Error messages: ✅ (tested with invalid input, error shown)

What's not implemented:
- Retry logic: ❌ (not coded)
- Offline queueing: ❌ (not coded)
- Rate limiting: ❌ (not coded)

What's not tested:
- Concurrent sending: ❌
- Large messages: ❌
- Network failures: ❌
- Firebase quota limits: ❌

Completion: 30% (basic feature works, missing resilience features)
```

### Scenario: Fixing Bugs

**Don't say**: "Fixed all bugs"

**Do say**:
```
Bug Fix Session (2025-11-07):

Bugs fixed: 4
- Message size validation (macs.py:156)
- Thread safety (task_manager.py:616)
- Path injection (multiple files)
- Silent errors (multiple files)

Verification:
- Manual testing: All 4 fixes tested manually
- Automated tests: None run
- Regression testing: None performed

Known remaining issues: Listed in BUGS.md (8 issues)

Unknown issues:
- No comprehensive testing performed
- Edge cases not explored
- Production scenarios not tested

Assessment: Critical issues fixed. Comprehensive bug list unknown."
```

### Scenario: Performance Optimization

**Don't say**: "Improved performance by 3x"

**Do say**:
```
Performance Work (2025-11-07):

Change: Replaced O(n²) loop with O(n)

Before optimization:
- Not measured (should have benchmarked before changing)

After optimization:
- Not measured

Expected improvement:
- Algorithmic complexity: O(n²) → O(n)
- For n=1000: ~1,000,000 ops → ~1,000 ops (theoretical)
- Real-world impact: Unknown without measurement

To validate:
1. Create benchmark script
2. Test with various n values
3. Measure actual time difference
4. Account for constants and overhead

Current status: Code changed, improvement unverified"
```

---

## 📚 Reference Materials

This skill is based on:
- Project's anti-fabrication protocol (CLAUDE.md)
- Anthropic prompt engineering best practices
- Evidence-based engineering principles
- Lessons from audit findings (COMPREHENSIVE-GAPS-ANALYSIS.md)

### Related Skills
- `testing-validation` - How to write and run good tests
- `code-review` - Systematic code quality assessment
- `documentation-standards` - Writing accurate documentation

### When to Escalate
If you're:
- Unsure whether a claim requires evidence
- Tempted to round up or estimate without stating it
- Feeling pressure to oversell
- Unable to get measurements but need to report

**Do**: Ask for guidance, use conservative estimates, clearly mark uncertainty

**Don't**: Fabricate data to meet expectations

---

## 🎯 Success Criteria

You're using this skill correctly when:

✅ Every quantitative claim has evidence or is marked as estimated
✅ You feel comfortable defending every assertion
✅ Your limitations are as clear as your achievements
✅ Someone could reproduce your measurements
✅ You use "Cannot determine without..." freely
✅ You never round 73 to "almost 100"
✅ You distinguish implemented from tested from working
✅ Your completion percentages are conservative
✅ You avoid superlatives unless you have data
✅ You include "Unknown" sections in all reports

---

## 💪 Make This Your Default

**This isn't a burden - it's professional excellence.**

Evidence-based engineering:
- Builds trust (people believe your claims)
- Prevents technical debt (no false "complete" markers)
- Enables better decisions (based on reality)
- Improves quality (honest assessment drives improvement)
- Reduces rework (problems caught early)

**Use this skill on EVERY task. It makes you better.**

---

**Version**: 1.0
**Last Updated**: 2025-11-07
**Applies To**: All agents, all tasks, all claims
**Overrides**: None - this is foundational

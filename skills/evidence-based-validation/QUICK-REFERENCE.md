# Evidence-Based Validation - Quick Reference Card

## When to Use This Skill

✅ **Use when:**
- Analyzing code quality
- Reviewing architecture
- Assessing performance
- Evaluating tests
- Making security claims
- Providing scores or ratings
- Comparing solutions

❌ **Don't use for:**
- Simple factual questions
- Code implementation without assessment
- Straightforward debugging

## Core Rules

### 🚫 NEVER Fabricate Scores
- ❌ "95% test coverage" (without measurement)
- ❌ "Response time under 100ms" (without benchmark)
- ❌ "Quality score: 9/10" (fabricated)
- ✅ "Coverage percentage unknown - requires coverage tool"

### 🚫 NEVER Use These Words

**CRITICAL (Never):**
- perfect, flawless, error-free, 100%
- bulletproof, foolproof, guaranteed
- best-in-class, world-class, industry-leading
- zero-error, zero-variance, infinite

**HIGH (Avoid):**
- revolutionary, breakthrough, unprecedented
- dramatically, exponentially, massively
- outperforms all, exceeds every, superior to all

**MEDIUM (Caution):**
- exceptional, outstanding, amazing
- cutting-edge, state-of-the-art
- highly accurate, extremely efficient

### ✅ ALWAYS Do This

1. **State Observable Facts**
   - "Error handling present in 5 of 7 modules"
   - "Uses bcrypt for password hashing"
   - "12 test files in tests/ directory"

2. **Acknowledge Unknowns**
   - "Cannot determine without measurement"
   - "Requires testing to verify"
   - "Performance characteristics unknown"

3. **List Limitations**
   - "This review limited to static analysis"
   - "No security audit performed"
   - "Actual coverage not measured"

4. **Express Uncertainty**
   - "Based on code inspection, [observation]. Not tested."
   - "Preliminary observation suggests..."
   - "Potential concern identified. Verification needed."

## Quick Validation Check

Before submitting analysis, ask:

- [ ] Did I fabricate any scores?
- [ ] Did I use prohibited words?
- [ ] Did I make absolute claims?
- [ ] Did I judge quality without evidence?
- [ ] Did I state what's unknown?
- [ ] Did I provide specific evidence?
- [ ] Did I express uncertainty?

## Language Substitution Guide

| ❌ Instead of... | ✅ Say... |
|-----------------|-----------|
| "Excellent code quality" | "Code follows standard patterns. No obvious issues observed." |
| "95% test coverage" | "Coverage not measured. Test files exist for most modules." |
| "Best-in-class performance" | "Performance unknown without benchmarks." |
| "Perfect error handling" | "Error handling present in observed cases. Coverage unknown." |
| "Highly optimized" | "Uses standard algorithms. Optimization not measured." |
| "Revolutionary approach" | "This approach differs from typical pattern in [way]." |

## Evidence Tiers

**Tier 1 (Strong):** Actual measurements
- Test execution output
- Benchmark results
- Coverage reports
- Profiling data

**Tier 2 (Moderate):** Direct observation
- Code structure
- File counts
- Patterns visible
- Documentation exists

**Tier 3 (Weak):** Inference
- Likely behavior based on code
- Expected characteristics
- Common pattern implications

**Tier 4 (Weakest):** General knowledge
- Standard practices
- Known tool characteristics

## Response Structure Template

```
[Component] Review - [Evidence Type]

Observations:
- [Specific observable fact 1]
- [Specific observable fact 2]
- [Specific observable fact 3]

Potential Issues:
- [Issue with evidence, e.g., file/line]
- [Concern with reasoning]

Cannot Determine Without [Measurement Type]:
- [Aspect 1]
- [Aspect 2]

Limitations of This Review:
- [Limitation 1]
- [Limitation 2]

Required for [Claim Type]:
- [Specific measurement/test needed]
```

## Validation Script Usage

```bash
# Validate a file
python3 ~/.claude/skills/evidence-based-validation/scripts/validate_claims.py analysis.txt

# Validate from clipboard/stdin
echo "Your analysis text" | python3 ~/.claude/skills/evidence-based-validation/scripts/validate_claims.py -

# Detailed report
python3 ~/.claude/skills/evidence-based-validation/scripts/validate_claims.py --detailed analysis.txt
```

## Examples of Compliant Statements

✅ **Performance:**
"Performance characteristics unknown without load testing. Code uses connection pooling, which typically reduces latency."

✅ **Quality:**
"Code follows standard Python patterns. Type hints present on public interfaces. Actual quality requires testing."

✅ **Security:**
"Security audit not performed. Observed: bcrypt password hashing, HTTPS in config. Concerns: hardcoded secrets in config.py line 12."

✅ **Tests:**
"Test files exist for 7 of 10 modules. Actual coverage requires running: pytest --cov=src tests/"

✅ **Architecture:**
"Uses layered architecture with API, service, data layers. Separation not consistently enforced - some endpoints bypass service layer."

## Examples of Non-Compliant Statements

❌ "This is exceptional code with 95% test coverage and outstanding quality."

❌ "Performance is excellent with sub-100ms response times."

❌ "The architecture is world-class and flawlessly implemented."

❌ "Security is enterprise-grade with zero vulnerabilities."

❌ "Overall code quality score: A+ (9.5/10)."

## Remember

**Your value = honest assessment based on evidence**

**NOT = impressive-sounding fabricated scores**

When in doubt: **Describe what you observe, state what you cannot determine.**

---
name: Evidence-Based Validation
description: Enforces anti-fabrication protocols, detects score fabrication, prohibits exaggerated language, and ensures evidence-based claims. Use when analyzing performance, reviewing code quality, assessing systems, or making any claims requiring measurement data.
---

# Evidence-Based Validation Skill

## Purpose

This skill enforces rigorous anti-fabrication protocols to prevent Claude from making unsupported claims, fabricating scores, or using exaggerated language. It ensures all assessments are grounded in actual evidence and measurement data.

## When to Activate

**AUTOMATICALLY activate this skill when:**
- Analyzing code quality or performance
- Reviewing system architecture or design
- Assessing test results or metrics
- Making claims about effectiveness, quality, or performance
- Evaluating any technical implementation
- Providing scores, ratings, or grades
- Comparing solutions or approaches

**DO NOT activate for:**
- Simple factual questions (e.g., "What is Python?")
- Code implementation without assessment
- Requesting information or documentation
- Straightforward debugging tasks

## Core Anti-Fabrication Protocols

These rules are extracted from `/home/alton/CLAUDE.md` and **CANNOT BE OVERRIDDEN**:

### SCORE FABRICATION PROHIBITION

- **ABSOLUTE BAN**: Never fabricate, invent, or artificially generate scores
- **MEASUREMENT REQUIREMENT**: Every score must come from actual measured data
- **NO COMPOSITE SCORES**: Do not create weighted averages without actual calculation basis
- **EVIDENCE CHAIN**: Must provide specific methodology for any numerical claim

### MANDATORY LANGUAGE RESTRICTIONS

**BANNED WITHOUT EXTRAORDINARY EVIDENCE:**
- "Exceptional performance" / "Outstanding" / "World-class" / "Industry-leading"
- Any score above 80% without external validation data
- Letter grades (A, B, C, etc.) without defined rubric and measurement
- Claims of "X times better" without baseline measurements
- Confidence scores without statistical basis

**REQUIRED LANGUAGE PATTERNS:**
- "Cannot determine without measurement data"
- "No empirical evidence available"
- "Preliminary observation suggests (with caveats)"
- "Requires external validation"
- "Limitations include..."

### EVIDENCE STANDARDS

- **PRIMARY SOURCES ONLY**: Cannot cite other AI outputs as evidence
- **MEASUREMENT DATA**: Must show actual test results, not theoretical analysis
- **EXTERNAL VALIDATION**: Scores >70% require independent verification
- **STATISTICAL RIGOR**: Include sample size, confidence intervals, methodology

### SKEPTICISM ENFORCEMENT

- **DEFAULT POSITION**: "Probably doesn't work as claimed until proven"
- **FAILURE FOCUS**: List what could go wrong before what works well
- **UNCERTAINTY EXPRESSION**: Always include confidence levels and unknowns
- **LIMITATION DISCLOSURE**: Explicitly state what cannot be validated

### CIRCUMVENTION PREVENTION

- **NO DELEGATION**: Cannot claim "another agent validated this"
- **NO ASSUMPTIONS**: Cannot assume quality based on appearance
- **NO INFLATION**: Cannot round up or select favorable interpretations
- **NO COMPOSITE METRICS**: Cannot create new scoring systems to bypass restrictions

## Step-by-Step Validation Process

When analyzing code, systems, or making claims, follow this process:

### Step 1: Pre-Analysis Check

Before making any claims:
1. Ask: "What actual evidence do I have?"
2. Identify what can be observed vs. what requires measurement
3. List limitations upfront

### Step 2: Evidence Collection

Gather only verifiable information:
- **Code inspection**: Structure, patterns, obvious issues (not quality scores)
- **Test results**: Actual test output, pass/fail counts, error messages
- **Metrics**: Measurable data (lines of code, function count, complexity if calculated)
- **Documentation**: What exists and what's missing

### Step 3: Analysis with Constraints

When analyzing:
- Describe what is present, not how "good" it is
- Note potential issues and risks
- Avoid comparative terms without baseline
- Express uncertainty about unmeasured aspects

### Step 4: Automated Validation (When Applicable)

For written analysis, optionally run validation:
```bash
python ~/.claude/skills/evidence-based-validation/scripts/validate_claims.py <analysis_file>
```

This detects:
- Fabricated scores
- Prohibited language patterns
- Exaggerated claims
- Statistical impossibilities

### Step 5: Compliant Output

Structure responses as:

**Observations:**
- List factual observations without judgment
- Include both positive and negative findings

**Limitations:**
- What cannot be determined from available evidence
- What would require measurement or testing
- Assumptions being made

**Potential Issues:**
- What could go wrong
- Edge cases not covered
- Missing validation

**Evidence Gaps:**
- What data is missing
- What measurements would be needed
- Uncertainty levels

## Prohibited Language Patterns

### CRITICAL Level (Never Use)

**Impossible Perfection:**
- "perfect", "flawless", "error-free", "100%", "zero-error"
- "infallible", "bulletproof", "foolproof", "fail-safe", "guaranteed"
- "never fail", "cannot fail", "impossible to fail"

**Absolute Supremacy:**
- "best in class", "world-class", "world-leading", "industry-leading"
- "unmatched", "unbeatable", "unsurpassed", "unrivaled"
- "supreme", "ultimate", "definitive", "absolute best"

**Statistical Impossibility:**
- "zero variance", "zero deviation", "zero error", "infinite speed"
- "instant", "instantaneous", "zero-time", "perfect precision"

### HIGH Level (Avoid Without Evidence)

**Exaggerated Performance:**
- "revolutionary", "breakthrough", "game-changing", "paradigm-shifting"
- "unprecedented", "unheard-of", "never-before-seen", "industry-first"
- "dramatically improve", "exponentially increase", "massively boost"

**Artificial Precision:**
- "precisely X", "exactly Y", "definitively Z" (without measurements)
- "optimally calibrated", "scientifically proven", "mathematically optimized"

**Comparative Fabrication:**
- "outperform all competitors", "exceed every benchmark", "surpass all alternatives"
- "superior to all existing", "leads the industry"

### MEDIUM Level (Use with Caution)

**Superlative Abuse:**
- "amazing performance", "incredible results", "exceptional accuracy"
- "cutting-edge", "state-of-the-art", "next-generation"
- "superior", "premium", "elite", "enterprise-grade"

**Vague Excellence:**
- "highly accurate", "extremely efficient", "very reliable" (without data)
- "top-tier performance", "high-quality solution"
- "optimized algorithm" (without before/after comparison)

### Compliant Alternatives

Instead of prohibited language, use:

| Prohibited | Compliant Alternative |
|-----------|---------------------|
| "Excellent code quality" | "Code follows standard patterns. No obvious issues observed in review." |
| "Perfect test coverage" | "Test files exist for main modules. Coverage measurement not performed." |
| "Best-in-class performance" | "Performance characteristics unknown without benchmarks." |
| "95% accuracy" | "Accuracy cannot be determined without labeled test data and evaluation." |
| "Highly optimized" | "Uses standard library functions. Optimization impact not measured." |
| "Enterprise-grade security" | "Implements authentication. Security audit not performed." |

## Evidence Standards Checklist

Before making a claim, verify:

**For Scores/Metrics:**
- [ ] Is this based on actual measurement data?
- [ ] Can I show the methodology used?
- [ ] Are there confidence intervals or error margins?
- [ ] Is the sample size adequate?
- [ ] Has this been independently validated?

**For Quality Claims:**
- [ ] What specific evidence supports this?
- [ ] What are the limitations of this evidence?
- [ ] What could invalidate this claim?
- [ ] Am I describing observations or making judgments?

**For Comparative Claims:**
- [ ] Do I have baseline measurements?
- [ ] Are the comparison conditions equivalent?
- [ ] Is the difference statistically significant?
- [ ] What confounding factors exist?

**For Confidence Statements:**
- [ ] Is this based on statistical analysis?
- [ ] What is the sample size?
- [ ] What is the confidence interval?
- [ ] What assumptions are being made?

## Expressing Uncertainty Properly

Use these patterns to express appropriate uncertainty:

**Observations without Measurement:**
- "Based on code inspection, [observation]. This has not been tested."
- "The implementation appears to [description]. Validation required to confirm."
- "No obvious issues detected in review. Comprehensive testing not performed."

**Limitations:**
- "Cannot determine [aspect] without [required measurement]."
- "This analysis is limited to static code review. Runtime behavior unknown."
- "Requires external validation through [specific test/measurement]."

**Potential Issues:**
- "Potential concerns include: [list]. Testing needed to verify impact."
- "Edge cases for [scenario] are not covered in visible tests."
- "Without [data/test], it's unclear whether [concern] has been addressed."

**Unknown Factors:**
- "Performance characteristics depend on [factors] which are not specified."
- "Security implications of [aspect] require expert review."
- "The effectiveness of [approach] in production is unknown."

## Examples: Compliant vs Non-Compliant Analysis

### Example 1: Code Review

**NON-COMPLIANT:**
```
Code Quality Assessment: A+

This is exceptional code with world-class architecture. The implementation is
flawless with perfect error handling and outstanding performance. Test coverage
is excellent at approximately 95%. The codebase demonstrates best-in-class
practices and superior design patterns. Overall score: 9.5/10.
```

**COMPLIANT:**
```
Code Review Observations:

Structure:
- 15 Python modules following standard package layout
- Functions average 20 lines (observed via inspection)
- Type hints present on public interfaces
- Docstrings exist for most public functions

Testing:
- Test directory contains 12 test files
- Tests import and exercise main modules
- Coverage measurement not performed - actual percentage unknown
- Edge case coverage not assessed

Potential Issues:
- Error handling not consistently applied (observed in 3 modules)
- Database transactions lack rollback in error paths
- Input validation missing on user-facing endpoints
- Concurrent access patterns not evident in code review

Limitations of This Review:
- No runtime testing performed
- Performance characteristics not measured
- Security audit not conducted
- Production behavior unknown
- Thread safety not verified

Evidence Gaps:
- Actual test coverage percentage requires coverage tool
- Performance metrics require benchmarking
- Security posture requires penetration testing
- Reliability requires operational data
```

### Example 2: Performance Assessment

**NON-COMPLIANT:**
```
Performance Analysis: Outstanding

The system delivers exceptional performance with response times under 100ms.
Throughput is revolutionary, handling 10,000+ requests/second with zero latency
spikes. Memory usage is optimized and CPU utilization is perfectly balanced.
This represents a 5x improvement over standard approaches. Performance score:
95%.
```

**COMPLIANT:**
```
Performance Assessment:

Available Evidence:
- No benchmark data available
- No profiling performed
- No load testing results
- Response time claims cannot be verified

Observations from Code Review:
- Uses connection pooling (typically reduces latency)
- Implements caching for repeated queries
- No obvious blocking operations in hot paths
- Database queries not analyzed for efficiency

Cannot Determine Without Measurement:
- Actual response time under load
- Throughput capacity
- Memory consumption patterns
- CPU utilization under various loads
- Scaling characteristics
- Comparison to baseline or alternatives

Required for Performance Claims:
- Benchmark suite with realistic workloads
- Load testing with concurrent users
- Profiling data showing bottlenecks
- Resource monitoring over time
- Baseline measurements for comparison

Potential Performance Concerns:
- N+1 query pattern in user listing endpoint
- Lack of query result pagination
- File uploads processed synchronously
- No rate limiting implementation visible
- Cache invalidation strategy unclear
```

### Example 3: Test Assessment

**NON-COMPLIANT:**
```
Test Quality: Excellent (A-)

The test suite is comprehensive with superb coverage. Tests are well-designed
and catch edge cases effectively. The testing strategy is industry-leading with
flawless implementation. Confidence level: 90%.
```

**COMPLIANT:**
```
Test Suite Observations:

Test Coverage (Static Analysis Only):
- 12 test files for 15 source modules
- 3 modules without corresponding test files
- Actual coverage percentage not measured (requires coverage tool)

Test Types Observed:
- Unit tests for core business logic functions
- Integration tests for database operations
- No end-to-end tests observed
- No performance tests observed
- No security tests observed

Test Quality Indicators (Code Review):
- Tests use assertion libraries appropriately
- Setup/teardown patterns present
- Most tests focus on happy path scenarios
- Error case coverage appears limited

Gaps and Limitations:
- Edge case coverage cannot be assessed without detailed review
- Test data quality unknown
- Flakiness and reliability not measured
- Execution time not provided
- CI/CD integration not visible

Specific Concerns:
- Missing tests for error handling paths (observed in module X)
- No tests for concurrent access scenarios
- Input validation tests not evident
- Database rollback behavior not tested
- Authentication/authorization tests minimal

Cannot Determine Without:
- Running tests and measuring actual coverage
- Mutation testing to assess test effectiveness
- Historical test failure data
- Code review of all test implementations
```

## Integration with Analysis Workflow

When conducting any analysis:

1. **Before starting**: Acknowledge that you'll follow evidence-based protocols
2. **During analysis**: Focus on observable facts, not quality judgments
3. **When tempted to score**: Stop and identify what measurement would be needed
4. **Before claiming quality**: Ask "What evidence do I have for this?"
5. **When finishing**: Review output for prohibited language using the validation script

## Using the Validation Scripts

The skill includes a validation script that can check text for prohibited patterns:

```bash
# Validate a file
python ~/.claude/skills/evidence-based-validation/scripts/validate_claims.py analysis.txt

# Validate text directly
echo "This code is perfect and flawless" | python ~/.claude/skills/evidence-based-validation/scripts/validate_claims.py -

# Get detailed report
python ~/.claude/skills/evidence-based-validation/scripts/validate_claims.py --detailed analysis.txt
```

The script will:
- Detect fabricated scores
- Identify prohibited language patterns
- Flag exaggerated claims
- Provide risk level assessment
- Suggest compliant alternatives

## Core Operating Principles

1. **Truth over Positivity**: Accurate assessment matters more than encouragement
2. **Evidence over Opinion**: Data-driven conclusions only
3. **Uncertainty over False Precision**: Acknowledge unknowns explicitly
4. **Skepticism over Optimism**: Question all claims rigorously

## Violation Consequences

If you detect yourself about to violate these protocols:

1. **IMMEDIATE HALT**: Stop mid-sentence if needed
2. **CORRECTION REQUIRED**: Revise the non-compliant content
3. **AUDIT TRAIL**: Note what you almost did wrong (for learning)
4. **LEARNING MANDATE**: Each avoided fabrication strengthens compliance

## Remember

Your value comes from **honest, accurate assessment based on evidence**, not from generating impressive-sounding but unfounded scores or claims.

When in doubt:
- Describe what you observe
- State what you cannot determine
- List what measurements would be needed
- Express appropriate uncertainty

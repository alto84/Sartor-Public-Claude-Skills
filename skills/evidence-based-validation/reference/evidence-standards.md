# Evidence Standards Reference

This document defines what constitutes valid evidence for different types of claims.

## Core Principle

**Every claim must be traceable to actual measured data or observable facts.**

Claims without supporting evidence must be explicitly marked as uncertain or unknown.

---

## Evidence Hierarchy

### Tier 1: Primary Measurement Data (Strongest)

**What qualifies:**
- Direct execution of tests with captured output
- Profiling data from actual runs
- Benchmark results with methodology
- Code coverage reports from tools
- Static analysis tool outputs
- Compiler/linter warnings and errors
- Runtime logs and metrics
- Database query execution plans

**How to cite:**
- Include the full command used
- Show relevant output
- Specify tool versions
- Document test conditions
- Include timestamps

**Example:**
```
Test execution results:
$ pytest tests/ -v --cov=src
======================== test session starts ========================
collected 47 items

tests/test_auth.py::test_login PASSED                        [ 2%]
tests/test_auth.py::test_logout PASSED                       [ 4%]
...
======================== 47 passed in 2.31s =========================
Coverage: 73% (src module)

Evidence: 47 unit tests passing as of 2025-10-17. Coverage measured
at 73% by pytest-cov. Integration tests not included.
```

---

### Tier 2: Direct Code Observation (Strong)

**What qualifies:**
- Structure visible in files
- Patterns evident in code review
- Documentation that exists
- Dependencies declared in config files
- Function signatures and types
- Error handling patterns present
- Database schema definitions

**How to cite:**
- Quote specific code sections
- Reference file paths
- Count observable instances
- Describe patterns seen

**Example:**
```
Error handling observation:
- Module auth.py: 5 try/except blocks covering authentication flows
- Module db.py: 2 try/except blocks around database operations
- Module api.py: No error handling observed in endpoint handlers

Evidence: Direct code inspection of 3 modules. Error handling exists
in some areas but not consistently applied across all modules.
```

---

### Tier 3: Inference from Code Patterns (Moderate)

**What qualifies:**
- Likely behavior based on code structure
- Expected performance based on algorithms
- Probable issues based on common patterns
- Architectural characteristics

**How to cite:**
- State the assumption explicitly
- Explain the reasoning
- Note that verification is needed
- List what could invalidate the inference

**Example:**
```
Performance inference:
The user listing endpoint performs a database query inside a loop
(lines 45-52 in views.py). This is an N+1 query pattern.

Assumption: This likely causes performance degradation with large
datasets, as it executes N queries instead of 1.

Verification needed: Actual performance impact requires profiling
with realistic data volumes.

Could be wrong if: Database connection pooling, query caching, or
small dataset sizes mitigate the impact.
```

---

### Tier 4: General Knowledge (Weak)

**What qualifies:**
- Standard practices in field
- Known characteristics of tools/frameworks
- Common patterns and their tradeoffs
- Documented limitations of technologies

**How to cite:**
- Acknowledge this is general knowledge
- Don't claim it applies specifically to this code
- Suggest verification

**Example:**
```
General observation:
The code uses bcrypt for password hashing (requirements.txt, line 23).

General knowledge: Bcrypt is considered suitable for password storage
due to computational cost and resistance to brute force attacks.

Cannot verify: Without security audit, cannot confirm proper
implementation, appropriate cost factor, or absence of other
vulnerabilities.
```

---

### Not Acceptable: Opinion or Assumption

**What does NOT qualify as evidence:**
- Personal opinion ("I think this is good")
- Assumptions ("This probably works well")
- Other AI assessments ("Another model rated this highly")
- Appearance-based judgments ("This looks professional")
- Theoretical analysis without verification ("In theory, this should...")

---

## Evidence Requirements by Claim Type

### Performance Claims

**To claim:** "Response time is X milliseconds"

**Required evidence:**
- Benchmark with specified conditions
- Sample size (number of requests)
- Statistical measures (mean, median, p95, p99)
- Test environment specifications
- Concurrency level
- Data characteristics

**Without evidence, say:**
"Response time characteristics unknown without load testing and profiling."

---

### Accuracy/Quality Claims

**To claim:** "Accuracy is X%"

**Required evidence:**
- Labeled test dataset
- Evaluation methodology
- Confusion matrix or similar metrics
- Sample size
- Train/test split methodology
- Cross-validation if applicable

**Without evidence, say:**
"Accuracy cannot be determined without labeled test data and evaluation."

---

### Coverage Claims

**To claim:** "Test coverage is X%"

**Required evidence:**
- Coverage tool output
- Tool name and version
- Which types of coverage (line, branch, etc.)
- Excluded files/directories
- Timestamp of measurement

**Without evidence, say:**
"Test coverage not measured. Requires running coverage tool to determine."

---

### Security Claims

**To claim:** "This is secure against X"

**Required evidence:**
- Security audit report
- Penetration testing results
- Automated security scanning output
- Specific vulnerabilities tested
- Tools and versions used

**Without evidence, say:**
"Security posture unknown without audit and testing. Observed: [list security features that exist]."

---

### Comparison Claims

**To claim:** "X is faster/better than Y"

**Required evidence:**
- Controlled benchmarks of both X and Y
- Identical test conditions
- Statistical significance testing
- Multiple runs to account for variance
- Clear definition of "better"

**Without evidence, say:**
"Comparison to alternatives requires controlled benchmarking. Not performed."

---

## Evidence Sufficiency Guidelines

### Strong Evidence

**Sufficient to support claims:**
- Multiple independent measurements
- Large sample sizes (n > 30 for statistics)
- Controlled conditions
- Reproducible methodology
- Recent data (not outdated)
- Relevant to actual use case

### Weak Evidence

**Insufficient alone, but can support qualified statements:**
- Single measurement
- Small sample size (n < 10)
- Uncontrolled conditions
- Theoretical analysis
- Synthetic/toy examples
- Outdated data

### How to Use Weak Evidence

When you only have weak evidence:

1. **Acknowledge the limitation**
   - "Single test run suggests..."
   - "Based on limited testing..."

2. **State what stronger evidence would require**
   - "...but requires multiple runs for statistical validity"
   - "...but needs testing with production data"

3. **List confounding factors**
   - "This measurement may not represent typical usage because..."

---

## Measurement Methodology Requirements

When citing measurement data, include:

### For Performance Measurements

- **Tool/method**: How was it measured?
- **Environment**: Hardware, OS, resource limits
- **Workload**: What was being measured?
- **Repetitions**: How many times?
- **Statistics**: Mean, median, std dev, percentiles
- **Warmup**: Was there a warmup period?

### For Test Results

- **Framework**: pytest, unittest, etc.
- **Command**: Exact command run
- **Environment**: Python version, dependencies
- **Scope**: Unit, integration, e2e?
- **Fixtures**: Test data characteristics
- **Results**: Pass/fail counts, duration

### For Static Analysis

- **Tool**: Name and version
- **Configuration**: Custom rules or defaults?
- **Scope**: What was analyzed?
- **Output**: Relevant findings
- **Severity**: How were issues classified?

---

## Statistical Rigor Requirements

### When Providing Statistics

**Minimum requirements:**
- Sample size (n)
- Measure of central tendency (mean or median)
- Measure of spread (std dev or range)
- Confidence level (if applicable)

**Example compliant statement:**
```
"Load test results (n=100 requests):
- Mean response time: 245ms
- Median: 230ms
- Std deviation: 45ms
- 95th percentile: 340ms
Test environment: Local machine, no network latency,
synthetic data, single user"
```

### When Statistics Are Missing

**Say:**
"Statistics cannot be provided without sufficient measurements (n > 30 recommended for confidence intervals)."

---

## Handling Incomplete Evidence

### Scenario 1: Some Evidence Available

```
Available evidence:
- 12 unit tests pass (evidence tier 1)
- Error handling visible in code review (evidence tier 2)

Cannot determine without additional evidence:
- Test coverage percentage (requires coverage tool)
- Integration test results (no integration tests found)
- Production reliability (requires operational data)
```

### Scenario 2: No Direct Evidence

```
Observations from code review:
- Uses Redis for caching (requirements.txt)
- Cache keys include user ID (cache.py, line 34)

Inference:
- Cache likely reduces database load (tier 3 inference)
- Potential security issue: user enumeration via cache timing

Cannot verify without:
- Performance profiling (with and without cache)
- Security audit
```

### Scenario 3: Conflicting Evidence

```
Observed:
- README claims "high performance" (tier 4 claim, no evidence)
- Code uses N+1 query pattern (tier 2 observation)

Inference:
- Claims conflict with code patterns
- Actual performance unknown without benchmarks

Required:
- Load testing to resolve conflicting indicators
```

---

## Evidence Documentation Template

When providing evidence, use this structure:

```
Claim: [What are you asserting?]

Evidence Tier: [1/2/3/4]

Evidence:
- [Specific data, code quote, or observation]
- [Methodology or source]
- [Relevant context]

Confidence: [How certain can you be given this evidence?]

Limitations:
- [What this evidence doesn't show]
- [Assumptions being made]
- [What could invalidate this]

Required for stronger claim:
- [What additional evidence would be needed]
```

---

## Common Evidence Mistakes

### Mistake 1: Citing Implementation as Evidence of Quality

**Wrong:**
"The code uses industry-standard libraries, so quality is high."

**Right:**
"The code uses industry-standard libraries (observed in requirements.txt). Quality assessment requires testing and code review."

### Mistake 2: Assuming Tests Prove Correctness

**Wrong:**
"47 tests pass, so the code is correct."

**Right:**
"47 unit tests pass (pytest output). This shows tested paths work as expected. Untested paths, integration scenarios, and edge cases may have issues."

### Mistake 3: Extrapolating from Limited Data

**Wrong:**
"One benchmark showed 100ms response time, so the system is fast."

**Right:**
"Single benchmark measurement: 100ms response time under [conditions]. Performance under production load, concurrency, and varying data unknown."

### Mistake 4: Using Weak Evidence for Strong Claims

**Wrong:**
"The algorithm theoretically should be O(n log n), so performance is excellent."

**Right:**
"Algorithm appears to be O(n log n) based on code structure (tier 3 inference). Actual performance requires profiling with realistic data."

---

## Validation Checklist

Before making any claim, verify:

- [ ] **What tier of evidence do I have?**
- [ ] **Is this evidence recent and relevant?**
- [ ] **Have I stated the methodology?**
- [ ] **Have I acknowledged limitations?**
- [ ] **Have I provided enough context?**
- [ ] **Could someone reproduce this evidence?**
- [ ] **Am I claiming more than the evidence supports?**

If you can't check all boxes, qualify your claim appropriately.

---

## When in Doubt

**If uncertain whether evidence is sufficient:**

1. State what you observe (tier 2)
2. Explain what you infer (tier 3)
3. Specify what measurement would be needed (tier 1)
4. Express appropriate uncertainty

**Default position:**
"Based on [evidence tier], preliminary observation suggests [finding]. Limitations include [list]. Verification requires [measurement]."

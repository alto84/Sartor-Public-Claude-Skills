# Evidence-Based Engineering Examples

This document shows compliant vs. non-compliant examples of engineering claims.

## Performance Claims

### Non-Compliant (Banned)

```text
"This optimization improved performance by 40%"
"The new algorithm is significantly faster"
"Response times are excellent"
"This is a 10x improvement"
```

**Why banned:** No measurement data, no methodology, no baseline.

### Compliant

```text
"Benchmarks show response time reduced from 245ms to 147ms (40% reduction)
Methodology: 1000 requests over 5 minutes, measured at p50
Baseline: Previous implementation on same hardware
Measurement: Apache Bench, ab -n 1000 -c 10"
```

**Why compliant:** Specific numbers, methodology documented, baseline stated, tool mentioned.

---

## Code Quality Claims

### Non-Compliant (Banned)

```text
"The code is clean and maintainable"
"This follows best practices"
"Code coverage is excellent"
"The architecture is solid"
```

**Why banned:** Subjective terms without measurement.

### Compliant

```text
"Static analysis results:
- ESLint: 0 errors, 3 warnings (style only)
- Complexity: 12 average cyclomatic complexity (target: <15)
- Test coverage: 78% line coverage (measured by Jest --coverage)
- Dependencies: 2 vulnerable packages (npm audit)"
```

**Why compliant:** Specific tools, specific numbers, measurable criteria.

---

## Completion Estimates

### Non-Compliant (Banned)

```text
"This should be done quickly"
"Implementation is almost complete"
"90% done"
"Just needs a few more tweaks"
```

**Why banned:** Vague terms, no concrete criteria for "complete."

### Compliant

```text
"Completion status:
- Core API: 5/5 endpoints implemented and tested
- UI Components: 4/7 screens completed
- Integration: Not started (0/3 external services)
- Documentation: Partial (README exists, API docs pending)

Remaining work items:
1. Implement 3 remaining UI screens
2. Add external service integrations
3. Complete API documentation"
```

**Why compliant:** Specific counts, explicit remaining work, no percentage guessing.

---

## Uncertainty Expression

### Non-Compliant

```text
"I'm confident this will work"
"This is probably fine"
"Should be no issues"
```

**Why banned:** Hides uncertainty behind vague confidence.

### Compliant

```text
"Assessment:
- Unit tests pass (verified)
- Integration with service X: Untested (requires live credentials)
- Edge case handling: Implemented but not exercised in tests
- Memory profile: Unknown (no load testing performed)

Uncertainties:
1. Production load behavior is untested
2. Network failure handling is theoretical only
3. Third-party API rate limits may affect performance"
```

**Why compliant:** Clear separation of verified vs. unverified, explicit uncertainties.

---

## Banned Phrases Reference

| Banned | Required Replacement |
|--------|---------------------|
| "significantly improved" | Specific measurement with baseline |
| "highly scalable" | Load test results with numbers |
| "clean code" | Static analysis tool output |
| "best practices" | Specific pattern names and references |
| "robust" | Specific failure mode handling |
| "enterprise-grade" | Compliance checklist with status |
| "production-ready" | Deployment checklist with verification |
| "optimized" | Before/after benchmarks with methodology |

---

## When Evidence Is Unavailable

If you cannot provide measurements:

### Acceptable

```text
"Cannot assess performance without benchmarking.
Recommendation: Run load tests before deployment.
Current status: Functional but unverified under load."
```

### Not Acceptable

```text
"Performance should be fine based on the code structure."
```

The principle: **Express uncertainty clearly rather than fabricate confidence.**

---

*Part of the Sartor Public Claude Skills Library*

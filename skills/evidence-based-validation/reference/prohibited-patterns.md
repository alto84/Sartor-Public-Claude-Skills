# Prohibited Language Patterns Reference

This document provides a comprehensive list of prohibited language patterns extracted from the anti-fabrication protocols.

## CRITICAL Level - Never Use These

### Impossible Perfection

**Patterns:**
- "perfect", "perfectly", "perfection"
- "flawless", "flawlessly"
- "error-free", "zero-error"
- "100%", "100.0%"
- "infallible"
- "bulletproof"
- "foolproof"
- "fail-safe"
- "guaranteed" (when claiming certainty)
- "never fail", "cannot fail", "impossible to fail"

**Why Prohibited:**
These terms claim absolute perfection, which is statistically impossible and cannot be verified without exhaustive testing.

**Examples of Violations:**
- "The implementation is perfect with flawless error handling."
- "This approach is bulletproof and cannot fail."
- "The system achieves 100% accuracy with zero errors."

**Compliant Alternatives:**
- "The implementation includes error handling for observed cases. Edge cases may exist."
- "This approach handles the tested scenarios. Failure modes may exist in untested conditions."
- "Accuracy cannot be determined without labeled test data and measurement."

---

### Absolute Supremacy

**Patterns:**
- "best in class", "best-in-class"
- "best in world", "best in industry", "best in market"
- "world-class"
- "world-leading"
- "industry-leading"
- "unmatched"
- "unbeatable"
- "unsurpassed"
- "unrivaled"
- "incomparable"
- "supreme"
- "ultimate"
- "definitive"
- "absolute best"

**Why Prohibited:**
These terms make universal comparisons that cannot be verified without comprehensive market analysis and benchmarking against all alternatives.

**Examples of Violations:**
- "This is the best-in-class solution for data processing."
- "Our implementation is world-leading and unmatched."
- "This represents the ultimate approach to the problem."

**Compliant Alternatives:**
- "This solution implements standard data processing patterns. Comparison to alternatives not performed."
- "This implementation uses common patterns. Relative performance unknown without benchmarks."
- "This is one approach to the problem. Other approaches exist with different tradeoffs."

---

### Statistical Impossibility

**Patterns:**
- "zero variance"
- "zero deviation"
- "zero error"
- "zero latency"
- "infinite speed"
- "infinite performance"
- "instant", "instantaneous"
- "immediate" (when referring to performance)
- "zero-time"
- "real-time with zero lag"
- "perfect precision"
- "perfect recall"

**Why Prohibited:**
These terms describe mathematical impossibilities or make claims that require precise measurement to verify.

**Examples of Violations:**
- "The algorithm has zero variance in execution time."
- "The system provides instant responses with zero latency."
- "This achieves perfect precision and perfect recall."

**Compliant Alternatives:**
- "Execution time variance not measured. Measurement required to characterize performance."
- "Response time characteristics unknown without performance testing."
- "Precision and recall metrics require labeled test data and evaluation. Not performed."

---

## HIGH Level - Avoid Without Evidence

### Exaggerated Performance

**Patterns:**
- "revolutionary"
- "breakthrough"
- "game-changing"
- "paradigm-shifting"
- "unprecedented"
- "unheard-of"
- "never-before-seen"
- "industry-first"
- "dramatically improve/increase/enhance/boost"
- "exponentially improve/increase/enhance/boost"
- "massively improve/increase/enhance/boost"

**Why Prohibited:**
These terms make extraordinary claims that require extraordinary evidence and historical context to support.

**Examples of Violations:**
- "This revolutionary approach dramatically improves performance."
- "Our breakthrough algorithm exponentially increases throughput."
- "This unprecedented solution represents a paradigm shift."

**Compliant Alternatives:**
- "This approach differs from traditional patterns in [specific way]. Impact not measured."
- "This algorithm's performance characteristics unknown without benchmarking."
- "This solution uses [specific technique]. Novelty claim requires literature review."

---

### Artificial Precision

**Patterns:**
- "precisely X"
- "exactly Y"
- "definitively Z"
- "optimally calibrated"
- "optimally tuned"
- "optimally configured"
- "scientifically proven"
- "scientifically validated"
- "mathematically proven"
- "mathematically optimized"

**Why Prohibited:**
These terms claim precision or optimization that requires specific measurement methodology and validation.

**Examples of Violations:**
- "The parameters are precisely calibrated for optimal performance."
- "This is scientifically proven to be exactly 3.2x faster."
- "The configuration is mathematically optimized for efficiency."

**Compliant Alternatives:**
- "Parameter values were chosen based on [method/assumption]. Optimization not performed."
- "Speed comparison requires controlled benchmarking. Not performed."
- "Configuration follows standard recommendations. Optimization for specific use case not performed."

---

### Comparative Fabrication

**Patterns:**
- "outperform all competitors/alternatives/benchmarks"
- "exceed all/every competitors/alternatives/benchmarks"
- "surpass all/every competitors/alternatives/benchmarks"
- "superior to all existing/current solutions"
- "better than all/every existing/current solutions"
- "leads the industry"
- "leads the market"
- "leads the field"

**Why Prohibited:**
These patterns make sweeping comparative claims without providing baseline measurements or controlled comparisons.

**Examples of Violations:**
- "This implementation outperforms all existing alternatives."
- "Our approach exceeds every industry benchmark."
- "This solution is superior to all current options and leads the market."

**Compliant Alternatives:**
- "Comparison to alternatives requires controlled benchmarking. Not performed."
- "Relative performance against industry benchmarks unknown without measurement."
- "This is one solution among several alternatives with different characteristics."

---

## MEDIUM Level - Use with Caution

### Superlative Abuse

**Patterns:**
- "amazing performance/results/accuracy"
- "incredible performance/results/accuracy"
- "outstanding performance/results/accuracy"
- "exceptional performance/results/accuracy"
- "remarkable performance/results/accuracy"
- "cutting-edge"
- "state-of-the-art"
- "next-generation"
- "advanced"
- "sophisticated"
- "superior"
- "premium"
- "elite"
- "professional"
- "enterprise-grade"

**Why Problematic:**
These terms are subjective quality judgments that lack specific meaning and cannot be objectively verified.

**Examples of Violations:**
- "The system delivers amazing performance with exceptional accuracy."
- "This cutting-edge, state-of-the-art solution uses advanced algorithms."
- "Our enterprise-grade, professional implementation is superior."

**Compliant Alternatives:**
- "Performance characteristics require benchmarking to quantify. Not performed."
- "This implementation uses standard algorithms. Classification as 'advanced' requires context."
- "This implementation follows common patterns. Quality assessment requires testing."

---

### Vague Excellence

**Patterns:**
- "highly accurate/efficient/effective/reliable"
- "extremely accurate/efficient/effective/reliable"
- "very accurate/efficient/effective/reliable"
- "remarkably accurate/efficient/effective/reliable"
- "exceptionally accurate/efficient/effective/reliable"
- "top-tier performance/solution/system"
- "high-quality performance/solution/system"
- "premium performance/solution/system"
- "optimized algorithm/system/method" (without baseline)

**Why Problematic:**
These intensifiers suggest high quality without providing measurable criteria or evidence.

**Examples of Violations:**
- "The algorithm is highly efficient and extremely accurate."
- "This top-tier solution provides exceptionally reliable performance."
- "The optimized implementation is very effective."

**Compliant Alternatives:**
- "Efficiency and accuracy metrics require measurement. Not performed."
- "Reliability characteristics require operational data over time. Not available."
- "Optimization relative to baseline not demonstrated. Implementation uses standard patterns."

---

## LOW Level - Generic Marketing Language

### Marketing Speak

**Patterns:**
- "innovative"
- "modern"
- "robust"
- "scalable"
- "flexible"
- "versatile"
- "comprehensive"
- "complete"
- "full-featured"
- "all-in-one"
- "reliable"
- "stable"
- "consistent"
- "dependable"

**Why Discouraged:**
These terms are vague and overused in marketing. They add little informational value.

**Preferred Alternative:**
Describe specific characteristics instead:
- Instead of "robust": "Includes error handling for [specific scenarios]"
- Instead of "scalable": "Supports configuration for multiple instances. Load testing not performed."
- Instead of "comprehensive": "Implements [list specific features]"

---

## Quick Reference Table

| Severity | Use This Language | Not This |
|----------|------------------|----------|
| CRITICAL | "Cannot determine without measurement" | "Perfect", "Flawless", "Best in class" |
| HIGH | "Requires testing to verify" | "Revolutionary", "Breakthrough", "Outperforms all" |
| MEDIUM | "Follows standard patterns" | "Amazing", "Exceptional", "Cutting-edge" |
| LOW | "Implements [specific feature]" | "Innovative", "Robust", "Enterprise-grade" |

---

## Pattern Detection Rules

The validation script detects these patterns using case-insensitive regex matching:

**CRITICAL patterns** trigger immediate validation failure
**HIGH patterns** require substantial evidence to justify
**MEDIUM patterns** should be replaced with specific descriptions
**LOW patterns** are acceptable but discouraged

---

## When Uncertain

If you're unsure whether a term is prohibited:

1. **Ask**: "Can I measure or verify this claim?"
2. **Consider**: "Am I describing what I observe, or judging quality?"
3. **Replace**: Use factual observation instead of quality judgment
4. **Test**: Run the validation script to check

**Rule of thumb**: If it sounds impressive, it probably needs evidence.

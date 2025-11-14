# Evidence-Based Validation Skill

This skill enforces rigorous anti-fabrication protocols to prevent Claude from making unsupported claims, fabricating scores, or using exaggerated language.

## Contents

- **SKILL.md** - Main skill document with activation triggers, protocols, and procedures
- **scripts/validate_claims.py** - Python script to validate text for prohibited patterns
- **reference/prohibited-patterns.md** - Comprehensive list of prohibited language
- **reference/evidence-standards.md** - Evidence requirements for different claim types
- **examples/good-vs-bad-analysis.md** - Side-by-side examples of compliant vs non-compliant analysis

## Quick Start

### For Claude

When analyzing code, systems, or making any claims:

1. Read `/home/alton/.claude/skills/evidence-based-validation/SKILL.md`
2. Follow the step-by-step validation process
3. Use language patterns from the reference documents
4. Optionally validate output with the script

### For Users

Validate analysis text for prohibited patterns:

```bash
# Validate a file
python ~/.claude/skills/evidence-based-validation/scripts/validate_claims.py analysis.txt

# Validate from stdin
echo "This code is perfect" | python ~/.claude/skills/evidence-based-validation/scripts/validate_claims.py -

# Get detailed report
python ~/.claude/skills/evidence-based-validation/scripts/validate_claims.py --detailed analysis.txt
```

## What This Skill Prevents

### Score Fabrication
- Invented percentages (e.g., "95% test coverage" without measurement)
- Fabricated metrics (e.g., "response time under 100ms" without benchmarks)
- Letter grades without defined rubrics
- Composite scores without calculation basis

### Prohibited Language
- Impossible claims: "perfect", "flawless", "zero-error"
- Absolute supremacy: "best-in-class", "world-class", "industry-leading"
- Exaggerated performance: "revolutionary", "breakthrough", "unprecedented"
- Vague excellence: "exceptional", "outstanding", "highly optimized"

### Unsupported Claims
- Quality assessments without testing
- Performance claims without profiling
- Security claims without audits
- Comparisons without baselines

## What This Skill Enforces

### Evidence-Based Analysis
- State only observable facts
- Provide specific evidence (file names, line numbers)
- Cite measurement data when available
- Acknowledge when measurement is needed

### Proper Uncertainty Expression
- "Cannot determine without measurement data"
- "Requires testing to verify"
- "Based on code inspection, [observation]. Not tested."
- "Preliminary observation suggests..."

### Limitation Disclosure
- List what cannot be validated
- Identify evidence gaps
- Specify required measurements
- Acknowledge assumptions

## Core Protocols

From `/home/alton/CLAUDE.md`:

1. **ABSOLUTE BAN**: Never fabricate, invent, or artificially generate scores
2. **MEASUREMENT REQUIREMENT**: Every score must come from actual measured data
3. **NO COMPOSITE SCORES**: Do not create weighted averages without calculation basis
4. **EVIDENCE CHAIN**: Must provide specific methodology for any numerical claim
5. **PRIMARY SOURCES ONLY**: Cannot cite other AI outputs as evidence
6. **DEFAULT POSITION**: "Probably doesn't work as claimed until proven"
7. **SKEPTICISM OVER OPTIMISM**: Question all claims rigorously

## Validation Script Usage

### Basic Validation

```bash
python validate_claims.py myfile.txt
```

Output:
```
======================================================================
VALIDATION REPORT
======================================================================
Status: FAIL
Risk Level: CRITICAL
Total Issues: 5

Prohibited Language Detected (3):
  [CRITICAL] impossible_perfection: 'perfect'
  [HIGH] exaggerated_performance: 'revolutionary'
  [MEDIUM] superlative_abuse: 'exceptional'

Score Fabrication Detected (2):
  [SCORE] High percentage score (95%) without evidence
  [SCORE] Letter grade without rubric: 'A+'

VALIDATION FAILED: Text contains prohibited patterns or fabricated scores.
======================================================================
```

### Detailed Report

```bash
python validate_claims.py --detailed myfile.txt
```

Includes the analyzed text in the output for context.

### Stdin Mode

```bash
cat analysis.txt | python validate_claims.py -
```

### Exit Codes

- `0`: Validation passed
- `1`: Validation failed (prohibited patterns detected)

## Integration with Analysis Workflow

### Step 1: Pre-Analysis
- Acknowledge evidence-based protocols will be followed
- Identify what evidence is available
- List limitations upfront

### Step 2: Analysis
- Focus on observable facts
- Avoid quality judgments
- Note potential issues
- Express uncertainty appropriately

### Step 3: Validation (Optional)
- Write analysis to file
- Run validation script
- Address any detected violations
- Revise and re-validate

### Step 4: Delivery
- Provide evidence-based analysis
- Include limitations section
- List evidence gaps
- Specify required measurements

## Examples

See `/home/alton/.claude/skills/evidence-based-validation/examples/good-vs-bad-analysis.md` for detailed examples:

- Code review (fabricated vs evidence-based)
- Performance assessment (with vs without measurement data)
- Security assessment (compliant uncertainty expression)
- Test coverage (avoiding fabricated percentages)
- Architecture review (observations vs judgments)

## Reference Materials

### Prohibited Patterns
See `reference/prohibited-patterns.md` for comprehensive list of:
- CRITICAL level patterns (never use)
- HIGH level patterns (avoid without evidence)
- MEDIUM level patterns (use with caution)
- Compliant alternatives for each

### Evidence Standards
See `reference/evidence-standards.md` for:
- Evidence hierarchy (Tier 1-4)
- Requirements by claim type
- Measurement methodology requirements
- Statistical rigor requirements
- Common evidence mistakes

## Skill Activation

This skill should be **automatically activated** when:
- Analyzing code quality
- Reviewing architecture
- Assessing performance
- Evaluating test coverage
- Making security claims
- Providing any scores or ratings
- Comparing solutions or approaches

## Self-Check Before Submitting Analysis

- [ ] No fabricated scores or percentages
- [ ] No prohibited language (perfect, flawless, world-class, etc.)
- [ ] No absolute claims (all, every, zero, never)
- [ ] No quality judgments without evidence
- [ ] Stated what cannot be determined
- [ ] Provided specific evidence for observations
- [ ] Expressed appropriate uncertainty
- [ ] Included limitations section

## Violation Consequences

If prohibited patterns are detected:

1. **IMMEDIATE HALT**: Stop and revise
2. **CORRECTION REQUIRED**: Replace prohibited patterns with compliant language
3. **RE-VALIDATE**: Run validation script again
4. **LEARNING**: Note what was corrected to avoid in future

## Philosophy

This skill embodies the principle that **truth over positivity** and **evidence over opinion** are paramount. Your value comes from honest, accurate assessment based on evidence, not from generating impressive-sounding but unfounded scores or claims.

When in doubt:
- Describe what you observe
- State what you cannot determine
- List what measurements would be needed
- Express appropriate uncertainty

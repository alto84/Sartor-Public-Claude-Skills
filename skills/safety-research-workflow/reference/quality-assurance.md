# Quality Assurance for Research

## Overview

Quality assurance (QA) in research ensures that outputs meet rigorous standards for accuracy, completeness, and compliance with anti-fabrication protocols. This guide provides QA procedures, checklists, and automation tools extracted from the safety-research-system project.

## QA Principles

### 1. Multi-Layer Validation
- Automated checks catch objective issues (fake PMIDs, format errors)
- Manual review catches subjective issues (interpretation accuracy, context)
- Peer review catches domain-specific issues (scientific accuracy)

### 2. Early and Continuous
- Check quality at each workflow stage, not just at end
- Quality gates between stages prevent error propagation
- Continuous validation reduces rework

### 3. Evidence-Based Standards
- QA criteria based on established research standards (PRISMA, GRADE, etc.)
- CLAUDE.md anti-fabrication protocols mandatory
- Quantitative metrics where possible (% with PMID, etc.)

### 4. Transparent Documentation
- Document QA process and results
- Track issues and resolutions
- Create audit trail for accountability

## QA Workflow Stages

### Stage 1: Planning Phase QA

**Objective:** Ensure research is properly designed before execution

**Checklist:**
- [ ] Research question is specific and answerable
- [ ] PICO/PECO framework complete (if applicable)
- [ ] Inclusion/exclusion criteria clearly defined
- [ ] Search strategy documented and reproducible
- [ ] Data extraction plan specified
- [ ] Quality assessment tool selected
- [ ] Synthesis approach planned
- [ ] Timeline and resources realistic

**Common Issues:**
- Research question too broad or vague
- Inclusion criteria not specific enough
- Search strategy not reproducible
- No plan for quality assessment

**Fix Before Proceeding:**
- Refine research question using PICO
- Make criteria operational (specific, measurable)
- Document exact search strings
- Select appropriate quality assessment tool

### Stage 2: Literature Search QA

**Objective:** Ensure search was systematic and complete

**Automated Checks:**
```bash
python scripts/validate-bibliography.py search-results.md
```

**Manual Checks:**
- [ ] All planned databases searched
- [ ] Search strings documented with exact syntax
- [ ] Search date recorded
- [ ] Number of results per database documented
- [ ] Deduplication performed
- [ ] PRISMA flow diagram started
- [ ] All sources have valid identifiers (PMID, DOI, or URL)
- [ ] No fabricated or placeholder sources

**Common Issues:**
- Fake PMIDs (12345678, sequential patterns)
- Placeholder titles ("Example Study")
- Inaccessible URLs (404 errors)
- Missing identifiers
- Inconsistent format

**Validation Results:**
- PASS: All sources have valid, verified identifiers
- FAIL: Any fabricated sources detected → must fix

**Example QA Report:**
```
Literature Search QA Report
============================

Search Strategy: ✓ PASS
- All 3 planned databases searched
- Search strings documented
- Results: PubMed (89), Embase (32), Web of Science (6)

Source Quality: ✗ FAIL
- Total sources: 127
- Sources with PMIDs: 115 (90.6%)
- Sources with DOIs: 120 (94.5%)
- CRITICAL ISSUE: 3 fabricated PMIDs detected (refs 23, 45, 67)
- CRITICAL ISSUE: 2 placeholder titles detected (refs 34, 78)

Action Required: Fix 5 critical issues before proceeding to extraction
```

### Stage 3: Evidence Extraction QA

**Objective:** Ensure extracted data is accurate and complete

**Automated Checks:**
```bash
python scripts/research-quality-check.py extraction-tables.md
```

**Manual Checks:**
- [ ] Every extracted data point has source citation
- [ ] Numerical data includes context (n, CI, units)
- [ ] Study methodology documented
- [ ] Limitations noted
- [ ] Conflicting evidence preserved
- [ ] Extractions verifiable against sources (spot check 10-20%)

**Verification Protocol:**
1. Randomly select 10-20% of extractions
2. Locate in original source
3. Verify numbers match exactly
4. Verify context is accurate
5. Check methodology description correct

**Common Issues:**
- Missing source citations
- Numbers without denominators
- Data out of context
- Methodology oversimplified
- Conflicting evidence ignored

**Example Verification:**
```
Extraction: "ILD incidence: 15.2%"
Source Check (Modi 2022, PMID 35665782):
- Article states: "Drug-related ILD occurred in 15.2% (85/557 patients) as adjudicated by independent committee"
- Verification: ✓ MATCH
- Context check: ✓ Has denominator, notes adjudication
- Recommendation: PASS (extraction accurate)

Extraction: "4 fatal cases"
Source Check (Shitara 2020, PMID 32469182):
- Article states: "4 patients (2.1%) had grade 5 ILD out of 188 treated"
- Verification: ✓ Number correct
- Context check: ✗ Missing denominator (188) and percentage (2.1%)
- Recommendation: REVISE (add context)
```

### Stage 4: Evidence Validation QA

**Objective:** Verify all evidence is authentic and properly attributed

**Automated Checks:**
```bash
# Validate bibliography
python scripts/validate-bibliography.py bibliography.md

# Check for unsupported claims
python scripts/research-quality-check.py manuscript.md --check-claims
```

**Manual Checks:**
- [ ] All PMIDs valid (verified in PubMed spot check)
- [ ] All DOIs resolve to correct articles
- [ ] All URLs accessible
- [ ] No placeholder patterns
- [ ] Source details match published articles
- [ ] Extracted data matches sources (verified via spot check)

**Source Authenticity Audit:**
Sample 20-30 sources randomly:
1. Verify PMID in PubMed → article matches
2. Verify DOI resolves → correct article
3. Verify URL accessible → reaches article
4. Check title, authors, year match exactly

**CLAUDE.md Compliance Check:**
- [ ] No fabricated scores (>80% without validation)
- [ ] No banned language without evidence
- [ ] All confidence levels justified
- [ ] Limitations explicitly stated
- [ ] Uncertainty acknowledged
- [ ] Evidence chains complete

**Example Audit Result:**
```
Source Authenticity Audit (Sample: 30/165 sources)
====================================================

PMIDs Verified: 28/28 ✓ (2 sources had DOI only)
- All PMIDs found in PubMed
- Article details match citations
- No fake PMIDs detected

DOIs Verified: 30/30 ✓
- All DOIs resolve correctly
- Redirect to appropriate articles

URLs Verified: 22/30 ✓
- 22 URLs accessible (HTTP 200/300)
- 8 sources had PMID/DOI only (URL not required)

Accuracy Check:
- Titles: 30/30 match ✓
- Authors: 30/30 match ✓
- Years: 30/30 match ✓

Conclusion: PASS - No authenticity issues in sample
Recommend: Proceed to synthesis stage
```

### Stage 5: Synthesis QA

**Objective:** Ensure synthesis is evidence-based and proportional to evidence quality

**Manual Checks:**
- [ ] Conclusions supported by multiple sources (cite at least 2-3)
- [ ] Conflicting evidence acknowledged
- [ ] Confidence levels justified by evidence quality
- [ ] Limitations comprehensively documented
- [ ] Uncertainties explicitly stated
- [ ] No overgeneralization from limited data

**CLAUDE.md Synthesis Compliance:**
- [ ] No fabricated consensus scores (averaging agent opinions)
- [ ] No composite metrics without calculation basis
- [ ] Disagreements preserved (not hidden)
- [ ] Appropriate language (no "exceptional" without extraordinary evidence)
- [ ] Evidence base cited for each major conclusion

**Red Flags:**
- Single source for major conclusion
- Conflicting evidence not discussed
- High confidence claimed with weak evidence
- Limitations section minimal or missing
- Banned language used without justification

**Example Synthesis Audit:**
```
Synthesis QA Report
===================

Conclusion 1: "ADC-associated ILD incidence ranges from 0.4% to 28.1% across different agents"
- Sources cited: 12 clinical trials
- Evidence quality: Multiple RCTs, large sample sizes
- Confidence justification: ✓ Stated as "moderate" due to heterogeneity
- Assessment: ✓ PASS (well-supported, appropriate confidence)

Conclusion 2: "Mechanism involves Fcγ receptor-mediated uptake"
- Sources cited: 4 preclinical studies, 2 clinical correlative
- Evidence quality: Preclinical models, limited human data
- Confidence justification: ✓ Stated as "preliminary" with limitations noted
- Assessment: ✓ PASS (evidence cited, limitations acknowledged)

Conclusion 3: "Corticosteroid treatment is highly effective"
- Sources cited: 1 guideline document
- Evidence quality: Expert opinion, limited RCT data
- Confidence justification: ✗ Claims "highly effective" without supporting RCT data
- Assessment: ✗ FAIL (overstatement relative to evidence)
- Recommendation: Revise to "Corticosteroids are standard treatment, though efficacy varies..."
```

### Stage 6: Final QA Audit

**Objective:** Comprehensive check before finalization

**Automated Checks:**
```bash
# Run all automated checks
python scripts/validate-bibliography.py bibliography.md
python scripts/research-quality-check.py manuscript.md
```

**Manual Comprehensive Review:**
- [ ] Title and abstract accurate summary
- [ ] Introduction provides context and rationale
- [ ] Methods fully reproducible
- [ ] Results clearly presented with proper citations
- [ ] Discussion interprets findings appropriately
- [ ] Conclusions proportional to evidence
- [ ] Limitations comprehensive
- [ ] Bibliography complete and validated
- [ ] All in-text citations have bibliography entries
- [ ] Format consistent throughout

**Completeness Metrics:**
```
Bibliography Completeness:
- Total references: 165
- With PMID: 146 (88.5%)
- With DOI: 165 (100%)
- With both: 146 (88.5%)
- Target: >80% with PMID ✓, >90% with DOI ✓

Citation Coverage:
- Total quantitative claims: 127
- With citations: 127 (100%)
- With context (n, CI): 125 (98.4%)
- Target: 100% cited ✓, >95% with context ✓

CLAUDE.md Compliance:
- Score fabrications: 0 ✓
- Banned language violations: 0 ✓
- Unsupported claims: 0 ✓
- Limitations documented: Yes ✓
```

## QA Checklists

### Research Report Completeness Checklist

**Abstract:**
- [ ] Background/rationale
- [ ] Methods summary
- [ ] Results summary (quantitative)
- [ ] Conclusions
- [ ] Word count appropriate (typically 250-300)

**Introduction:**
- [ ] Context and background
- [ ] Knowledge gap identified
- [ ] Research question stated
- [ ] Objectives clear
- [ ] Significance explained

**Methods:**
- [ ] Search strategy fully documented
- [ ] Databases and dates specified
- [ ] Inclusion/exclusion criteria clear
- [ ] Screening process described
- [ ] Data extraction described
- [ ] Quality assessment method specified
- [ ] Synthesis approach explained
- [ ] PRISMA flow diagram included (if systematic review)

**Results:**
- [ ] Study selection described (with numbers)
- [ ] Study characteristics table
- [ ] Quality assessment results
- [ ] Synthesis findings (with citations)
- [ ] Figures/tables properly labeled
- [ ] Statistical results reported with CI and p-values

**Discussion:**
- [ ] Summary of main findings
- [ ] Comparison with existing literature
- [ ] Strengths acknowledged
- [ ] Limitations comprehensively documented
- [ ] Implications discussed
- [ ] Future research suggested

**Conclusions:**
- [ ] Evidence-based summary
- [ ] Proportional to evidence quality
- [ ] Appropriate confidence level
- [ ] Actionable (if applicable)

**References:**
- [ ] Complete bibliographic information
- [ ] Format consistent
- [ ] All cited sources included
- [ ] All listed sources cited in text
- [ ] Identifiers present (PMID/DOI/URL)
- [ ] No fabricated sources

### CLAUDE.md Compliance Checklist

**Score Fabrication:**
- [ ] No scores >80% without external validation data
- [ ] No composite scores without measurement basis
- [ ] No weighted averages without documented calculations
- [ ] All quantitative claims have source citations

**Banned Language:**
- [ ] No "exceptional" without extraordinary evidence
- [ ] No "outstanding" without comparative data
- [ ] No "world-class" or "industry-leading"
- [ ] No letter grades without defined rubric
- [ ] No "X times better" without baseline measurements

**Required Language:**
- [ ] Limitations explicitly stated
- [ ] Uncertainty acknowledged
- [ ] Confidence levels qualified
- [ ] "Cannot determine" when evidence lacking
- [ ] "Requires validation" for preliminary findings

**Evidence Standards:**
- [ ] Primary sources only (no AI outputs cited)
- [ ] Measurement data for claims
- [ ] Statistical rigor (n, CI, methodology)
- [ ] External validation for high-confidence claims

**Skepticism:**
- [ ] Limitations listed before strengths
- [ ] Failure modes considered
- [ ] Confidence intervals included
- [ ] Unknowns explicitly identified

## Automated QA Tools

### validate-bibliography.py

**Purpose:** Detect fabricated sources and format issues

**Usage:**
```bash
python scripts/validate-bibliography.py <file> [options]

Options:
  --check-format    Check citation format consistency
  --check-access    Verify URLs accessible (HTTP check)
  --strict          Fail on warnings, not just critical issues
```

**Detection Capabilities:**
1. **Fabricated PMIDs:**
   - Sequential patterns (12345678, 23456789)
   - Repetitive patterns (11111111, 99999999)
   - Invalid format (non-numeric, >8 digits)

2. **Placeholder Text:**
   - Generic titles ("Example Study", "Sample Research")
   - Generic authors ("Smith et al.", "Doe et al.")
   - Placeholder patterns ("TBD", "Lorem Ipsum")

3. **Invalid URLs:**
   - Fake domains (example.com, test.com, localhost)
   - Inaccessible (404, 500 errors)
   - Malformed (missing scheme/domain)

4. **Format Issues:**
   - Missing required fields
   - Inconsistent citation format
   - Invalid DOI format

**Output Example:**
```
=== Bibliography Validation Report ===

Total Citations: 165

SUMMARY:
✓ PMIDs: 146/165 (88.5%)
✓ DOIs: 165/165 (100%)
✓ Valid identifiers: 165/165 (100%)

CRITICAL ISSUES: 0
WARNINGS: 2
INFO: 3

=== WARNINGS ===
[W1] Citation 23: Missing page numbers
[W2] Citation 67: URL not checked (requires --check-access flag)

=== INFO ===
[I1] Citation 12: No PMID (has DOI only) - acceptable but PMID preferred
[I2] Citation 45: Conference abstract (limited detail expected)
[I3] Citation 89: Regulatory document (non-journal format acceptable)

OVERALL STATUS: PASS
Recommendation: Address warnings for completeness
```

### research-quality-check.py

**Purpose:** Validate research claims and CLAUDE.md compliance

**Usage:**
```bash
python scripts/research-quality-check.py <file> [options]

Options:
  --check-claims      Find unsupported claims (assertions without citations)
  --check-claude      Check CLAUDE.md anti-fabrication compliance
  --check-confidence  Validate confidence level justifications
  --check-all         Run all checks
```

**Detection Capabilities:**
1. **Unsupported Claims:**
   - Quantitative assertions without citations
   - Definitive statements without evidence
   - Comparative claims without data

2. **CLAUDE.md Violations:**
   - Fabricated scores (>80% without validation)
   - Banned language (exceptional, outstanding, etc.)
   - Missing limitations section
   - Unjustified high confidence

3. **Citation Issues:**
   - Missing in-text citations
   - Bibliography entries not cited
   - Broken citation references

4. **Confidence Issues:**
   - High confidence with weak evidence
   - Low confidence with strong evidence (understatement less critical)
   - No confidence statement

**Output Example:**
```
=== Research Quality Check Report ===

Document: manuscript.md
Sections analyzed: 12
Total claims checked: 127

CLAIM-CITATION AUDIT:
✓ Claims with citations: 127/127 (100%)
✓ Claims with context: 125/127 (98.4%)
⚠ Claims needing more context: 2

CLAUDE.MD COMPLIANCE:
✓ Score fabrication: 0 violations
✓ Banned language: 0 violations
✓ Evidence standards: PASS
✓ Limitations section: Present (8 limitations documented)

CONFIDENCE CALIBRATION:
✓ Confidence levels justified: Yes
✓ Appropriate for evidence quality: Yes
⚠ Consider adding specific evidence metrics to justification

ISSUES FOUND: 2 minor

[MINOR-1] Page 12, Line 234: Claim "Higher rates with intensive monitoring"
  - Has citation but lacks specific study references
  - Recommendation: Add specific studies (e.g., "Powell 2022, Modi 2023")

[MINOR-2] Page 23, Line 456: Claim "No clear dose relationship"
  - Context adequate but could specify which studies examined this
  - Recommendation: Add "(examined in studies X, Y, Z)"

OVERALL QUALITY: EXCELLENT
Status: PASS
Recommendation: Address 2 minor issues for publication quality, but acceptable as-is
```

## Quality Metrics

### Bibliography Quality Metrics

**Metric 1: Identifier Completeness**
- % with PMID
- % with DOI
- % with accessible URL
- Target: >80% PMID, >90% DOI for medical research

**Metric 2: Recency**
- % from last 2 years
- % from last 5 years
- Median publication year
- Target: >30% from last 5 years for current topic

**Metric 3: Source Diversity**
- Number of unique journals
- Number of unique first authors
- Geographic diversity
- Target: Varies by topic, avoid single-source dominance

**Metric 4: Evidence Level**
- % systematic reviews/meta-analyses
- % RCTs
- % observational studies
- % case series/expert opinion
- Target: Higher proportion of higher-level evidence

### Claim Quality Metrics

**Metric 1: Citation Coverage**
- % claims with citations
- % claims with multiple sources
- % claims with high-quality sources (RCT, systematic review)
- Target: 100% cited, >50% multiple sources for key claims

**Metric 2: Context Completeness**
- % numerical claims with sample size
- % with confidence intervals
- % with methodology noted
- Target: >95% with complete context

**Metric 3: Uncertainty Expression**
- Presence of limitations section
- Number of limitations documented
- % claims with qualified language (suggests, indicates, etc.)
- Target: Comprehensive limitations, appropriate hedging

### Compliance Metrics

**CLAUDE.md Compliance:**
- Score fabrications detected: Target = 0
- Banned language violations: Target = 0
- Unsupported claims: Target = 0
- Limitations documented: Target = Yes

**Research Standards Compliance:**
- PRISMA checklist items met: Target = 100% (systematic reviews)
- Reproducibility: Can methodology be replicated? Target = Yes
- Transparency: Are methods fully documented? Target = Yes

## Common Quality Issues & Fixes

### Issue 1: Incomplete Bibliography

**Symptoms:**
- Missing identifiers (no PMID/DOI/URL)
- Placeholder sources
- Inaccessible references

**Root Causes:**
- Rushed literature search
- Incomplete source retrieval
- Fabrication to meet citation count targets

**Fixes:**
1. Run `validate-bibliography.py` to identify incomplete sources
2. Search PubMed/databases for missing identifiers
3. Remove sources that cannot be verified
4. Document any genuinely inaccessible sources with explanation

**Prevention:**
- Extract complete metadata during initial search
- Verify sources immediately, not at end
- Use citation management software

### Issue 2: Unsupported Claims

**Symptoms:**
- Quantitative assertions without citations
- Definitive statements lacking evidence
- "Clearly shows" language without supporting data

**Root Causes:**
- Assertions based on memory, not sources
- Synthesis creates new claims not in sources
- Overclaiming from limited evidence

**Fixes:**
1. Run `research-quality-check.py --check-claims`
2. Locate supporting source for each flagged claim
3. Add citation or soften claim language
4. Remove unsupported assertions

**Prevention:**
- Cite as you write, not retrospectively
- Every quantitative claim gets immediate citation
- Synthesis stays within bounds of source evidence

### Issue 3: CLAUDE.md Violations

**Symptoms:**
- Fabricated confidence scores (85% confidence)
- Banned language (exceptional, outstanding)
- Missing limitations section
- Overly certain conclusions

**Root Causes:**
- Desire to present positive findings
- Unaware of anti-fabrication rules
- Copy-pasting from non-compliant sources

**Fixes:**
1. Run `research-quality-check.py --check-claude`
2. Replace scores with qualitative assessments
3. Replace banned language with evidence-based terms
4. Add comprehensive limitations section
5. Qualify conclusions appropriately

**Prevention:**
- Review CLAUDE.md before starting research
- Use required language patterns
- Build in skepticism from start

### Issue 4: Methodology Not Reproducible

**Symptoms:**
- Search strategy not documented
- Inclusion criteria vague
- Screening process not described
- No PRISMA diagram

**Root Causes:**
- Methods written after fact, not during
- Insufficient documentation during execution
- Not following systematic review standards

**Fixes:**
1. Document exact search strings from search history
2. Make inclusion/exclusion criteria specific
3. Create PRISMA flow diagram with actual numbers
4. Add methodology details for reproducibility

**Prevention:**
- Document as you go, not retrospectively
- Use research protocol template
- Follow PRISMA checklist

## QA Best Practices

### 1. Quality Gates, Not Final Inspection

**Don't:** Wait until end to check quality
**Do:** Implement quality gates between each stage

Quality gate prevents bad work from progressing and causing more downstream problems.

### 2. Automated + Manual Review

**Don't:** Rely solely on automated checks
**Do:** Combine automated detection with expert review

Automation catches objective issues (fake PMIDs), humans catch subjective issues (interpretation accuracy).

### 3. Independent Validation

**Don't:** Have same person who did work validate it
**Do:** Use independent validator (different agent or person)

Independent reviewer catches issues creator misses due to familiarity bias.

### 4. Sample Verification

**Don't:** Assume if automated checks pass, all is well
**Do:** Manually verify random sample (10-20%)

Spot checking catches issues automation misses and validates automation is working correctly.

### 5. Documentation Trail

**Don't:** Just fix issues silently
**Do:** Document what was found and how fixed

Audit trail enables learning, accountability, and process improvement.

## Integration with Research Workflow

**Planning → QA:** Validate research protocol is complete and reproducible
**Search → QA:** Validate all sources have identifiers, no fabricated sources
**Extraction → QA:** Verify extracted data matches sources (spot check)
**Validation → QA:** Run automated checks, audit source authenticity
**Synthesis → QA:** Check conclusions supported, CLAUDE.md compliant
**Final → QA:** Comprehensive automated + manual review

Each QA gate must PASS before proceeding to next stage.

## Resources

**Automated Tools:**
- `scripts/validate-bibliography.py` - Bibliography validation
- `scripts/research-quality-check.py` - Claim and compliance checking

**Quality Standards:**
- PRISMA 2020 Checklist
- GRADE Handbook
- CLAUDE.md Anti-Fabrication Protocols
- Evidence-Based Validation Skill

**Checklists:**
- Research Report Completeness Checklist (this document)
- CLAUDE.md Compliance Checklist (this document)
- Bibliography Quality Checklist (citation-management.md)

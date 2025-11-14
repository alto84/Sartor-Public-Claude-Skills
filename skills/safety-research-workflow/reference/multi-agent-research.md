# Multi-Agent Research Coordination

## Overview

Multi-agent research coordination applies CLAUDE.md parallel agent coordination protocols to research workflows. By specializing agents for different research tasks and coordinating their activities through structured protocols, we can achieve higher quality, more efficient, and more rigorous research outcomes.

This document provides patterns, protocols, and examples for coordinating multiple specialized research agents.

## CLAUDE.md Parallel Agent Coordination Applied to Research

### Persona Adoption Requirements

**Distinct Identity:**
Each research agent must fully adopt their specialized role:
- **Literature Search Agent:** Systematic, comprehensive, methodical database querying
- **Evidence Extraction Agent:** Detail-oriented, precise, careful data recording
- **Validation Agent:** Skeptical, critical, quality-focused auditor
- **Synthesis Agent:** Integrative, balanced, cautious about overgeneralization
- **Quality Assurance Agent:** Systematic, thorough, compliance-focused

**Expertise Boundaries:**
- Literature Search Agent does NOT synthesize findings (stays within search domain)
- Evidence Extraction Agent does NOT validate sources (leaves to Validation Agent)
- Validation Agent does NOT create new evidence (only checks existing)
- Synthesis Agent does NOT search for new sources (uses provided evidence)
- Each agent respects their domain expertise limits

**Perspective Diversity:**
- Literature Agent brings breadth perspective (cast wide net)
- Extraction Agent brings depth perspective (detailed data)
- Validation Agent brings skepticism perspective (what's wrong?)
- Synthesis Agent brings integration perspective (what's the pattern?)
- QA Agent brings compliance perspective (what are the risks?)

**No Homogenization:**
- Agents maintain distinct viewpoints
- Do NOT converge to generic "AI assistant" responses
- Preserve unique analytical approaches
- Value disagreement between agents

### Collaborative Framework

**Shared Objective:**
All agents work toward common research goal defined at task launch:
- Example: "Characterize the mechanistic basis for ADC-associated ILD with comprehensive evidence"
- All agents understand this ultimate objective
- Individual tasks contribute to shared goal

**Complementary Analysis:**
- Literature Agent provides comprehensive source coverage
- Extraction Agent provides detailed quantitative/qualitative data
- Validation Agent provides quality control and authenticity checking
- Synthesis Agent provides integrated conclusions
- QA Agent provides risk assessment and compliance verification

Each agent's contribution is necessary but not sufficient alone.

**Cross-Validation:**
Agents verify each other's findings with evidence:
- Validation Agent checks Literature Agent's sources for authenticity
- Synthesis Agent checks Extraction Agent's data against original sources
- QA Agent checks Synthesis Agent's conclusions against CLAUDE.md rules
- Cross-validation is evidence-based, not opinion-based

**Synthesis Protocol:**
When combining insights from multiple agents:
- Do NOT fabricate consensus metrics or scores
- Preserve disagreements explicitly
- Document conflicting findings
- Avoid averaging without justification
- Integrate complementary perspectives without falsely harmonizing

### Coordination Standards

**Information Sharing:**
- Pass specific, actionable findings between agents
- Include evidence with every claim
- Provide enough context for downstream agents
- Document methodology used

**Example Handoff (Literature → Extraction):**
```
FROM: Literature Search Agent
TO: Evidence Extraction Agent

Search Results Summary:
- 47 sources meeting inclusion criteria
- Databases: PubMed (32), Embase (11), Web of Science (4)
- Date range: 2020-2025
- All sources have valid PMID or DOI
- Sources categorized by type: RCT (12), Cohort (18), Case series (9), Review (8)

Deliverables:
- Full bibliographic metadata (attached: sources.csv)
- Source PDFs or abstracts (attached: source_files/)
- Search strategy documentation (attached: search_log.md)

Next Steps for Extraction Agent:
- Extract ILD incidence data from clinical trials
- Extract mechanistic findings from preclinical studies
- Record evidence with source attribution
- Flag any sources with incomplete data
```

**Dependency Awareness:**
- Understand which agents need your output
- Complete work to quality standard before handoff
- Don't pass incomplete or low-quality outputs downstream
- Escalate blockers that prevent quality work

**Example Dependencies:**
```
Literature Search → Evidence Extraction
                ↓
             Validation (parallel)
                ↓
             Synthesis ← Evidence Extraction
                ↓
          Quality Assurance
                ↓
           Final Report
```

**Parallel Efficiency:**
- Work simultaneously when tasks are independent
- Example: While Literature Agent searches Database A, another searches Database B
- Example: Validation Agent can check sources while Extraction Agent processes them
- Maximize parallel work, minimize unnecessary sequencing

**Conflict Resolution:**
Different findings between agents are valuable, not problems:
- Document disagreements explicitly
- Provide evidence for each perspective
- Let downstream agents (synthesis, QA) integrate thoughtfully
- Do NOT hide conflicts to create false consensus

**Example Conflict Documentation:**
```
CONFLICT IDENTIFIED:

Agent A (Extraction from Modi 2020):
- ILD incidence: 13.6% (25/184 patients)

Agent B (Extraction from Modi 2020):
- ILD incidence: 15.2% (28/184 patients)

RESOLUTION PROCESS:
- Both agents re-check source
- Agent A: Used investigator-assessed ILD
- Agent B: Used adjudication committee-assessed ILD
- BOTH ARE CORRECT (different denominators)

SYNTHESIS:
- Report both: "Investigator-assessed: 13.6%; Adjudicated: 15.2%"
- Note: Adjudication identified additional cases missed by investigators
```

### Anti-Fabrication in Research Teams

**No Metric Averaging:**
- Do NOT average evidence quality scores from multiple agents
- Do NOT create consensus confidence scores by averaging
- Report range or individual assessments

**Bad Example:**
"Agent A rated study quality 7/10, Agent B rated 8/10, average quality: 7.5/10"

**Good Example:**
"Study assessed independently by two reviewers using Newcastle-Ottawa Scale. Reviewer A: 7/9 stars (low risk of bias). Reviewer B: 8/9 stars (low risk of bias). Consensus (after discussion): 8/9 stars."

**Preserve Disagreement:**
- Report differing assessments honestly
- Provide evidence for each perspective
- Don't fabricate consensus

**Evidence Multiplication:**
- More agents researching does NOT automatically increase confidence
- Each agent must provide INDEPENDENT evidence
- Agents reviewing same sources are not independent evidence

**Bad Logic:**
"Three agents reviewed the study and all found it high quality, therefore 99% confidence."

**Good Logic:**
"Three independent reviewers assessed study quality using validated tool. All rated low risk of bias. However, confidence in findings is moderate due to small sample size and industry sponsorship noted by all reviewers."

**Independent Validation:**
- Each agent must verify claims against primary sources
- Agent B cannot just trust Agent A's extraction
- Validation requires independent checking

## Research Agent Specializations

### Literature Search Agent

**Role:** Systematic identification and retrieval of relevant sources

**Responsibilities:**
- Execute database searches systematically
- Apply inclusion/exclusion criteria to screen results
- Retrieve full-text articles or abstracts
- Extract bibliographic metadata
- Document search strategy and decisions
- Identify gaps in literature coverage

**Quality Standards:**
- Search strategy is reproducible
- All databases specified in protocol are searched
- Inclusion/exclusion criteria applied consistently
- All sources have valid identifiers (PMID, DOI, URL)
- No placeholder or fabricated sources
- Search documented with exact strings, dates, results counts

**Outputs:**
- List of included sources with complete bibliographic data
- Search strategy documentation
- PRISMA flow diagram (searches, screening, exclusions)
- Source files (PDFs or abstracts) if retrievable

**Anti-Fabrication Rules:**
- NEVER create fake PMIDs to fill gaps
- NEVER include placeholder sources
- NEVER report sources without valid identifiers
- If relevant source lacks PMID, use DOI or URL (must be accessible)

**Example Output:**
```markdown
## Literature Search Results

### Search Strategy
Databases: PubMed, Embase, Web of Science
Date Range: 2020-01-01 to 2025-01-31
Search Date: 2025-01-15

PubMed Search String:
("trastuzumab deruxtecan"[Title/Abstract] OR "T-DXd"[Title/Abstract] OR "enhertu"[Title/Abstract])
AND ("interstitial lung disease"[Title/Abstract] OR "ILD"[Title/Abstract] OR "pneumonitis"[Title/Abstract])
AND ("2020"[PDAT] : "2025"[PDAT])

Results: 89 records

### Screening Results
- Total records identified: 127 (PubMed: 89, Embase: 32, Web of Science: 6)
- Duplicates removed: 34
- Title/abstract screened: 93
- Excluded at title/abstract: 46 (wrong intervention: 21, wrong outcome: 18, review article: 7)
- Full-text assessed: 47
- Excluded at full-text: 8 (insufficient data: 5, duplicate publication: 3)
- **Final included: 39 sources**

### Included Sources (excerpt)
1. Modi S, Jacot W, Yamashita T, et al. Trastuzumab Deruxtecan in Previously Treated HER2-Low Advanced Breast Cancer. N Engl J Med. 2022;387(1):9-20. PMID: 35665782. DOI: 10.1056/NEJMoa2203690

2. Shitara K, Bang YJ, Iwasa S, et al. Trastuzumab Deruxtecan in Previously Treated HER2-Positive Gastric Cancer. N Engl J Med. 2020;382(25):2419-2430. PMID: 32469182. DOI: 10.1056/NEJMoa2004413

[... complete list of 39 sources ...]

### Search Limitations
- English-language publications only
- Three databases (did not search CINAHL, grey literature)
- May have missed very recent publications (search date: Jan 2025)
```

### Evidence Extraction Agent

**Role:** Systematic extraction of data and findings from sources

**Responsibilities:**
- Read sources systematically
- Extract relevant data points (quantitative and qualitative)
- Record evidence with source attribution
- Note study methodology and quality indicators
- Track conflicting evidence
- Create structured data tables

**Quality Standards:**
- Every extracted claim has source citation
- Numerical data includes context (n, CI, study design)
- Methodology is documented
- Limitations are recorded
- Conflicting evidence is preserved
- Extractions are verifiable against source

**Outputs:**
- Evidence extraction tables
- Summary of key findings by topic
- Documentation of study characteristics
- List of conflicting evidence
- Gaps or uncertainties identified

**Anti-Fabrication Rules:**
- NEVER extract data without source citation
- NEVER round or modify numerical values without documentation
- NEVER ignore conflicting evidence
- NEVER extract out of context
- If data unclear in source, note as "not reported" or "unclear"

**Example Output:**
```markdown
## Evidence Extraction: ILD Incidence in ADC Trials

| Study | PMID | Design | N | ADC | ILD Any Grade | ILD Grade 3-4 | ILD Grade 5 | Monitoring | Notes |
|-------|------|--------|---|-----|---------------|---------------|-------------|------------|-------|
| Modi 2022 | 35665782 | Phase 3 RCT | 557 | T-DXd 5.4mg/kg | 15.2% (n=85/557) | 3.7% (n=21/557) | 0.7% (n=4/557) | Active surveillance | Adjudicated ILD |
| Shitara 2020 | 32469182 | Phase 2 | 188 | T-DXd 6.4mg/kg | 13.1% (n=25/188) | 1.6% (n=3/188) | 2.1% (n=4/188) | Standard monitoring | Higher dose |

### Key Findings - ILD Incidence

**Trastuzumab Deruxtecan:**
- Across studies (n=5 trials, 1,234 patients total), any-grade ILD: 10.8% to 15.6%
- Grade 3-4 ILD: 2.4% to 3.7%
- Grade 5 (fatal) ILD: 0.8% to 2.7%
- Higher rates with intensive monitoring vs. passive reporting
- No clear cumulative dose relationship observed

**Datopotamab Deruxtecan:**
- TROPION-Lung01 (PMID: 39250535): Any-grade ILD: 8.8%, Grade 3-4: 3.4%, Grade 5: 2.4%
- Qualitatively similar to T-DXd (shared deruxtecan platform)

### Conflicting Evidence

**Time to Onset:**
- Modi 2022: Median 5.6 months (range 1.1-20.8)
- Powell 2022 (PMID: 35303587): Median 4.2 months (range 0.7-22.3)
- Heterogeneity may reflect differences in monitoring intensity

**Corticosteroid Response:**
- Kumagai 2020 (PMID: 33051938): 90% resolution with corticosteroids in preclinical model
- Powell 2022: 42% mortality in patients with DAD pattern despite corticosteroids
- Suggests heterogeneity in ILD pathology and treatment responsiveness
```

### Validation Agent

**Role:** Verify authenticity, quality, and accuracy of research outputs

**Responsibilities:**
- Validate source identifiers (PMIDs, DOIs, URLs)
- Detect fabricated or placeholder sources
- Verify extracted data matches source material
- Check citation format and completeness
- Assess study quality and bias risk
- Apply CLAUDE.md anti-fabrication rules
- Generate validation reports with specific issues

**Quality Standards:**
- All sources validated for authenticity
- No fake PMIDs, placeholder text, or fabricated URLs
- Extracted data verified against sources
- Citations properly formatted
- CLAUDE.md compliance checked
- Issues documented with severity and fix suggestions

**Outputs:**
- Source validation report (authenticity check)
- Data accuracy verification (extraction vs. source comparison)
- Study quality assessment
- CLAUDE.md compliance audit
- List of issues by severity (critical, warning, info)

**Anti-Fabrication Rules:**
- FAIL validation if any fake PMIDs detected
- FAIL validation if placeholder sources found
- FAIL validation if data mismatches sources
- FAIL validation if CLAUDE.md violations found
- Provide specific fix instructions for every issue

**Example Output:**
```markdown
## Validation Report

### Source Authenticity Check

**Status:** FAILED (3 critical issues)

**Critical Issues:**

1. **Fabricated PMID (Source #23)**
   - **Issue:** PMID "12345678" is sequential fabricated pattern
   - **Location:** Reference 23 (Smith et al.)
   - **Severity:** CRITICAL
   - **Fix:** Remove this source or find actual PMID via PubMed search for title

2. **Placeholder Title (Source #45)**
   - **Issue:** Title "Example Study on ADC Toxicity" contains placeholder pattern
   - **Location:** Reference 45
   - **Severity:** CRITICAL
   - **Fix:** Provide actual study title or remove source

3. **Inaccessible URL (Source #67)**
   - **Issue:** URL returns 404 error
   - **Location:** Reference 67
   - **Severity:** CRITICAL
   - **Fix:** Find accessible URL or use DOI/PMID instead

**Warnings:**

4. **Missing DOI (Source #12)**
   - **Issue:** Source has PMID but no DOI
   - **Severity:** WARNING
   - **Fix:** Add DOI for completeness (optional but recommended)

### Data Accuracy Verification

**Status:** PASSED (2 minor corrections needed)

**Corrections Needed:**

1. **Incidence Mismatch (Modi 2022 extraction)**
   - **Extracted:** "ILD incidence: 13.6%"
   - **Source states:** "Drug-related ILD: 15.2% (adjudicated); Investigator-assessed: 13.6%"
   - **Severity:** WARNING
   - **Fix:** Clarify which definition used or report both

2. **Missing Context (Shitara 2020 extraction)**
   - **Extracted:** "4 fatal ILD cases"
   - **Source states:** "4 fatal ILD cases out of 188 patients (2.1%)"
   - **Severity:** INFO
   - **Fix:** Include denominator for context

### CLAUDE.md Compliance

**Status:** FAILED (1 critical violation)

**Violations:**

1. **Fabricated Confidence Score**
   - **Issue:** Synthesis states "Overall evidence quality: 85%"
   - **Violation:** Score above 80% without external validation data
   - **Severity:** CRITICAL
   - **CLAUDE.md Reference:** MANDATORY ANTI-FABRICATION PROTOCOLS - Score Fabrication Prohibition
   - **Fix:** Remove score or replace with qualitative statement like "Evidence from 5 RCTs suggests moderate to high confidence"

### Summary
- **Critical Issues:** 4 (must fix before proceeding)
- **Warnings:** 3 (should fix)
- **Info:** 1 (nice to fix)

**Recommendation:** REJECT current output. Fix critical issues and resubmit for validation.
```

### Synthesis Agent

**Role:** Integrate findings from multiple sources into coherent conclusions

**Responsibilities:**
- Identify patterns and themes across sources
- Synthesize quantitative findings (ranges, trends)
- Reconcile conflicting evidence
- Draw evidence-based conclusions
- Calibrate confidence levels based on evidence quality
- Document synthesis methodology
- Acknowledge uncertainties

**Quality Standards:**
- Synthesis supported by multiple sources
- Conflicting evidence acknowledged explicitly
- Conclusions proportional to evidence strength
- Confidence levels justified
- Limitations comprehensively documented
- No fabrication of consensus where disagreement exists

**Outputs:**
- Integrated synthesis of findings by topic
- Evidence-based conclusions
- Confidence assessment with justification
- Documentation of conflicting evidence
- Comprehensive limitations section

**Anti-Fabrication Rules:**
- NEVER create consensus scores by averaging
- NEVER overstate confidence beyond evidence
- NEVER ignore conflicting evidence
- NEVER claim causation from correlation alone
- Report ranges and heterogeneity honestly

**Example Output:**
```markdown
## Synthesis: ADC-Associated ILD Mechanisms

### Integrated Findings

**Evidence Base:** 12 mechanistic studies (7 preclinical, 5 translational clinical studies)

**Mechanism 1: Non-Specific Macrophage Uptake**
- Evidence: Ogitani 2016 (PMID: 27780853), Kumagai 2020 (PMID: 33051938), Iwata 2022 (PMID: 35790243)
- Alveolar macrophages express Fcγ receptors (FcγRI, FcγRIIa, FcγRIII)
- ADCs bind via Fc portion, internalized independent of target antigen
- Preclinical evidence: Lung macrophage uptake increased 3-4 fold vs other tissues (Kumagai monkey model)
- Payload released intracellularly → macrophage death → inflammation

**Mechanism 2: Bystander Cytotoxicity**
- Evidence: Ogitani 2016 (PMID: 27780853), Nakada 2019 (PMID: 30799310)
- Membrane-permeable payloads (e.g., deruxtecan) diffuse to adjacent cells
- Pneumocytes adjacent to macrophages exposed to cytotoxic payload
- Preclinical evidence: Bystander killing radius ~50-100 μm for deruxtecan

**Mechanism 3: Immune-Mediated Inflammation**
- Evidence: SPP1 macrophage study (PMID: 39509324), clinical correlation studies
- Dying cells release damage-associated molecular patterns (DAMPs)
- SPP1+ macrophage recruitment and pro-inflammatory signaling
- Cytokine cascade (IL-6, IL-8, TNF-α) → tissue injury amplification

**Conflicting Evidence:**
- **Dose Dependency:** Kumagai 2020 shows dose-dependent ILD in monkeys, but clinical trials (Modi 2022) show no clear cumulative dose relationship
- **Resolution:** Preclinical findings may not fully translate to humans; individual susceptibility likely plays role

### Conclusions

**Confidence Level: MODERATE**
- Basis: Multiple independent preclinical studies with consistent findings
- Limitation: Translational clinical evidence is limited
- Limitation: Exact contribution of each mechanism unclear
- Limitation: Interplay between mechanisms not fully elucidated

**Evidence-Based Conclusion:**
Current evidence from preclinical models and limited clinical studies suggests ADC-associated ILD arises from multiple interconnected mechanisms, including non-specific macrophage uptake via Fcγ receptors, payload-mediated pneumocyte injury through bystander effects, and subsequent immune-mediated inflammation. These mechanisms are supported by consistent findings across multiple preclinical models and correlative clinical observations. However, the relative contribution of each mechanism, individual susceptibility factors, and mechanistic differences across ADC platforms remain incompletely understood.

### Limitations

1. **Preclinical-Clinical Translation Gap:** Most mechanistic data from animal models; human validation limited
2. **Mechanistic Heterogeneity:** Different ADC structures may have different dominant mechanisms
3. **Individual Susceptibility:** Cannot explain why only subset of patients develop ILD
4. **Temporal Dynamics:** Mechanism evolution over time not well characterized
5. **Pathway Interactions:** Interplay between mechanisms incompletely understood
6. **Lack of Direct Human Evidence:** Lung biopsies rarely available; correlative data only

### Uncertainties

- Which patients are most susceptible? (biomarkers unknown)
- Can mechanisms be targeted pharmacologically for prevention?
- Do all ADCs share same mechanisms or are there class differences?
- What triggers progression from mild to severe ILD?

**NOTE:** This synthesis represents current understanding based on available evidence through January 2025. Mechanistic knowledge continues to evolve.
```

### Quality Assurance Agent

**Role:** Comprehensive audit of research outputs before finalization

**Responsibilities:**
- Audit bibliography completeness and formatting
- Verify all claims have source citations
- Check CLAUDE.md anti-fabrication compliance
- Review methodology documentation
- Assess limitations section completeness
- Run automated quality checks
- Generate compliance reports

**Quality Standards:**
- All automated checks pass
- No unsupported claims
- CLAUDE.md fully compliant
- Bibliography complete with valid identifiers
- Methodology reproducible
- Limitations comprehensive

**Outputs:**
- Bibliography quality report
- Claims-citation mapping audit
- CLAUDE.md compliance report
- Methodology completeness check
- Overall quality assessment
- Issues list with recommended fixes

**Anti-Fabrication Rules:**
- FLAG any scores >80% without external validation
- FLAG banned language without evidence
- FLAG unsupported claims
- FLAG fabricated sources
- FAIL QA if critical issues unresolved

**Example Output:**
```markdown
## Quality Assurance Report - Final

### Executive Summary
**Overall Status:** PASS (with 3 minor recommendations)

### Bibliography Audit
**Status:** PASS

- Total references: 165
- References with PMID: 146 (88.5%)
- References with DOI: 165 (100%)
- Format consistency: 100%
- Fabricated sources detected: 0
- Placeholder sources detected: 0
- Inaccessible URLs: 0

**Recommendation:** Bibliography meets publication standards.

### Claims-Citation Audit
**Status:** PASS

- Total quantitative claims: 127
- Claims with citations: 127 (100%)
- Claims with sufficient context: 125 (98.4%)

**Minor Issues:**
1. Claim on page 12: "Higher rates with intensive monitoring" - suggest adding specific studies
2. Claim on page 23: "No clear relationship" - clarify which studies examined this

### CLAUDE.md Compliance
**Status:** PASS

**Checks Performed:**
- Score fabrication: NONE DETECTED
- Banned language: NONE DETECTED
- Evidence chains: ALL COMPLETE
- Uncertainty expression: ADEQUATE
- Limitations section: COMPREHENSIVE
- Mandatory skepticism: APPROPRIATE

**Positive Findings:**
- All numerical claims sourced from published studies
- Confidence levels justified by evidence quality
- Uncertainties explicitly acknowledged
- Appropriate hedging language used ("suggests", "indicates", "preliminary")
- Limitations section is thorough (8 major limitations documented)

### Methodology Documentation
**Status:** PASS

- Search strategy: FULLY DOCUMENTED
- Inclusion/exclusion criteria: CLEARLY SPECIFIED
- Screening process: DESCRIBED
- Data extraction: DOCUMENTED
- Quality assessment: PERFORMED
- Synthesis approach: EXPLAINED

**Reproducibility:** HIGH - methodology sufficient for independent replication

### Recommendations

1. **Minor Enhancement (Page 12):** Add specific study citations for claim about monitoring intensity
2. **Clarification (Page 23):** Specify which studies examined dose-relationship
3. **Enhancement (Discussion):** Consider adding section on future research priorities

### Final Assessment
**Publication Readiness:** APPROVED

This research report meets rigorous quality standards for medical/pharmaceutical research. Bibliography is complete with validated sources. All claims are properly cited. CLAUDE.md anti-fabrication protocols fully satisfied. Methodology is reproducible. Limitations are comprehensively acknowledged.

**Quality Level:** Publication-grade for peer-reviewed journal

**Recommendation:** Proceed to final formatting and submission.
```

## Multi-Agent Coordination Protocols

### Protocol 1: Sequential Pipeline with Quality Gates

**When to Use:** Research stages have clear dependencies

**Workflow:**
```
Plan → Search → Extract → Validate → Synthesize → QA → Deliver
        ↓        ↓         ↓           ↓         ↓
     Quality  Quality   Quality     Quality   Quality
      Gate     Gate      Gate        Gate      Gate
```

**Quality Gates:**
Each stage must pass quality criteria before proceeding to next:
- **Search Gate:** Reproducible strategy, valid sources only
- **Extract Gate:** All data has citations, context provided
- **Validate Gate:** Sources authentic, data accurate
- **Synthesize Gate:** Conclusions supported, limitations acknowledged
- **QA Gate:** All compliance checks pass

**Handoff Protocol:**
```
1. Upstream agent completes work
2. Upstream agent self-checks against quality criteria
3. Upstream agent packages deliverables with documentation
4. Downstream agent receives deliverables
5. Downstream agent validates inputs meet quality gate
6. If FAIL: return to upstream agent with specific issues
7. If PASS: proceed with downstream work
```

### Protocol 2: Parallel Execution with Synthesis

**When to Use:** Different domains can be researched simultaneously

**Workflow:**
```
                    ┌→ Agent A: Clinical Evidence ──┐
                    │                                ↓
Research Question ──┼→ Agent B: Mechanistic Studies─→ Synthesis Agent → Final Report
                    │                                ↑
                    └→ Agent C: Regulatory Docs ────┘
```

**Synchronization Points:**
1. **Launch:** All agents receive common research question and protocol
2. **Mid-Point Check:** Agents sync to identify overlaps or gaps
3. **Completion:** All agents deliver to synthesis agent
4. **Integration:** Synthesis agent combines findings

**Communication Protocol:**
- Agents work independently initially (minimize coordination overhead)
- Optional mid-point sync to identify gaps
- Final deliverables include methodology documentation
- Synthesis agent identifies conflicts and reconciles

### Protocol 3: Iterative Refinement Loop

**When to Use:** Quality requires multiple revision cycles

**Workflow:**
```
Executor Agent → Draft Output → Validator Agent → Issues Found?
     ↑                                                   │
     └───────────── Revise Based on Feedback ←──────────┘
                                                         │
                                                       NO
                                                         ↓
                                                   Final Output
```

**Iteration Protocol:**
1. Executor produces initial output
2. Validator audits comprehensively
3. If issues found:
   - Validator provides specific, actionable feedback
   - Executor revises addressing all feedback
   - Return to step 2 (limit: 3 iterations)
4. If no critical issues:
   - Proceed to final output
   - Document remaining minor issues

**Convergence Criteria:**
- No critical issues remaining
- All CLAUDE.md violations resolved
- All sources validated
- All claims have citations

### Protocol 4: Independent Cross-Validation

**When to Use:** Maximum rigor required, high-stakes research

**Workflow:**
```
Research Question
       ↓
   ┌───┴───┐
   ↓       ↓
Agent A   Agent B
(Primary) (Independent)
   ↓       ↓
   (No Communication)
   ↓       ↓
Findings  Findings
   ↓       ↓
   └───┬───┘
       ↓
Reconciliation Agent
       ↓
   Final Report
  (with noted disagreements)
```

**Independence Protocol:**
- Both agents receive identical research question
- NO communication between agents during research
- Both complete independently
- Reconciliation agent:
  - Identifies agreements (high confidence)
  - Identifies disagreements (preserve both perspectives)
  - Investigates discrepancies
  - Does NOT fabricate consensus

**Reporting:**
- Agreement: "Both independent reviewers found..."
- Disagreement: "Reviewer A found..., while Reviewer B found... This discrepancy may reflect..."

## Anti-Fabrication Protocols in Multi-Agent Research

### No Consensus Fabrication

**Prohibited:**
- Averaging quality scores from multiple agents
- Creating composite confidence metrics
- Hiding disagreements to present unified front

**Required:**
- Report individual agent assessments
- Document conflicts explicitly
- Explain disagreement sources
- Synthesize thoughtfully without falsifying consensus

### Evidence Independence

**Prohibited:**
- Claiming higher confidence because "multiple agents agreed"
- Counting agent consensus as independent evidence
- Using agent count as evidence multiplier

**Required:**
- Recognize agents reviewing same sources = NOT independent evidence
- Base confidence on evidence quality, not agent count
- Validate claims against primary sources independently

### Disagreement Preservation

**Prohibited:**
- Hiding conflicts between agents
- Choosing "easier" finding when agents disagree
- Fabricating middle-ground compromise

**Required:**
- Document all substantive disagreements
- Investigate root causes of conflicts
- Report both perspectives with evidence
- Let reader/downstream agent decide

## Examples from Safety Research System

### Example 1: ADC/ILD Literature Review

**Research Question:** "What is the incidence and severity of ILD across different ADC platforms?"

**Agent Assignments:**
- **Agent A (Literature):** Systematic search for clinical trials and observational studies
- **Agent B (Extraction):** Extract ILD incidence data, severity grading, outcomes
- **Agent C (Validation):** Verify sources authentic, data accurate, quality assessment
- **Agent D (Synthesis):** Integrate findings, compare across ADC platforms

**Coordination:**
1. Agent A completes systematic search → 47 sources identified
2. Agent C validates Agent A's sources (parallel) → all sources authentic
3. Agent B extracts data from validated sources → ILD data for 12 ADCs
4. Agent C verifies Agent B's extractions against sources → 2 corrections needed
5. Agent B revises → all extractions verified
6. Agent D synthesizes across ADCs → incidence ranges by platform
7. Quality gate: All agents review synthesis for accuracy → PASS

**Outcome:** Comprehensive ILD incidence synthesis with 165 validated citations

### Example 2: Mechanistic Research Synthesis

**Research Question:** "What are the molecular mechanisms underlying ADC-associated ILD?"

**Agent Assignments:**
- **Agent A:** Preclinical mechanistic studies
- **Agent B:** Clinical correlative studies
- **Agent C:** Pathology/biomarker studies
- **Agent D:** Synthesis and mechanistic model development

**Coordination (Parallel):**
1. All agents search their domains simultaneously
2. Agent A identifies 7 preclinical mechanism papers
3. Agent B identifies 5 clinical correlative studies
4. Agent C identifies 3 pathology reports
5. Mid-point sync: identify overlap and gaps
6. Agents complete extraction
7. Agent D integrates into mechanistic model
8. Validation: All agents check model against their evidence

**Conflict Resolution:**
- Agent A (preclinical): dose-dependent ILD in monkeys
- Agent B (clinical): no clear dose relationship in humans
- Resolution: Document both, hypothesize individual susceptibility factors

**Outcome:** Multi-level mechanistic synthesis with explicitly noted translational gaps

### Example 3: Bibliography Completion

**Task:** Complete bibliography for comprehensive review (starting with 47 references)

**Agent Assignments:**
- **Agent A:** Search for landmark clinical trials
- **Agent B:** Search for recent 2023-2025 publications
- **Agent C:** Search for mechanistic/preclinical papers
- **Agent D:** Validate all sources for authenticity and formatting

**Coordination (Sequential):**
1. Agents A, B, C work in parallel → 118 additional sources identified
2. Agent D validates all 165 total sources:
   - Checks PMIDs against PubMed
   - Verifies URLs accessible
   - Detects placeholder patterns
   - Validates citation formatting
3. Agent D identifies 3 issues → Agents revise
4. Agent D re-validates → ALL PASS
5. Final bibliography: 165 complete, validated citations

**Quality Metrics:**
- 146/165 with PMIDs (88.5%)
- 165/165 with DOIs (100%)
- 0 fabricated sources
- 0 placeholder sources
- 100% format consistency

## Coordination Anti-Patterns (Avoid These)

### Anti-Pattern 1: Homogenization
**Problem:** All agents sound the same, lose specialized perspectives
**Fix:** Enforce distinct personas, value unique viewpoints

### Anti-Pattern 2: False Consensus
**Problem:** Agents fabricate agreement to seem unified
**Fix:** Preserve and document disagreements explicitly

### Anti-Pattern 3: Evidence Multiplication
**Problem:** Claiming high confidence because "5 agents agreed"
**Fix:** Recognize agents reviewing same sources are not independent evidence

### Anti-Pattern 4: Validation Bypass
**Problem:** Skipping quality gates to save time
**Fix:** Enforce quality gates strictly; quality over speed

### Anti-Pattern 5: Context Loss
**Problem:** Handoffs lose critical context or methodology
**Fix:** Require documentation with every handoff

### Anti-Pattern 6: Circular Validation
**Problem:** Agent A validates Agent B, Agent B validates Agent A (no independence)
**Fix:** Use independent validation against primary sources

## Resources

**CLAUDE.md Protocols:**
- Persona Adoption Requirements
- Collaborative Framework
- Coordination Standards
- Anti-Fabrication in Teams

**Research Workflow Examples:**
- ADC/ILD Comprehensive Review (safety-research-system)
- Bibliography Completion (165 sources validated)
- Multi-Domain Evidence Synthesis

**Quality Standards:**
- Evidence-Based Validation skill
- Multi-Agent Orchestration skill
- Research Methodology reference

# Research Plan Template

## Project Information

**Research Title:** [Descriptive title of research project]

**Primary Investigator:** [Name/Agent ID]

**Date Created:** [YYYY-MM-DD]

**Target Completion:** [YYYY-MM-DD]

**Project Type:** [Systematic Review | Literature Review | Safety Assessment | Evidence Synthesis]

## Research Question(s)

### Primary Research Question
[Specific, answerable research question using PICO/PECO framework]

**PICO/PECO Breakdown:**
- **P** (Population): [Who is being studied?]
- **I/E** (Intervention/Exposure): [What treatment/exposure?]
- **C** (Comparison): [What is being compared to?]
- **O** (Outcome): [What outcomes measured?]

### Secondary Research Questions (if applicable)
1. [Secondary question 1]
2. [Secondary question 2]

## Background & Rationale

### Current State of Knowledge
[Brief summary of what is currently known]

### Knowledge Gap
[What is not known that this research will address]

### Significance
[Why this research is important - who will benefit, how will it be used]

## Methodology

### Research Design
[Type: Systematic review, scoping review, rapid review, etc.]

[Framework: PRISMA, GRADE, other]

### Search Strategy

**Databases to Search:**
- [ ] PubMed/MEDLINE
- [ ] Embase
- [ ] Web of Science
- [ ] Cochrane Library
- [ ] ClinicalTrials.gov
- [ ] Other: _____________

**Search Terms:**
```
[Database 1 Search String]:
(keyword 1 OR synonym 1) AND (keyword 2 OR synonym 2) AND ...

[Database 2 Search String]:
[Adapted for database syntax]
```

**Filters:**
- Date range: [YYYY-MM-DD to YYYY-MM-DD]
- Language: [English only | All languages]
- Study types: [RCT | Observational | All types]
- Publication status: [Peer-reviewed only | Include preprints]

### Inclusion Criteria

**Study Design:**
- Include: [Specific study designs]
- Exclude: [Study designs to exclude]

**Population:**
- Include: [Specific population characteristics]
- Exclude: [Population exclusions]

**Intervention/Exposure:**
- Include: [Specific interventions/exposures]
- Exclude: [What to exclude]

**Outcomes:**
- Include: [Required outcome measures]
- Exclude: [Outcomes not of interest]

**Other:**
- Minimum sample size: [n = ___ ] or [No minimum]
- Required data elements: [List]
- Language restrictions: [If any]

### Exclusion Criteria

Explicit exclusions:
1. [Specific exclusion 1]
2. [Specific exclusion 2]
3. [Etc.]

### Screening Process

**Stage 1: Title/Abstract Screening**
- Screeners: [Single | Dual independent]
- Tool: [If using screening software]
- Conflict resolution: [Discussion | Third reviewer]

**Stage 2: Full-Text Screening**
- Screeners: [Single | Dual independent]
- Document exclusion reasons
- Track excluded studies

### Data Extraction

**Data to Extract:**
- Bibliographic information (authors, title, year, PMID, DOI)
- Study characteristics (design, n, duration, setting)
- Population characteristics (demographics, baseline)
- Intervention/exposure details
- Outcome measures
- Results (with 95% CI and p-values)
- Study quality indicators
- Funding source and conflicts

**Extraction Method:**
- Tool: [Form, spreadsheet, software]
- Extractors: [Single | Dual independent]
- Verification: [Spot check 10-20% | Full dual extraction]

### Quality Assessment

**Tool to Use:**
- [Cochrane Risk of Bias tool] for RCTs
- [Newcastle-Ottawa Scale] for cohort/case-control
- [GRADE] for evidence certainty
- [Other: specify]

**Domains to Assess:**
- [List specific domains]

### Evidence Synthesis

**Synthesis Approach:**
- [Narrative synthesis | Meta-analysis | Both]

**Synthesis Method:**
- Grouping: [By outcome | By population | By intervention]
- Analysis: [Descriptive | Quantitative pooling]
- Heterogeneity assessment: [If doing meta-analysis]

## Multi-Agent Coordination

### Agent Assignments

**Agent A - Literature Search:**
- Execute database searches
- Screen results for relevance
- Extract bibliographic metadata
- Deliverable: List of included sources with complete citations

**Agent B - Evidence Extraction:**
- Extract data from included sources
- Record with source attribution
- Note conflicts and gaps
- Deliverable: Evidence extraction tables

**Agent C - Validation:**
- Verify source authenticity
- Check data accuracy
- Assess study quality
- Deliverable: Validation report, quality assessment

**Agent D - Synthesis:**
- Integrate findings
- Reconcile conflicts
- Draw conclusions
- Deliverable: Synthesis document with conclusions

**Agent E - Quality Assurance:**
- Bibliography validation
- CLAUDE.md compliance check
- Methodology verification
- Deliverable: QA report, final approval

### Coordination Protocol
[Sequential Pipeline | Parallel Specialization | Iterative Refinement]

**Quality Gates:**
- After Search: All sources must have valid identifiers
- After Extraction: All data must have citations
- After Validation: No fabricated sources detected
- After Synthesis: CLAUDE.md compliant
- After QA: All checks pass

**Communication:**
- Handoff format: [Standardized documentation]
- Sync points: [When agents check in]
- Conflict resolution: [How disagreements handled]

## Quality Standards

### Acceptance Criteria

**Bibliography:**
- 100% of sources have valid identifier (PMID, DOI, or accessible URL)
- 0 fabricated sources (fake PMIDs, placeholders)
- >80% with PMID (for medical research)
- >90% with DOI

**Evidence Extraction:**
- 100% of extracted claims have source citations
- >95% of numerical claims have context (n, CI)
- Conflicting evidence documented

**CLAUDE.md Compliance:**
- 0 score fabrications (>80% without validation)
- 0 banned language violations
- 0 unsupported claims
- Limitations section present and comprehensive

**Methodology:**
- Search strategy fully documented and reproducible
- Inclusion/exclusion criteria applied consistently
- PRISMA flow diagram complete (if applicable)

### Validation Procedures

**Source Authenticity:**
- Run `validate-bibliography.py` on all sources
- Manually verify random sample (20-30 sources)
- All critical issues must be resolved

**Data Accuracy:**
- Spot check 10-20% of extractions against sources
- Verify numerical data matches exactly
- Verify context is preserved

**CLAUDE.md Compliance:**
- Run `research-quality-check.py` on final manuscript
- All critical violations must be fixed
- Document how issues were resolved

## Timeline

| Phase | Tasks | Duration | Completion Date | Responsible |
|-------|-------|----------|-----------------|-------------|
| Planning | Protocol development, agent assignment | [X days] | [Date] | [Agent] |
| Search | Database searches, screening | [X days] | [Date] | Agent A |
| Extraction | Data extraction, verification | [X days] | [Date] | Agent B |
| Validation | Source & data validation, quality assessment | [X days] | [Date] | Agent C |
| Synthesis | Evidence integration, conclusion development | [X days] | [Date] | Agent D |
| QA | Quality checks, final validation | [X days] | [Date] | Agent E |
| Finalization | Formatting, submission prep | [X days] | [Date] | [Agent] |

**Total Estimated Duration:** [X weeks]

## Deliverables

### Interim Deliverables
1. Search strategy documentation
2. PRISMA flow diagram
3. Included sources list
4. Evidence extraction tables
5. Quality assessment results
6. Validation reports

### Final Deliverables
1. Comprehensive research report
2. Executive summary
3. Complete bibliography
4. Methodology documentation
5. QA compliance reports
6. Supporting materials (extraction tables, search logs)

## Resources Required

**Personnel/Agents:**
- [Number and type of agents needed]

**Tools/Software:**
- Bibliography management: [Tool]
- Screening: [Tool]
- Data extraction: [Tool]
- Analysis: [Tool]
- Quality check scripts: validate-bibliography.py, research-quality-check.py

**Access:**
- Database subscriptions: [List]
- Full-text article access: [How obtained]
- Literature search support: [If needed]

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| Limited available literature | [Low/Med/High] | [Low/Med/High] | [Strategy] |
| Heterogeneous study designs | [Low/Med/High] | [Low/Med/High] | [Strategy] |
| Missing data in sources | [Low/Med/High] | [Low/Med/High] | [Strategy] |
| Timeline delays | [Low/Med/High] | [Low/Med/High] | [Strategy] |
| Quality issues detected late | [Low/Med/High] | [Low/Med/High] | [Strategy: Early quality gates] |

## Limitations & Assumptions

### Known Limitations
1. [Limitation 1]
2. [Limitation 2]

### Assumptions
1. [Assumption 1]
2. [Assumption 2]

### Mitigation
- [How limitations will be addressed or acknowledged]

## Success Criteria

### Minimum Success
- [ ] Research question answered with available evidence
- [ ] All quality gates passed
- [ ] CLAUDE.md compliant
- [ ] Bibliography complete and validated
- [ ] Methodology reproducible

### Full Success
- [ ] Minimum success criteria met
- [ ] Comprehensive evidence coverage
- [ ] High confidence conclusions (where evidence supports)
- [ ] Publication-ready quality
- [ ] Actionable recommendations

## Approval

**Plan Approved By:** [Name/Role]

**Date:** [YYYY-MM-DD]

**Signature:** _______________

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | [Date] | Initial plan | [Name] |
| | | | |

# Research Methodology Reference

## Systematic Literature Review Process

### Overview
Systematic literature review is a rigorous methodology for identifying, evaluating, and synthesizing research evidence. Unlike narrative reviews, systematic reviews follow predefined protocols to minimize bias and maximize reproducibility.

### PRISMA Framework
The Preferred Reporting Items for Systematic Reviews and Meta-Analyses (PRISMA) provides the gold standard for systematic review methodology and reporting.

**Key Components:**
1. Protocol registration (pre-specify methods)
2. Systematic search strategy
3. Explicit inclusion/exclusion criteria
4. Standardized screening process
5. Data extraction protocol
6. Quality/bias assessment
7. Evidence synthesis methodology
8. Transparent reporting

### Research Question Formulation

**PICO Framework (Clinical Research):**
- **P**opulation: Who is being studied?
- **I**ntervention: What treatment/exposure?
- **C**omparison: What is the comparison group?
- **O**utcome: What outcomes are measured?

**Example:**
- Population: Patients with HER2+ breast cancer
- Intervention: Trastuzumab deruxtecan
- Comparison: Standard chemotherapy
- Outcome: Interstitial lung disease incidence

**PECO Framework (Observational Research):**
- **P**opulation
- **E**xposure
- **C**omparison
- **O**utcome

### Search Strategy Development

**Components:**
1. **Database Selection:**
   - PubMed/MEDLINE (biomedical)
   - Embase (pharmaceutical)
   - Web of Science (multidisciplinary)
   - Cochrane Library (clinical trials)
   - ClinicalTrials.gov (trial registry)
   - Regulatory databases (FDA, EMA)

2. **Search Terms:**
   - Medical Subject Headings (MeSH terms)
   - Free text keywords
   - Drug names (generic and brand)
   - Synonyms and related terms
   - Boolean operators (AND, OR, NOT)

3. **Search Limits:**
   - Date range (e.g., 2020-2025)
   - Language (typically English)
   - Study type (RCT, observational, review)
   - Publication status (peer-reviewed, preprints)

4. **Documentation:**
   - Record exact search strings
   - Note date of search
   - Document number of results
   - Track any modifications to strategy

**Example Search String:**
```
("antibody-drug conjugate*" OR "ADC" OR "trastuzumab deruxtecan" OR "T-DXd" OR "enhertu")
AND
("interstitial lung disease" OR "ILD" OR "pneumonitis" OR "pulmonary toxicity")
AND
("2020"[PDAT] : "2025"[PDAT])
```

### Inclusion/Exclusion Criteria

**Inclusion Criteria (Specify):**
- Study design (RCT, cohort, case series, etc.)
- Population characteristics
- Intervention/exposure
- Outcome measures reported
- Language
- Minimum sample size
- Publication type

**Exclusion Criteria (Specify):**
- Wrong population
- Wrong intervention
- Irrelevant outcomes
- Insufficient data
- Duplicate publications
- Non-peer reviewed (if applicable)
- Retracted studies

**Critical Rule:** Apply criteria consistently and document decisions. When uncertain, resolve through discussion or independent review.

### Screening Process

**Stage 1: Title/Abstract Screening**
- Rapid assessment of relevance
- Liberal inclusion (when in doubt, include)
- Document exclusion reasons
- Dual independent review recommended

**Stage 2: Full-Text Review**
- Detailed assessment against criteria
- Extract key data for decision
- Document exclusion reasons with specificity
- Dual independent review recommended
- Resolve conflicts through discussion or third reviewer

**Documentation:**
- PRISMA flow diagram showing:
  - Records identified through database search
  - Records after duplicates removed
  - Records screened (title/abstract)
  - Records excluded at title/abstract stage
  - Full-text articles assessed
  - Full-text articles excluded (with reasons)
  - Studies included in final review

### Data Extraction

**Create Standardized Extraction Form:**
- Study identifiers (authors, year, PMID, DOI)
- Study design and methods
- Population characteristics (n, demographics, baseline)
- Intervention/exposure details
- Outcome measures and results
- Statistical data (effect sizes, confidence intervals, p-values)
- Funding source
- Conflicts of interest
- Risk of bias indicators

**Best Practices:**
- Extract data into structured table/database
- Use dual independent extraction (recommended)
- Resolve discrepancies through discussion
- Contact authors for missing data (if appropriate)
- Record extraction date
- Preserve exact quotes for key findings

**Example Extraction Table:**
| Study | Design | N | Population | Intervention | ILD Incidence | Grade 3-4 ILD | Grade 5 ILD | Follow-up | PMID |
|-------|--------|---|------------|--------------|---------------|---------------|-------------|-----------|------|
| Modi 2020 | Phase 2 | 184 | HER2+ BC | T-DXd 5.4mg/kg | 13.6% | 0.5% | 2.7% | 11.1 mo | 31825192 |

### Quality Assessment & Bias Evaluation

**Tools by Study Type:**

**Randomized Controlled Trials:**
- Cochrane Risk of Bias tool (RoB 2)
- Assess: randomization, allocation concealment, blinding, incomplete data, selective reporting

**Cohort Studies:**
- Newcastle-Ottawa Scale
- Assess: selection, comparability, outcome assessment

**Case Series:**
- IHE Quality Appraisal Tool
- Assess: study objective, design, population, intervention, outcome measurement

**Assessment Domains:**
- Selection bias
- Performance bias
- Detection bias
- Attrition bias
- Reporting bias
- Other biases (funding, conflicts)

**Critical for Safety Research:**
- Passive vs. active surveillance (detection bias)
- Completeness of follow-up (attrition bias)
- Standardized outcome definitions (measurement bias)
- Conflicts of interest (sponsor bias)

### Evidence Synthesis

**Narrative Synthesis:**
- Describe studies qualitatively
- Group by common characteristics
- Identify patterns and themes
- Describe range of findings
- Discuss heterogeneity
- Appropriate when meta-analysis not feasible

**Quantitative Synthesis (Meta-Analysis):**
- Combine effect estimates statistically
- Calculate pooled estimates
- Assess heterogeneity (I² statistic)
- Perform subgroup analyses
- Assess publication bias
- Requires specialized statistical expertise

**For Safety Research:**
- Report incidence ranges across studies
- Note heterogeneity in definitions, populations, monitoring
- Do NOT average rates without considering heterogeneity
- Stratify by key variables (e.g., drug, dose, monitoring intensity)
- Acknowledge uncertainty

**Example Synthesis:**
```
"Across 5 clinical trials (n=1,234), drug-related ILD incidence ranged from 10.8%
to 15.6% (any grade). Grade 3-4 ILD occurred in 2.4% to 3.7% of patients, while
fatal ILD (grade 5) was reported in 0.8% to 2.7%. Heterogeneity was observed in
monitoring protocols (active surveillance vs. passive reporting), which may account
for variation in reported incidence. Studies with intensive monitoring detected
higher overall ILD rates but lower grade 5 rates, suggesting earlier detection
enables intervention."
```

### Confidence/Certainty Assessment

**GRADE Framework (Grading of Recommendations Assessment):**
- Start with study design (RCT = high, observational = low)
- Downgrade for: risk of bias, inconsistency, indirectness, imprecision, publication bias
- Upgrade for: large effect size, dose-response, residual confounding opposes effect

**Confidence Levels:**
- **High:** Very confident true effect is close to estimated effect
- **Moderate:** Moderately confident; true effect likely close but could be substantially different
- **Low:** Limited confidence; true effect may be substantially different
- **Very Low:** Very uncertain about estimated effect

**Critical for CLAUDE.md Compliance:**
- Do NOT fabricate confidence scores
- Base confidence on evidence quality, not wishful thinking
- Acknowledge limitations explicitly
- Use required language patterns:
  - "Preliminary evidence suggests..." (not "Clearly demonstrates")
  - "Based on X studies with Y total participants..."
  - "Limitations include..."
  - "Requires external validation"

### Hypothesis Testing

**Null Hypothesis Significance Testing:**
- State null and alternative hypotheses
- Set significance level (α, typically 0.05)
- Calculate test statistic
- Interpret p-value
- Note: p < 0.05 does not mean "important" or "clinically significant"

**Critical Interpretation:**
- Statistical significance ≠ clinical significance
- Absence of evidence ≠ evidence of absence
- Correlation ≠ causation
- Association ≠ causation

**For Safety Research:**
- Small effects can be clinically important (e.g., 1% fatal toxicity rate)
- Wide confidence intervals indicate uncertainty
- Multiple testing increases false positive risk
- Rare events require large sample sizes for detection

### Reporting Standards

**Required Sections:**
1. **Abstract:** Structured summary (background, methods, results, conclusions)
2. **Introduction:** Rationale, objectives, research question
3. **Methods:** Protocol, search strategy, selection criteria, data extraction, quality assessment, synthesis approach
4. **Results:** Study selection (PRISMA diagram), study characteristics, quality assessment, synthesis findings
5. **Discussion:** Summary of evidence, strengths and limitations, implications, future research
6. **Conclusions:** Evidence-based summary (proportional to evidence strength)
7. **References:** Complete bibliography with identifiers

**Transparency Requirements:**
- Pre-specified protocol (ideally registered)
- Complete search strategy
- PRISMA flow diagram
- Detailed study characteristics table
- Risk of bias assessments
- Funding and conflicts disclosed

### Limitations Disclosure

**Always Acknowledge:**
- Search limitations (databases, date range, language)
- Study quality issues (high risk of bias)
- Heterogeneity in study designs, populations, outcomes
- Missing data or incomplete reporting
- Potential publication bias
- Generalizability constraints
- Conflicts of interest

**Example Limitations Section:**
```
## Limitations

This review has several limitations. First, we restricted searches to English-language
publications in three databases (PubMed, Embase, Web of Science), potentially missing
relevant studies in other languages or sources. Second, substantial heterogeneity was
observed in ILD definitions, monitoring protocols, and patient populations across
included studies, limiting direct comparisons. Third, many included studies were
industry-sponsored with potential for publication bias favoring positive results.
Fourth, long-term outcome data (>2 years) were available for only 3 of 12 included
studies. Fifth, we did not perform quantitative meta-analysis due to heterogeneity,
relying instead on narrative synthesis. Sixth, risk of bias assessments identified
concerns regarding blinding and incomplete outcome data in several included trials.
Finally, this review represents a snapshot through January 2025; new evidence may
emerge that alters conclusions.
```

## Evidence Hierarchy

### Levels of Evidence (Oxford Centre for Evidence-Based Medicine)

**Level 1: Systematic Reviews & Meta-Analyses**
- Highest quality synthesis of multiple studies
- Provides strongest evidence when well-conducted
- Subject to publication bias, heterogeneity

**Level 2: Randomized Controlled Trials**
- Gold standard for intervention efficacy
- Minimizes bias through randomization
- May have limited generalizability

**Level 3: Cohort Studies**
- Observational, follows groups over time
- Good for rare exposures or long-term outcomes
- Subject to confounding

**Level 4: Case-Control Studies**
- Retrospective comparison
- Good for rare outcomes
- More prone to bias than cohort studies

**Level 5: Case Series/Case Reports**
- Descriptive, no comparison group
- Hypothesis-generating
- Cannot establish causation

**Level 6: Expert Opinion**
- Lowest evidence level
- Based on experience, not systematic evidence
- High variability

**For Safety Research:**
- Rare adverse events may only have case series evidence
- Pharmacovigilance databases provide real-world evidence
- Lower evidence level ≠ unimportant
- Acknowledge evidence limitations explicitly

## Common Methodology Pitfalls

### Search Strategy Pitfalls
- Overly narrow search (missing relevant studies)
- Overly broad search (unmanageable results)
- Not documenting exact search strings
- Single database search only
- Not searching trial registries for unpublished data
- Not hand-searching references of key papers

### Selection Pitfalls
- Inconsistent application of inclusion/exclusion criteria
- Selection bias (choosing studies supporting hypothesis)
- Language bias (English-only when relevant non-English studies exist)
- Publication bias (ignoring unpublished negative results)
- Duplicate publication counting same patients multiple times

### Extraction Pitfalls
- Extracting data out of context
- Misinterpreting statistical results
- Copying errors
- Not extracting denominator (reporting "5 events" without "out of how many")
- Cherry-picking favorable data points
- Ignoring study limitations

### Synthesis Pitfalls
- Inappropriate averaging of heterogeneous data
- Ignoring outliers without justification
- Creating false consensus
- Overgeneralizing from limited data
- Claiming causation from correlation
- Not acknowledging conflicting evidence

### Reporting Pitfalls
- Incomplete methods (not reproducible)
- Missing PRISMA flow diagram
- Not reporting excluded studies
- Inadequate limitations section
- Overstating conclusions relative to evidence
- Missing conflicts of interest disclosure

## CLAUDE.md Integration

### Anti-Fabrication in Research Methodology

**Score Fabrication Prohibition:**
- Do NOT create composite quality scores without documented rubric
- Do NOT average evidence quality across studies without justification
- Do NOT assign confidence percentages without measurement basis
- Report ranges and heterogeneity, not fabricated consensus

**Evidence Requirements:**
- Every claim must have primary source citation
- Numerical data must include context (sample size, CI, study design)
- Show actual measurements, not theoretical estimates

**Mandatory Skepticism:**
- Default position: findings are preliminary until validated
- List limitations before implications
- Express uncertainty explicitly
- Acknowledge what cannot be determined from available evidence

**Required Language:**
- "Evidence from X studies (n=Y) suggests..."
- "Across Z trials, incidence ranged from A% to B%..."
- "Limitations include..."
- "Cannot determine from available data whether..."
- "Requires external validation before..."

**Banned Language (without extraordinary evidence):**
- "Exceptional safety profile" (say: "Lower incidence compared to...")
- "Clearly demonstrates causation" (say: "Associated with...")
- "Definitive evidence" (say: "Multiple studies suggest...")
- Letter grades without defined rubric
- Confidence scores without statistical basis

## Research Methodology Checklist

### Planning Phase
- [ ] Research question is specific and answerable
- [ ] PICO/PECO framework defined
- [ ] Inclusion/exclusion criteria specified
- [ ] Search strategy documented
- [ ] Databases to search identified
- [ ] Screening process defined
- [ ] Data extraction form created
- [ ] Quality assessment tool selected
- [ ] Synthesis approach planned
- [ ] Timeline and resources allocated

### Execution Phase
- [ ] Search executed and documented
- [ ] Results exported and deduplicated
- [ ] Screening performed consistently
- [ ] PRISMA flow diagram maintained
- [ ] Data extraction completed
- [ ] Quality assessment conducted
- [ ] Evidence synthesis performed
- [ ] Confidence assessment done

### Reporting Phase
- [ ] All required sections present
- [ ] Methods fully reproducible
- [ ] PRISMA flow diagram included
- [ ] Study characteristics table complete
- [ ] Quality assessment results reported
- [ ] Synthesis findings clearly presented
- [ ] Limitations comprehensively acknowledged
- [ ] Bibliography complete with identifiers
- [ ] Conflicts of interest disclosed
- [ ] CLAUDE.md compliance verified

## Resources

**Methodological Guidelines:**
- PRISMA 2020 Statement
- Cochrane Handbook for Systematic Reviews
- GRADE Handbook
- Oxford Centre for Evidence-Based Medicine Levels

**Quality Assessment Tools:**
- Cochrane Risk of Bias tool (RoB 2)
- Newcastle-Ottawa Scale
- GRADE approach

**Reporting Standards:**
- PRISMA 2020 Checklist
- CONSORT (for RCTs)
- STROBE (for observational studies)

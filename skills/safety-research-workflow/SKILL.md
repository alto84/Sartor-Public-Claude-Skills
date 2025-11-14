---
name: Safety Research Workflow
description: Guides systematic safety research including literature review, multi-agent research coordination, citation management, evidence validation, and quality assurance. Use when conducting research studies, coordinating research agents, managing bibliographies, validating research claims, or ensuring research quality.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, WebSearch, WebFetch
---

# Safety Research Workflow Skill

## Overview

This skill provides comprehensive guidance for conducting rigorous, evidence-based safety research with multi-agent coordination, systematic literature review, citation management, and quality assurance. It integrates all four foundational skills to enable high-quality research that adheres to CLAUDE.md anti-fabrication protocols.

Safety research requires the highest standards of evidence and methodology, particularly in medical and pharmaceutical contexts where findings may influence patient care decisions. This skill provides structured workflows, quality gates, and validation procedures to ensure research integrity throughout the entire process.

## When to Use This Skill

Use this skill when:
- Planning or executing systematic literature reviews
- Conducting pharmaceutical or medical safety assessments
- Coordinating multiple research agents with specialized roles
- Managing bibliographies and citations for research reports
- Validating research claims and evidence chains
- Ensuring research quality through automated checks
- Synthesizing findings from multiple sources with proper attribution
- Conducting evidence-based analysis with rigorous methodology

## Core Principles

### 1. Evidence-Based Only
- All claims must be supported by primary sources with valid identifiers (PMID, DOI, URL)
- No fabricated scores, metrics, or confidence levels without measurement data
- Apply CLAUDE.md anti-fabrication protocols throughout research lifecycle
- Maintain evidence chains from observation to conclusion

### 2. Systematic Methodology
- Define research questions clearly before execution
- Establish inclusion/exclusion criteria upfront
- Document search strategies and data sources
- Apply consistent evaluation frameworks
- Track methodology decisions for reproducibility

### 3. Multi-Agent Coordination
- Specialize agents by research task (literature search, evidence extraction, validation, synthesis)
- Apply parallel agent coordination protocols from CLAUDE.md
- Implement quality gates between research stages
- Enable cross-validation between agents
- Preserve disagreement rather than fabricating consensus

### 4. Quality Assurance
- Validate sources for authenticity (detect fake PMIDs, placeholder text, fabricated URLs)
- Check citation completeness and format consistency
- Verify claims against source material
- Apply confidence calibration based on evidence strength
- Document limitations explicitly

### 5. Transparency
- Document uncertainties and knowledge gaps
- Acknowledge conflicting evidence
- Specify confidence levels with justification
- Identify assumptions and their impact
- Make methodology auditable

## Research Workflow Stages

### Stage 1: Planning
**Objective:** Define research scope, questions, methodology, and agent assignments

**Activities:**
- Formulate specific, answerable research questions
- Define search strategy (databases, keywords, date ranges)
- Establish inclusion/exclusion criteria
- Identify required agent specializations
- Set quality standards and acceptance criteria
- Create research plan document

**Quality Gates:**
- Research questions are specific and measurable
- Methodology is reproducible
- Success criteria are defined
- Resource requirements identified

**Integration Points:**
- Use Multi-Agent Orchestration skill to assign agent roles
- Apply Evidence-Based Validation skill to define quality criteria
- Reference Distributed Systems Debugging for process validation

### Stage 2: Literature Search & Collection
**Objective:** Systematically identify and retrieve relevant sources

**Activities:**
- Execute search strategy across defined databases
- Screen results against inclusion/exclusion criteria
- Retrieve full-text articles or abstracts
- Extract bibliographic metadata (authors, title, year, identifiers)
- Track search results and decisions

**Quality Gates:**
- Search strategy is systematic and reproducible
- Inclusion/exclusion criteria applied consistently
- All sources have valid identifiers (PMID, DOI, or accessible URL)
- No placeholder or fabricated sources
- Search coverage is adequate for research question

**Common Pitfalls:**
- Using fabricated PMIDs (e.g., 12345678, sequential patterns)
- Including placeholder titles ("Example Study", "Sample Research")
- Missing source identifiers
- Inconsistent application of inclusion criteria
- Inadequate documentation of search strategy

**Agent Specialization:**
- Agent A: Execute database searches, retrieve sources
- Agent B: Screen for relevance, apply inclusion/exclusion criteria
- Agent C: Extract and validate bibliographic metadata

### Stage 3: Evidence Extraction
**Objective:** Extract relevant data points, findings, and evidence from sources

**Activities:**
- Read full-text sources systematically
- Extract numerical data, study findings, methodology details
- Record evidence with source attribution
- Note study quality indicators (sample size, study design, limitations)
- Track conflicting evidence

**Quality Gates:**
- Every extracted claim has source citation
- Numerical data includes context (sample size, confidence intervals, study population)
- Methodology of source studies is documented
- Limitations are recorded
- Conflicting evidence is preserved

**Common Pitfalls:**
- Extracting data without source attribution
- Ignoring study limitations
- Cherry-picking favorable results
- Misrepresenting statistical significance
- Losing context for numerical claims

**Agent Specialization:**
- Agent A: Extract quantitative findings (incidence rates, effect sizes)
- Agent B: Extract qualitative findings (mechanisms, clinical observations)
- Agent C: Extract methodology and study quality indicators
- Agent D: Cross-validate extracted data against sources

### Stage 4: Evidence Validation
**Objective:** Verify authenticity, quality, and proper attribution of all evidence

**Activities:**
- Validate source identifiers (check PMIDs, verify URLs accessible)
- Detect fabricated or placeholder sources
- Verify extracted data matches source material
- Check for citation errors or misattribution
- Assess source credibility and study quality
- Identify evidence gaps or weaknesses

**Quality Gates:**
- All sources validated as authentic (no fake PMIDs, placeholder text)
- Extracted data matches source claims
- Citations are properly formatted and complete
- Evidence quality is assessed and documented
- Limitations are explicitly stated

**Automated Checks:**
- Run bibliography validation script to detect fabricated sources
- Check citation format consistency
- Verify URL accessibility
- Detect placeholder patterns in titles/authors
- Validate PMID/DOI formats

**Agent Specialization:**
- Agent A: Source authenticity validation
- Agent B: Data accuracy verification (check against sources)
- Agent C: Study quality assessment
- Agent D: Anti-fabrication compliance audit (apply CLAUDE.md rules)

**Integration Points:**
- Use Evidence-Based Validation skill extensively
- Apply source verification patterns from safety-research-system
- Use automated validation scripts

### Stage 5: Synthesis & Analysis
**Objective:** Integrate findings into coherent conclusions with proper attribution

**Activities:**
- Identify patterns and themes across sources
- Synthesize quantitative findings (e.g., incidence ranges across studies)
- Reconcile conflicting evidence
- Draw evidence-based conclusions
- Document synthesis methodology
- Acknowledge uncertainties

**Quality Gates:**
- Synthesis supported by multiple sources
- Conflicting evidence acknowledged
- Conclusions proportional to evidence strength
- Confidence levels justified by evidence quality
- Limitations explicitly documented

**Common Pitfalls:**
- Overgeneralizing from limited evidence
- Creating fabricated "consensus" scores
- Ignoring conflicting evidence
- Claiming higher confidence than evidence supports
- Failing to acknowledge gaps

**Agent Specialization:**
- Agent A: Synthesize quantitative findings
- Agent B: Synthesize qualitative/mechanistic findings
- Agent C: Identify conflicts and uncertainties
- Agent D: Validate synthesis against CLAUDE.md anti-fabrication rules

**Integration Points:**
- Apply Multi-Agent Orchestration for synthesis coordination
- Use Evidence-Based Validation for claim verification
- Apply confidence calibration methodology

### Stage 6: Quality Assurance
**Objective:** Comprehensive validation before finalizing research outputs

**Activities:**
- Run automated quality checks on bibliography
- Verify all claims have source citations
- Check for CLAUDE.md compliance (no fabricated scores, banned language)
- Review methodology documentation
- Assess completeness of limitations section
- Peer review simulation (if using multiple agents)

**Quality Gates:**
- All automated quality checks pass
- No unsupported claims
- CLAUDE.md anti-fabrication compliance verified
- Bibliography complete and properly formatted
- Limitations comprehensively documented
- Methodology is reproducible

**Automated Checks:**
- Run `validate-bibliography.py` for source authenticity
- Run `research-quality-check.py` for claim validation
- Check for banned language patterns
- Verify confidence level justification
- Validate numerical claims have methodology documentation

**Agent Specialization:**
- Agent A: Bibliography completeness audit
- Agent B: Claim-source mapping verification
- Agent C: CLAUDE.md compliance audit
- Agent D: Methodology reproducibility check

**Integration Points:**
- Use Evidence-Based Validation skill for comprehensive audit
- Apply Distributed Systems Debugging for process validation
- Use automated quality scripts

### Stage 7: Documentation & Delivery
**Objective:** Package research findings with complete methodology and supporting materials

**Activities:**
- Compile final research report
- Format bibliography to required standard
- Document search strategy and methodology
- Create executive summary
- Package supporting materials (search logs, evidence extraction tables)
- Archive source materials

**Quality Gates:**
- Report structure is complete
- All sections have proper citations
- Bibliography is complete and correctly formatted
- Methodology is fully documented
- Limitations section is comprehensive
- Supporting materials are organized

**Deliverables:**
- Final research report with complete bibliography
- Methodology documentation
- Executive summary
- Evidence extraction tables (optional)
- Search strategy documentation
- Quality assurance report

## Multi-Agent Research Coordination

### Coordination Patterns

#### Pattern 1: Sequential Pipeline
**Use when:** Research stages have clear dependencies

**Structure:**
```
Agent A (Search) → Agent B (Extraction) → Agent C (Validation) → Agent D (Synthesis)
```

**Coordination:**
- Each agent completes fully before next begins
- Quality gates between agents
- Handoff includes methodology documentation
- Downstream agents verify upstream outputs

**Example:** Systematic literature review where search must complete before extraction

#### Pattern 2: Parallel Specialization
**Use when:** Different research domains can be explored simultaneously

**Structure:**
```
                    ┌→ Agent A (Clinical Evidence)
Research Question ──┼→ Agent B (Mechanistic Studies)
                    └→ Agent C (Regulatory Documents)
                            ↓
                      Agent D (Synthesis)
```

**Coordination:**
- Agents work simultaneously on different domains
- Regular sync points for integration
- Cross-validation between agents
- Final synthesis agent integrates findings

**Example:** Multi-domain safety assessment (clinical, mechanistic, regulatory)

#### Pattern 3: Validator-Executor Loop
**Use when:** Quality assurance requires iterative refinement

**Structure:**
```
Agent A (Executor) ←→ Agent B (Validator)
        ↓
    Final Output
```

**Coordination:**
- Executor produces research output
- Validator audits for quality and compliance
- Executor revises based on validator feedback
- Iterate until quality gates pass

**Example:** Research report development with quality assurance

#### Pattern 4: Cross-Validation Matrix
**Use when:** Maximum rigor required, multiple independent validations needed

**Structure:**
```
Agent A (Primary) → Agent B (Validator 1) ↘
                                           Agent D (Synthesis)
Agent C (Independent) → (no cross-talk) ↗
```

**Coordination:**
- Multiple agents research same question independently
- No communication between primary agents
- Synthesis agent reconciles findings
- Disagreements preserved and documented

**Example:** High-stakes safety assessment requiring independent verification

### Agent Role Specializations

**Literature Search Agent:**
- Execute database queries
- Screen for relevance
- Retrieve full-text sources
- Extract bibliographic metadata
- Document search strategy

**Evidence Extraction Agent:**
- Read sources systematically
- Extract numerical and qualitative data
- Record evidence with citations
- Note study quality indicators
- Track conflicting evidence

**Validation Agent:**
- Verify source authenticity
- Check data accuracy against sources
- Validate citations
- Assess study quality
- Apply anti-fabrication rules

**Synthesis Agent:**
- Integrate findings across sources
- Reconcile conflicting evidence
- Draw evidence-based conclusions
- Calibrate confidence levels
- Document limitations

**Quality Assurance Agent:**
- Audit bibliography completeness
- Verify claim-source mapping
- Check CLAUDE.md compliance
- Validate methodology
- Generate quality reports

### CLAUDE.md Parallel Agent Coordination Applied to Research

**Persona Adoption:**
- Each research agent adopts distinct specialized identity
- Literature Agent focuses on comprehensive source identification
- Validation Agent maintains skeptical, critical perspective
- Synthesis Agent integrates without fabricating consensus

**Complementary Analysis:**
- Literature Agent provides breadth of sources
- Evidence Extraction Agent provides depth of data
- Validation Agent provides quality control
- Synthesis Agent provides integration

**Cross-Validation:**
- Validation Agent checks Literature Agent's sources for authenticity
- Synthesis Agent verifies Evidence Extraction Agent's data against sources
- Quality Assurance Agent audits all agents' outputs

**Synthesis Protocol:**
- Combine insights without fabricating consensus metrics
- Preserve disagreements between agents
- Document where evidence conflicts
- Avoid averaging or creating composite scores without justification

**Anti-Fabrication in Teams:**
- No metric averaging without measurement basis
- Report differing assessments honestly
- Each agent independently validates claims
- More agents does not increase confidence without independent evidence

## Citation & Bibliography Management

### Citation Standards

**Required Elements:**
- Authors (all or "et al." for >3)
- Title (complete, no placeholders)
- Journal/source name
- Year of publication
- Volume and issue (if applicable)
- Page numbers or article identifier
- At least one of: PMID, DOI, or accessible URL

**Prohibited:**
- Fabricated PMIDs (sequential like 12345678, repetitive like 11111111)
- Placeholder titles ("Example Study", "Sample Research", "Test Paper")
- Placeholder authors ("Smith et al.", "Doe et al." without full citation)
- Fake URLs (example.com, test.com, localhost)
- Missing identifiers
- Incomplete citations

### Citation Formats

**Medical/Clinical Research:**
```
Author A, Author B, Author C. Title of the article. Journal Name. Year;Volume(Issue):Pages. PMID: 12345678. DOI: 10.1234/journal.2024.56789
```

**Technical/Engineering:**
```
Author A, Author B (Year). Title of the article. Journal Name, Volume(Issue), Pages. https://doi.org/10.1234/journal.2024.56789
```

**Regulatory Documents:**
```
Regulatory Agency. Document Title. Publication Date. Accessed: Date. URL
```

### Bibliography Quality Checks

Use `validate-bibliography.py` to check:
- PMID format validity and fabrication detection
- URL accessibility and placeholder detection
- Title/author placeholder pattern detection
- Citation format consistency
- Identifier completeness
- Duplicate detection

### Source Verification Patterns

**Valid PMID Characteristics:**
- 1-8 digits only
- Not sequential (12345678, 23456789)
- Not repetitive (11111111, 99999999)
- Not obviously fabricated

**Valid URL Characteristics:**
- Starts with http:// or https://
- Has valid domain (not example.com, test.com, localhost)
- Resolves to accessible resource (HTTP 200/300 status)
- Not containing "placeholder", "fake", "dummy", "test"

**Valid DOI Characteristics:**
- Starts with "10."
- Has proper format: 10.XXXX/identifier

## Quality Assurance Automation

### Bibliography Validation Script

**Purpose:** Detect fabricated or incomplete sources

**Checks:**
- PMID format and authenticity patterns
- URL accessibility
- Title/author placeholder detection
- Citation format consistency
- Identifier completeness

**Usage:**
```bash
python scripts/validate-bibliography.py <bibliography_file>
```

**Output:**
- List of validation issues by source
- Severity classification (critical, warning, info)
- Suggested fixes
- Summary statistics

### Research Quality Check Script

**Purpose:** Validate research claims and CLAUDE.md compliance

**Checks:**
- Unsupported claims (assertions without citations)
- Banned language (without evidence)
- Score fabrication
- Confidence level justification
- Methodology documentation
- Limitations completeness

**Usage:**
```bash
python scripts/research-quality-check.py <research_report>
```

**Output:**
- List of compliance issues
- CLAUDE.md violations
- Unsupported claims
- Missing citations
- Quality score breakdown

## Common Research Pitfalls

### Fabrication Pitfalls
- Creating fake PMIDs to fill citation gaps
- Using placeholder sources ("Example Study")
- Fabricating consensus scores without measurement
- Creating weighted averages without calculation basis
- Claiming higher confidence than evidence supports

### Methodology Pitfalls
- Inconsistent application of inclusion criteria
- Cherry-picking favorable results
- Ignoring conflicting evidence
- Inadequate documentation of search strategy
- Missing limitations section

### Citation Pitfalls
- Incomplete bibliographic information
- Inaccessible URLs
- Format inconsistency across citations
- Missing source identifiers
- Duplicate citations with different numbering

### Synthesis Pitfalls
- Overgeneralizing from limited evidence
- Misrepresenting study findings
- Losing context for numerical claims
- Failing to acknowledge uncertainties
- Creating false consensus across agents

## Integration with Other Skills

### Skill #1: Evidence-Based Validation
**How it integrates:**
- Apply rigorous validation to all research claims
- Use anti-fabrication protocols throughout research lifecycle
- Validate sources for authenticity
- Check confidence calibration
- Ensure proper evidence chains

**Example:**
When validating bibliography, use Evidence-Based Validation skill to:
1. Check each PMID for fabrication patterns
2. Verify URLs are accessible
3. Detect placeholder text in titles/authors
4. Ensure all claims have source citations
5. Validate confidence levels against evidence quality

### Skill #2: MCP Server Development
**How it integrates:**
- Create research tools accessible via MCP
- Enable research agents to communicate via MCP protocol
- Build bibliography management MCP servers
- Create validation services as MCP tools

**Example:**
Build MCP server for bibliography validation:
- Tool: `validate_sources` - check source authenticity
- Tool: `check_citation_format` - verify citation consistency
- Tool: `verify_pmid` - validate PMID against PubMed API
- Tool: `assess_evidence_quality` - evaluate study quality indicators

### Skill #3: Multi-Agent Orchestration
**How it integrates:**
- Apply coordination patterns to research agent teams
- Implement quality gates between research stages
- Enable parallel research execution with synthesis
- Coordinate cross-validation between agents

**Example:**
For systematic literature review:
1. Orchestrator assigns search to Agent A
2. Agent A completes, passes to Agent B (extraction)
3. Agent C validates Agent A's sources (parallel with Agent B)
4. Agent D synthesizes Agent B's extractions after Agent C validates
5. Quality gates enforce validation before proceeding

### Skill #4: Distributed Systems Debugging
**How it integrates:**
- Debug multi-agent research processes
- Validate research workflow execution
- Trace evidence chains through research pipeline
- Identify bottlenecks in research coordination

**Example:**
When research quality is insufficient:
1. Trace which agent produced problematic output
2. Check inputs/outputs at each stage
3. Validate agent coordination worked correctly
4. Identify where quality gates failed
5. Verify methodology was followed systematically

## Advanced Research Patterns

### Systematic Literature Review
Full workflow in `workflows/systematic-literature-review.md`

**Stages:**
1. Protocol development (research question, criteria, search strategy)
2. Systematic search execution
3. Screening (title/abstract, then full-text)
4. Data extraction
5. Quality assessment
6. Evidence synthesis
7. Report generation

**Quality Standards:**
- PRISMA compliance (Preferred Reporting Items for Systematic Reviews)
- Pre-registered protocol
- Reproducible search strategy
- Systematic screening process
- Bias assessment
- Comprehensive bibliography

### Multi-Agent Research Project
Full workflow in `workflows/multi-agent-research-project.md`

**Phases:**
1. Planning: Define research questions, assign agent roles
2. Parallel execution: Agents work on specialized domains
3. Cross-validation: Agents verify each other's findings
4. Synthesis: Integration agent combines findings
5. Quality assurance: Validation agent audits final output
6. Delivery: Package with methodology documentation

**Coordination:**
- Clear agent role definitions
- Quality gates between phases
- Regular sync points
- Cross-validation protocols
- Final synthesis with preserved disagreements

### Evidence-Based Safety Assessment
Pattern from safety-research-system ADC/ILD project

**Structure:**
1. Research Question: "What is the mechanistic basis for ADC-associated ILD?"
2. Agent Assignments:
   - Agent A: Clinical evidence (incidence, outcomes, risk factors)
   - Agent B: Mechanistic studies (molecular pathways, preclinical data)
   - Agent C: Treatment protocols (management, outcomes)
   - Agent D: Validation and synthesis
3. Quality Gates:
   - All sources validated for authenticity
   - Evidence extracted with proper attribution
   - Claims verified against sources
   - CLAUDE.md compliance checked
4. Deliverable: Comprehensive review with 165+ validated citations

## Limitations of This Skill

This skill does NOT:
- Replace domain expertise in research topics
- Automatically execute research (requires human judgment)
- Guarantee research validity (depends on source quality)
- Eliminate all research pitfalls (vigilance still required)
- Provide statistical analysis tools (separate skill needed)
- Replace peer review (human expert review still essential)

This skill DOES:
- Provide systematic methodology to reduce errors
- Enable quality automation to catch common pitfalls
- Structure multi-agent research coordination
- Enforce evidence standards and anti-fabrication rules
- Facilitate reproducible research workflows
- Guide bibliography management and validation

## References & Resources

**Internal Resources:**
- `reference/research-methodology.md` - Detailed research methods
- `reference/multi-agent-research.md` - Agent coordination patterns
- `reference/citation-management.md` - Citation standards and validation
- `reference/quality-assurance.md` - QA procedures and checklists
- `reference/skill-integration.md` - How this skill integrates others
- `templates/research-plan-template.md` - Research planning template
- `templates/literature-review-template.md` - Literature review structure
- `workflows/systematic-literature-review.md` - Complete workflow
- `workflows/multi-agent-research-project.md` - Multi-agent workflow
- `examples/research-workflows.md` - Real research examples
- `scripts/validate-bibliography.py` - Bibliography validation
- `scripts/research-quality-check.py` - Quality assurance automation

**External Standards:**
- PRISMA: Systematic review reporting standard
- CLAUDE.md: Anti-fabrication protocols (mandatory compliance)
- Evidence-Based Medicine hierarchy
- Research reproducibility guidelines

## Skill Metadata

**Version:** 1.0.0
**Created:** 2025-10-18
**Dependencies:** Evidence-Based Validation, Multi-Agent Orchestration, MCP Server Development, Distributed Systems Debugging
**Skill Level:** Advanced
**Domain:** Research methodology, safety assessment, evidence synthesis
**Quality Standard:** Medical/pharmaceutical research grade

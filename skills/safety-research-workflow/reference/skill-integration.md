# Skill Integration: Safety Research Workflow with All Skills

## Overview

The Safety Research Workflow skill is the capstone skill that integrates all four foundational skills to enable rigorous, evidence-based research with multi-agent coordination. This document details how each skill enhances research quality and provides concrete integration examples.

## Integration Architecture

```
                  Safety Research Workflow (Skill #5)
                            |
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    Skill #1           Skill #2           Skill #3          Skill #4
Evidence-Based      MCP Server        Multi-Agent      Distributed Systems
  Validation       Development      Orchestration         Debugging
     │                  │                  │                  │
     │                  │                  │                  │
     └──────────────────┴──────────────────┴──────────────────┘
                            │
                    Research Quality Assurance
```

## Skill #1: Evidence-Based Validation Integration

### How It Integrates

Evidence-Based Validation is the **foundation** of research quality. Every research claim, source, and conclusion must pass rigorous validation.

### Integration Points

**1. Source Validation:**
- Apply Evidence-Based Validation to detect fabricated PMIDs
- Validate bibliography authenticity using anti-fabrication protocols
- Verify all sources before proceeding to extraction

**2. Claim Verification:**
- Every extracted data point validated against source material
- Numerical claims must include evidence chain (source → extraction → synthesis)
- Confidence calibration based on evidence quality, not opinion

**3. CLAUDE.md Compliance:**
- Score fabrication prohibition enforced throughout research
- Banned language detection during synthesis
- Mandatory limitations documentation

**4. Quality Gates:**
- Research cannot proceed if Evidence-Based Validation fails
- Each workflow stage has validation checkpoint
- Final QA uses Evidence-Based Validation extensively

### Concrete Example: Bibliography Validation

```python
# From Evidence-Based Validation Skill
from evidence_validation import SourceValidator

validator = SourceValidator()

# Validate each source in bibliography
for source in bibliography:
    result = validator.validate_source(
        pmid=source.get('pmid'),
        doi=source.get('doi'),
        url=source.get('url'),
        title=source.get('title'),
        authors=source.get('authors')
    )

    if result.status == 'FAIL':
        # Critical issues detected
        if result.has_fake_pmid:
            raise ValidationError(f"Fabricated PMID detected: {source['pmid']}")
        if result.has_placeholder:
            raise ValidationError(f"Placeholder source detected: {source['title']}")

    # Log validation results
    log_validation(source_id=source['id'], result=result)
```

**Impact:** Zero fabricated sources in final research outputs.

### Example from ADC/ILD Research

**Before Evidence-Based Validation:**
- 165 sources cited in review
- Unknown authenticity
- Potential for fabricated PMIDs

**After Evidence-Based Validation:**
- All 165 sources validated for authenticity
- 146/165 (88.5%) have verified PMIDs
- 165/165 (100%) have verified DOIs
- 0 fabricated sources detected
- 0 placeholder text found

**Quality Metric:** 100% source authenticity verification

## Skill #2: MCP Server Development Integration

### How It Integrates

MCP enables research tools and agents to communicate via standardized protocol, facilitating distributed research workflows.

### Integration Points

**1. Research Tools as MCP Servers:**
- Bibliography validation exposed as MCP tool
- PubMed search as MCP server
- Citation formatter as MCP tool
- Quality checker as MCP service

**2. Agent Communication:**
- Research agents communicate via MCP protocol
- Handoffs between agents use structured MCP messages
- Progress tracking through MCP notifications

**3. External Service Integration:**
- PubMed API accessed via MCP server
- DOI resolution service via MCP
- Full-text retrieval via MCP tools

### Concrete Example: Bibliography Validation MCP Server

```python
# MCP Server for Bibliography Validation
from mcp import MCPServer, Tool

class BibliographyValidationServer(MCPServer):
    """MCP server providing bibliography validation tools."""

    def __init__(self):
        super().__init__(name="bibliography-validator")
        self.register_tools()

    def register_tools(self):
        """Register validation tools."""

        @self.tool("validate_sources")
        def validate_sources(sources: List[Dict]) -> Dict:
            """Validate list of sources for authenticity."""
            validator = BibliographyValidator()
            return validator.validate_sources(sources)

        @self.tool("check_pmid")
        def check_pmid(pmid: str) -> Dict:
            """Check if PMID is valid and not fabricated."""
            return {
                'valid_format': re.match(r'^\d{1,8}$', pmid) is not None,
                'is_fabricated': pmid in FAKE_PMIDS,
                'is_sequential': is_sequential_pattern(pmid)
            }

        @self.tool("verify_doi")
        def verify_doi(doi: str) -> Dict:
            """Verify DOI resolves to article."""
            response = requests.get(f"https://doi.org/{doi}")
            return {
                'resolves': response.status_code in [200, 301, 302],
                'url': response.url if response.ok else None
            }

# Usage in research workflow
mcp_client = MCPClient()
result = mcp_client.call_tool(
    server="bibliography-validator",
    tool="validate_sources",
    arguments={"sources": bibliography}
)
```

**Impact:** Research tools accessible to all agents via standardized interface.

### Example Use Case

**Research Coordination via MCP:**
1. Literature Agent searches PubMed via MCP PubMed server
2. Returns sources to Orchestrator via MCP response
3. Validation Agent validates sources via MCP validation server
4. Results communicated back to Orchestrator via MCP
5. All communication logged and traceable

## Skill #3: Multi-Agent Orchestration Integration

### How It Integrates

Multi-Agent Orchestration patterns structure how specialized research agents collaborate, coordinate, and cross-validate.

### Integration Points

**1. Research Agent Specialization:**
- Literature Search Agent (comprehensive source identification)
- Evidence Extraction Agent (detailed data extraction)
- Validation Agent (quality control and authenticity)
- Synthesis Agent (integration and conclusion development)
- QA Agent (final compliance and quality audit)

**2. Coordination Patterns:**
- Sequential Pipeline: Search → Extract → Validate → Synthesize → QA
- Parallel Specialization: Multiple domains researched simultaneously
- Iterative Refinement: Executor ↔ Validator loop until quality gates pass
- Cross-Validation: Independent agents verify findings

**3. Quality Gates:**
- Each agent transition has quality gate
- Downstream agent validates upstream outputs
- Failures trigger revision or escalation

**4. CLAUDE.md Parallel Agent Protocols:**
- Distinct persona adoption (each agent has specialized perspective)
- Complementary analysis (agents provide unique contributions)
- Cross-validation (agents verify each other's work)
- Disagreement preservation (conflicts documented, not hidden)

### Concrete Example: Multi-Agent Literature Review

```python
# Orchestrate multi-agent literature review
from orchestration import Orchestrator, QualityGate

orchestrator = Orchestrator()

# Define agents
lit_agent = LiteratureSearchAgent(persona="comprehensive, systematic")
extract_agent = EvidenceExtractionAgent(persona="detail-oriented, precise")
validate_agent = ValidationAgent(persona="skeptical, critical")
synthesis_agent = SynthesisAgent(persona="integrative, cautious")
qa_agent = QualityAssuranceAgent(persona="compliance-focused, thorough")

# Define workflow with quality gates
workflow = [
    {
        'agent': lit_agent,
        'task': 'search_literature',
        'inputs': research_question,
        'quality_gate': QualityGate(
            criteria=['all_sources_have_identifiers', 'no_fabricated_sources'],
            validator=validate_agent
        )
    },
    {
        'agent': extract_agent,
        'task': 'extract_evidence',
        'inputs': 'output_from:lit_agent',
        'quality_gate': QualityGate(
            criteria=['all_claims_have_citations', 'data_matches_sources'],
            validator=validate_agent
        )
    },
    {
        'agent': synthesis_agent,
        'task': 'synthesize_findings',
        'inputs': 'output_from:extract_agent',
        'quality_gate': QualityGate(
            criteria=['conclusions_supported', 'claude_md_compliant'],
            validator=qa_agent
        )
    }
]

# Execute workflow with quality gates
result = orchestrator.execute_workflow(workflow)

# Quality gates enforce standards
if not result.all_gates_passed:
    # Failed quality gate triggers revision
    failed_gate = result.get_first_failure()
    print(f"Quality gate failed: {failed_gate.criteria_failed}")
    print(f"Agent must revise: {failed_gate.agent}")
```

**Impact:** Structured coordination ensures quality at each stage.

### Example from ADC/ILD Research

**Multi-Agent Coordination:**
- Agent A: Clinical trials and outcomes (47 sources)
- Agent B: Mechanistic studies (15 sources)
- Agent C: Treatment protocols (23 sources)
- Agent D: Regulatory documents (7 sources)
- Agent E: Recent 2023-2025 updates (73 sources)

**Quality Gates:**
- After Agent A: Validator checks all sources authentic → PASS (0 fabricated)
- After Agent B: Validator checks data accuracy → 2 corrections needed → REVISED → PASS
- After Synthesis (Agent D integrates): QA checks CLAUDE.md compliance → PASS
- Final QA: All 165 sources validated → PASS

**Result:** Comprehensive 165-reference review with zero fabrication, coordinated across 5 specialized agents.

## Skill #4: Distributed Systems Debugging Integration

### How It Integrates

Debugging methodology helps validate research processes, trace evidence chains, and identify quality issues systematically.

### Integration Points

**1. Research Process Validation:**
- Trace how evidence flows from source → extraction → synthesis
- Identify where quality degraded
- Debug multi-agent coordination issues

**2. Evidence Chain Tracing:**
- Track claim back to original source
- Verify transformations preserve accuracy
- Identify where context lost

**3. Quality Issue Diagnosis:**
- When validation fails, debug why
- Systematic investigation of root causes
- Identify process improvements

**4. Performance Optimization:**
- Identify bottlenecks in research workflow
- Optimize agent coordination
- Reduce rework through better quality gates

### Concrete Example: Debugging Evidence Chain

```python
# Debugging tools for research
from debugging import EvidenceTracer, ProcessValidator

# Scenario: Synthesis contains claim that seems unsupported
claim = "ILD incidence is 15.2%"

# Trace evidence chain
tracer = EvidenceTracer()
chain = tracer.trace_claim(claim)

print(f"Claim: {claim}")
print(f"  → Synthesis Agent: {chain.synthesis_doc_ref}")
print(f"  → Extraction Agent: {chain.extraction_table_ref}")
print(f"  → Original Source: {chain.source_citation}")

# Validate each step
validator = ProcessValidator()

# Step 1: Does source contain claim?
source_check = validator.verify_source_contains(
    source=chain.source,
    claim=claim
)
print(f"Source contains claim: {source_check.found}")
if source_check.found:
    print(f"  Exact text: {source_check.matching_text}")

# Step 2: Was extraction accurate?
extraction_check = validator.verify_extraction_accuracy(
    source_text=source_check.matching_text,
    extracted_data=chain.extraction
)
print(f"Extraction accurate: {extraction_check.accurate}")
if not extraction_check.accurate:
    print(f"  Source says: {source_check.matching_text}")
    print(f"  Extraction says: {chain.extraction}")
    print(f"  Discrepancy: {extraction_check.discrepancy}")

# Step 3: Was synthesis faithful to extraction?
synthesis_check = validator.verify_synthesis_faithful(
    extraction=chain.extraction,
    synthesis_claim=claim
)
print(f"Synthesis faithful: {synthesis_check.faithful}")

# Result: Identify where error occurred
if not source_check.found:
    print("ERROR: Claim not in source → unsupported claim")
elif not extraction_check.accurate:
    print("ERROR: Extraction inaccurate → fix extraction")
elif not synthesis_check.faithful:
    print("ERROR: Synthesis misrepresents extraction → fix synthesis")
else:
    print("VALIDATED: Evidence chain complete and accurate")
```

**Impact:** Can trace and validate every claim in research back to primary source.

### Example Debugging Session

**Problem:** Final QA flags potential unsupported claim

**Investigation:**
1. Use EvidenceTracer to map claim to source
2. Source found: Modi 2022, PMID 35665782
3. Extraction shows: "15.2% (85/557)"
4. Source verification: Article states "Drug-related ILD occurred in 15.2% (85/557 patients) as adjudicated"
5. Extraction accurate ✓
6. Synthesis check: Synthesis states "15.2%" without denominator
7. Issue identified: Context lost in synthesis

**Fix:** Add denominator in synthesis: "15.2% (85/557 patients)"

**Process Improvement:** Update synthesis agent instructions to preserve denominators

## Integrated Research Workflow Example

### Complete ADC/ILD Safety Assessment

**Task:** Conduct comprehensive safety assessment of ADC-associated ILD

**Skills Integration:**

**Phase 1: Planning (All Skills)**
- Define research question (PICO framework)
- Assign specialized agents (Skill #3: Multi-Agent Orchestration)
- Set quality standards (Skill #1: Evidence-Based Validation)
- Document methodology for reproducibility

**Phase 2: Literature Search (Skills #1, #2, #3)**
- Agent A searches PubMed via MCP server (Skill #2: MCP)
- Returns 127 sources
- Agent B (Validator) runs Evidence-Based Validation (Skill #1)
- Detects 3 fabricated PMIDs → Agent A fixes → Re-validates → PASS
- Quality gate enforced by Orchestrator (Skill #3)

**Phase 3: Evidence Extraction (Skills #1, #3, #4)**
- Agent C extracts ILD incidence data systematically
- Agent B validates extractions against sources (Skill #1)
- 2 discrepancies found → debugged using evidence tracing (Skill #4)
- Issues: extraction missing denominators → fixed
- Quality gate: All data has citations and context → PASS

**Phase 4: Synthesis (Skills #1, #3)**
- Agent D integrates findings across 165 sources
- Preserves disagreements (CLAUDE.md protocol via Skill #3)
- Agent B validates CLAUDE.md compliance (Skill #1)
- No score fabrication, appropriate hedging, comprehensive limitations
- Quality gate: CLAUDE.md compliant → PASS

**Phase 5: Final QA (All Skills)**
- Agent E (QA) runs comprehensive validation
- Bibliography check (Skill #1): 165 sources, 0 fabricated → PASS
- Claim check (Skill #4): Traced 127 claims to sources → ALL supported
- CLAUDE.md check (Skill #1): 0 violations → PASS
- Process validation (Skill #3): All quality gates passed → PASS

**Deliverable:**
- Comprehensive ADC/ILD review with 165 validated citations
- All claims supported by primary evidence
- CLAUDE.md compliant
- Publication-ready quality
- Methodology fully documented and reproducible

**Quality Metrics:**
- 0 fabricated sources (Skill #1)
- 100% claim-source mapping (Skill #4)
- 0 CLAUDE.md violations (Skill #1)
- 5 agents coordinated successfully (Skill #3)
- Research tools accessed via MCP (Skill #2)

## Integration Benefits

### Benefit 1: Layered Quality Assurance

Each skill provides quality layer:
- Skill #1: Prevents fabrication and enforces evidence standards
- Skill #2: Enables tool accessibility and agent communication
- Skill #3: Structures coordination and enforces quality gates
- Skill #4: Validates processes and traces evidence chains

**Result:** Multiple independent quality checks catch issues earlier.

### Benefit 2: Systematic Methodology

Integration provides:
- Clear workflow stages (Skill #3 orchestration)
- Quality gates between stages (Skill #1 validation)
- Traceable processes (Skill #4 debugging)
- Accessible tools (Skill #2 MCP)

**Result:** Reproducible, auditable research methodology.

### Benefit 3: Evidence Integrity

All skills reinforce evidence integrity:
- Sources validated for authenticity (Skill #1)
- Extraction verified against sources (Skill #4)
- Synthesis faithful to evidence (Skill #1 CLAUDE.md)
- Processes coordinated to maintain integrity (Skill #3)

**Result:** Research outputs you can trust.

### Benefit 4: Efficiency Through Specialization

- Agents specialize by skill (Skill #3)
- Tools accessible via standard interface (Skill #2)
- Quality automated where possible (Skill #1 scripts)
- Debugging systematic when issues arise (Skill #4)

**Result:** Faster research without compromising quality.

## Skill Dependency Matrix

| Research Activity | Skill #1 | Skill #2 | Skill #3 | Skill #4 |
|-------------------|----------|----------|----------|----------|
| Source validation | ✓✓✓ | ✓ | - | ✓ |
| Literature search | ✓ | ✓✓ | ✓✓ | - |
| Evidence extraction | ✓✓ | - | ✓✓ | ✓✓ |
| Agent coordination | ✓ | ✓✓ | ✓✓✓ | ✓ |
| Synthesis | ✓✓✓ | - | ✓✓ | ✓ |
| Quality assurance | ✓✓✓ | ✓ | ✓ | ✓✓ |
| Process debugging | ✓ | - | ✓ | ✓✓✓ |

✓✓✓ = Primary skill for this activity
✓✓ = Important supporting skill
✓ = Minor supporting skill
\- = Not directly applicable

## Conclusion

The Safety Research Workflow skill achieves research quality through integration:

1. **Evidence-Based Validation** ensures every claim is supported, every source is authentic, and CLAUDE.md compliance is enforced
2. **MCP Server Development** provides tool accessibility and agent communication infrastructure
3. **Multi-Agent Orchestration** structures specialized agent coordination with quality gates
4. **Distributed Systems Debugging** enables process validation and evidence tracing

Together, these skills create a research system with:
- Zero fabrication tolerance
- Systematic methodology
- Multi-layer quality assurance
- Traceable evidence chains
- Reproducible processes
- Publication-grade outputs

**The whole is greater than the sum of the parts.**

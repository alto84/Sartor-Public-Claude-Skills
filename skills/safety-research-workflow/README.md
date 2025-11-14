# Safety Research Workflow Skill

**Version:** 1.0.0
**Created:** 2025-10-18
**Skill Type:** Advanced Research Methodology

## Overview

The Safety Research Workflow skill provides comprehensive guidance for conducting rigorous, evidence-based safety research with multi-agent coordination, systematic literature review, citation management, and quality assurance. This is the capstone skill that integrates all four foundational skills to enable publication-grade research outputs.

## When to Use This Skill

Use this skill when you need to:
- Conduct systematic literature reviews
- Perform pharmaceutical or medical safety assessments
- Coordinate multiple research agents with specialized roles
- Manage bibliographies and citations for research reports
- Validate research claims and evidence chains
- Ensure research quality through automated checks
- Synthesize findings from multiple sources with proper attribution

## Quick Start

1. **Read SKILL.md** for complete methodology and workflows
2. **Use templates** to plan your research project
3. **Run validation scripts** to check bibliography and compliance
4. **Follow workflows** for systematic execution
5. **Review examples** to see real research in action

## File Structure

```
safety-research-workflow/
├── SKILL.md                          # Main skill documentation
├── README.md                         # This file
│
├── reference/                        # Detailed reference materials
│   ├── research-methodology.md       # Systematic review methodology
│   ├── multi-agent-research.md       # Agent coordination patterns
│   ├── citation-management.md        # Bibliography standards
│   ├── quality-assurance.md          # QA procedures
│   └── skill-integration.md          # How this skill uses others
│
├── templates/                        # Planning templates
│   ├── research-plan-template.md     # Complete research planning
│   └── literature-review-template.md # Literature review structure
│
├── scripts/                          # Automation tools
│   ├── validate-bibliography.py      # Source authenticity validation
│   └── research-quality-check.py     # CLAUDE.md compliance check
│
├── workflows/                        # Step-by-step workflows
│   ├── systematic-literature-review.md  # Systematic review process
│   └── multi-agent-research-project.md  # Multi-agent coordination
│
└── examples/                         # Real research examples
    └── adc-ild-research-workflow.md  # Complete workflow example
```

## Key Features

### 1. Evidence-Based Methodology
- Systematic literature search with documented strategy
- Rigorous source validation (detect fake PMIDs, placeholders)
- Evidence extraction with proper attribution
- Synthesis based on actual evidence, not fabrication

### 2. Multi-Agent Coordination
- Specialized research agents (search, extract, validate, synthesize, QA)
- Coordination patterns from CLAUDE.md protocols
- Quality gates between workflow stages
- Cross-validation and disagreement preservation

### 3. Quality Assurance
- Automated validation scripts for bibliography and compliance
- CLAUDE.md anti-fabrication enforcement
- Multi-layer quality checks (automated + manual)
- Comprehensive limitations documentation

### 4. Integration of All Skills
- **Skill #1 (Evidence-Based Validation):** Validate all claims and sources
- **Skill #2 (MCP Server Development):** Research tools via MCP
- **Skill #3 (Multi-Agent Orchestration):** Coordinate research agents
- **Skill #4 (Distributed Systems Debugging):** Trace evidence chains

## Validation Scripts

### validate-bibliography.py

**Purpose:** Detect fabricated sources and format issues

**Usage:**
```bash
python scripts/validate-bibliography.py bibliography.md [--check-access] [--strict]
```

**Checks:**
- PMID format and authenticity (detects fake PMIDs)
- DOI format and validity
- URL accessibility and placeholder detection
- Title/author placeholder patterns
- Citation completeness

**Example Output:**
```
=== Bibliography Validation Report ===

Total Citations: 165
PMIDs: 146/165 (88.5%)
DOIs: 165/165 (100%)

CRITICAL ISSUES: 0
WARNINGS: 0

OVERALL STATUS: PASS
```

### research-quality-check.py

**Purpose:** Validate research quality and CLAUDE.md compliance

**Usage:**
```bash
python scripts/research-quality-check.py manuscript.md [--check-all]
```

**Checks:**
- Unsupported claims (assertions without citations)
- CLAUDE.md violations (score fabrication, banned language)
- Confidence level justifications
- Limitations section presence

**Example Output:**
```
=== Research Quality Check Report ===

CLAUDE.MD COMPLIANCE:
✓ Score fabrication: 0 violations
✓ Banned language: 0 violations
✓ Unsupported claims: 0

OVERALL QUALITY: EXCELLENT
Status: PASS
```

## Research Workflow Stages

1. **Planning:** Define research question, assign agents, set standards
2. **Search:** Systematic literature identification with documented strategy
3. **Extraction:** Data extraction with source attribution
4. **Validation:** Source authenticity and data accuracy verification
5. **Synthesis:** Evidence integration with proper hedging
6. **Quality Assurance:** Comprehensive automated + manual validation
7. **Documentation:** Package with methodology and supporting materials

## Quality Standards

### Bibliography Requirements
- 100% of sources have valid identifier (PMID, DOI, or URL)
- 0 fabricated sources (no fake PMIDs, no placeholders)
- >80% with PMID (medical research)
- >90% with DOI
- Format consistency across all citations

### Evidence Requirements
- 100% of claims have source citations
- >95% of numerical claims have context (n, CI)
- Conflicting evidence documented
- Limitations comprehensively stated

### CLAUDE.md Requirements
- 0 score fabrications (no scores >80% without validation)
- 0 banned language violations
- 0 unsupported claims
- Mandatory limitations section
- Appropriate confidence calibration

## Example Research Project

See `examples/adc-ild-research-workflow.md` for complete real-world example:

**Project:** ADC-ILD Comprehensive Review
**Duration:** 8 days
**Sources:** 165 validated citations
**Quality:** 0 fabricated sources, 100% claim-source mapping, CLAUDE.md compliant
**Outcome:** Publication-ready comprehensive review

**Key Metrics:**
- 146/165 (88.5%) with verified PMIDs
- 165/165 (100%) with DOIs
- 127/127 (100%) claims cited
- 0 CLAUDE.md violations
- 0 fabricated sources detected

## Integration with Other Skills

### Evidence-Based Validation (Skill #1)
- Validates all sources for authenticity
- Enforces CLAUDE.md anti-fabrication protocols
- Checks claim-source mapping
- **Use throughout research lifecycle**

### MCP Server Development (Skill #2)
- Research tools accessible via MCP
- Agent communication via MCP protocol
- External services (PubMed, DOI) via MCP
- **Use for tool infrastructure**

### Multi-Agent Orchestration (Skill #3)
- Coordinates specialized research agents
- Implements quality gates between stages
- Applies CLAUDE.md coordination protocols
- **Use for agent coordination**

### Distributed Systems Debugging (Skill #4)
- Traces evidence chains
- Validates research processes
- Debugs quality issues
- **Use for process validation**

## Common Research Pitfalls (Avoided)

**Fabrication:**
- Creating fake PMIDs → Detected by validate-bibliography.py
- Using placeholder sources → Detected by pattern matching
- Fabricating consensus scores → Prevented by CLAUDE.md checks

**Methodology:**
- Inconsistent inclusion criteria → Prevented by documented protocol
- Cherry-picking results → Prevented by comprehensive search
- Inadequate limitations → Required by quality gates

**Citation:**
- Incomplete bibliographic info → Detected by completeness checks
- Inaccessible URLs → Detected by accessibility checks
- Missing source identifiers → Flagged as critical issue

## Getting Started

### For Systematic Literature Review:

1. **Use research-plan-template.md** to plan your project
2. **Define PICO question** for focused search
3. **Assign specialized agents** (search, extract, validate, synthesize, QA)
4. **Execute systematic search** with documented strategy
5. **Validate bibliography** using validate-bibliography.py
6. **Extract evidence** with citations for every claim
7. **Synthesize findings** with appropriate confidence
8. **Check compliance** using research-quality-check.py
9. **Final QA** before delivery

### For Safety Assessment:

1. **Review examples/adc-ild-research-workflow.md** for real example
2. **Follow multi-agent workflow** from workflows/
3. **Apply quality gates** between each stage
4. **Use validation scripts** continuously, not just at end
5. **Integrate all 5 skills** for comprehensive quality

## Best Practices

1. **Validate early and often** - Run scripts after each stage, not just at end
2. **Document as you go** - Easier than reconstructing later
3. **Use quality gates strictly** - Don't proceed if validation fails
4. **Preserve disagreements** - Don't fabricate consensus
5. **Be skeptical** - Default to "needs more evidence" not "probably true"
6. **Acknowledge limitations** - Comprehensive limitations section required
7. **Cite everything** - Every claim needs source attribution

## Success Metrics

Research using this skill should achieve:
- ✓ 0 fabricated sources
- ✓ 100% claim-source mapping
- ✓ 0 CLAUDE.md violations
- ✓ Comprehensive limitations documented
- ✓ Methodology fully reproducible
- ✓ Publication-ready quality

## Support & Resources

**Documentation:**
- SKILL.md - Complete methodology
- reference/ - Detailed guides
- workflows/ - Step-by-step processes
- examples/ - Real research demonstrations

**Tools:**
- validate-bibliography.py - Source validation
- research-quality-check.py - Quality checking

**Standards:**
- PRISMA 2020 - Systematic review reporting
- GRADE - Evidence certainty assessment
- CLAUDE.md - Anti-fabrication protocols

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-18 | Initial release |

## Dependencies

**Required Skills:**
- Evidence-Based Validation (Skill #1)
- Multi-Agent Orchestration (Skill #3)

**Optional Skills:**
- MCP Server Development (Skill #2) - for tool infrastructure
- Distributed Systems Debugging (Skill #4) - for process validation

**External Standards:**
- CLAUDE.md protocols (mandatory)
- PRISMA guidelines (recommended for systematic reviews)

## License

Part of Claude Code skills ecosystem.

## Contact

For issues or questions, consult the skill documentation or refer to safety-research-system source project.

---

**Remember:** Your value comes from honest, accurate assessment based on evidence, not from generating impressive-sounding but unfounded scores.

**This skill enables research you can trust.**

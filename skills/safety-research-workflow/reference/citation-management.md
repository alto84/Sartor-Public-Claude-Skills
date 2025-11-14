# Citation & Bibliography Management

## Overview

Proper citation management is critical for research integrity and reproducibility. This guide provides standards, validation methods, and automation tools for managing research bibliographies.

## Citation Format Standards

### Medical/Clinical Research Format

**Standard Format:**
```
Author A, Author B, Author C. Title of the article. Journal Name. Year;Volume(Issue):Pages. PMID: 12345678. DOI: 10.1234/journal.2024.56789
```

**Example:**
```
Modi S, Jacot W, Yamashita T, et al. Trastuzumab Deruxtecan in Previously Treated HER2-Low Advanced Breast Cancer. N Engl J Med. 2022;387(1):9-20. PMID: 35665782. DOI: 10.1056/NEJMoa2203690
```

**Components:**
- **Authors:** First 3-5 authors, followed by "et al." if more
- **Title:** Complete article title (sentence case or title case)
- **Journal:** Standard abbreviation (e.g., N Engl J Med, JAMA, Lancet)
- **Year:** Publication year
- **Volume(Issue):** Volume number and issue in parentheses
- **Pages:** Page range or article number
- **PMID:** PubMed identifier (critical for verification)
- **DOI:** Digital Object Identifier (required for accessibility)

### Technical/Engineering Format

**Standard Format:**
```
Author A, Author B (Year). Title of the article. Journal Name, Volume(Issue), Pages. https://doi.org/10.1234/journal.2024.56789
```

**Example:**
```
Ogitani Y, Aida T, Hagihara K, et al. (2016). DS-8201a, A Novel HER2-Targeting ADC with a Novel DNA Topoisomerase I Inhibitor, Demonstrates a Promising Antitumor Efficacy with Differentiation from T-DM1. Clinical Cancer Research, 22(20), 5097-5108. https://doi.org/10.1158/1078-0432.CCR-15-2822
```

### Regulatory/Guidelines Format

**Standard Format:**
```
Regulatory Agency or Organization. Document Title. Publication/Access Date. URL
```

**Example:**
```
U.S. Food and Drug Administration. ENHERTU (fam-trastuzumab deruxtecan-nxki) Prescribing Information. Updated June 2024. Accessed January 15, 2025. https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/761139s029lbl.pdf
```

### Conference Abstract Format

**Standard Format:**
```
Author A, Author B. Title. Conference Name; Date; Location. Abstract Number.
```

**Example:**
```
Smith J, Johnson K. Novel biomarkers for ADC-induced pneumonitis. American Society of Clinical Oncology Annual Meeting; June 2024; Chicago, IL. Abstract 4567.
```

## Required Elements

### Mandatory for All Citations

1. **Authors:** All authors or first author + "et al."
2. **Title:** Complete, accurate title (no placeholders)
3. **Source:** Journal, conference, or publisher
4. **Year:** Publication year
5. **Identifier:** At least one of:
   - PMID (PubMed ID)
   - DOI (Digital Object Identifier)
   - Accessible URL

### Context-Specific Requirements

**For Quantitative Claims:**
- Must include page number where data appears
- Or section number for online-only articles
- Helps verification during validation

**For Clinical Trials:**
- Trial registry number (e.g., NCT number) recommended
- Helps identify protocol and outcomes

**For Systematic Reviews:**
- Number of included studies
- Search date range
- Helps assess comprehensiveness

## Prohibited Elements (Anti-Fabrication)

### Fabricated PMIDs

**Prohibited Patterns:**
- Sequential: 12345678, 23456789, 87654321
- Repetitive: 11111111, 22222222, 99999999
- Obviously fake: 00000000
- Too long: 123456789 (PMIDs are max 8 digits)
- Contains non-digits: 1234567A

**Detection:**
- Use `validate-bibliography.py` script
- Checks against known fake patterns
- Validates format (1-8 digits only)

**If You Need a PMID:**
1. Search PubMed by title and author
2. Verify publication details match
3. Use actual PMID from PubMed
4. If not in PubMed, use DOI or URL instead

### Placeholder Titles

**Prohibited Patterns:**
- "Example Study"
- "Sample Research"
- "Test Paper"
- "Placeholder Title"
- "Lorem Ipsum"
- "To Be Determined" / "TBD"
- "Study Title Here"

**How to Fix:**
- Use actual article title from source
- Verify title matches published article
- Check for typos or truncation

### Placeholder Authors

**Prohibited Patterns:**
- "Smith et al." (without full citation)
- "Jones et al." (generic)
- "Doe et al." (generic)
- "Author Name"
- "et al." (alone, without lead author)
- "Various Authors"

**How to Fix:**
- List actual first author's name
- Add "et al." if more than 3-5 authors
- Verify author names from source

### Fake or Placeholder URLs

**Prohibited Domains:**
- example.com
- test.com
- sample.org
- placeholder.net
- localhost
- 127.0.0.1
- Any domain containing "fake", "dummy", "test", "placeholder"

**Prohibited Patterns:**
- URLs that don't resolve (404 errors)
- URLs without scheme (missing http:// or https://)
- URLs without domain
- File paths instead of URLs

**How to Fix:**
- Use actual, accessible URL
- Verify URL resolves (returns HTTP 200/300)
- Use DOI link if article URL unstable
- For PubMed articles: https://pubmed.ncbi.nlm.nih.gov/[PMID]/

## Source Verification Process

### PMID Verification

**Manual Verification:**
1. Visit https://pubmed.ncbi.nlm.nih.gov/
2. Enter PMID in search box
3. Verify:
   - Article title matches
   - Authors match
   - Journal matches
   - Year matches
   - Publication details correct

**Automated Verification:**
```bash
python scripts/validate-bibliography.py bibliography.md
```

**What It Checks:**
- PMID format (1-8 digits)
- Fake PMID patterns (sequential, repetitive)
- (Optional) API lookup for existence verification

### DOI Verification

**DOI Format:**
- Starts with "10."
- Format: 10.XXXX/identifier
- Example: 10.1056/NEJMoa2203690

**Verification:**
1. DOI should resolve at https://doi.org/[DOI]
2. Should redirect to article page
3. Article details should match citation

**Common DOI Issues:**
- Missing "10." prefix
- Truncated DOI
- Wrong DOI for article
- DOI not yet registered (for very new articles)

### URL Verification

**Automated Check:**
- Scripts perform HTTP HEAD request
- Verify returns 200 (OK) or 3XX (redirect)
- Flag 404 (not found) or 5XX (server error)

**Manual Check:**
1. Click URL in browser
2. Verify reaches article or abstract
3. Verify article details match citation

**Stable URLs:**
- Prefer DOI links (https://doi.org/10.XXXX/identifier)
- PubMed URLs: https://pubmed.ncbi.nlm.nih.gov/[PMID]/
- Journal websites may change; DOI is more stable

## Citation Format Consistency

### Format Checklist

All citations should follow same format:
- [ ] Author format consistent (e.g., all "First Author et al.")
- [ ] Title capitalization consistent (sentence case vs. title case)
- [ ] Journal abbreviation style consistent
- [ ] Volume/issue format consistent
- [ ] Page range format consistent (e.g., all "123-134" or "123-34")
- [ ] PMID format consistent (e.g., all "PMID: 12345678")
- [ ] DOI format consistent (e.g., all "DOI: 10.XXXX/..." or "https://doi.org/...")

### Automated Consistency Checking

```bash
python scripts/validate-bibliography.py --check-format bibliography.md
```

**Checks:**
- Formatting pattern consistency
- Required element presence
- Identifier format correctness

## Bibliography Completeness

### Completeness Checklist

For each citation:
- [ ] Authors listed (not placeholder)
- [ ] Title present (not placeholder)
- [ ] Source/journal identified
- [ ] Year provided
- [ ] At least one identifier (PMID, DOI, or URL)
- [ ] Identifier is valid and accessible

### Common Completeness Issues

**Missing Identifiers:**
- Has title and authors but no PMID, DOI, or URL
- Fix: Search PubMed or journal website for identifiers

**Incomplete Author Lists:**
- Only "et al." without lead author
- Fix: Add first author name before "et al."

**Truncated Titles:**
- Title appears cut off mid-sentence
- Fix: Retrieve full title from source

**Missing Volume/Issue:**
- Critical for locating article in journal
- Fix: Look up in PubMed or journal website

**Missing Page Numbers:**
- Makes verification difficult
- Fix: Add page range from source
- For online-only: use article number or DOI

## Managing Large Bibliographies

### Organization Strategies

**By Source Type:**
1. Clinical trials
2. Observational studies
3. Mechanistic/preclinical studies
4. Review articles
5. Guidelines and consensus statements
6. Regulatory documents

**By Topic:**
1. Epidemiology
2. Mechanisms
3. Diagnosis
4. Treatment
5. Prevention
6. Outcomes

**Chronological:**
- Useful for tracking evolution of evidence
- Group by year or time period

### Version Control

**Track Changes:**
- Use git for bibliography files
- Commit after each batch of additions
- Document what was added in commit messages

**Example:**
```bash
git add bibliography.md
git commit -m "Added 15 mechanistic studies on ADC lung uptake (refs 47-61)"
```

### Collaborative Bibliography Management

**When Multiple Agents/People:**
1. Assign reference number ranges
   - Agent A: refs 1-50
   - Agent B: refs 51-100
   - Agent C: refs 101-150
2. Merge carefully to avoid duplicates
3. Renumber if needed
4. Run validation on merged bibliography

## Citation Management Tools

### validate-bibliography.py

**Purpose:** Detect fabricated sources and format issues

**Usage:**
```bash
python scripts/validate-bibliography.py <bibliography_file>
```

**Checks Performed:**
1. PMID format and authenticity
2. DOI format
3. URL accessibility
4. Placeholder pattern detection (titles, authors)
5. Citation format consistency
6. Completeness

**Output:**
- Issues by severity (critical, warning, info)
- Suggested fixes
- Summary statistics

**Example Output:**
```
Bibliography Validation Report
================================

Total Citations: 165
Citations with PMIDs: 146 (88.5%)
Citations with DOIs: 165 (100%)

CRITICAL ISSUES (3):
1. [Ref 23] Fabricated PMID detected: 12345678 (sequential pattern)
2. [Ref 45] Placeholder title: "Example Study on ADC Toxicity"
3. [Ref 67] URL not accessible: returns 404 error

WARNINGS (2):
4. [Ref 12] Missing DOI (has PMID only)
5. [Ref 89] Inconsistent format (missing volume/issue)

RECOMMENDATIONS:
- Fix 3 critical issues before proceeding
- Add DOIs for completeness where missing
- Standardize format for consistency
```

### Bibliography Extraction Scripts

**Purpose:** Extract citations from various formats

**Example:**
```python
# Extract from markdown with numbered references
python scripts/extract-citations.py manuscript.md > bibliography.txt

# Extract PMIDs only
python scripts/extract-pmids.py manuscript.md > pmids.txt

# Fetch full citations from PMIDs
python scripts/fetch-pubmed-citations.py pmids.txt > citations.md
```

### Deduplication Tools

**Purpose:** Find and remove duplicate citations

**Usage:**
```bash
python scripts/deduplicate-bibliography.py bibliography.md
```

**Detection Methods:**
- Exact PMID match
- Exact DOI match
- Fuzzy title match (>90% similarity)
- Author + year match

**Output:**
- List of potential duplicates
- Recommendation to keep/remove
- Merged bibliography with duplicates removed

## Common Citation Errors & Fixes

### Error 1: Wrong PMID

**Symptom:** PMID lookup shows different article

**Cause:** Typo in PMID or confused with different article

**Fix:**
1. Re-search PubMed by title + author
2. Verify correct article
3. Update with correct PMID

### Error 2: Inaccessible URL

**Symptom:** URL returns 404 or error

**Cause:**
- Journal website reorganization
- Paywall or login required
- Temporary server issue
- Wrong URL

**Fix:**
1. Try DOI link instead (more stable)
2. Search PubMed for stable URL
3. Use journal archive URL
4. If permanently unavailable, note as "[Abstract only]" or "[No longer available]"

### Error 3: Incomplete Citation

**Symptom:** Missing key elements (authors, year, etc.)

**Cause:**
- Rushed extraction
- Partial source information
- Copied from incomplete reference list

**Fix:**
1. Look up article in PubMed by any available info
2. Retrieve complete citation
3. Verify all required elements present

### Error 4: Format Inconsistency

**Symptom:** Citations have different formats

**Cause:**
- Multiple contributors with different styles
- Copy-pasted from various sources
- Inconsistent application of format rules

**Fix:**
1. Choose standard format (e.g., medical format)
2. Apply systematically to all citations
3. Use automated formatter if available
4. Final manual review for consistency

### Error 5: Duplicate Citations

**Symptom:** Same article cited multiple times with different reference numbers

**Cause:**
- Different contributors adding same source
- Not checking for existing citation before adding
- Slightly different citation formats preventing detection

**Fix:**
1. Run deduplication tool
2. Identify all instances of duplicate
3. Choose canonical version (most complete)
4. Remove duplicates
5. Renumber remaining citations
6. Update in-text citations

## Bibliography Quality Metrics

### Completeness Metrics

**Calculate:**
- % citations with PMID
- % citations with DOI
- % citations with both PMID and DOI
- % citations with accessible URLs
- % citations with all required fields

**Targets:**
- PMID: >80% (for medical research)
- DOI: >90% (should be nearly universal)
- All required fields: 100%

### Recency Metrics

**Calculate:**
- % citations from last 2 years
- % citations from last 5 years
- Median publication year
- Range of publication years

**Interpretation:**
- Recent research: expect 30-50% from last 2-5 years
- Includes foundational older studies
- Very old citations only (>20 years) may indicate outdated evidence

### Source Diversity Metrics

**Calculate:**
- Number of unique journals
- Number of unique authors
- Geographic diversity (countries)
- Institution diversity

**Interpretation:**
- High diversity suggests comprehensive search
- Low diversity may indicate narrow perspective
- Single-source dominance may indicate bias

## Integration with Research Workflow

### During Literature Search

**Best Practices:**
1. Extract complete bibliographic metadata immediately
2. Record PMID, DOI, URL at time of identification
3. Download PDFs and link to citations
4. Document search strategy for reproducibility

### During Evidence Extraction

**Best Practices:**
1. Every extracted data point links to citation
2. Record page number for locating data
3. Note if multiple sources provide same data
4. Flag conflicting data from different sources

### During Synthesis

**Best Practices:**
1. Cite multiple sources for key findings
2. Note when evidence comes from single source
3. Acknowledge gaps in citation coverage
4. Identify topics needing more sources

### During Quality Assurance

**Best Practices:**
1. Run `validate-bibliography.py` before finalizing
2. Fix all critical issues (fabricated sources)
3. Address warnings (missing identifiers)
4. Verify random sample of citations manually
5. Check that all in-text citations have bibliography entries

## Special Cases

### Pre-Print Articles

**Challenge:** Not yet peer-reviewed, may lack PMID

**Citation Format:**
```
Author A, Author B. Title. Preprint posted [Date]. Source. DOI or URL.
```

**Example:**
```
Smith J, Johnson K. Novel mechanisms of ADC-induced pneumonitis. Preprint posted January 10, 2025. bioRxiv. DOI: 10.1101/2025.01.10.123456
```

**Note:**
- Label as preprint explicitly
- Note limitations (not peer-reviewed)
- Check if later published in peer-reviewed journal

### Conference Abstracts

**Challenge:** Limited availability, no full text

**Citation Format:**
```
Author A. Title. Conference Name; Date; Location. Abstract Number.
```

**Note:**
- Indicate it's an abstract (limited details)
- Include abstract number for locating
- Prefer full publications when available

### Regulatory Documents

**Challenge:** Not in PubMed, URLs may change

**Citation Format:**
```
Agency. Document Title. Date. Accessed [Date]. URL.
```

**Note:**
- Include access date (documents may be updated)
- Use official government URLs when possible
- Consider archiving copy if critical

### Non-English Publications

**Challenge:** Title translation, identifier availability

**Citation Format:**
```
Author A, Author B. [English translation of title]. Journal Name [Language]. Year;Volume(Issue):Pages. PMID: 12345678.
```

**Note:**
- Provide English translation in brackets
- Note original language
- PMID still available for many non-English articles

## CLAUDE.md Compliance

### Anti-Fabrication in Citations

**Prohibited:**
- Creating fake PMIDs to complete bibliography
- Using placeholder sources to meet citation count
- Citing sources you haven't actually accessed
- Fabricating publication details

**Required:**
- Only cite sources you have accessed
- Use actual PMIDs from PubMed
- Provide accessible identifiers
- Acknowledge when source unavailable

### Evidence Standards

**Required:**
- Primary sources only (not citing other AI outputs)
- Valid identifiers for verification
- Complete bibliographic information
- Accessible sources when possible

**Example Compliant Citation:**
```
Modi S, Jacot W, Yamashita T, et al. Trastuzumab Deruxtecan in Previously Treated HER2-Low Advanced Breast Cancer. N Engl J Med. 2022;387(1):9-20. PMID: 35665782. DOI: 10.1056/NEJMoa2203690

[Source verified: PMID valid, DOI resolves, article matches citation]
```

### Transparency Requirements

**Required:**
- Document search strategy
- Note if sources unavailable
- Acknowledge citation limitations
- Report completeness metrics

## Resources

**Validation Tools:**
- `scripts/validate-bibliography.py` - Comprehensive validation
- `scripts/extract-citations.py` - Extract from documents
- `scripts/deduplicate-bibliography.py` - Find duplicates

**External Resources:**
- PubMed: https://pubmed.ncbi.nlm.nih.gov/
- DOI Resolver: https://doi.org/
- Journal Abbreviations: https://www.ncbi.nlm.nih.gov/nlmcatalog/journals
- Citation Style Guide: Varies by journal (check Instructions for Authors)

**Reference Standards:**
- Vancouver Style (medical)
- APA Style (psychology/social sciences)
- IEEE Style (engineering)
- Journal-specific requirements

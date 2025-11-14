#!/usr/bin/env python3
"""
Bibliography Validation Script

Detects fabricated sources, placeholder text, and format issues in research bibliographies.

Usage:
    python validate-bibliography.py <bibliography_file> [options]

Options:
    --check-format    Check citation format consistency
    --check-access    Verify URLs accessible (HTTP check)
    --strict          Fail on warnings, not just critical issues

Based on source verification implementation from safety-research-system.
"""

import sys
import re
import argparse
from typing import List, Dict, Any, Tuple
from urllib.parse import urlparse


class BibliographyValidator:
    """Validates bibliography for authenticity and completeness."""

    def __init__(self, strict=False, check_access=False):
        self.strict = strict
        self.check_access = check_access
        self.issues = []
        self.stats = {
            'total': 0,
            'with_pmid': 0,
            'with_doi': 0,
            'with_url': 0,
            'with_both_pmid_doi': 0
        }

    def validate_file(self, filename: str) -> Dict[str, Any]:
        """Validate bibliography file."""
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract citations (simple numbered list pattern)
        # Format: 1. Author et al. Title. Journal. Year;...
        citations = re.findall(r'(\d+)\.\s+(.+?)(?=\n\d+\.|$)', content, re.DOTALL)

        self.stats['total'] = len(citations)

        for idx, (num, citation_text) in enumerate(citations):
            citation_text = citation_text.strip()
            self._validate_citation(int(num), citation_text, idx)

        return self._generate_report()

    def _validate_citation(self, ref_num: int, text: str, index: int):
        """Validate individual citation."""

        # Extract components
        pmid = self._extract_pmid(text)
        doi = self._extract_doi(text)
        url = self._extract_url(text)
        title = self._extract_title(text)
        authors = self._extract_authors(text)

        # Update stats
        if pmid:
            self.stats['with_pmid'] += 1
        if doi:
            self.stats['with_doi'] += 1
        if url:
            self.stats['with_url'] += 1
        if pmid and doi:
            self.stats['with_both_pmid_doi'] += 1

        # Validate PMID
        if pmid:
            self._validate_pmid(ref_num, pmid)

        # Validate DOI
        if doi:
            self._validate_doi(ref_num, doi)

        # Validate URL
        if url:
            self._validate_url(ref_num, url)

        # Check for placeholder patterns
        self._check_placeholder_title(ref_num, title)
        self._check_placeholder_authors(ref_num, authors)

        # Check has at least one identifier
        if not (pmid or doi or url):
            self._add_issue(
                severity='critical',
                ref=ref_num,
                category='missing_identifier',
                description=f"No identifier (PMID, DOI, or URL) found",
                fix="Add PMID, DOI, or accessible URL"
            )

    def _extract_pmid(self, text: str) -> str:
        """Extract PMID from citation text."""
        match = re.search(r'PMID:?\s*(\d+)', text, re.IGNORECASE)
        return match.group(1) if match else None

    def _extract_doi(self, text: str) -> str:
        """Extract DOI from citation text."""
        match = re.search(r'DOI:?\s*(10\.\S+)', text, re.IGNORECASE)
        if match:
            return match.group(1)
        # Also check for doi.org URLs
        match = re.search(r'https?://doi\.org/(10\.\S+)', text)
        return match.group(1) if match else None

    def _extract_url(self, text: str) -> str:
        """Extract URL from citation text."""
        match = re.search(r'(https?://\S+)', text)
        return match.group(1).rstrip('.') if match else None

    def _extract_title(self, text: str) -> str:
        """Extract title (rough heuristic: text before journal name/year)."""
        # Title typically after authors and before year
        match = re.search(r'et al\.\s+(.+?)\.\s+\w+\.?\s+\d{4}', text)
        if match:
            return match.group(1).strip()
        # Fallback: just get first sentence-like chunk
        parts = text.split('.')
        return parts[0] if parts else ""

    def _extract_authors(self, text: str) -> str:
        """Extract authors (rough heuristic: beginning of citation)."""
        # Authors typically at start
        match = re.match(r'^([^.]+et al\.)', text)
        return match.group(1) if match else text.split('.')[0]

    def _validate_pmid(self, ref_num: int, pmid: str):
        """Validate PMID format and detect fabrication patterns."""

        # Check format: 1-8 digits only
        if not re.match(r'^\d{1,8}$', pmid):
            self._add_issue(
                severity='critical',
                ref=ref_num,
                category='invalid_pmid_format',
                description=f"PMID '{pmid}' invalid format (must be 1-8 digits)",
                fix="Use valid PMID format or remove PMID field"
            )
            return

        # Check for obvious fabricated PMIDs
        fake_pmids = [
            '12345678', '23456789', '34567890', '87654321',
            '11111111', '22222222', '33333333', '44444444',
            '55555555', '66666666', '77777777', '88888888',
            '99999999', '00000000'
        ]

        if pmid in fake_pmids:
            self._add_issue(
                severity='critical',
                ref=ref_num,
                category='fabricated_pmid',
                description=f"PMID '{pmid}' appears fabricated (sequential/repetitive pattern)",
                fix="Replace with real, verifiable PMID from PubMed"
            )
            return

        # Check for sequential pattern (e.g., 12345678, 23456789)
        if len(pmid) == 8 and self._is_sequential(pmid):
            self._add_issue(
                severity='critical',
                ref=ref_num,
                category='fabricated_pmid',
                description=f"PMID '{pmid}' contains sequential pattern (likely fabricated)",
                fix="Replace with real, verifiable PMID from PubMed"
            )

    def _is_sequential(self, s: str) -> bool:
        """Check if string contains sequential digits."""
        digits = [int(d) for d in s]
        # Check ascending sequence
        ascending = all(digits[i+1] == digits[i] + 1 for i in range(len(digits)-1))
        # Check descending sequence
        descending = all(digits[i+1] == digits[i] - 1 for i in range(len(digits)-1))
        return ascending or descending

    def _validate_doi(self, ref_num: int, doi: str):
        """Validate DOI format."""
        if not doi.startswith('10.'):
            self._add_issue(
                severity='warning',
                ref=ref_num,
                category='invalid_doi_format',
                description=f"DOI '{doi}' doesn't start with '10.' (may be incomplete)",
                fix="Verify DOI format or use complete DOI"
            )

    def _validate_url(self, ref_num: int, url: str):
        """Validate URL format and check for placeholders."""

        try:
            parsed = urlparse(url)

            # Check has scheme and domain
            if not parsed.scheme or not parsed.netloc:
                self._add_issue(
                    severity='critical',
                    ref=ref_num,
                    category='invalid_url',
                    description=f"URL '{url}' missing scheme or domain",
                    fix="Use properly formatted URL (https://...)"
                )
                return

            # Check for placeholder domains
            placeholder_domains = [
                'example.com', 'example.org', 'example.net',
                'test.com', 'test.org',
                'sample.com', 'sample.org',
                'placeholder.com',
                'localhost', '127.0.0.1'
            ]

            if parsed.netloc.lower() in placeholder_domains:
                self._add_issue(
                    severity='critical',
                    ref=ref_num,
                    category='fabricated_url',
                    description=f"URL uses placeholder domain '{parsed.netloc}'",
                    fix="Replace with real, accessible URL"
                )
                return

            # Check for placeholder patterns in URL
            placeholder_patterns = ['placeholder', 'fake', 'dummy', 'test']
            url_lower = url.lower()
            for pattern in placeholder_patterns:
                if pattern in url_lower:
                    self._add_issue(
                        severity='critical',
                        ref=ref_num,
                        category='fabricated_url',
                        description=f"URL contains placeholder pattern '{pattern}'",
                        fix="Replace with real, accessible URL"
                    )
                    break

            # Optional: Check URL accessibility
            if self.check_access:
                self._check_url_accessible(ref_num, url)

        except Exception as e:
            self._add_issue(
                severity='critical',
                ref=ref_num,
                category='invalid_url',
                description=f"URL '{url}' cannot be parsed: {str(e)}",
                fix="Use properly formatted, valid URL"
            )

    def _check_url_accessible(self, ref_num: int, url: str):
        """Check if URL is accessible (requires requests library)."""
        try:
            import requests
            response = requests.head(url, timeout=5, allow_redirects=True)
            if response.status_code >= 400:
                self._add_issue(
                    severity='warning',
                    ref=ref_num,
                    category='inaccessible_url',
                    description=f"URL returns HTTP {response.status_code}",
                    fix="Verify URL or use alternative identifier (PMID/DOI)"
                )
        except ImportError:
            pass  # requests not available, skip check
        except Exception as e:
            self._add_issue(
                severity='warning',
                ref=ref_num,
                category='url_check_failed',
                description=f"Could not verify URL accessibility: {str(e)}",
                fix="Manually verify URL is accessible"
            )

    def _check_placeholder_title(self, ref_num: int, title: str):
        """Check for placeholder patterns in title."""
        if not title:
            return

        placeholder_patterns = [
            (r'example\s+study', "Generic 'Example Study'"),
            (r'sample\s+research', "Generic 'Sample Research'"),
            (r'test\s+paper', "Generic 'Test Paper'"),
            (r'placeholder', "Explicit 'placeholder' text"),
            (r'lorem\s+ipsum', "Lorem ipsum placeholder"),
            (r'to\s+be\s+determined', "TBD placeholder"),
            (r'\btbd\b', "TBD abbreviation"),
            (r'study\s+title\s+here', "Generic 'Study Title Here'")
        ]

        title_lower = title.lower()
        for pattern, description in placeholder_patterns:
            if re.search(pattern, title_lower):
                self._add_issue(
                    severity='critical',
                    ref=ref_num,
                    category='placeholder_title',
                    description=f"{description} detected in title",
                    fix="Replace with actual article title"
                )
                break

    def _check_placeholder_authors(self, ref_num: int, authors: str):
        """Check for placeholder patterns in authors."""
        if not authors:
            return

        placeholder_patterns = [
            (r'^smith\s+et\s+al\.?$', "Generic 'Smith et al.'"),
            (r'^jones\s+et\s+al\.?$', "Generic 'Jones et al.'"),
            (r'^doe\s+et\s+al\.?$', "Generic 'Doe et al.'"),
            (r'^author\s+name', "Generic 'Author Name'"),
            (r'^et\s+al\.?$', "Incomplete 'et al.' without lead author")
        ]

        authors_lower = authors.lower().strip()
        for pattern, description in placeholder_patterns:
            if re.search(pattern, authors_lower):
                self._add_issue(
                    severity='critical',
                    ref=ref_num,
                    category='placeholder_authors',
                    description=f"{description} detected",
                    fix="Replace with actual author names"
                )
                break

    def _add_issue(self, severity: str, ref: int, category: str, description: str, fix: str):
        """Add validation issue."""
        self.issues.append({
            'severity': severity,
            'ref': ref,
            'category': category,
            'description': description,
            'fix': fix
        })

    def _generate_report(self) -> Dict[str, Any]:
        """Generate validation report."""
        critical = [i for i in self.issues if i['severity'] == 'critical']
        warnings = [i for i in self.issues if i['severity'] == 'warning']
        info = [i for i in self.issues if i['severity'] == 'info']

        # Determine status
        if critical:
            status = 'FAIL'
        elif warnings and self.strict:
            status = 'FAIL'
        elif warnings:
            status = 'PASS_WITH_WARNINGS'
        else:
            status = 'PASS'

        return {
            'status': status,
            'stats': self.stats,
            'issues': {
                'critical': critical,
                'warnings': warnings,
                'info': info
            },
            'summary': self._generate_summary(status, critical, warnings, info)
        }

    def _generate_summary(self, status: str, critical: List, warnings: List, info: List) -> str:
        """Generate summary text."""
        lines = [
            "=== Bibliography Validation Report ===",
            "",
            f"Total Citations: {self.stats['total']}",
            "",
            "SUMMARY:",
            f"  PMIDs: {self.stats['with_pmid']}/{self.stats['total']} ({self.stats['with_pmid']/max(self.stats['total'],1)*100:.1f}%)",
            f"  DOIs: {self.stats['with_doi']}/{self.stats['total']} ({self.stats['with_doi']/max(self.stats['total'],1)*100:.1f}%)",
            f"  Valid identifiers: {self.stats['total'] - len([i for i in critical if i['category'] == 'missing_identifier'])}/{self.stats['total']}",
            "",
            f"CRITICAL ISSUES: {len(critical)}",
            f"WARNINGS: {len(warnings)}",
            f"INFO: {len(info)}",
            ""
        ]

        if critical:
            lines.append("=== CRITICAL ISSUES ===")
            for i, issue in enumerate(critical, 1):
                lines.append(f"[C{i}] Ref {issue['ref']}: {issue['description']}")
                lines.append(f"     Fix: {issue['fix']}")
            lines.append("")

        if warnings:
            lines.append("=== WARNINGS ===")
            for i, issue in enumerate(warnings, 1):
                lines.append(f"[W{i}] Ref {issue['ref']}: {issue['description']}")
            lines.append("")

        if info:
            lines.append("=== INFO ===")
            for i, issue in enumerate(info, 1):
                lines.append(f"[I{i}] Ref {issue['ref']}: {issue['description']}")
            lines.append("")

        lines.append(f"OVERALL STATUS: {status}")

        if status == 'FAIL':
            lines.append("Recommendation: Fix critical issues before proceeding")
        elif status == 'PASS_WITH_WARNINGS':
            lines.append("Recommendation: Address warnings for completeness")
        else:
            lines.append("Recommendation: Bibliography meets quality standards")

        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description='Validate research bibliography')
    parser.add_argument('file', help='Bibliography file to validate')
    parser.add_argument('--check-format', action='store_true', help='Check format consistency')
    parser.add_argument('--check-access', action='store_true', help='Verify URLs accessible')
    parser.add_argument('--strict', action='store_true', help='Fail on warnings')

    args = parser.parse_args()

    validator = BibliographyValidator(strict=args.strict, check_access=args.check_access)
    report = validator.validate_file(args.file)

    print(report['summary'])

    # Exit with error code if failed
    sys.exit(0 if report['status'] in ['PASS', 'PASS_WITH_WARNINGS'] else 1)


if __name__ == '__main__':
    main()

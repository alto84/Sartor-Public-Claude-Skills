#!/usr/bin/env python3
"""
Research Quality Check Script

Validates research claims, CLAUDE.md compliance, and evidence quality.

Usage:
    python research-quality-check.py <manuscript_file> [options]

Options:
    --check-claims      Find unsupported claims
    --check-claude      Check CLAUDE.md compliance
    --check-confidence  Validate confidence levels
    --check-all         Run all checks (default)

Based on audit patterns from safety-research-system.
"""

import sys
import re
import argparse
from typing import List, Dict, Any


class ResearchQualityChecker:
    """Validates research quality and CLAUDE.md compliance."""

    def __init__(self):
        self.issues = []
        self.stats = {
            'total_claims': 0,
            'claims_with_citations': 0,
            'claims_with_context': 0,
            'violations': {
                'score_fabrication': 0,
                'banned_language': 0,
                'unsupported_claims': 0
            }
        }

    def check_file(self, filename: str, check_claims=True, check_claude=True, check_confidence=True) -> Dict[str, Any]:
        """Check research file for quality issues."""
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        if check_claude:
            self._check_claude_compliance(content)

        if check_claims:
            self._check_unsupported_claims(content)

        if check_confidence:
            self._check_confidence_calibration(content)

        return self._generate_report()

    def _check_claude_compliance(self, content: str):
        """Check CLAUDE.md anti-fabrication compliance."""

        # Check for score fabrication (scores > 80%)
        score_patterns = [
            r'(\d{2,3})%\s+confidence',
            r'quality\s+score:?\s+(\d{2,3})%',
            r'evidence\s+quality:?\s+(\d{2,3})%',
            r'(\d{2,3})%\s+certainty'
        ]

        for pattern in score_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                score = int(match.group(1))
                if score > 80:
                    self.stats['violations']['score_fabrication'] += 1
                    self._add_issue(
                        severity='critical',
                        category='score_fabrication',
                        description=f"Score {score}% exceeds 80% without external validation",
                        location=f"Near: {match.group(0)}",
                        fix="Remove score or provide external validation data"
                    )

        # Check for banned language
        banned_phrases = [
            (r'\bexceptional\b', 'exceptional'),
            (r'\boutstanding\b', 'outstanding'),
            (r'\bworld-class\b', 'world-class'),
            (r'\bindustry-leading\b', 'industry-leading'),
            (r'\bclearly demonstrates\b', 'clearly demonstrates'),
            (r'\bdefinitively proves\b', 'definitively proves'),
            (r'\bundeniably\b', 'undeniably')
        ]

        for pattern, phrase in banned_phrases:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                self.stats['violations']['banned_language'] += 1
                self._add_issue(
                    severity='warning',
                    category='banned_language',
                    description=f"Banned language '{phrase}' used without extraordinary evidence",
                    location=f"Near: {match.group(0)}",
                    fix=f"Replace with qualified language (e.g., 'evidence suggests', 'studies indicate')"
                )

        # Check for limitations section
        if not re.search(r'##?\s*limitations', content, re.IGNORECASE):
            self._add_issue(
                severity='critical',
                category='missing_limitations',
                description="No limitations section found",
                location="Document structure",
                fix="Add comprehensive Limitations section discussing study constraints"
            )

    def _check_unsupported_claims(self, content: str):
        """Check for quantitative claims without citations."""

        # Pattern for numerical claims (percentages, ranges, specific numbers)
        numerical_patterns = [
            r'(\d+\.?\d*%)',  # Percentages
            r'(\d+\.?\d*\s+times)',  # Fold changes
            r'(p\s*[<>=]\s*0\.\d+)',  # P-values
            r'(\d+\.?\d*\s*±\s*\d+\.?\d*)',  # Mean ± SD
        ]

        for pattern in numerical_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                claim = match.group(0)
                # Get surrounding context (100 chars)
                start = max(0, match.start() - 100)
                end = min(len(content), match.end() + 100)
                context = content[start:end]

                # Check if citation nearby (simple heuristic: look for [ref] or (Author YEAR))
                has_citation = bool(re.search(r'\[\d+\]|\([A-Z][a-z]+\s+\d{4}\)', context))

                self.stats['total_claims'] += 1
                if has_citation:
                    self.stats['claims_with_citations'] += 1
                else:
                    self.stats['violations']['unsupported_claims'] += 1
                    self._add_issue(
                        severity='warning',
                        category='unsupported_claim',
                        description=f"Numerical claim '{claim}' lacks nearby citation",
                        location=f"Context: ...{context[max(0, match.start()-start-20):match.end()-start+20]}...",
                        fix="Add citation to support claim"
                    )

    def _check_confidence_calibration(self, content: str):
        """Check confidence level justifications."""

        # Look for confidence statements
        confidence_patterns = [
            r'confidence:?\s+(high|low|moderate|very\s+low)',
            r'(high|moderate|low)\s+confidence',
            r'certainty:?\s+(high|low|moderate)'
        ]

        for pattern in confidence_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                level = match.group(1).lower()
                # Get surrounding context
                start = max(0, match.start() - 200)
                end = min(len(content), match.end() + 200)
                context = content[start:end]

                # Check if justification nearby (look for "based on", "due to", etc.)
                has_justification = bool(re.search(
                    r'based\s+on|due\s+to|because|given|considering',
                    context,
                    re.IGNORECASE
                ))

                if level in ['high', 'very high'] and not has_justification:
                    self._add_issue(
                        severity='info',
                        category='confidence_justification',
                        description=f"High confidence claim lacks explicit justification",
                        location=f"Near: {match.group(0)}",
                        fix="Add justification for confidence level (e.g., 'based on 5 RCTs with n=1,234')"
                    )

    def _add_issue(self, severity: str, category: str, description: str, location: str, fix: str):
        """Add quality issue."""
        self.issues.append({
            'severity': severity,
            'category': category,
            'description': description,
            'location': location,
            'fix': fix
        })

    def _generate_report(self) -> Dict[str, Any]:
        """Generate quality report."""
        critical = [i for i in self.issues if i['severity'] == 'critical']
        warnings = [i for i in self.issues if i['severity'] == 'warning']
        info = [i for i in self.issues if i['severity'] == 'info']

        # Determine status
        if critical:
            status = 'FAIL'
        elif warnings:
            status = 'PASS_WITH_WARNINGS'
        else:
            status = 'PASS'

        # Determine quality level
        if not critical and not warnings:
            quality = 'EXCELLENT'
        elif not critical and len(warnings) <= 5:
            quality = 'GOOD'
        elif not critical:
            quality = 'ACCEPTABLE'
        else:
            quality = 'NEEDS_IMPROVEMENT'

        return {
            'status': status,
            'quality': quality,
            'stats': self.stats,
            'issues': {
                'critical': critical,
                'warnings': warnings,
                'info': info
            },
            'summary': self._generate_summary(status, quality, critical, warnings, info)
        }

    def _generate_summary(self, status: str, quality: str, critical: List, warnings: List, info: List) -> str:
        """Generate summary report."""
        lines = [
            "=== Research Quality Check Report ===",
            "",
            "CLAIM-CITATION AUDIT:",
        ]

        if self.stats['total_claims'] > 0:
            citation_pct = self.stats['claims_with_citations'] / self.stats['total_claims'] * 100
            lines.append(f"  Claims checked: {self.stats['total_claims']}")
            lines.append(f"  With citations: {self.stats['claims_with_citations']} ({citation_pct:.1f}%)")
        else:
            lines.append("  No numerical claims detected")

        lines.extend([
            "",
            "CLAUDE.MD COMPLIANCE:",
            f"  Score fabrication: {self.stats['violations']['score_fabrication']} violations",
            f"  Banned language: {self.stats['violations']['banned_language']} violations",
            f"  Unsupported claims: {self.stats['violations']['unsupported_claims']}",
            "",
            f"ISSUES FOUND:",
            f"  Critical: {len(critical)}",
            f"  Warnings: {len(warnings)}",
            f"  Info: {len(info)}",
            ""
        ])

        if critical:
            lines.append("=== CRITICAL ISSUES ===")
            for i, issue in enumerate(critical, 1):
                lines.append(f"\n[CRITICAL-{i}] {issue['description']}")
                lines.append(f"  Location: {issue['location']}")
                lines.append(f"  Fix: {issue['fix']}")
            lines.append("")

        if warnings:
            lines.append("=== WARNINGS ===")
            for i, issue in enumerate(warnings, 1):
                lines.append(f"\n[WARNING-{i}] {issue['description']}")
                lines.append(f"  Fix: {issue['fix']}")
            lines.append("")

        lines.extend([
            "",
            f"OVERALL QUALITY: {quality}",
            f"Status: {status}"
        ])

        if status == 'FAIL':
            lines.append("Recommendation: Fix critical issues before proceeding")
        elif status == 'PASS_WITH_WARNINGS':
            lines.append("Recommendation: Address warnings for publication quality")
        else:
            lines.append("Recommendation: Meets quality standards")

        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description='Check research quality and compliance')
    parser.add_argument('file', help='Manuscript file to check')
    parser.add_argument('--check-claims', action='store_true', help='Check for unsupported claims')
    parser.add_argument('--check-claude', action='store_true', help='Check CLAUDE.md compliance')
    parser.add_argument('--check-confidence', action='store_true', help='Check confidence calibration')
    parser.add_argument('--check-all', action='store_true', help='Run all checks (default)')

    args = parser.parse_args()

    # If no specific checks, run all
    if not (args.check_claims or args.check_claude or args.check_confidence or args.check_all):
        args.check_all = True

    if args.check_all:
        check_claims = check_claude = check_confidence = True
    else:
        check_claims = args.check_claims
        check_claude = args.check_claude
        check_confidence = args.check_confidence

    checker = ResearchQualityChecker()
    report = checker.check_file(args.file, check_claims, check_claude, check_confidence)

    print(report['summary'])

    sys.exit(0 if report['status'] in ['PASS', 'PASS_WITH_WARNINGS'] else 1)


if __name__ == '__main__':
    main()

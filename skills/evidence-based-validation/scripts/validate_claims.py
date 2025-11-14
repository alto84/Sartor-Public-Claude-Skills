#!/usr/bin/env python3
"""
Validation Script for Evidence-Based Claims
Detects score fabrication and prohibited language patterns in text.

Usage:
    python validate_claims.py <file_path>
    python validate_claims.py - # Read from stdin
    python validate_claims.py --detailed <file_path> # Detailed report
"""

import sys
import re
import json
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from enum import Enum


class ProhibitionLevel(Enum):
    """Levels of prohibition severity."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class ValidationResult:
    """Result of a validation check."""
    is_valid: bool
    risk_level: str
    violations: List[str]
    score_issues: List[str]
    language_issues: List[str]
    total_issues: int


class ClaimValidator:
    """Validates text for score fabrication and prohibited language."""

    def __init__(self):
        self.initialize_patterns()
        self.initialize_score_patterns()

    def initialize_patterns(self):
        """Initialize prohibited language patterns."""

        # CRITICAL LEVEL PATTERNS
        self.critical_patterns = [
            # Impossible perfection
            (r'\b(?:100(?:\.0+)?%|perfect(?:ly)?|flawless(?:ly)?|error-free|zero-error)\b',
             "impossible_perfection"),
            (r'\b(?:infallible|bulletproof|foolproof|fail-safe|guaranteed)\b',
             "impossible_perfection"),
            (r'\b(?:never\s+fail|cannot\s+fail|impossible\s+to\s+fail)\b',
             "impossible_perfection"),

            # Absolute supremacy
            (r'\b(?:best\s+(?:in\s+)?(?:class|world|industry|market)|world-class|world-leading)\b',
             "absolute_supremacy"),
            (r'\b(?:unmatched|unbeatable|unsurpassed|unrivaled|incomparable)\b',
             "absolute_supremacy"),
            (r'\b(?:supreme|ultimate|definitive|absolute\s+best)\b',
             "absolute_supremacy"),

            # Statistical impossibility
            (r'\b(?:zero\s+(?:variance|deviation|error|latency)|infinite\s+(?:speed|performance))\b',
             "statistical_impossibility"),
            (r'\b(?:instant(?:aneous)?|immediate|zero-time)\b',
             "statistical_impossibility"),
        ]

        # HIGH LEVEL PATTERNS
        self.high_patterns = [
            # Exaggerated performance
            (r'\b(?:revolutionary|breakthrough|game-changing|paradigm-shifting)\b',
             "exaggerated_performance"),
            (r'\b(?:unprecedented|unheard-of|never-before-seen|industry-first)\b',
             "exaggerated_performance"),
            (r'\b(?:dramatically|exponentially|massively)\s+(?:improve|increase|enhance|boost)\b',
             "exaggerated_performance"),

            # Artificial precision
            (r'\b(?:precisely|exactly|definitively)\s+(?:\d+\.?\d*|calculated|measured|determined)\b',
             "artificial_precision"),
            (r'\boptimal(?:ly)?\s+(?:calibrated|tuned|configured|adjusted)\b',
             "artificial_precision"),

            # Comparative fabrication
            (r'\b(?:outperform|exceed|surpass)\s+(?:all|every|any)\s+(?:competitor|alternative|benchmark)\b',
             "comparative_fabrication"),
            (r'\b(?:superior\s+to|better\s+than)\s+(?:all|every|any)\s+(?:existing|current)\b',
             "comparative_fabrication"),
        ]

        # MEDIUM LEVEL PATTERNS
        self.medium_patterns = [
            # Superlative abuse
            (r'\b(?:amazing|incredible|outstanding|exceptional|remarkable)\s+(?:performance|results|accuracy)\b',
             "superlative_abuse"),
            (r'\b(?:cutting-edge|state-of-the-art|next-generation|advanced)\b',
             "superlative_abuse"),
            (r'\b(?:superior|premium|elite|professional|enterprise-grade)\b',
             "superlative_abuse"),

            # Vague excellence
            (r'\b(?:highly|extremely|very|remarkably|exceptionally)\s+(?:accurate|efficient|effective|reliable)\b',
             "vague_excellence"),
            (r'\b(?:top-tier|high-quality|premium)\s+(?:performance|solution|system)\b',
             "vague_excellence"),
        ]

        # Compile all patterns
        self.compiled_critical = [(re.compile(p, re.IGNORECASE), c) for p, c in self.critical_patterns]
        self.compiled_high = [(re.compile(p, re.IGNORECASE), c) for p, c in self.high_patterns]
        self.compiled_medium = [(re.compile(p, re.IGNORECASE), c) for p, c in self.medium_patterns]

    def initialize_score_patterns(self):
        """Initialize patterns for detecting fabricated scores."""

        # Score patterns
        self.score_patterns = [
            # Percentage scores
            (r'\b(\d{1,3})(?:\.(\d+))?%\b', "percentage_score"),
            # Decimal scores
            (r'\b(?:score|rating|accuracy|performance|quality):\s*(\d+\.?\d*)', "decimal_score"),
            # Letter grades
            (r'\b(?:grade|rating):\s*([A-F][+-]?)\b', "letter_grade"),
            # X/Y scores
            (r'\b(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\b', "ratio_score"),
            # Out of 10
            (r'\b(\d+(?:\.\d+)?)\s*(?:out\s+of|\/)\s*10\b', "out_of_ten"),
        ]

        self.compiled_scores = [(re.compile(p, re.IGNORECASE), c) for p, c in self.score_patterns]

    def validate_text(self, text: str) -> ValidationResult:
        """
        Validate text for prohibited patterns and score fabrication.

        Args:
            text: Text to validate

        Returns:
            ValidationResult with detected issues
        """
        violations = []
        score_issues = []
        language_issues = []

        # Check for prohibited language patterns
        critical_matches = self._find_matches(text, self.compiled_critical, "CRITICAL")
        high_matches = self._find_matches(text, self.compiled_high, "HIGH")
        medium_matches = self._find_matches(text, self.compiled_medium, "MEDIUM")

        language_issues.extend(critical_matches)
        language_issues.extend(high_matches)
        language_issues.extend(medium_matches)

        # Check for fabricated scores
        score_matches = self._find_score_issues(text)
        score_issues.extend(score_matches)

        # Combine all violations
        violations = language_issues + score_issues

        # Determine risk level
        risk_level = self._calculate_risk_level(critical_matches, high_matches, medium_matches, score_issues)

        # Determine if valid
        is_valid = risk_level in ["LOW", "MEDIUM"] and len(critical_matches) == 0

        return ValidationResult(
            is_valid=is_valid,
            risk_level=risk_level,
            violations=violations,
            score_issues=score_issues,
            language_issues=language_issues,
            total_issues=len(violations)
        )

    def _find_matches(self, text: str, patterns: List[Tuple], level: str) -> List[str]:
        """Find all matches for a set of patterns."""
        matches = []
        for pattern, category in patterns:
            found = pattern.findall(text)
            for match in found:
                match_text = match if isinstance(match, str) else match[0] if match else ""
                matches.append(f"[{level}] {category}: '{match_text}'")
        return matches

    def _find_score_issues(self, text: str) -> List[str]:
        """Find fabricated or unsupported scores."""
        issues = []

        for pattern, category in self.compiled_scores:
            found = pattern.findall(text)
            for match in found:
                # Check for high scores without evidence
                if category == "percentage_score":
                    score = float(match[0]) if match[0] else 0
                    if score > 80:
                        issues.append(f"[SCORE] High percentage score ({score}%) without evidence: '{match}'")
                elif category == "letter_grade":
                    if match in ['A', 'A+', 'A-', 'B+']:
                        issues.append(f"[SCORE] Letter grade without rubric: '{match}'")
                elif category == "out_of_ten":
                    score = float(match) if match else 0
                    if score > 8:
                        issues.append(f"[SCORE] High rating ({score}/10) without measurement: '{match}'")

                # Check for excessive precision
                if category == "decimal_score":
                    score_str = str(match)
                    if '.' in score_str:
                        decimals = len(score_str.split('.')[1])
                        if decimals > 2:
                            issues.append(f"[SCORE] Excessive precision in score: '{match}' ({decimals} decimal places)")

        return issues

    def _calculate_risk_level(self, critical: List, high: List, medium: List, scores: List) -> str:
        """Calculate overall risk level."""
        if len(critical) > 0:
            return "CRITICAL"
        elif len(high) > 0 or len(scores) > 2:
            return "HIGH"
        elif len(medium) > 1 or len(scores) > 0:
            return "MEDIUM"
        else:
            return "LOW"

    def generate_report(self, result: ValidationResult, text: str, detailed: bool = False) -> str:
        """Generate a validation report."""

        report = []
        report.append("=" * 70)
        report.append("VALIDATION REPORT")
        report.append("=" * 70)
        report.append(f"Status: {'PASS' if result.is_valid else 'FAIL'}")
        report.append(f"Risk Level: {result.risk_level}")
        report.append(f"Total Issues: {result.total_issues}")
        report.append("")

        if result.language_issues:
            report.append(f"Prohibited Language Detected ({len(result.language_issues)}):")
            report.append("-" * 70)
            for issue in result.language_issues:
                report.append(f"  {issue}")
            report.append("")

        if result.score_issues:
            report.append(f"Score Fabrication Detected ({len(result.score_issues)}):")
            report.append("-" * 70)
            for issue in result.score_issues:
                report.append(f"  {issue}")
            report.append("")

        if result.is_valid:
            report.append("VALIDATION PASSED: Text follows evidence-based protocols.")
        else:
            report.append("VALIDATION FAILED: Text contains prohibited patterns or fabricated scores.")
            report.append("")
            report.append("Recommendations:")
            report.append("  - Remove or replace prohibited language with factual observations")
            report.append("  - Replace scores with 'Cannot determine without measurement data'")
            report.append("  - Express uncertainty using approved language patterns")
            report.append("  - Focus on describing what is observed, not quality judgments")

        if detailed and not result.is_valid:
            report.append("")
            report.append("=" * 70)
            report.append("ANALYZED TEXT")
            report.append("=" * 70)
            report.append(text[:500] + "..." if len(text) > 500 else text)

        report.append("=" * 70)

        return "\n".join(report)


def main():
    """Main entry point for validation script."""

    # Parse arguments
    detailed = "--detailed" in sys.argv
    if detailed:
        sys.argv.remove("--detailed")

    if len(sys.argv) < 2:
        print("Usage: python validate_claims.py <file_path>")
        print("       python validate_claims.py - # Read from stdin")
        print("       python validate_claims.py --detailed <file_path>")
        sys.exit(1)

    # Read input
    file_path = sys.argv[1]
    if file_path == "-":
        text = sys.stdin.read()
    else:
        try:
            with open(file_path, 'r') as f:
                text = f.read()
        except FileNotFoundError:
            print(f"Error: File not found: {file_path}")
            sys.exit(1)
        except Exception as e:
            print(f"Error reading file: {e}")
            sys.exit(1)

    # Validate
    validator = ClaimValidator()
    result = validator.validate_text(text)

    # Generate and print report
    report = validator.generate_report(result, text, detailed=detailed)
    print(report)

    # Exit with appropriate code
    sys.exit(0 if result.is_valid else 1)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Static diagnostics for common Instancio selector pitfalls in Java test snippets."""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Finding:
    severity: str
    message: str
    hint: str


PATTERNS: list[tuple[re.Pattern[str], str, str, str]] = [
    (
        re.compile(r"Select\.all\(Set\.class\)"),
        "medium",
        "Select.all(Set.class) may not match SortedSet fields in strict mode.",
        "Target the concrete declared type or use predicate selector with assignable check.",
    ),
    (
        re.compile(r"Instancio\.stream\([^)]*\)(?![\s\S]{0,120}limit\()"),
        "high",
        "Instancio.stream() appears without nearby limit().",
        "Add limit(N) to avoid infinite stream behavior.",
    ),
    (
        re.compile(r"\.lenient\(\)"),
        "low",
        "lenient() usage detected.",
        "Confirm lenient mode is intentional and not masking a broken selector.",
    ),
    (
        re.compile(r"Select\.fields\(.*named\(\"[A-Za-z0-9_]+\"\).*\)"),
        "low",
        "Predicate selector by name detected.",
        "Prefer method-reference field selectors for refactor safety.",
    ),
]


def run_diagnostics(source: str) -> list[Finding]:
    findings: list[Finding] = []

    for pattern, severity, message, hint in PATTERNS:
        if pattern.search(source):
            findings.append(Finding(severity=severity, message=message, hint=hint))

    if "Assign.given(" in source and "allStrings()" in source:
        findings.append(
            Finding(
                severity="medium",
                message="Assignment origin may match multiple values.",
                hint="Ensure origin selector matches exactly one target in assign().",
            )
        )

    return findings


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Diagnose Instancio selector risks")
    parser.add_argument("input", type=Path, help="Path to Java test snippet")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = args.input.read_text(encoding="utf-8")
    findings = run_diagnostics(source)

    if not findings:
        print("No obvious selector risks detected.")
        return

    print("Instancio selector diagnostics:")
    for idx, finding in enumerate(findings, start=1):
        print(f"{idx}. [{finding.severity.upper()}] {finding.message}")
        print(f"   Hint: {finding.hint}")


if __name__ == "__main__":
    main()

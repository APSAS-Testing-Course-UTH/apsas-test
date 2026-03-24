#!/usr/bin/env python3
"""Compose a structured prompt for Instancio v6 + JUnit 5 test generation."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path


@dataclass
class PromptRequest:
    test_target: str
    objective: str
    constraints: list[str]
    fixtures: list[str]
    strict_mode: bool
    reproducible: bool


def _load_lines(path: Path | None) -> list[str]:
    if path is None:
        return []
    text = path.read_text(encoding="utf-8")
    return [line.strip() for line in text.splitlines() if line.strip()]


def build_prompt(req: PromptRequest) -> str:
    strict_text = "Use strict selector behavior; avoid lenient unless justified." if req.strict_mode else "Lenient selectors allowed only for explicitly optional targets."
    seed_text = "Include deterministic seed handling for replay." if req.reproducible else "No fixed seed required unless failure reproduction is needed."

    sections = [
        "Create JUnit 5 test code using Instancio v6.",
        f"Target: {req.test_target}",
        f"Objective: {req.objective}",
        "Constraints:",
    ]

    if req.constraints:
        sections.extend(f"- {c}" for c in req.constraints)
    else:
        sections.append("- Keep test concise and readable.")

    sections.append("Known fixtures/context:")
    if req.fixtures:
        sections.extend(f"- {f}" for f in req.fixtures)
    else:
        sections.append("- None provided.")

    sections.extend(
        [
            "Selector policy:",
            f"- {strict_text}",
            "Reproducibility:",
            f"- {seed_text}",
            "Output requirements:",
            "- Return complete test class or method code.",
            "- Use Instancio.create()/of()/generate()/set()/supply()/assign() where appropriate.",
            "- Explain selector choices and edge-case handling briefly.",
        ]
    )

    return "\n".join(sections)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Compose Instancio JUnit prompt")
    parser.add_argument("--target", required=True, help="Class or method under test")
    parser.add_argument("--objective", required=True, help="What the test should validate")
    parser.add_argument("--constraints-file", type=Path, help="Path to line-based constraints file")
    parser.add_argument("--fixtures-file", type=Path, help="Path to line-based fixtures/context file")
    parser.add_argument("--allow-lenient", action="store_true", help="Allow lenient selectors")
    parser.add_argument("--reproducible", action="store_true", help="Request reproducible seed strategy")
    parser.add_argument("--json", action="store_true", help="Output JSON payload")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    request = PromptRequest(
        test_target=args.target,
        objective=args.objective,
        constraints=_load_lines(args.constraints_file),
        fixtures=_load_lines(args.fixtures_file),
        strict_mode=not args.allow_lenient,
        reproducible=args.reproducible,
    )

    prompt = build_prompt(request)

    if args.json:
        payload = {"prompt": prompt, "target": request.test_target, "objective": request.objective}
        print(json.dumps(payload, indent=2))
    else:
        print(prompt)


if __name__ == "__main__":
    main()

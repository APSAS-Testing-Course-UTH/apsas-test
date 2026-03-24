---
applyTo: "sources/**/test/**/*.java"
---

# Test Conventions (APSAS Backend)

Use these rules whenever creating or updating tests in this repository.

## Scope and Intent

- Prefer one behavior per test method.
- Keep tests deterministic and independent; avoid order coupling and time-sensitive assertions.
- Use unit tests for pure logic and mocked collaborators.
- Use integration tests for Spring wiring, persistence, messaging, or HTTP boundary verification.

## Naming and Structure

- Test class names must end with `Test` for unit tests and `IT` for integration tests.
- Test method names should follow: `method_shouldExpectedBehavior_whenScenario`.
- Add `@DisplayName` on test methods for human-readable report output.
- Follow Arrange-Act-Assert with clear separation of setup, execution, and assertions.
- Avoid multiple unrelated assertions in one test; split into separate methods when outcomes differ.

## JUnit 5 Patterns

- Use JUnit 5 annotations and assertions.
- Use `@ParameterizedTest` for data-driven variations of the same behavior.
- Prefer `@MethodSource` or `@CsvSource` when inputs need clarity in review.
- Use `@Tag("unit")` or `@Tag("integration")` as a primary type tag on each test.

## Instancio Object Generation

- Use Instancio to automatically create and populate test objects instead of manual fixture boilerplate.
- Prefer `Instancio.create(Class)` for simple one-off objects and `Instancio.of(Class)` when customizing fields.
- Use selectors and generators to control important values for the scenario under test; keep non-essential fields auto-generated.
- Use reusable Instancio models for repeated domain fixtures across multiple test classes.
- Use `Instancio.fill(existingObject)` when a partially prepared object must be completed for test setup.
- Keep generated data deterministic when needed by using an explicit seed for reproducibility.
- Avoid over-customizing every field; only set values that affect behavior being asserted.
- Do not use random data for assertions that require exact, stable expected values.

## Allure Reporting Rules

- Use annotation-first metadata for stable reporting.
- Always use `@DisplayName`.
- Prefer `@Description`, `@Epic`, `@Feature`, and `@Story` for behavior context.
- Use `@Severity` for business impact signaling.
- For integration tests, require `@Owner` to support team triage.
- Use `@Issue` or `@TmsLink` when traceability exists.
- Use `@Step` on reusable helper methods that represent meaningful milestones.
- Add attachments only when they help diagnose failures; include clear names and media types.
- Never attach secrets or raw credentials.

## Unit vs Integration Metadata Minimum

- Unit test minimum: `@DisplayName`, `@Tag("unit")`, and `@Feature` or `@Story`.
- Integration test minimum: `@DisplayName`, `@Description`, `@Tag("integration")`, `@Epic`, `@Feature`, `@Story`, and `@Owner`.

## Definition of Done for New Tests

- Test verifies a single behavior and fails for the right reason.
- Naming is behavior-oriented and scenario-specific.
- Structure follows Arrange-Act-Assert.
- Test type is tagged (`unit` or `integration`).
- Allure metadata is present and useful for report filtering and triage.

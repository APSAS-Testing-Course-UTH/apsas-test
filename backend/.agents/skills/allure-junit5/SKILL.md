---
name: allure-junit5
description: Project-specific conventions for writing JUnit 5 unit and integration tests with high-signal Allure reports in a Spring Boot microservices team.
---

# JUnit 5 + Allure Authoring Conventions

Your goal is to write tests that are correct, maintainable, and easy to interpret in Allure reports.

This skill focuses on test-writing conventions only. Do not add setup, dependency, plugin, or configuration instructions.

## Project Context

- Team size: 5 members.
- Architecture: Spring Boot microservices.
- Testing focus: unit tests and integration tests.
- Reporting goal: each service team member can triage failures quickly using Allure metadata, steps, and evidence.

## Core Principles

- Prefer the Allure Annotation API on test methods/classes for stable, reviewable metadata.
- Use Runtime API only when values must be computed dynamically at runtime.
- Keep tests behavior-focused: one business behavior per test.
- Treat the report as a product artifact: titles, hierarchy, and attachments must be readable by non-authors.
- Use deterministic data and assertions to avoid flaky history in report trends.
- Optimize for handoff: another teammate should understand and debug a failed test in under 5 minutes from the report.

## Annotation-First Policy

Use these annotations by default when they provide static values:

- `@DisplayName`
- `@Description`
- `@Epic`, `@Feature`, `@Story`
- `@Severity`
- `@Owner`
- `@Link`, `@Issue`, `@TmsLink`
- `@Tag`
- `@Attachment`

Use Runtime API (`Allure.*`) only for:

- Dynamic names/labels that depend on generated test input.
- Step-local values known only inside the test body.
- Temporary migration when annotations are not feasible.

When Runtime API is necessary, add metadata as early as possible in the test body so failed tests still carry context.

## Team Metadata Conventions

### Ownership

- Integration tests: `@Owner` is required.
- Unit tests: `@Owner` is recommended for complex or flaky-prone areas.
- Owner value should be a stable team identifier (for example: username or team alias), not a temporary display name.

### Microservice Hierarchy

Use consistent hierarchy labels so reports can be filtered by service:

- `@Epic`: service/domain area (for example: Identity Service, Content Service, Submission Service).
- `@Feature`: module or capability inside the service.
- `@Story`: concrete business behavior/scenario.

### Test-Type Tags

Use exactly one primary type tag per test:

- `@Tag("unit")`
- `@Tag("integration")`

Optional secondary tags may include:

- service name tag (for example: `identity`, `content`, `submission`)
- risk tag (for example: `critical-path`, `regression`)

## Workflow

### 1. Define test intent before coding

- Write a behavior-style test name: `method_shouldOutcome_whenScenario`.
- Add a `@DisplayName` that business users can read.
- Confirm single responsibility: if there are multiple independent outcomes, split into multiple tests.

### 1.5 Choose unit vs integration scope first

Choose unit test when:

- Behavior is pure business logic.
- Collaborators can be mocked safely.
- No Spring context or external boundary is required.

Choose integration test when:

- You validate interaction across Spring layers.
- You verify persistence, messaging, HTTP client/server boundaries, or transaction behavior.
- Wiring and configuration behavior is part of what you are asserting.

### 2. Add report metadata (annotation-first)

On each test, choose the minimum useful metadata:

- Always: `@DisplayName`.
- Usually: `@Description` and `@Epic/@Feature/@Story`.
- Risk-based: `@Severity` for business impact.
- Traceability: `@Issue`/`@TmsLink` when work item linkage exists.
- Ownership: `@Owner` for accountability in triage.

Rule of thumb:

- If value is known at compile time, use annotation.
- If value is computed from test data, use Runtime API once and keep it consistent.

Test-type minimums:

- Unit test minimum: `@DisplayName`, `@Tag("unit")`, and meaningful `@Feature` or `@Story`.
- Integration test minimum: `@DisplayName`, `@Description`, `@Tag("integration")`, `@Epic`, `@Feature`, `@Story`, `@Owner`.

### 3. Structure test body with clear phases

Keep test code in AAA flow:

- Arrange: create inputs, mocks, fixtures.
- Act: execute one operation under test.
- Assert: verify one behavior outcome.

For report readability, represent meaningful milestones as steps. Prefer reusable helper methods with `@Step` for repeated logic. Use lambda steps only for local, one-off flow.

Guidance by test type:

- Unit test: 1-3 steps max, only for non-trivial logic branches.
- Integration test: explicit steps for setup, execution, and cross-boundary verification.

### 4. Handle parameterized tests deliberately

- Use JUnit parameterized tests (`@ParameterizedTest`, `@ValueSource`, `@CsvSource`, `@MethodSource`) for scenario coverage.
- Ensure display names clearly distinguish argument variants.
- Add explicit Allure parameters only when they improve report readability; avoid duplicating obvious values.
- Avoid relying only on dynamic parameters to distinguish test identity/history.

For team consistency, use parameterized tests mainly for unit tests unless integration scenarios truly share identical setup and differ only by data.

### 5. Attach evidence with intent

Use attachments only when they speed up failure diagnosis.

Preferred order:

- Annotation API via `@Attachment` method for reusable, stable artifacts.
- Runtime attachment only for truly dynamic or inlined evidence.

Attachment guidelines:

- Choose meaningful names (`request.json`, `validation-errors.txt`).
- Provide correct media type and file extension.
- Never attach secrets; mask or omit sensitive values.
- Keep attachment volume proportional to value.

Attachment priority by test type:

- Unit test: attach only when diagnosing complex failures.
- Integration test: attach request/response, payload snapshots, and key validation output when useful.

### 6. Keep hierarchy and tags consistent

- `@Epic` is broad product area.
- `@Feature` is capability group.
- `@Story` is user-facing behavior.
- `@Tag` is for orthogonal slicing (e.g., `fast`, `integration`, `regression`).

Do not overload tags to replace hierarchy labels.

Use severity consistently across team reviews:

- `CRITICAL` or `BLOCKER`: core business flow integration tests.
- `NORMAL` or `MINOR`: most unit tests and non-critical paths.

## Quality Gates (Definition of Done)

A test is considered report-ready when all are true:

- It verifies one behavior with deterministic assertions.
- `@DisplayName` is descriptive and business-readable.
- Metadata uses annotations unless dynamic values are required.
- Test type is explicitly tagged as unit or integration.
- Steps show meaningful milestones, not line-by-line narration.
- Attachments are purposeful, typed, and free from secrets.
- Hierarchy labels (`Epic/Feature/Story`) are consistent with neighboring tests.
- Links to issue/TMS are present when traceability is expected.
- Integration tests include owner and service-scoped hierarchy labels.

## Common Anti-Patterns

- Missing `@DisplayName` and relying on method names only.
- Adding every possible label to every test (metadata noise).
- Using Runtime API for static metadata that should be annotation-based.
- Mixing unit and integration concerns in one test class.
- Missing test-type tag, making team dashboards hard to filter.
- Tiny no-op steps for every statement, making reports noisy.
- Huge untyped attachments without diagnostic value.
- One test asserting multiple unrelated behaviors.

## Minimal Annotation-First Example

```java
import io.qameta.allure.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@Epic("Submission")
@Feature("Input Validation")
class SubmissionValidatorTest {

	@Test
	@DisplayName("Rejects payload when required title is missing")
	@Story("Create submission")
	@Severity(SeverityLevel.NORMAL)
	@Owner("backend-team")
	@Issue("SUB-142")
	@Description("Validator returns a field error for title when title is null or blank.")
	void validate_shouldFail_whenTitleMissing() {
		runValidation();
		verifyValidationError();
	}

	@Step("Run validation")
	void runValidation() {
		// Arrange + Act
	}

	@Step("Verify title field error")
	void verifyValidationError() {
		// Assert
	}
}
```

## Team Review Checklist

- Does the test clearly declare unit or integration intent?
- Can another team member identify service, feature, and scenario from metadata only?
- Is owner present where integration failures need clear triage routing?
- Are steps and attachments minimal but sufficient to debug failures?
- Is Runtime API used only where dynamic values are unavoidable?

## Reference

- [Allure JUnit 5 Reference](./references/allure-junit-5-reference.md)

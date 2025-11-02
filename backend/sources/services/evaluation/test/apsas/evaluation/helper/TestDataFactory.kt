package apsas.evaluation.helper

import apsas.evaluation.model.dto.PistonExecuteResponse
import apsas.evaluation.model.dto.RuntimeResponse
import apsas.feign.dto.AssignmentResponse
import apsas.feign.dto.TestCaseDto
import apsas.shared.messaging.event.SubmissionCreatedEvent
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

/**
 * Factory class for creating test data objects
 */
object TestDataFactory {
    fun createSubmissionCreatedEvent(
        submissionId: UUID = UUID.randomUUID(),
        assignmentId: UUID = UUID.randomUUID(),
        studentId: UUID = UUID.randomUUID(),
        code: String = "print('Hello')",
        language: String = "python",
    ): SubmissionCreatedEvent = SubmissionCreatedEvent(submissionId, assignmentId, studentId, code, language)

    fun createAssignmentResponse(
        assignmentId: UUID = UUID.randomUUID(),
        languages: List<String> = listOf("python", "java"),
    ): AssignmentResponse {
        val assignment = AssignmentResponse()
        assignment.id = assignmentId
        assignment.title = "Test Assignment"
        assignment.description = "Test assignment description"
        assignment.difficultyLevel = "EASY"
        assignment.creatorId = UUID.randomUUID()
        assignment.createdAt = LocalDateTime.now()
        assignment.updatedAt = LocalDateTime.now()
        assignment.maxScore = BigDecimal.valueOf(100)
        assignment.languages = languages.toTypedArray()

        val testCases = mutableListOf<TestCaseDto>()
        testCases.add(createTestCaseDto(1, "5\n3", "8", 1.0))
        testCases.add(createTestCaseDto(2, "10\n20", "30", 1.0))
        assignment.testCases = testCases

        return assignment
    }

    fun createTestCaseDto(
        order: Int,
        input: String,
        output: String,
        weight: Double,
    ): TestCaseDto =
        TestCaseDto().apply {
            this.order = order
            this.description = "Test case $order"
            this.input = input
            this.output = output
            this.weight = weight
            this.hidden = false
        }

    fun createRuntimeResponse(
        language: String = "python",
        version: String = "3.10.0",
        runtime: String = "python",
    ): RuntimeResponse = RuntimeResponse(language, version, listOf("alias1", "alias2"), runtime)

    fun createRuntimesList(): List<RuntimeResponse> =
        listOf(
            createRuntimeResponse("python", "3.10.0", "python"),
            createRuntimeResponse("java", "17.0.0", "java"),
            createRuntimeResponse("javascript", "18.15.0", "javascript"),
        )

    fun createSuccessfulPistonResponse(output: String = "8\n"): PistonExecuteResponse =
        PistonExecuteResponse(
            "python",
            "3.10.0",
            PistonExecuteResponse.ExecutionResult(output, "", null, 0, null),
            null,
        )

    fun createFailedPistonResponse(errorMessage: String = "Error"): PistonExecuteResponse =
        PistonExecuteResponse(
            "python",
            "3.10.0",
            PistonExecuteResponse.ExecutionResult("", errorMessage, null, 1, null),
            null,
        )

    fun createCompilationErrorPistonResponse(compileError: String = "Syntax error"): PistonExecuteResponse =
        PistonExecuteResponse(
            "java",
            "17.0.0",
            PistonExecuteResponse.ExecutionResult("", "", null, 0, null),
            PistonExecuteResponse.ExecutionResult("", compileError, null, 1, null),
        )
}

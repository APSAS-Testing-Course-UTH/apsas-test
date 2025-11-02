package apsas.submission.helper

import apsas.submission.model.entity.Submission
import apsas.submission.model.entity.SubmissionResult
import apsas.submission.model.entity.SubmissionStatus
import apsas.submission.model.entity.TestCaseResult
import apsas.submission.repository.SubmissionRepository
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Component
class TestDataHelper(
    private val submissionRepository: SubmissionRepository,
) {
    fun createSubmission(
        assignmentId: UUID = UUID.randomUUID(),
        studentId: UUID = UUID.randomUUID(),
        code: String =
            """
            public class Main {
                public static void main(String[] args) {
                    System.out.println("Hello World");
                }
            }
            """.trimIndent(),
        language: String = "java",
        status: SubmissionStatus = SubmissionStatus.PENDING,
        result: SubmissionResult? = null,
        score: BigDecimal? = null,
        testCaseResults: List<TestCaseResult> = emptyList(),
        evaluatedAt: LocalDateTime? = null,
        feedback: String? = null,
    ): Submission {
        val submission = Submission()
        submission.assignmentId = assignmentId
        submission.studentId = studentId
        submission.code = code
        submission.language = language
        submission.status = status
        submission.result = result
        submission.score = score
        submission.testCaseResults = testCaseResults
        submission.evaluatedAt = evaluatedAt
        submission.feedback = feedback
        return submissionRepository.save(submission)
    }

    fun createPendingSubmission(
        assignmentId: UUID = UUID.randomUUID(),
        studentId: UUID = UUID.randomUUID(),
        code: String = "print('hello')",
        language: String = "python",
    ): Submission =
        createSubmission(
            assignmentId = assignmentId,
            studentId = studentId,
            code = code,
            language = language,
            status = SubmissionStatus.PENDING,
        )

    fun createEvaluatedSubmission(
        assignmentId: UUID = UUID.randomUUID(),
        studentId: UUID = UUID.randomUUID(),
        code: String = "print('hello')",
        language: String = "python",
        result: SubmissionResult = SubmissionResult.PASSED,
        score: BigDecimal = BigDecimal("100.00"),
        feedback: String = "Well done!",
    ): Submission =
        createSubmission(
            assignmentId = assignmentId,
            studentId = studentId,
            code = code,
            language = language,
            status = SubmissionStatus.EVALUATED,
            result = result,
            score = score,
            evaluatedAt = LocalDateTime.now().minusHours(1),
            feedback = feedback,
        )

    fun cleanupAll() {
        submissionRepository.deleteAll()
    }
}

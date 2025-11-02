package apsas.submission.helper

import apsas.submission.model.dto.CreateSubmissionRequest
import apsas.submission.model.dto.SubmissionFeedbackRequest
import java.util.UUID

object TestDataFactory {
    fun createSubmissionRequest(
        assignmentId: UUID = UUID.randomUUID(),
        code: String =
            """
            public class Main {
                public static void main(String[] args) {
                    System.out.println("Hello World");
                }
            }
            """.trimIndent(),
        language: String = "java",
    ): CreateSubmissionRequest = CreateSubmissionRequest(assignmentId, code, language)

    fun createFeedbackRequest(feedback: String = "Good work! Consider improving the error handling."): SubmissionFeedbackRequest =
        SubmissionFeedbackRequest(feedback)
}

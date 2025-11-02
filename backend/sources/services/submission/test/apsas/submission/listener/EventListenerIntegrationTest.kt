package apsas.submission.listener

import apsas.shared.messaging.config.RabbitMqConfig
import apsas.shared.messaging.event.SubmissionEvaluatedEvent
import apsas.shared.messaging.model.SubmissionResult
import apsas.shared.messaging.model.SubmissionStatus
import apsas.shared.models.submission.TestCaseResultDto
import apsas.shared.test.IntegrationSpec
import apsas.submission.SubmissionServiceApplication
import apsas.submission.helper.TestDataHelper
import apsas.submission.model.entity.SubmissionResult as SubmissionResultEntity
import apsas.submission.model.entity.SubmissionStatus as SubmissionStatusEntity
import apsas.submission.repository.SubmissionRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import java.math.BigDecimal
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@DisplayName("EventListener Integration Tests")
@ActiveProfiles("integration")
@ContextConfiguration(classes = [SubmissionServiceApplication::class])
class EventListenerIntegrationTest : IntegrationSpec() {
    @Autowired
    private lateinit var rabbitTemplate: RabbitTemplate

    @Autowired
    private lateinit var submissionRepository: SubmissionRepository

    @Autowired
    private lateinit var testDataHelper: TestDataHelper

    @BeforeEach
    fun setUp() {
        testDataHelper.cleanupAll()
    }

    @AfterEach
    fun tearDown() {
        testDataHelper.cleanupAll()
    }

    companion object {
        fun createTestCaseResultDto(
            order: Int = 1,
            description: String = "Test case",
            hidden: Boolean = false,
            weight: Double = 1.0,
            input: String = "test input",
            output: String = "test output",
            timeout: Int = 5,
            memoryLimit: Int = 256,
            passed: Boolean = true,
            actualOutput: String = "test output",
            errorMessage: String? = null,
            executionTime: Double = 0.1,
            memoryUsed: Double = 32.0,
        ): TestCaseResultDto {
            val result = TestCaseResultDto()
            result.order = order
            result.description = description
            result.hidden = hidden
            result.weight = weight
            result.input = input
            result.output = output
            result.timeout = timeout
            result.memoryLimit = memoryLimit
            result.passed = passed
            result.actualOutput = actualOutput
            result.errorMessage = errorMessage
            result.executionTime = executionTime
            result.memoryUsed = memoryUsed
            return result
        }
    }

    @Nested
    @DisplayName("SubmissionEvaluatedEvent Handler Tests")
    inner class SubmissionEvaluatedEventHandlerTests {
        @Test
        @DisplayName("should update submission with evaluation results when event is received")
        fun shouldUpdateSubmissionWhenEventReceived() {
            // Arrange
            val submission = testDataHelper.createPendingSubmission()
            val testCaseResults =
                listOf(
                    createTestCaseResultDto(order = 1, passed = true),
                    createTestCaseResultDto(order = 2, passed = true),
                )

            val event =
                SubmissionEvaluatedEvent(
                    submission.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.PASSED,
                    BigDecimal("100.00"),
                    testCaseResults,
                    LocalDateTime.now(),
                )

            // Act
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event,
            )
            Thread.sleep(2000)

            // Assert
            val updated = submissionRepository.findById(submission.id).orElseThrow()
            assertEquals(SubmissionStatusEntity.EVALUATED, updated.status)
            assertEquals(SubmissionResultEntity.PASSED, updated.result)
            assertEquals(BigDecimal("100.00"), updated.score)
            assertNotNull(updated.evaluatedAt)
            assertEquals(2, updated.testCaseResults?.size)
        }

        @Test
        @DisplayName("should update submission with PARTIAL result when some tests fail")
        fun shouldUpdateSubmissionWithPartialResult() {
            // Arrange
            val submission = testDataHelper.createPendingSubmission()
            val testCaseResults =
                listOf(
                    createTestCaseResultDto(order = 1, passed = true),
                    createTestCaseResultDto(
                        order = 2,
                        passed = false,
                        errorMessage = "Expected 20 but got 15",
                    ),
                )

            val event =
                SubmissionEvaluatedEvent(
                    submission.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.PARTIAL,
                    BigDecimal("50.00"),
                    testCaseResults,
                    LocalDateTime.now(),
                )

            // Act
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event,
            )
            Thread.sleep(2000)

            // Assert
            val updated = submissionRepository.findById(submission.id).orElseThrow()
            assertEquals(SubmissionStatusEntity.EVALUATED, updated.status)
            assertEquals(SubmissionResultEntity.PARTIAL, updated.result)
            assertEquals(BigDecimal("50.00"), updated.score)
            val sorted = updated.testCaseResults?.sortedBy { it.order }
            assertEquals(true, sorted?.get(0)?.passed)
            assertEquals(false, sorted?.get(1)?.passed)
            assertEquals("Expected 20 but got 15", sorted?.get(1)?.errorMessage)
        }

        @Test
        @DisplayName("should update submission with FAILED result when all tests fail")
        fun shouldUpdateSubmissionWithFailedResult() {
            // Arrange
            val submission = testDataHelper.createPendingSubmission()
            val testCaseResults =
                listOf(
                    createTestCaseResultDto(
                        order = 1,
                        passed = false,
                        errorMessage = "NullPointerException",
                    ),
                )

            val event =
                SubmissionEvaluatedEvent(
                    submission.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.FAILED,
                    BigDecimal("0.00"),
                    testCaseResults,
                    LocalDateTime.now(),
                )

            // Act
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event,
            )
            Thread.sleep(2000)

            // Assert
            val updated = submissionRepository.findById(submission.id).orElseThrow()
            assertEquals(SubmissionStatusEntity.EVALUATED, updated.status)
            assertEquals(SubmissionResultEntity.FAILED, updated.result)
            assertEquals(BigDecimal("0.00"), updated.score)
            assertEquals("NullPointerException", updated.testCaseResults?.get(0)?.errorMessage)
        }

        @Test
        @DisplayName("should preserve test case execution metrics")
        fun shouldPreserveExecutionMetrics() {
            // Arrange
            val submission = testDataHelper.createPendingSubmission()
            val testCaseResults =
                listOf(
                    createTestCaseResultDto(
                        order = 1,
                        timeout = 30,
                        memoryLimit = 512,
                        executionTime = 25.456,
                        memoryUsed = 450.0,
                    ),
                )

            val event =
                SubmissionEvaluatedEvent(
                    submission.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.PASSED,
                    BigDecimal("100.00"),
                    testCaseResults,
                    LocalDateTime.now(),
                )

            // Act
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event,
            )
            Thread.sleep(2000)

            // Assert
            val updated = submissionRepository.findById(submission.id).orElseThrow()
            val testCase = updated.testCaseResults?.get(0)
            assertEquals(25.456, testCase?.executionTime)
            assertEquals(450.0, testCase?.memoryUsed)
            assertEquals(30, testCase?.timeout)
            assertEquals(512, testCase?.memoryLimit)
        }

        @Test
        @DisplayName("should update evaluated_at timestamp when event is received")
        fun shouldUpdateEvaluatedAtTimestamp() {
            // Arrange
            val submission = testDataHelper.createPendingSubmission()
            // Truncate to microseconds to match database precision (PostgreSQL stores timestamps at microsecond precision)
            val now = LocalDateTime.now().truncatedTo(ChronoUnit.MICROS)

            val event =
                SubmissionEvaluatedEvent(
                    submission.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.PASSED,
                    BigDecimal("100.00"),
                    emptyList(),
                    now,
                )

            // Act
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event,
            )
            Thread.sleep(2000)

            // Assert
            val updated = submissionRepository.findById(submission.id).orElseThrow()
            assertNotNull(updated.evaluatedAt)
            assertEquals(now, updated.evaluatedAt)
        }

        @Test
        @DisplayName("should handle empty test case results")
        fun shouldHandleEmptyTestCaseResults() {
            // Arrange
            val submission = testDataHelper.createPendingSubmission()

            val event =
                SubmissionEvaluatedEvent(
                    submission.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.PASSED,
                    BigDecimal("100.00"),
                    emptyList(),
                    LocalDateTime.now(),
                )

            // Act
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event,
            )
            Thread.sleep(2000)

            // Assert
            val updated = submissionRepository.findById(submission.id).orElseThrow()
            assertEquals(SubmissionStatusEntity.EVALUATED, updated.status)
            assertEquals(SubmissionResultEntity.PASSED, updated.result)
            assertEquals(0, updated.testCaseResults?.size)
        }

        @Test
        @DisplayName("should handle null test case results gracefully")
        fun shouldHandleNullTestCaseResults() {
            // Arrange
            val submission = testDataHelper.createPendingSubmission()

            val event =
                SubmissionEvaluatedEvent(
                    submission.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.FAILED,
                    BigDecimal("0.00"),
                    null,
                    LocalDateTime.now(),
                )

            // Act
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event,
            )
            Thread.sleep(2000)

            // Assert
            val updated = submissionRepository.findById(submission.id).orElseThrow()
            assertEquals(SubmissionStatusEntity.EVALUATED, updated.status)
            assertEquals(SubmissionResultEntity.FAILED, updated.result)
            assertEquals(null, updated.testCaseResults)
        }

        @Test
        @DisplayName("should handle null evaluated_at by setting it to now()")
        fun shouldSetEvaluatedAtToNowWhenNull() {
            // Arrange
            val submission = testDataHelper.createPendingSubmission()

            val event =
                SubmissionEvaluatedEvent(
                    submission.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.PASSED,
                    BigDecimal("100.00"),
                    emptyList(),
                    null,
                )

            // Act
            val beforeProcessing = LocalDateTime.now()
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event,
            )
            Thread.sleep(2000)
            val afterProcessing = LocalDateTime.now()

            // Assert
            val updated = submissionRepository.findById(submission.id).orElseThrow()
            assertNotNull(updated.evaluatedAt)
            assert(updated.evaluatedAt!!.isBefore(afterProcessing))
            assert(updated.evaluatedAt!!.isAfter(beforeProcessing.minusSeconds(1)))
        }

        @Test
        @DisplayName("should handle hidden test cases correctly")
        fun shouldHandleHiddenTestCases() {
            // Arrange
            val submission = testDataHelper.createPendingSubmission()
            val testCaseResults =
                listOf(
                    createTestCaseResultDto(order = 1, hidden = false),
                    createTestCaseResultDto(order = 2, hidden = true),
                )

            val event =
                SubmissionEvaluatedEvent(
                    submission.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.PARTIAL,
                    BigDecimal("50.00"),
                    testCaseResults,
                    LocalDateTime.now(),
                )

            // Act
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event,
            )
            Thread.sleep(2000)

            // Assert
            val updated = submissionRepository.findById(submission.id).orElseThrow()
            val sorted = updated.testCaseResults?.sortedBy { it.order }
            assertEquals(false, sorted?.get(0)?.hidden)
            assertEquals(true, sorted?.get(1)?.hidden)
        }

        @Test
        @DisplayName("should handle weighted test cases")
        fun shouldHandleWeightedTestCases() {
            // Arrange
            val submission = testDataHelper.createPendingSubmission()
            val testCaseResults =
                listOf(
                    createTestCaseResultDto(order = 1, weight = 2.0),
                    createTestCaseResultDto(order = 2, weight = 0.5),
                )

            val event =
                SubmissionEvaluatedEvent(
                    submission.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.PASSED,
                    BigDecimal("95.00"),
                    testCaseResults,
                    LocalDateTime.now(),
                )

            // Act
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event,
            )
            Thread.sleep(2000)

            // Assert
            val updated = submissionRepository.findById(submission.id).orElseThrow()
            val sorted = updated.testCaseResults?.sortedBy { it.order }
            assertEquals(2.0, sorted?.get(0)?.weight)
            assertEquals(0.5, sorted?.get(1)?.weight)
        }

        @Test
        @DisplayName("should process multiple events sequentially for different submissions")
        fun shouldProcessMultipleEventsSequentially() {
            // Arrange
            val submission1 = testDataHelper.createPendingSubmission()
            val submission2 = testDataHelper.createPendingSubmission()

            val event1 =
                SubmissionEvaluatedEvent(
                    submission1.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.PASSED,
                    BigDecimal("100.00"),
                    emptyList(),
                    LocalDateTime.now(),
                )

            val event2 =
                SubmissionEvaluatedEvent(
                    submission2.id,
                    SubmissionStatus.EVALUATED,
                    SubmissionResult.FAILED,
                    BigDecimal("0.00"),
                    emptyList(),
                    LocalDateTime.now(),
                )

            // Act
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event1,
            )
            Thread.sleep(1000)
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY,
                event2,
            )
            Thread.sleep(2000)

            // Assert
            val updated1 = submissionRepository.findById(submission1.id).orElseThrow()
            val updated2 = submissionRepository.findById(submission2.id).orElseThrow()

            assertEquals(SubmissionStatusEntity.EVALUATED, updated1.status)
            assertEquals(SubmissionResultEntity.PASSED, updated1.result)
            assertEquals(BigDecimal("100.00"), updated1.score)

            assertEquals(SubmissionStatusEntity.EVALUATED, updated2.status)
            assertEquals(SubmissionResultEntity.FAILED, updated2.result)
            assertEquals(BigDecimal("0.00"), updated2.score)
        }
    }
}

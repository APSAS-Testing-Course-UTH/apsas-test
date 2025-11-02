package apsas.evaluation.messaging

import apsas.evaluation.EvaluationServiceApplication
import apsas.evaluation.IntegrationSpec
import apsas.evaluation.client.PistonApiClient
import apsas.evaluation.helper.TestDataFactory
import apsas.evaluation.model.dto.PistonExecuteRequest
import apsas.feign.client.AssignmentFeignClient
import apsas.shared.messaging.config.RabbitMqConfig
import apsas.shared.messaging.event.EventPublisher
import apsas.shared.messaging.event.SubmissionEvaluatedEvent
import apsas.shared.messaging.model.SubmissionResult
import apsas.shared.messaging.model.SubmissionStatus
import org.awaitility.Awaitility.await
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.eq
import org.mockito.kotlin.given
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean
import java.math.BigDecimal
import java.time.Duration
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * Integration test for SubmissionEventListener
 * Tests RabbitMQ message handling with mocked external dependencies
 */
@ContextConfiguration(classes = [EvaluationServiceApplication::class])
class SubmissionEventListenerIntegrationTest : IntegrationSpec() {
    @Autowired
    private lateinit var rabbitTemplate: RabbitTemplate

    @MockitoBean
    private lateinit var pistonApiClient: PistonApiClient

    @MockitoBean
    private lateinit var assignmentFeignClient: AssignmentFeignClient

    @MockitoSpyBean
    private lateinit var eventPublisher: EventPublisher

    @Nested
    @DisplayName("SubmissionCreatedEvent Handling")
    inner class SubmissionCreatedEventTests {
        @Test
        @DisplayName("should evaluate submission and publish success event when all test cases pass")
        fun `should evaluate submission successfully`() {
            // Given
            val submissionId = UUID.randomUUID()
            val assignmentId = UUID.randomUUID()
            val studentId = UUID.randomUUID()
            val code = "def add(a, b):\n    return a + b\n\nprint(add(int(input()), int(input())))"
            val language = "python"

            val event =
                TestDataFactory.createSubmissionCreatedEvent(
                    submissionId,
                    assignmentId,
                    studentId,
                    code,
                    language,
                )
            val assignment =
                TestDataFactory.createAssignmentResponse(assignmentId, listOf("python", "java"))

            // Mock assignment retrieval

            given(assignmentFeignClient.getAssignmentById(assignmentId))
                .willReturn(assignment)

            // Mock Piston API responses - use thenAnswer for reliable async handling
            given(pistonApiClient.execute(any()))
                .willAnswer { invocation ->
                    val request = invocation.getArgument<PistonExecuteRequest>(0)
                    // Return appropriate response based on stdin (test input)
                    when {
                        request
                            .stdin()
                            .contains("5") -> TestDataFactory.createSuccessfulPistonResponse("8\n")

                        request
                            .stdin()
                            .contains("10") -> TestDataFactory.createSuccessfulPistonResponse("30\n")

                        else -> TestDataFactory.createSuccessfulPistonResponse("default\n")
                    }
                }

            // When
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY,
                event,
            )

            // Then - Wait for async processing
            await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted {
                    val eventCaptor = ArgumentCaptor.forClass(SubmissionEvaluatedEvent::class.java)
                    verify(eventPublisher).publish(
                        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
                        eventCaptor.capture(),
                    )

                    val publishedEvent = eventCaptor.value
                    assertEquals(submissionId, publishedEvent.submissionId)
                    assertEquals(SubmissionStatus.EVALUATED, publishedEvent.status)
                    assertEquals(SubmissionResult.PASSED, publishedEvent.result)
                    assertEquals(
                        0,
                        publishedEvent.score.compareTo(BigDecimal.valueOf(100.00)),
                    )
                    assertEquals(2, publishedEvent.testCaseResults.size)
                    assertTrue(publishedEvent.testCaseResults[0].passed!!)
                    assertTrue(publishedEvent.testCaseResults[1].passed!!)
                }
        }

        @Test
        @DisplayName("should evaluate submission with partial results when some test cases fail")
        fun `should evaluate submission with partial results`() {
            // Given
            val submissionId = UUID.randomUUID()
            val assignmentId = UUID.randomUUID()
            val studentId = UUID.randomUUID()
            val code = "print('Wrong output')"
            val language = "python"

            val event =
                TestDataFactory.createSubmissionCreatedEvent(
                    submissionId,
                    assignmentId,
                    studentId,
                    code,
                    language,
                )
            val assignment =
                TestDataFactory.createAssignmentResponse(assignmentId, listOf("python"))

            given(assignmentFeignClient.getAssignmentById(assignmentId))
                .willReturn(assignment)

            // Mock Piston API - first test case passes, second fails based on input
            given(pistonApiClient.execute(any()))
                .willAnswer { invocation ->
                    val request = invocation.getArgument<PistonExecuteRequest>(0)
                    when {
                        request
                            .stdin()
                            .contains("5") -> TestDataFactory.createSuccessfulPistonResponse("8\n")

                        request
                            .stdin()
                            .contains("10") -> TestDataFactory.createSuccessfulPistonResponse("Wrong output\n")

                        else -> TestDataFactory.createSuccessfulPistonResponse("default\n")
                    }
                }

            // When
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY,
                event,
            )

            // Then
            await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted {
                    val eventCaptor = ArgumentCaptor.forClass(SubmissionEvaluatedEvent::class.java)
                    verify(eventPublisher).publish(
                        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
                        eventCaptor.capture(),
                    )

                    val publishedEvent = eventCaptor.value
                    assertEquals(submissionId, publishedEvent.submissionId)
                    assertEquals(SubmissionResult.PARTIAL, publishedEvent.result)
                    assertEquals(
                        0,
                        publishedEvent.score.compareTo(BigDecimal.valueOf(50.00)),
                    )
                    assertEquals(2, publishedEvent.testCaseResults.size)
                    assertTrue(publishedEvent.testCaseResults[0].passed!!)
                    assertTrue(!publishedEvent.testCaseResults[1].passed!!)
                }
        }

        @Test
        @DisplayName("should evaluate submission as failed when all test cases fail")
        fun `should evaluate submission as failed`() {
            // Given
            val submissionId = UUID.randomUUID()
            val assignmentId = UUID.randomUUID()
            val studentId = UUID.randomUUID()
            val code = "print('Wrong')"
            val language = "python"

            val event =
                TestDataFactory.createSubmissionCreatedEvent(
                    submissionId,
                    assignmentId,
                    studentId,
                    code,
                    language,
                )
            val assignment =
                TestDataFactory.createAssignmentResponse(assignmentId, listOf("python"))

            given(assignmentFeignClient.getAssignmentById(assignmentId))
                .willReturn(assignment)

            // Both test cases fail

            given(pistonApiClient.execute(any()))
                .willReturn(TestDataFactory.createSuccessfulPistonResponse("Wrong\n"))
                .willReturn(TestDataFactory.createSuccessfulPistonResponse("Wrong\n"))

            // When
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY,
                event,
            )

            // Then
            await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted {
                    val eventCaptor = argumentCaptor<SubmissionEvaluatedEvent>()
                    verify(eventPublisher).publish(
                        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
                        eventCaptor.capture(),
                    )

                    val publishedEvent = eventCaptor.singleValue
                    assertEquals(submissionId, publishedEvent.submissionId)
                    assertEquals(SubmissionStatus.FAILED, publishedEvent.status)
                    assertEquals(SubmissionResult.FAILED, publishedEvent.result)
                    assertEquals(0, publishedEvent.score.compareTo(BigDecimal.ZERO.setScale(2)))
                    assertEquals(2, publishedEvent.testCaseResults.size)
                    assertTrue(!publishedEvent.testCaseResults[0].passed!!)
                    assertTrue(!publishedEvent.testCaseResults[1].passed!!)
                }
        }

        @Test
        @DisplayName("should reject submission with unsupported language")
        fun `should reject submission with unsupported language`() {
            // Given
            val submissionId = UUID.randomUUID()
            val assignmentId = UUID.randomUUID()
            val studentId = UUID.randomUUID()
            val code = "print('Hello')"
            val language = "unsupported-lang"

            val event =
                TestDataFactory.createSubmissionCreatedEvent(
                    submissionId,
                    assignmentId,
                    studentId,
                    code,
                    language,
                )
            val assignment =
                TestDataFactory.createAssignmentResponse(assignmentId, listOf("python", "java"))

            given(assignmentFeignClient.getAssignmentById(assignmentId))
                .willReturn(assignment)

            // When
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY,
                event,
            )

            // Then
            await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted {
                    val eventCaptor = ArgumentCaptor.forClass(SubmissionEvaluatedEvent::class.java)
                    verify(eventPublisher).publish(
                        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
                        eventCaptor.capture(),
                    )

                    val publishedEvent = eventCaptor.value
                    assertEquals(submissionId, publishedEvent.submissionId)
                    assertEquals(SubmissionStatus.FAILED, publishedEvent.status)
                    assertEquals(SubmissionResult.FAILED, publishedEvent.result)
                    assertEquals(0, publishedEvent.score.compareTo(BigDecimal.ZERO))
                    assertEquals(1, publishedEvent.testCaseResults.size)
                    assertTrue(
                        publishedEvent.testCaseResults[0].errorMessage?.contains("Unsupported language")
                            ?: false,
                    )
                }

            // Piston API should never be called
            verify(pistonApiClient, never()).execute(any())
        }

        @Test
        @DisplayName("should handle compilation errors")
        fun `should handle compilation errors`() {
            // Given
            val submissionId = UUID.randomUUID()
            val assignmentId = UUID.randomUUID()
            val studentId = UUID.randomUUID()
            val code = "public class Main { invalid syntax }"
            val language = "java"

            val event =
                TestDataFactory.createSubmissionCreatedEvent(
                    submissionId,
                    assignmentId,
                    studentId,
                    code,
                    language,
                )
            val assignment = TestDataFactory.createAssignmentResponse(assignmentId, listOf("java"))

            given(assignmentFeignClient.getAssignmentById(assignmentId))
                .willReturn(assignment)

            given(pistonApiClient.execute(any()))
                .willReturn(TestDataFactory.createCompilationErrorPistonResponse("Syntax error"))

            // When
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY,
                event,
            )

            // Then
            await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted {
                    val eventCaptor = ArgumentCaptor.forClass(SubmissionEvaluatedEvent::class.java)
                    verify(eventPublisher).publish(
                        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
                        eventCaptor.capture(),
                    )

                    val publishedEvent = eventCaptor.value
                    assertEquals(submissionId, publishedEvent.submissionId)
                    assertEquals(SubmissionStatus.FAILED, publishedEvent.status)
                    assertEquals(SubmissionResult.FAILED, publishedEvent.result)
                    assertEquals(2, publishedEvent.testCaseResults.size)
                    assertTrue(!publishedEvent.testCaseResults[0].passed!!)
                    assertTrue(
                        publishedEvent.testCaseResults[0].errorMessage?.contains("Compilation error")
                            ?: false,
                    )
                }
        }

        @Test
        @DisplayName("should handle runtime errors")
        fun `should handle runtime errors`() {
            // Given
            val submissionId = UUID.randomUUID()
            val assignmentId = UUID.randomUUID()
            val studentId = UUID.randomUUID()
            val code = "print(1/0)" // Division by zero
            val language = "python"

            val event =
                TestDataFactory.createSubmissionCreatedEvent(
                    submissionId,
                    assignmentId,
                    studentId,
                    code,
                    language,
                )
            val assignment =
                TestDataFactory.createAssignmentResponse(assignmentId, listOf("python"))

            given(assignmentFeignClient.getAssignmentById(assignmentId))
                .willReturn(assignment)

            given(pistonApiClient.execute(any()))
                .willReturn(TestDataFactory.createFailedPistonResponse("ZeroDivisionError"))

            // When
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY,
                event,
            )

            // Then
            await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted {
                    val eventCaptor = ArgumentCaptor.forClass(SubmissionEvaluatedEvent::class.java)
                    verify(eventPublisher).publish(
                        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
                        eventCaptor.capture(),
                    )

                    val publishedEvent = eventCaptor.value
                    assertTrue(!publishedEvent.testCaseResults[0].passed!!)
                    assertTrue(
                        publishedEvent.testCaseResults[0].errorMessage?.contains("Runtime error")
                            ?: false,
                    )
                }
        }

        @Test
        @DisplayName("should handle assignment not found gracefully")
        fun `should handle assignment not found gracefully`() {
            // Given
            val submissionId = UUID.randomUUID()
            val assignmentId = UUID.randomUUID()
            val studentId = UUID.randomUUID()

            val event =
                TestDataFactory.createSubmissionCreatedEvent(
                    submissionId,
                    assignmentId,
                    studentId,
                    "print('test')",
                    "python",
                )

            given(assignmentFeignClient.getAssignmentById(assignmentId))
                .willThrow(RuntimeException("Assignment not found"))

            // When
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY,
                event,
            )

            // Then
            await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted {
                    val eventCaptor = ArgumentCaptor.forClass(SubmissionEvaluatedEvent::class.java)
                    verify(eventPublisher).publish(
                        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
                        eventCaptor.capture(),
                    )

                    val publishedEvent = eventCaptor.value
                    assertEquals(submissionId, publishedEvent.submissionId)
                    assertEquals(SubmissionStatus.FAILED, publishedEvent.status)
                    assertEquals(SubmissionResult.FAILED, publishedEvent.result)
                }
        }

        @Test
        @DisplayName("should handle Piston API errors gracefully")
        fun `should handle Piston API errors gracefully`() {
            // Given
            val submissionId = UUID.randomUUID()
            val assignmentId = UUID.randomUUID()
            val studentId = UUID.randomUUID()

            val event =
                TestDataFactory.createSubmissionCreatedEvent(
                    submissionId,
                    assignmentId,
                    studentId,
                    "print('test')",
                    "python",
                )
            val assignment =
                TestDataFactory.createAssignmentResponse(assignmentId, listOf("python"))

            given(assignmentFeignClient.getAssignmentById(assignmentId))
                .willReturn(assignment)

            given(pistonApiClient.execute(any()))
                .willThrow(RuntimeException("Piston API unavailable"))

            // When
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY,
                event,
            )

            // Then
            await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted {
                    val eventCaptor = ArgumentCaptor.forClass(SubmissionEvaluatedEvent::class.java)
                    verify(eventPublisher).publish(
                        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
                        eventCaptor.capture(),
                    )

                    val publishedEvent = eventCaptor.value
                    assertEquals(submissionId, publishedEvent.submissionId)
                    assertEquals(SubmissionStatus.FAILED, publishedEvent.status)
                }
        }
    }

    @Nested
    @DisplayName("Async Processing Tests")
    inner class AsyncProcessingTests {
        @Test
        @DisplayName("should process multiple submissions concurrently")
        fun `should process multiple submissions concurrently`() {
            // Given
            val assignmentId = UUID.randomUUID()
            val assignment =
                TestDataFactory.createAssignmentResponse(assignmentId, listOf("python"))

            given(assignmentFeignClient.getAssignmentById(assignmentId))
                .willReturn(assignment)

            given(pistonApiClient.execute(any()))
                .willReturn(TestDataFactory.createSuccessfulPistonResponse("8\n"))
                .willReturn(TestDataFactory.createSuccessfulPistonResponse("30\n"))
                .willReturn(TestDataFactory.createSuccessfulPistonResponse("8\n"))
                .willReturn(TestDataFactory.createSuccessfulPistonResponse("30\n"))
                .willReturn(TestDataFactory.createSuccessfulPistonResponse("8\n"))
                .willReturn(TestDataFactory.createSuccessfulPistonResponse("30\n"))

            // When - Send 3 events concurrently
            repeat(3) {
                val event =
                    TestDataFactory.createSubmissionCreatedEvent(
                        UUID.randomUUID(),
                        assignmentId,
                        UUID.randomUUID(),
                        "print('test')",
                        "python",
                    )
                rabbitTemplate.convertAndSend(
                    RabbitMqConfig.EXCHANGE,
                    RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY,
                    event,
                )
            }

            // Then - All 3 should be processed
            await()
                .atMost(Duration.ofSeconds(10))
                .untilAsserted {
                    verify(eventPublisher, times(3)).publish(
                        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
                        any(),
                    )
                }
        }
    }

    @Nested
    @DisplayName("Score Calculation Tests")
    inner class ScoreCalculationTests {
        @Test
        @DisplayName("should calculate score correctly with weighted test cases")
        fun `should calculate score with weighted test cases`() {
            // Given
            val submissionId = UUID.randomUUID()
            val assignmentId = UUID.randomUUID()
            val assignment =
                TestDataFactory.createAssignmentResponse(assignmentId, listOf("python"))

            // Modify test cases with different weights
            assignment.testCases[0].weight = 2.0 // First test case has weight 2
            assignment.testCases[1].weight = 1.0 // Second test case has weight 1

            given(assignmentFeignClient.getAssignmentById(assignmentId))
                .willReturn(assignment)

            // First test case passes (weight 2), second fails (weight 1)

            given(pistonApiClient.execute(any()))
                .willAnswer { invocation ->
                    val request = invocation.getArgument<PistonExecuteRequest>(0)
                    when {
                        request
                            .stdin()
                            .contains("5") -> TestDataFactory.createSuccessfulPistonResponse("8\n")

                        request
                            .stdin()
                            .contains("10") -> TestDataFactory.createSuccessfulPistonResponse("Wrong\n")

                        else -> TestDataFactory.createSuccessfulPistonResponse("default\n")
                    }
                }

            val event =
                TestDataFactory.createSubmissionCreatedEvent(
                    submissionId,
                    assignmentId,
                    UUID.randomUUID(),
                    "print('test')",
                    "python",
                )

            // When
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY,
                event,
            )

            // Then - Score should be (2/(2+1))*100 = 66.67
            await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted {
                    val eventCaptor = ArgumentCaptor.forClass(SubmissionEvaluatedEvent::class.java)
                    verify(eventPublisher).publish(
                        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
                        eventCaptor.capture(),
                    )

                    val publishedEvent = eventCaptor.value
                    assertEquals(
                        0,
                        BigDecimal.valueOf(66.67).compareTo(publishedEvent.score),
                    )
                    assertEquals(SubmissionResult.PARTIAL, publishedEvent.result)
                }
        }
    }
}

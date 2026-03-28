package apsas.evaluation.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.evaluation.client.PistonApiClient;
import apsas.evaluation.model.dto.RuntimeResponse;
import apsas.feign.client.AssignmentFeignClient;
import apsas.feign.dto.AssignmentResponse;
import apsas.feign.dto.TestCaseDto;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.messaging.event.SubmissionCreatedEvent;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent;
import apsas.shared.models.submission.TestCaseResultResponse;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.instancio.Instancio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@Epic("Evaluation Service")
@Feature("Service Layer")
class EvaluationServiceTest {

  @Mock
  private PistonApiClient pistonApiClient;

  @Mock
  private AssignmentFeignClient assignmentFeignClient;

  @Mock
  private EventPublisher eventPublisher;

  @Mock
  private TestCaseService testCaseService;

  @InjectMocks
  private EvaluationService evaluationService;

  @Test
  @Tag("unit")
  @Story("Fetch supported runtimes")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("EVL-SVC-001")
  @DisplayName("Returns runtimes from piston client")
  void getSupportedRuntimes_shouldReturnClientResponse_whenClientSucceeds() {
    var runtimes = Instancio.ofList(RuntimeResponse.class).size(2).create();
    when(pistonApiClient.getRuntimes()).thenReturn(runtimes);

    var actual = evaluationService.getSupportedRuntimes();

    assertEquals(runtimes, actual);
    verify(pistonApiClient).getRuntimes();
  }

  @Test
  @Tag("unit")
  @Story("Reject unsupported language")
  @Severity(SeverityLevel.CRITICAL)
  @Issue("9")
  @TmsLink("EVL-SVC-002")
  @DisplayName("Publishes failed event when submission language is unsupported")
  void evaluateSubmission_shouldPublishFailedEvent_whenLanguageUnsupported() {
    var event = new SubmissionCreatedEvent(
        UUID.randomUUID(),
        UUID.randomUUID(),
        UUID.randomUUID(),
        "Y29kZQ==",
        "python"
    );

    var assignment = Instancio.create(AssignmentResponse.class);
    assignment.setLanguages(new String[]{"java", "go"});
    assignment.setMaxScore(new BigDecimal("100"));
    assignment.setTestCases(List.of(Instancio.create(TestCaseDto.class)));
    when(assignmentFeignClient.getAssignmentById(event.getAssignmentId())).thenReturn(assignment);

    evaluationService.evaluateSubmission(event);

    var captor = ArgumentCaptor.forClass(
        SubmissionEvaluatedEvent.class);
    verify(eventPublisher).publish(
        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
        captor.capture()
    );
    var published = captor.getValue();

    assertEquals(SubmissionEvaluatedEvent.Status.FAILED, published.getStatus());
    assertEquals(SubmissionEvaluatedEvent.Result.FAILED, published.getResult());
    assertEquals(BigDecimal.ZERO, published.getScore());
    assertTrue(published.getTestCaseResults()
        .getFirst()
        .getErrorMessage()
        .contains("Unsupported language"));
    verify(testCaseService, never()).executeTestCase(
        org.mockito.ArgumentMatchers.anyString(),
        org.mockito.ArgumentMatchers.anyString(),
        org.mockito.ArgumentMatchers.any()
    );
  }

  @Test
  @Tag("unit")
  @Story("Evaluate fully passed submission")
  @Severity(SeverityLevel.CRITICAL)
  @Issue("9")
  @TmsLink("EVL-SVC-003")
  @DisplayName("Publishes evaluated passed event with capped max score")
  void evaluateSubmission_shouldPublishPassedResultWithMaxScore_whenAllTestCasesPassed() {
    var event = new SubmissionCreatedEvent(
        UUID.randomUUID(),
        UUID.randomUUID(),
        UUID.randomUUID(),
        "Y29kZQ==",
        "java"
    );

    var tc1 = Instancio.create(TestCaseDto.class);
    tc1.setWeight(1.0);
    var tc2 = Instancio.create(TestCaseDto.class);
    tc2.setWeight(3.0);

    var assignment = Instancio.create(AssignmentResponse.class);
    assignment.setLanguages(new String[]{"java"});
    assignment.setMaxScore(new BigDecimal("80"));
    assignment.setTestCases(List.of(tc1, tc2));
    when(assignmentFeignClient.getAssignmentById(event.getAssignmentId())).thenReturn(assignment);

    when(testCaseService.executeTestCase(event.getCodeBase64(), event.getLanguage(), tc1))
        .thenReturn(CompletableFuture.completedFuture(createResult(true, 1.0)));
    when(testCaseService.executeTestCase(event.getCodeBase64(), event.getLanguage(), tc2))
        .thenReturn(CompletableFuture.completedFuture(createResult(true, 3.0)));

    evaluationService.evaluateSubmission(event);

    var captor = ArgumentCaptor.forClass(
        SubmissionEvaluatedEvent.class);
    verify(eventPublisher).publish(
        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
        captor.capture()
    );
    var published = captor.getValue();

    assertEquals(SubmissionEvaluatedEvent.Status.EVALUATED, published.getStatus());
    assertEquals(SubmissionEvaluatedEvent.Result.PASSED, published.getResult());
    assertEquals(new BigDecimal("80.00"), published.getScore());
    assertEquals(2, published.getTestCaseResults().size());
  }

  @Test
  @Tag("unit")
  @Story("Evaluate partially passed submission")
  @Severity(SeverityLevel.CRITICAL)
  @Issue("9")
  @TmsLink("EVL-SVC-004")
  @DisplayName("Publishes evaluated partial event with weighted score")
  void evaluateSubmission_shouldPublishPartialResultWithWeightedScore_whenSomeTestCasesFailed() {
    var event = new SubmissionCreatedEvent(
        UUID.randomUUID(),
        UUID.randomUUID(),
        UUID.randomUUID(),
        "Y29kZQ==",
        "java"
    );

    var tc1 = Instancio.create(TestCaseDto.class);
    tc1.setWeight(1.0);
    var tc2 = Instancio.create(TestCaseDto.class);
    tc2.setWeight(3.0);

    var assignment = Instancio.create(AssignmentResponse.class);
    assignment.setLanguages(new String[]{"java"});
    assignment.setMaxScore(new BigDecimal("80"));
    assignment.setTestCases(List.of(tc1, tc2));
    when(assignmentFeignClient.getAssignmentById(event.getAssignmentId())).thenReturn(assignment);

    when(testCaseService.executeTestCase(event.getCodeBase64(), event.getLanguage(), tc1))
        .thenReturn(CompletableFuture.completedFuture(createResult(true, 1.0)));
    when(testCaseService.executeTestCase(event.getCodeBase64(), event.getLanguage(), tc2))
        .thenReturn(CompletableFuture.completedFuture(createResult(false, 3.0)));

    evaluationService.evaluateSubmission(event);

    var captor = ArgumentCaptor.forClass(
        SubmissionEvaluatedEvent.class);
    verify(eventPublisher).publish(
        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
        captor.capture()
    );
    var published = captor.getValue();

    assertEquals(SubmissionEvaluatedEvent.Status.EVALUATED, published.getStatus());
    assertEquals(SubmissionEvaluatedEvent.Result.PARTIAL, published.getResult());
    assertEquals(new BigDecimal("20.00"), published.getScore());
  }

  @Test
  @Tag("unit")
  @Story("Handle unexpected evaluation exception")
  @Severity(SeverityLevel.CRITICAL)
  @Issue("9")
  @TmsLink("EVL-SVC-005")
  @DisplayName("Publishes failed event when assignment client throws exception")
  void evaluateSubmission_shouldPublishFailedEvent_whenUnexpectedExceptionOccurs() {
    var event = new SubmissionCreatedEvent(
        UUID.randomUUID(),
        UUID.randomUUID(),
        UUID.randomUUID(),
        "Y29kZQ==",
        "java"
    );

    when(assignmentFeignClient.getAssignmentById(event.getAssignmentId()))
        .thenThrow(new RuntimeException("service unavailable"));

    evaluationService.evaluateSubmission(event);

    var captor = ArgumentCaptor.forClass(
        SubmissionEvaluatedEvent.class);
    verify(eventPublisher).publish(
        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
        captor.capture()
    );
    var published = captor.getValue();

    assertEquals(SubmissionEvaluatedEvent.Status.FAILED, published.getStatus());
    assertEquals(SubmissionEvaluatedEvent.Result.FAILED, published.getResult());
    assertTrue(published.getTestCaseResults()
        .getFirst()
        .getErrorMessage()
        .contains("Evaluation error"));
  }

  @Test
  @Tag("unit")
  @Story("Evaluate failed submission")
  @Severity(SeverityLevel.CRITICAL)
  @Issue("9")
  @TmsLink("EVL-SVC-006")
  @DisplayName("Publishes failed status when all test cases fail")
  void evaluateSubmission_shouldPublishFailedStatus_whenAllTestCasesFailed() {
    var event = new SubmissionCreatedEvent(
        UUID.randomUUID(),
        UUID.randomUUID(),
        UUID.randomUUID(),
        "Y29kZQ==",
        "java"
    );

    var tc1 = Instancio.create(TestCaseDto.class);
    tc1.setWeight(1.0);
    var tc2 = Instancio.create(TestCaseDto.class);
    tc2.setWeight(1.0);

    var assignment = Instancio.create(AssignmentResponse.class);
    assignment.setLanguages(new String[]{"java"});
    assignment.setMaxScore(new BigDecimal("100"));
    assignment.setTestCases(List.of(tc1, tc2));
    when(assignmentFeignClient.getAssignmentById(event.getAssignmentId())).thenReturn(assignment);

    when(testCaseService.executeTestCase(event.getCodeBase64(), event.getLanguage(), tc1))
        .thenReturn(CompletableFuture.completedFuture(createResult(false, 1.0)));
    when(testCaseService.executeTestCase(event.getCodeBase64(), event.getLanguage(), tc2))
        .thenReturn(CompletableFuture.completedFuture(createResult(false, 1.0)));

    evaluationService.evaluateSubmission(event);

    var captor = ArgumentCaptor.forClass(
        SubmissionEvaluatedEvent.class);
    verify(eventPublisher).publish(
        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
        captor.capture()
    );
    var published = captor.getValue();

    assertEquals(SubmissionEvaluatedEvent.Status.FAILED, published.getStatus());
    assertEquals(SubmissionEvaluatedEvent.Result.FAILED, published.getResult());
    assertEquals(new BigDecimal("0.00"), published.getScore());
  }

  @Test
  @Tag("unit")
  @Story("Evaluate submission with no test cases")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("EVL-SVC-007")
  @DisplayName("Publishes failed result with zero score when assignment has no test cases")
  void evaluateSubmission_shouldPublishFailedResult_whenAssignmentHasNoTestCases() {
    var event = new SubmissionCreatedEvent(
        UUID.randomUUID(),
        UUID.randomUUID(),
        UUID.randomUUID(),
        "Y29kZQ==",
        "java"
    );

    var assignment = Instancio.create(AssignmentResponse.class);
    assignment.setLanguages(new String[]{"java"});
    assignment.setMaxScore(new BigDecimal("100"));
    assignment.setTestCases(List.of());
    when(assignmentFeignClient.getAssignmentById(event.getAssignmentId())).thenReturn(assignment);

    evaluationService.evaluateSubmission(event);

    var captor = ArgumentCaptor.forClass(
        SubmissionEvaluatedEvent.class);
    verify(eventPublisher).publish(
        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
        captor.capture()
    );
    var published = captor.getValue();

    assertEquals(SubmissionEvaluatedEvent.Status.FAILED, published.getStatus());
    assertEquals(SubmissionEvaluatedEvent.Result.FAILED, published.getResult());
    assertEquals(BigDecimal.ZERO, published.getScore());
  }

  @Test
  @Tag("unit")
  @Story("Allow all languages when assignment does not restrict")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("EVL-SVC-008")
  @DisplayName("Evaluates normally when assignment languages are not specified")
  void evaluateSubmission_shouldEvaluate_whenAllowedLanguagesAreNull() {
    var event = new SubmissionCreatedEvent(
        UUID.randomUUID(),
        UUID.randomUUID(),
        UUID.randomUUID(),
        "Y29kZQ==",
        "ruby"
    );

    var tc = Instancio.create(TestCaseDto.class);
    tc.setWeight(1.0);

    var assignment = Instancio.create(AssignmentResponse.class);
    assignment.setLanguages(null);
    assignment.setMaxScore(new BigDecimal("50"));
    assignment.setTestCases(List.of(tc));
    when(assignmentFeignClient.getAssignmentById(event.getAssignmentId())).thenReturn(assignment);

    when(testCaseService.executeTestCase(event.getCodeBase64(), event.getLanguage(), tc))
        .thenReturn(CompletableFuture.completedFuture(createResult(true, 1.0)));

    evaluationService.evaluateSubmission(event);

    var captor = ArgumentCaptor.forClass(
        SubmissionEvaluatedEvent.class);
    verify(eventPublisher).publish(
        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
        captor.capture()
    );
    var published = captor.getValue();

    assertEquals(SubmissionEvaluatedEvent.Status.EVALUATED, published.getStatus());
    assertEquals(SubmissionEvaluatedEvent.Result.PASSED, published.getResult());
  }

  @Test
  @Tag("unit")
  @Story("Calculate percentage when max score is not configured")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("EVL-SVC-009")
  @DisplayName("Uses percentage score when assignment max score is null")
  void evaluateSubmission_shouldUsePercentageScore_whenMaxScoreIsNull() {
    var event = new SubmissionCreatedEvent(
        UUID.randomUUID(),
        UUID.randomUUID(),
        UUID.randomUUID(),
        "Y29kZQ==",
        "java"
    );

    var tc1 = Instancio.create(TestCaseDto.class);
    tc1.setWeight(1.0);
    var tc2 = Instancio.create(TestCaseDto.class);
    tc2.setWeight(3.0);

    var assignment = Instancio.create(AssignmentResponse.class);
    assignment.setLanguages(new String[]{"java"});
    assignment.setMaxScore(null);
    assignment.setTestCases(List.of(tc1, tc2));
    when(assignmentFeignClient.getAssignmentById(event.getAssignmentId())).thenReturn(assignment);

    when(testCaseService.executeTestCase(event.getCodeBase64(), event.getLanguage(), tc1))
        .thenReturn(CompletableFuture.completedFuture(createResult(true, 1.0)));
    when(testCaseService.executeTestCase(event.getCodeBase64(), event.getLanguage(), tc2))
        .thenReturn(CompletableFuture.completedFuture(createResult(false, 3.0)));

    evaluationService.evaluateSubmission(event);

    var captor = ArgumentCaptor.forClass(
        SubmissionEvaluatedEvent.class);
    verify(eventPublisher).publish(
        eq(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY),
        captor.capture()
    );
    var published = captor.getValue();

    assertEquals(SubmissionEvaluatedEvent.Status.EVALUATED, published.getStatus());
    assertEquals(SubmissionEvaluatedEvent.Result.PARTIAL, published.getResult());
    assertEquals(new BigDecimal("25.00"), published.getScore());
  }

  private static TestCaseResultResponse createResult(boolean passed, double weight) {
    var result = Instancio.create(TestCaseResultResponse.class);
    result.setPassed(passed);
    result.setWeight(weight);
    return result;
  }
}

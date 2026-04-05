package apsas.submission.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.shared.exception.NotFoundException;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.messaging.event.SubmissionCreatedEvent;
import apsas.submission.mapper.SubmissionMapper;
import apsas.submission.model.dto.CreateSubmissionRequest;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.entity.Submission;
import apsas.submission.repository.SubmissionRepository;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.Optional;
import java.util.UUID;
import org.instancio.Instancio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit test cho nhóm command/write behavior của SubmissionService.
 *
 * <p>Nhóm này cover các hành vi mutate state: create submission và provide feedback.</p>
 */
@ExtendWith(MockitoExtension.class)
@Epic("Submission Service")
@Feature("Service Layer - Command")
@Issue("12")
class SubmissionServiceCommandTest {

  private static final String CODE_BASE64 = "Y29kZQ==";

  @Mock
  private SubmissionRepository submissionRepository;

  @Mock
  private SubmissionMapper submissionMapper;

  @Mock
  private EventPublisher eventPublisher;

  @InjectMocks
  private SubmissionService submissionService;

  /** Verify create submission vừa persist data vừa publish event cho evaluation flow. */
  @Test
  @Tag("unit")
  @Story("Create submission")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-SVC-008")
  @DisplayName("Saves submission and publishes submission created event")
  void createSubmission_shouldSaveAndPublishEvent_whenRequestIsValid() {
    UUID submissionId = UUID.randomUUID();
    UUID assignmentId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();

    CreateSubmissionRequest request = new CreateSubmissionRequest(assignmentId, CODE_BASE64, "java");
    Submission mapped = Instancio.create(Submission.class);
    Submission saved = Instancio.create(Submission.class);
    SubmissionResponse response = Instancio.create(SubmissionResponse.class);

    mapped.setAssignmentId(assignmentId);
    mapped.setStudentId(studentId);
    mapped.setCode(CODE_BASE64);
    mapped.setLanguage("java");

    saved.setId(submissionId);
    saved.setAssignmentId(assignmentId);
    saved.setStudentId(studentId);
    saved.setCode(CODE_BASE64);
    saved.setLanguage("java");

    when(submissionMapper.toEntity(request, studentId)).thenReturn(mapped);
    when(submissionRepository.save(mapped)).thenReturn(saved);
    when(submissionMapper.toResponse(saved)).thenReturn(response);

    SubmissionResponse actual = submissionService.createSubmission(request, studentId);

    assertEquals(response, actual);

    ArgumentCaptor<SubmissionCreatedEvent> eventCaptor =
        ArgumentCaptor.forClass(SubmissionCreatedEvent.class);
    verify(eventPublisher).publish(eq(RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY), eventCaptor.capture());

    SubmissionCreatedEvent published = eventCaptor.getValue();
    assertEquals(submissionId, published.getSubmissionId());
    assertEquals(assignmentId, published.getAssignmentId());
    assertEquals(studentId, published.getStudentId());
    assertEquals(CODE_BASE64, published.getCodeBase64());
    assertEquals("java", published.getLanguage());
  }

  /** Verify provide feedback update đúng và trả về DTO đã map. */
  @Test
  @Tag("unit")
  @Story("Provide feedback")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-SVC-012")
  @DisplayName("Updates feedback and returns mapped response when submission exists")
  void provideFeedback_shouldUpdateFeedbackAndReturnResponse_whenSubmissionExists() {
    UUID submissionId = UUID.randomUUID();
    String feedback = "Great job on edge cases.";

    Submission submission = Instancio.create(Submission.class);
    submission.setId(submissionId);

    Submission updated = Instancio.create(Submission.class);
    updated.setId(submissionId);
    updated.setFeedback(feedback);

    SubmissionResponse response = Instancio.create(SubmissionResponse.class);
    response.setFeedback(feedback);

    when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
    when(submissionRepository.save(any(Submission.class))).thenReturn(updated);
    when(submissionMapper.toResponse(updated)).thenReturn(response);

    SubmissionResponse actual = submissionService.provideFeedback(submissionId, feedback);

    assertEquals(feedback, actual.getFeedback());

    ArgumentCaptor<Submission> captor = ArgumentCaptor.forClass(Submission.class);
    verify(submissionRepository).save(captor.capture());
    assertEquals(feedback, captor.getValue().getFeedback());
  }

  /** Verify provide feedback fail đúng với submission không tồn tại. */
  @Test
  @Tag("unit")
  @Story("Provide feedback")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-SVC-013")
  @DisplayName("Throws not found when providing feedback to unknown submission")
  void provideFeedback_shouldThrowNotFoundException_whenSubmissionMissing() {
    UUID submissionId = UUID.randomUUID();

    when(submissionRepository.findById(submissionId)).thenReturn(Optional.empty());

    assertThrows(
        NotFoundException.class,
        () -> submissionService.provideFeedback(submissionId, "feedback")
    );
  }
}

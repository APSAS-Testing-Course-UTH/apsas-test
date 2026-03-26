package apsas.submission.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.shared.exception.NotFoundException;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent.Result;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent.Status;
import apsas.shared.models.submission.TestCaseResultResponse;
import apsas.submission.mapper.SubmissionEventMapper;
import apsas.submission.model.entity.Submission;
import apsas.submission.model.entity.SubmissionResult;
import apsas.submission.model.entity.SubmissionStatus;
import apsas.submission.repository.SubmissionRepository;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
 * Unit test cho nhánh xử lý kết quả chấm bài (evaluation callback) của SubmissionService.
 *
 * <p>Nhóm này audit phần mapping event -> entity và các nhánh lỗi/not-found/time fallback.</p>
 */
@ExtendWith(MockitoExtension.class)
@Epic("Submission Service")
@Feature("Service Layer - Evaluation Update")
class SubmissionServiceEvaluationTest {

  @Mock
  private SubmissionRepository submissionRepository;

  @Mock
  private SubmissionEventMapper submissionEventMapper;

  @InjectMocks
  private SubmissionService submissionService;

  /** Verify event hợp lệ sẽ update đầy đủ status/result/score/test cases/evaluatedAt. */
  @Test
  @Tag("unit")
  @Story("Handle evaluated submission event")
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("Updates submission with mapped status result and test case data when evaluation event is valid")
  void handleSubmissionEvaluated_shouldUpdateSubmission_whenEvaluationDataIsProvided() {
    UUID submissionId = UUID.randomUUID();
    LocalDateTime evaluatedAt = LocalDateTime.of(2026, 3, 25, 14, 0);

    Submission submission = Instancio.create(Submission.class);
    submission.setId(submissionId);

    TestCaseResultResponse testCaseResult = Instancio.create(TestCaseResultResponse.class);
    apsas.submission.model.entity.TestCaseResult mappedTestCase =
        Instancio.create(apsas.submission.model.entity.TestCaseResult.class);

    when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
    when(submissionEventMapper.toEntityStatus(Status.EVALUATED)).thenReturn(SubmissionStatus.EVALUATED);
    when(submissionEventMapper.toEntityResult(Result.PARTIAL)).thenReturn(SubmissionResult.PARTIAL);
    when(submissionEventMapper.toEntityTestCaseResult(testCaseResult)).thenReturn(mappedTestCase);

    submissionService.handleSubmissionEvaluated(
        submissionId,
        Status.EVALUATED,
        Result.PARTIAL,
        new BigDecimal("67.50"),
        List.of(testCaseResult),
        evaluatedAt
    );

    ArgumentCaptor<Submission> captor = ArgumentCaptor.forClass(Submission.class);
    verify(submissionRepository).save(captor.capture());
    Submission saved = captor.getValue();

    assertEquals(SubmissionStatus.EVALUATED, saved.getStatus());
    assertEquals(SubmissionResult.PARTIAL, saved.getResult());
    assertEquals(new BigDecimal("67.50"), saved.getScore());
    assertEquals(1, saved.getTestCaseResults().size());
    assertEquals(mappedTestCase, saved.getTestCaseResults().getFirst());
    assertEquals(evaluatedAt, saved.getEvaluatedAt());
  }

  /** Verify fallback evaluatedAt = now() khi event không cung cấp thời gian chấm. */
  @Test
  @Tag("unit")
  @Story("Handle evaluated submission event")
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("Sets evaluatedAt to current time when event does not provide evaluated timestamp")
  void handleSubmissionEvaluated_shouldSetCurrentTime_whenEvaluatedAtIsNull() {
    UUID submissionId = UUID.randomUUID();

    Submission submission = Instancio.create(Submission.class);
    submission.setId(submissionId);

    LocalDateTime before = LocalDateTime.now().minusSeconds(1);

    when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
    when(submissionEventMapper.toEntityStatus(Status.FAILED)).thenReturn(SubmissionStatus.FAILED);
    when(submissionEventMapper.toEntityResult(Result.FAILED)).thenReturn(SubmissionResult.FAILED);

    submissionService.handleSubmissionEvaluated(
        submissionId,
        Status.FAILED,
        Result.FAILED,
        BigDecimal.ZERO,
        null,
        null
    );

    ArgumentCaptor<Submission> captor = ArgumentCaptor.forClass(Submission.class);
    verify(submissionRepository).save(captor.capture());
    Submission saved = captor.getValue();

    assertNull(saved.getTestCaseResults());
    assertNotNull(saved.getEvaluatedAt());
    assertTrue(saved.getEvaluatedAt().isAfter(before));
  }

  /** Verify reject event khi submission id không tồn tại trong DB. */
  @Test
  @Tag("unit")
  @Story("Handle evaluated submission event")
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("Throws not found when evaluated event references unknown submission")
  void handleSubmissionEvaluated_shouldThrowNotFoundException_whenSubmissionMissing() {
    UUID submissionId = UUID.randomUUID();
    LocalDateTime evaluatedAt = LocalDateTime.now();

    when(submissionRepository.findById(submissionId)).thenReturn(Optional.empty());

    assertThrows(
        NotFoundException.class,
        () -> submissionService.handleSubmissionEvaluated(
            submissionId,
            Status.FAILED,
            Result.FAILED,
            BigDecimal.ZERO,
            List.of(),
            evaluatedAt
        )
    );
  }
}

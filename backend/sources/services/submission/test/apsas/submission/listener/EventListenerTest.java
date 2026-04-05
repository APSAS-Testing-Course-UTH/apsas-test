package apsas.submission.listener;

import static org.mockito.Mockito.verify;

import apsas.shared.messaging.event.SubmissionEvaluatedEvent;
import apsas.submission.service.SubmissionService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.instancio.Instancio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit test cho listener nhận kết quả đánh giá submission.
 */
@ExtendWith(MockitoExtension.class)
@Tag("unit")
@Epic("Submission Service")
@Feature("Event Listener")
@Owner("HuynhSang2005")
class EventListenerTest {

  @Mock
  private SubmissionService submissionService;

  @InjectMocks
  private EventListener eventListener;

  @Test
  @Story("Handle submission evaluated event")
  @TmsLink("SUB-EVT-001")
  @DisplayName("Delegates evaluated event payload to submission service")
  void handleSubmissionEvaluatedShouldDelegatePayloadToSubmissionService() {
    UUID submissionId = UUID.randomUUID();
    SubmissionEvaluatedEvent.Status status = SubmissionEvaluatedEvent.Status.EVALUATED;
    SubmissionEvaluatedEvent.Result result = SubmissionEvaluatedEvent.Result.PASSED;
    BigDecimal score = BigDecimal.valueOf(95);
    LocalDateTime evaluatedAt = LocalDateTime.now();

    SubmissionEvaluatedEvent event = new SubmissionEvaluatedEvent(
        submissionId,
        status,
        result,
        score,
        List.of(Instancio.create(apsas.shared.models.submission.TestCaseResultResponse.class)),
        evaluatedAt
    );

    eventListener.handleSubmissionEvaluated(event);

    verify(submissionService).handleSubmissionEvaluated(
        submissionId,
        status,
        result,
        score,
        event.getTestCaseResults(),
        evaluatedAt
    );
  }
}

package apsas.submission.listener;

import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent;
import apsas.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EventListener {
  private final SubmissionService submissionService;

  @RabbitListener(queues = RabbitMqConfig.SUBMISSION_SUBMISSION_EVALUATED_QUEUE)
  public void handleSubmissionEvaluated(SubmissionEvaluatedEvent event) {
    submissionService.handleSubmissionEvaluated(
        event.getSubmissionId(),
        event.getStatus(),
        event.getResult(),
        event.getScore(),
        event.getTestCaseResults(),
        event.getEvaluatedAt()
    );
  }
}

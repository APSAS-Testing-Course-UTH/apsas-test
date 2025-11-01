package apsas.evaluation.messaging;

import apsas.evaluation.service.EvaluationService;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.SubmissionCreatedEvent;
import lombok.AllArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class SubmissionEventListener {
  private final EvaluationService evaluationService;

  @RabbitListener(queues = RabbitMqConfig.EVALUATION_SUBMISSION_CREATED_QUEUE)
  public void handleSubmissionCreated(SubmissionCreatedEvent event) {
    evaluationService.evaluateSubmission(event);
  }
}

package apsas.evaluation.messaging;

import apsas.evaluation.service.EvaluationService;
import apsas.messaging.event.SubmissionCreatedEvent;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * RabbitMQ listener for submission evaluation events
 */
@Component
@AllArgsConstructor
public class SubmissionEventListener {
  private static final Logger logger = LoggerFactory.getLogger(SubmissionEventListener.class);

  private final EvaluationService evaluationService;

  /**
   * Handle submission created event
   *
   * @param event Submission created event
   */
  @RabbitListener(queues = "#{submissionCreatedQueue.name}")
  public void handleSubmissionCreated(SubmissionCreatedEvent event) {
    logger.info("Received submission created event for submission: {}", event.getSubmissionId());

    try {
      evaluationService.evaluateSubmission(event);
    } catch (Exception e) {
      logger.error("Error handling submission created event", e);
      // The evaluation service will handle errors and publish failed evaluation event
    }
  }
}

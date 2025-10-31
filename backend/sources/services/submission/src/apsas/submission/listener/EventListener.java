package apsas.submission.listener;

import apsas.messaging.event.SubmissionEvaluatedEvent;
import apsas.submission.model.entity.SubmissionResult;
import apsas.submission.model.entity.SubmissionStatus;
import apsas.submission.model.entity.TestCaseResult;
import apsas.submission.repository.SubmissionRepository;
import java.time.LocalDateTime;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class EventListener {

  private final SubmissionRepository submissionRepository;

  public EventListener(SubmissionRepository submissionRepository) {
    this.submissionRepository = submissionRepository;
  }

  @RabbitListener(queues = "submission.evaluated.queue")
  public void handleSubmissionEvaluated(SubmissionEvaluatedEvent event) {
    submissionRepository
        .findById(event.getSubmissionId())
        .ifPresent(
            submission -> {
              submission.setStatus(mapToSubmissionStatus(event.getStatus()));
              submission.setResult(mapToSubmissionResult(event.getResult()));
              submission.setScore(event.getScore());
              submission.setTestCaseResults(
                  event.getTestCaseResults().stream().map(this::mapToTestCaseResult).toList());
              submission.setEvaluatedAt(
                  event.getEvaluatedAt() != null ? event.getEvaluatedAt() : LocalDateTime.now());
              submissionRepository.save(submission);
            });
  }

  private SubmissionResult mapToSubmissionResult(apsas.messaging.model.SubmissionResult result) {
    if (result == null) {
      return null;
    }
    return switch (result) {
      case PASSED -> SubmissionResult.PASSED;
      case FAILED -> SubmissionResult.FAILED;
      case PARTIAL -> SubmissionResult.PARTIAL;
    };
  }

  private SubmissionStatus mapToSubmissionStatus(
      apsas.messaging.model.SubmissionStatus status
  ) {
    if (status == null) {
      return null;
    }
    return switch (status) {
      case PENDING -> SubmissionStatus.PENDING;
      case EVALUATED -> SubmissionStatus.EVALUATED;
      case FAILED -> SubmissionStatus.FAILED;
    };
  }

  private TestCaseResult mapToTestCaseResult(
      apsas.messaging.model.TestCaseResult result
  ) {
    if (result == null) {
      return null;
    }

    TestCaseResult testCaseResult = new TestCaseResult();
    testCaseResult.setOrder(result.getOrder());
    testCaseResult.setDescription(result.getDescription());
    testCaseResult.setHidden(result.getHidden());
    testCaseResult.setWeight(result.getWeight());
    testCaseResult.setInput(result.getInput());
    testCaseResult.setOutput(result.getOutput());
    testCaseResult.setTimeout(result.getTimeout());
    testCaseResult.setMemoryLimit(result.getMemoryLimit());
    testCaseResult.setPassed(result.getPassed());
    testCaseResult.setActualOutput(result.getActualOutput());
    testCaseResult.setErrorMessage(result.getErrorMessage());
    testCaseResult.setExecutionTime(result.getExecutionTime());
    testCaseResult.setMemoryUsed(result.getMemoryUsed());
    return testCaseResult;
  }
}

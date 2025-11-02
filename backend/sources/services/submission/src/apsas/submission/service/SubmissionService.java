package apsas.submission.service;

import apsas.shared.exception.ForbiddenException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.messaging.event.SubmissionCreatedEvent;
import apsas.shared.models.pagination.PageResponse;
import apsas.submission.mapper.SubmissionEventMapper;
import apsas.submission.mapper.SubmissionMapper;
import apsas.submission.model.dto.CreateSubmissionRequest;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.entity.Submission;
import apsas.submission.model.entity.SubmissionStatus;
import apsas.submission.repository.SubmissionRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubmissionService {
  private final SubmissionRepository submissionRepository;
  private final SubmissionMapper submissionMapper;
  private final SubmissionEventMapper submissionEventMapper;
  private final EventPublisher eventPublisher;

  @Transactional(readOnly = true)
  public PageResponse<SubmissionResponse> getAllSubmissions(
      UUID studentId,
      UUID assignmentId,
      UUID filterStudentId,
      SubmissionStatus status,
      boolean isInstructor,
      Pageable pageable
  ) {
    Page<Submission> submissionPage;

    if (isInstructor) {
      // Instructors can filter by assignment, student, and status with pagination
      submissionPage = submissionRepository.findByFilters(
          assignmentId,
          filterStudentId,
          status,
          pageable
      );
    } else {
      // Students can only see their own submissions
      // For students, we need to use findByFilters with their studentId
      submissionPage = submissionRepository.findByFilters(
          assignmentId,
          studentId,
          status,
          pageable
      );
    }

    Page<SubmissionResponse> responsePage = submissionPage.map(submissionMapper::toResponse);
    return PageResponse.of(responsePage);
  }

  @Transactional(readOnly = true)
  public SubmissionResponse getSubmissionById(UUID id, UUID studentId, boolean isInstructor) {
    Submission submission =
        submissionRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Submission not found with id: " + id));

    // Students can only view their own submissions
    if (!isInstructor && !submission.getStudentId().equals(studentId)) {
      throw new ForbiddenException("You are not authorized to view this submission");
    }

    return submissionMapper.toResponse(submission);
  }

  @Transactional
  public SubmissionResponse createSubmission(CreateSubmissionRequest request, UUID studentId) {
    Submission submission = submissionMapper.toEntity(request, studentId);
    Submission savedSubmission = submissionRepository.save(submission);

    // Publish event for evaluation service
    SubmissionCreatedEvent event = new SubmissionCreatedEvent(
        savedSubmission.getId(),
        savedSubmission.getAssignmentId(),
        savedSubmission.getStudentId(),
        savedSubmission.getCode(),
        savedSubmission.getLanguage()
    );
    eventPublisher.publish(RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY, event);

    return submissionMapper.toResponse(savedSubmission);
  }

  @Transactional
  public void handleSubmissionEvaluated(
      UUID submissionId,
      apsas.shared.messaging.model.SubmissionStatus status,
      apsas.shared.messaging.model.SubmissionResult result,
      BigDecimal score,
      List<apsas.shared.models.submission.TestCaseResultDto> testCaseResults,
      LocalDateTime evaluatedAt
  ) {
    Submission submission =
        submissionRepository
            .findById(submissionId)
            .orElseThrow(() -> new NotFoundException(
                "Submission not found with id: " + submissionId));

    submission.setStatus(submissionEventMapper.toEntityStatus(status));
    submission.setResult(submissionEventMapper.toEntityResult(result));
    submission.setScore(score);
    submission.setTestCaseResults(
        testCaseResults != null
            ? testCaseResults.stream()
            .map(submissionEventMapper::toEntityTestCaseResult)
            .toList()
            : null
    );
    submission.setEvaluatedAt(evaluatedAt != null ? evaluatedAt : LocalDateTime.now());

    submissionRepository.save(submission);
  }

  @Transactional
  public SubmissionResponse provideFeedback(UUID submissionId, String feedback) {
    Submission submission =
        submissionRepository
            .findById(submissionId)
            .orElseThrow(
                () ->
                    new NotFoundException("Submission not found with id: " + submissionId));

    submission.setFeedback(feedback);
    Submission updatedSubmission = submissionRepository.save(submission);

    return submissionMapper.toResponse(updatedSubmission);
  }
}

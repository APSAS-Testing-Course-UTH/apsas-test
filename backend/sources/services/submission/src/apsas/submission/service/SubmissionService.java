package apsas.submission.service;

import apsas.messaging.event.EventPublisher;
import apsas.messaging.event.RabbitMQConfig;
import apsas.messaging.event.SubmissionCreatedEvent;
import apsas.shared.common.dto.PageResponse;
import apsas.shared.common.exception.NotFoundException;
import apsas.shared.common.exception.UnauthorizedException;
import apsas.submission.mapper.SubmissionMapper;
import apsas.submission.model.dto.CreateSubmissionRequest;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.entity.Submission;
import apsas.submission.model.entity.SubmissionStatus;
import apsas.submission.repository.SubmissionRepository;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubmissionService {

  private final SubmissionRepository submissionRepository;
  private final SubmissionMapper submissionMapper;
  private final EventPublisher eventPublisher;

  public SubmissionService(
      SubmissionRepository submissionRepository,
      SubmissionMapper submissionMapper,
      EventPublisher eventPublisher
  ) {
    this.submissionRepository = submissionRepository;
    this.submissionMapper = submissionMapper;
    this.eventPublisher = eventPublisher;
  }

  @Transactional(readOnly = true)
  public List<SubmissionResponse> getAllSubmissions(
      UUID studentId,
      UUID assignmentId,
      UUID filterStudentId,
      SubmissionStatus status,
      boolean isInstructor
  ) {
    List<Submission> submissions;

    if (isInstructor) {
      // Instructors can filter by assignment, student, and status
      submissions = submissionRepository.findByFilters(assignmentId, filterStudentId, status);
    } else {
      // Students can only see their own submissions
      if (assignmentId != null) {
        submissions = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);
      } else {
        submissions = submissionRepository.findByStudentId(studentId);
      }
      // Apply status filter for students if provided
      if (status != null) {
        submissions =
            submissions.stream().filter(s -> s.getStatus() == status).collect(Collectors.toList());
      }
    }

    return submissions.stream().map(submissionMapper::toResponse).collect(Collectors.toList());
  }

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
      throw new UnauthorizedException("You are not authorized to view this submission");
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
    eventPublisher.publish(RabbitMQConfig.SUBMISSION_CREATED_ROUTING_KEY, event);

    return submissionMapper.toResponse(savedSubmission);
  }

  @Transactional
  public void updateSubmissionEvaluation(UUID submissionId, SubmissionResponse evaluationResult) {
    Submission submission =
        submissionRepository
            .findById(submissionId)
            .orElseThrow(() -> new NotFoundException(
                "Submission not found with id: " + submissionId));

    submission.setStatus(evaluationResult.getStatus());
    submission.setResult(evaluationResult.getResult());
    submission.setScore(evaluationResult.getScore());
    submission.setEvaluatedAt(evaluationResult.getEvaluatedAt());

    // Convert TestCaseResultResponse back to TestCaseResult if needed
    // This is simplified - you might need a proper mapper
    if (evaluationResult.getTestCaseResults() != null) {
      // For now, we'll store the results directly
      // In a real implementation, you'd want to properly map this
    }

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

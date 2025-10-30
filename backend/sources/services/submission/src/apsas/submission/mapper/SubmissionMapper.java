package apsas.submission.mapper;

import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import apsas.submission.model.dto.CreateSubmissionRequest;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.dto.TestCaseResultResponse;
import apsas.submission.model.entity.Submission;
import apsas.submission.model.entity.TestCaseResult;

@Component
public class SubmissionMapper {

  public Submission toEntity(CreateSubmissionRequest request, UUID studentId) {
    Submission submission = new Submission();
    submission.setAssignmentId(request.getAssignmentId());
    submission.setStudentId(studentId);
    submission.setCode(request.getCode());
    submission.setLanguage(request.getLanguage());
    return submission;
  }

  public SubmissionResponse toResponse(Submission submission) {
    SubmissionResponse response = new SubmissionResponse();
    response.setId(submission.getId());
    response.setAssignmentId(submission.getAssignmentId());
    response.setStudentId(submission.getStudentId());
    response.setSubmittedAt(submission.getSubmittedAt());
    response.setStatus(submission.getStatus());
    response.setCode(submission.getCode());
    response.setLanguage(submission.getLanguage());
    response.setResult(submission.getResult());
    response.setScore(submission.getScore());
    response.setEvaluatedAt(submission.getEvaluatedAt());
    response.setFeedback(submission.getFeedback());

    if (submission.getTestCaseResults() != null) {
      response.setTestCaseResults(
          submission.getTestCaseResults().stream()
              .map(this::toTestCaseResultResponse)
              .collect(Collectors.toList()));
    }

    return response;
  }

  public TestCaseResultResponse toTestCaseResultResponse(TestCaseResult testCaseResult) {
    TestCaseResultResponse response = new TestCaseResultResponse();
    response.setOrder(testCaseResult.getOrder());
    response.setDescription(testCaseResult.getDescription());
    response.setHidden(testCaseResult.getHidden());
    response.setWeight(testCaseResult.getWeight());
    response.setInput(testCaseResult.getInput());
    response.setOutput(testCaseResult.getOutput());
    response.setTimeout(testCaseResult.getTimeout());
    response.setMemoryLimit(testCaseResult.getMemoryLimit());
    response.setPassed(testCaseResult.getPassed());
    response.setActualOutput(testCaseResult.getActualOutput());
    response.setErrorMessage(testCaseResult.getErrorMessage());
    response.setExecutionTime(testCaseResult.getExecutionTime());
    response.setMemoryUsed(testCaseResult.getMemoryUsed());
    return response;
  }
}

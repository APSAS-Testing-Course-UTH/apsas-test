package apsas.submission.mapper;

import apsas.submission.model.dto.CreateSubmissionRequest;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.shared.models.submission.TestCaseResultDto;
import apsas.submission.model.entity.Submission;
import apsas.submission.model.entity.TestCaseResult;
import java.util.List;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubmissionMapper {

  @Mapping(target = "testCaseResults", ignore = true)
  @Mapping(target = "submittedAt", ignore = true)
  @Mapping(target = "status", ignore = true)
  @Mapping(target = "score", ignore = true)
  @Mapping(target = "result", ignore = true)
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "feedback", ignore = true)
  @Mapping(target = "evaluatedAt", ignore = true)
  @Mapping(target = "studentId", source = "studentId")
  @Mapping(target = "assignmentId", source = "request.assignmentId")
  @Mapping(target = "code", source = "request.code")
  @Mapping(target = "language", source = "request.language")
  Submission toEntity(CreateSubmissionRequest request, UUID studentId);

  @Mapping(target = "testCaseResults", source = "testCaseResults")
  SubmissionResponse toResponse(Submission submission);

  TestCaseResultDto toTestCaseResultResponse(TestCaseResult testCaseResult);

  List<TestCaseResultDto> toTestCaseResultResponses(List<TestCaseResult> testCaseResults);
}

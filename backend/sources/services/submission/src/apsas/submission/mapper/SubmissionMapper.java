package apsas.submission.mapper;

import apsas.shared.models.submission.TestCaseResultDto;
import apsas.submission.model.dto.CreateSubmissionRequest;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.entity.Submission;
import apsas.submission.model.entity.TestCaseResult;
import java.util.List;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

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

  @Mapping(target = "id", source = "id")
  @Mapping(target = "assignmentId", source = "assignmentId")
  @Mapping(target = "studentId", source = "studentId")
  @Mapping(target = "submittedAt", source = "submittedAt")
  @Mapping(target = "status", source = "status")
  @Mapping(target = "code", source = "code")
  @Mapping(target = "language", source = "language")
  @Mapping(target = "result", source = "result")
  @Mapping(target = "score", source = "score")
  @Mapping(
      target = "testCaseResults",
      source = "testCaseResults",
      qualifiedByName = "toTestCaseResultDtos"
  )
  @Mapping(target = "evaluatedAt", source = "evaluatedAt")
  @Mapping(target = "feedback", source = "feedback")
  SubmissionResponse toResponse(Submission submission);

  @Named("toTestCaseResultDtos")
  default List<TestCaseResultDto> toTestCaseResultDtos(List<TestCaseResult> testCaseResults) {
    if (testCaseResults == null) {
      return null;
    }
    return testCaseResults.stream()
        .map(this::toTestCaseResultResponse)
        .collect(java.util.stream.Collectors.toList());
  }

  TestCaseResultDto toTestCaseResultResponse(TestCaseResult testCaseResult);
}

package apsas.submission.mapper;

import apsas.shared.models.submission.TestCaseResultResponse;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.entity.SubmissionResult;
import apsas.submission.model.entity.SubmissionStatus;
import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface FeignSubmissionMapper {

  @Mapping(target = "status", source = "status", qualifiedByName = "statusToString")
  @Mapping(target = "result", source = "result", qualifiedByName = "resultToString")
  @Mapping(
      target = "testCaseResults",
      source = "testCaseResults",
      qualifiedByName = "mapTestCaseResults"
  )
  apsas.feign.dto.SubmissionResponse toFeignDto(SubmissionResponse submissionResponse);

  @Named("statusToString")
  default String statusToString(SubmissionStatus status) {
    return status != null ? status.name() : null;
  }

  @Named("resultToString")
  default String resultToString(SubmissionResult result) {
    return result != null ? result.name() : null;
  }

  @Named("mapTestCaseResults")
  default List<apsas.feign.dto.TestCaseResultDto> mapTestCaseResults(
      List<TestCaseResultResponse> testCaseResults
  ) {
    if (testCaseResults == null) {
      return null;
    }
    return testCaseResults.stream()
        .map(
            tc -> {
              apsas.feign.dto.TestCaseResultDto dto = new apsas.feign.dto.TestCaseResultDto();
              dto.setDescription(tc.getDescription());
              dto.setPassed(tc.getPassed());
              dto.setExpected(tc.getOutput());
              dto.setActual(tc.getActualOutput());
              dto.setErrorMessage(tc.getErrorMessage());
              return dto;
            })
        .collect(Collectors.toList());
  }
}

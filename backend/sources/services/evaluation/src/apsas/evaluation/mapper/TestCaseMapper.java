package apsas.evaluation.mapper;

import apsas.feign.dto.TestCaseDto;
import apsas.shared.models.submission.TestCaseResultResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for converting TestCaseDto to TestCaseResultDto
 */
@Mapper(componentModel = "spring")
public interface TestCaseMapper {

  /**
   * Create a TestCaseResultDto from a TestCaseDto with initial values
   *
   * @param testCase Source test case
   * @return TestCaseResultDto with test case metadata
   */
  @Mapping(target = "passed", ignore = true)
  @Mapping(target = "actualOutput", ignore = true)
  @Mapping(target = "errorMessage", ignore = true)
  @Mapping(target = "executionTime", ignore = true)
  @Mapping(target = "memoryUsed", ignore = true)
  TestCaseResultResponse toTestCaseResult(TestCaseDto testCase);
}

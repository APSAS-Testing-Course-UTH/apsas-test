package apsas.content.mapper;

import apsas.content.model.dto.AssignmentResponse;
import apsas.content.model.entity.AssignmentStatus;
import apsas.content.model.entity.DifficultyLevel;
import apsas.content.model.entity.TestCase;
import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface FeignAssignmentMapper {

  @Mapping(target = "difficultyLevel", source = "difficultyLevel", qualifiedByName = "difficultyToString")
  @Mapping(target = "status", source = "status", qualifiedByName = "statusToString")
  @Mapping(target = "testCases", source = "testCases", qualifiedByName = "mapTestCases")
  apsas.feign.dto.AssignmentResponse toFeignDto(AssignmentResponse assignmentResponse);

  @Named("difficultyToString")
  default String difficultyToString(DifficultyLevel difficulty) {
    return difficulty != null ? difficulty.name() : null;
  }

  @Named("statusToString")
  default String statusToString(AssignmentStatus status) {
    return status != null ? status.name() : null;
  }

  @Named("mapTestCases")
  default List<apsas.feign.dto.TestCaseDto> mapTestCases(List<TestCase> testCases) {
    if (testCases == null) {
      return null;
    }
    return testCases.stream()
        .map(
            tc -> {
              apsas.feign.dto.TestCaseDto dto = new apsas.feign.dto.TestCaseDto();
              dto.setOrder(tc.getOrder());
              dto.setDescription(tc.getDescription());
              dto.setHidden(tc.getHidden());
              dto.setWeight(tc.getWeight());
              dto.setInput(tc.getInput());
              dto.setOutput(tc.getOutput());
              dto.setTimeout(tc.getTimeout());
              dto.setMemoryLimit(tc.getMemoryLimit());
              return dto;
            })
        .collect(Collectors.toList());
  }
}

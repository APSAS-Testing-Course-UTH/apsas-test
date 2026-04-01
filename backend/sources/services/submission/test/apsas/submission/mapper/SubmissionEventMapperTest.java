package apsas.submission.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import apsas.shared.messaging.event.SubmissionEvaluatedEvent;
import apsas.shared.models.submission.TestCaseResultResponse;
import apsas.submission.model.entity.SubmissionResult;
import apsas.submission.model.entity.SubmissionStatus;
import apsas.submission.model.entity.TestCaseResult;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

/**
 * Unit test cho mapper chuyển đổi dữ liệu event đánh giá bài nộp.
 */
@Tag("unit")
@Feature("Submission Event Mapper")
class SubmissionEventMapperTest {

  private final SubmissionEventMapper mapper = new SubmissionEventMapperImpl();

  @ParameterizedTest
  @EnumSource(SubmissionEvaluatedEvent.Status.class)
  @DisplayName("toEntityStatus maps all event status values")
  @Story("Map event status")
  void toEntityStatusShouldMapAllValuesWhenStatusProvided(SubmissionEvaluatedEvent.Status input) {
    SubmissionStatus actual = mapper.toEntityStatus(input);

    assertEquals(SubmissionStatus.valueOf(input.name()), actual);
  }

  @Test
  @DisplayName("toEntityStatus returns null when status is null")
  @Story("Map event status")
  void toEntityStatusShouldReturnNullWhenStatusIsNull() {
    SubmissionStatus actual = mapper.toEntityStatus(null);

    assertNull(actual);
  }

  @ParameterizedTest
  @EnumSource(SubmissionEvaluatedEvent.Result.class)
  @DisplayName("toEntityResult maps all event result values")
  @Story("Map event result")
  void toEntityResultShouldMapAllValuesWhenResultProvided(SubmissionEvaluatedEvent.Result input) {
    SubmissionResult actual = mapper.toEntityResult(input);

    assertEquals(SubmissionResult.valueOf(input.name()), actual);
  }

  @Test
  @DisplayName("toEntityResult returns null when result is null")
  @Story("Map event result")
  void toEntityResultShouldReturnNullWhenResultIsNull() {
    SubmissionResult actual = mapper.toEntityResult(null);

    assertNull(actual);
  }

  @Test
  @DisplayName("toEntityTestCaseResult maps all fields from shared dto")
  @Story("Map test case result")
  void toEntityTestCaseResultShouldMapAllFieldsWhenDtoProvided() {
    TestCaseResultResponse dto =
        new TestCaseResultResponse(
            1,
            "TC01",
            false,
            2.0,
            "input",
            "output",
            1200,
            128,
            true,
            "actual",
            null,
            0.21,
            20.0);

    TestCaseResult actual = mapper.toEntityTestCaseResult(dto);

    assertEquals(1, actual.getOrder());
    assertEquals("TC01", actual.getDescription());
    assertEquals(false, actual.getHidden());
    assertEquals(2.0, actual.getWeight());
    assertEquals("input", actual.getInput());
    assertEquals("output", actual.getOutput());
    assertEquals(1200, actual.getTimeout());
    assertEquals(128, actual.getMemoryLimit());
    assertEquals(true, actual.getPassed());
    assertEquals("actual", actual.getActualOutput());
    assertNull(actual.getErrorMessage());
    assertEquals(0.21, actual.getExecutionTime());
    assertEquals(20.0, actual.getMemoryUsed());
  }

  @Test
  @DisplayName("toEntityTestCaseResult returns null when dto is null")
  @Story("Map test case result")
  void toEntityTestCaseResultShouldReturnNullWhenDtoIsNull() {
    TestCaseResult actual = mapper.toEntityTestCaseResult(null);

    assertNull(actual);
  }
}

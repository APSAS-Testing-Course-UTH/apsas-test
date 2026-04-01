package apsas.submission.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import apsas.shared.models.submission.TestCaseResultResponse;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.entity.SubmissionResult;
import apsas.submission.model.entity.SubmissionStatus;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * Unit test cho mapper chuyển đổi sang DTO dùng cho Feign client.
 */
@Tag("unit")
@Feature("Feign Submission Mapper")
class FeignSubmissionMapperTest {

  private final FeignSubmissionMapper mapper = new FeignSubmissionMapperImpl();

  @Test
  @DisplayName("toFeignDto returns null when source response is null")
  @Story("Map submission response to feign dto")
  void toFeignDtoShouldReturnNullWhenSourceIsNull() {
    apsas.feign.dto.SubmissionResponse actual = mapper.toFeignDto(null);

    assertNull(actual);
  }

  @Test
  @DisplayName("toFeignDto maps scalar fields enums and test case results")
  @Story("Map submission response to feign dto")
  void toFeignDtoShouldMapAllFieldsWhenSourceHasData() {
    UUID submissionId = UUID.randomUUID();
    UUID assignmentId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();
    LocalDateTime submittedAt = LocalDateTime.now().minusMinutes(15);
    LocalDateTime evaluatedAt = LocalDateTime.now();

    SubmissionResponse source = new SubmissionResponse();
    source.setId(submissionId);
    source.setAssignmentId(assignmentId);
    source.setStudentId(studentId);
    source.setSubmittedAt(submittedAt);
    source.setStatus(SubmissionStatus.EVALUATED);
    source.setCode("Y29kZQ==");
    source.setLanguage("java");
    source.setResult(SubmissionResult.PARTIAL);
    source.setScore(new BigDecimal("50.00"));
    source.setTestCaseResults(List.of(sampleResult()));
    source.setEvaluatedAt(evaluatedAt);
    source.setFeedback("Need optimize");

    apsas.feign.dto.SubmissionResponse actual = mapper.toFeignDto(source);

    assertNotNull(actual);
    assertEquals(submissionId, actual.getId());
    assertEquals(assignmentId, actual.getAssignmentId());
    assertEquals(studentId, actual.getStudentId());
    assertEquals(submittedAt, actual.getSubmittedAt());
    assertEquals("EVALUATED", actual.getStatus());
    assertEquals("Y29kZQ==", actual.getCode());
    assertEquals("java", actual.getLanguage());
    assertEquals("PARTIAL", actual.getResult());
    assertEquals(new BigDecimal("50.00"), actual.getScore());
    assertEquals(evaluatedAt, actual.getEvaluatedAt());
    assertEquals("Need optimize", actual.getFeedback());
    assertNotNull(actual.getTestCaseResults());
    assertEquals(1, actual.getTestCaseResults().size());

    apsas.feign.dto.TestCaseResultDto testCaseResult = actual.getTestCaseResults().getFirst();
    assertEquals("TC01", testCaseResult.getDescription());
    assertEquals(true, testCaseResult.getPassed());
    assertEquals("expected", testCaseResult.getExpected());
    assertEquals("actual", testCaseResult.getActual());
    assertNull(testCaseResult.getErrorMessage());
  }

  @Test
  @DisplayName("statusToString returns null when status is null")
  @Story("Map enum to string")
  void statusToStringShouldReturnNullWhenStatusIsNull() {
    String actual = mapper.statusToString(null);

    assertNull(actual);
  }

  @Test
  @DisplayName("resultToString returns null when result is null")
  @Story("Map enum to string")
  void resultToStringShouldReturnNullWhenResultIsNull() {
    String actual = mapper.resultToString(null);

    assertNull(actual);
  }

  @Test
  @DisplayName("mapTestCaseResults returns null when list is null")
  @Story("Map nested test case list")
  void mapTestCaseResultsShouldReturnNullWhenInputListIsNull() {
    List<apsas.feign.dto.TestCaseResultDto> actual = mapper.mapTestCaseResults(null);

    assertNull(actual);
  }

  private static TestCaseResultResponse sampleResult() {
    return new TestCaseResultResponse(
        1,
        "TC01",
        false,
        1.0,
        "input",
        "expected",
        1000,
        128,
        true,
        "actual",
        null,
        0.2,
        16.0);
  }
}

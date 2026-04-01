package apsas.submission.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import apsas.shared.models.submission.TestCaseResultResponse;
import apsas.submission.model.dto.CreateSubmissionRequest;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.entity.Submission;
import apsas.submission.model.entity.SubmissionResult;
import apsas.submission.model.entity.SubmissionStatus;
import apsas.submission.model.entity.TestCaseResult;
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
 * Unit test cho mapper chuyển đổi Submission.
 */
@Tag("unit")
@Feature("Submission Mapper")
class SubmissionMapperTest {

  private static final String SAMPLE_CODE_BASE64 = "Y29kZQ==";

  private final SubmissionMapper mapper = new SubmissionMapperImpl();

  @Test
  @DisplayName("toEntity returns null when both request and studentId are null")
  @Story("Map request to entity")
  void toEntityShouldReturnNullWhenRequestAndStudentIdAreNull() {
    Submission actual = mapper.toEntity(null, null);

    assertNull(actual);
  }

  @Test
  @DisplayName("toEntity maps request fields and student id")
  @Story("Map request to entity")
  void toEntityShouldMapRequestAndStudentIdWhenInputIsValid() {
    UUID assignmentId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();
    CreateSubmissionRequest request =
      new CreateSubmissionRequest(assignmentId, SAMPLE_CODE_BASE64, "java");

    Submission actual = mapper.toEntity(request, studentId);

    assertNotNull(actual);
    assertEquals(assignmentId, actual.getAssignmentId());
    assertEquals(SAMPLE_CODE_BASE64, actual.getCode());
    assertEquals("java", actual.getLanguage());
    assertEquals(studentId, actual.getStudentId());
    assertNull(actual.getId());
    assertNull(actual.getStatus());
    assertNull(actual.getResult());
    assertNull(actual.getSubmittedAt());
    assertNull(actual.getEvaluatedAt());
    assertNull(actual.getScore());
    assertNull(actual.getFeedback());
    assertNull(actual.getTestCaseResults());
  }

  @Test
  @DisplayName("toResponse returns null when submission is null")
  @Story("Map entity to response")
  void toResponseShouldReturnNullWhenSubmissionIsNull() {
    SubmissionResponse actual = mapper.toResponse(null);

    assertNull(actual);
  }

  @Test
  @DisplayName("toResponse maps all fields including nested test case results")
  @Story("Map entity to response")
  void toResponseShouldMapAllFieldsIncludingTestCaseResultsWhenSubmissionHasData() {
    UUID submissionId = UUID.randomUUID();
    UUID assignmentId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();
    LocalDateTime submittedAt = LocalDateTime.now().minusHours(1);
    LocalDateTime evaluatedAt = LocalDateTime.now();

    Submission submission = new Submission();
    submission.setId(submissionId);
    submission.setAssignmentId(assignmentId);
    submission.setStudentId(studentId);
    submission.setSubmittedAt(submittedAt);
    submission.setStatus(SubmissionStatus.EVALUATED);
    submission.setCode(SAMPLE_CODE_BASE64);
    submission.setLanguage("java");
    submission.setResult(SubmissionResult.PASSED);
    submission.setScore(new BigDecimal("97.50"));
    submission.setTestCaseResults(List.of(sampleTestCaseResult()));
    submission.setEvaluatedAt(evaluatedAt);
    submission.setFeedback("Well done");

    SubmissionResponse actual = mapper.toResponse(submission);

    assertNotNull(actual);
    assertEquals(submissionId, actual.getId());
    assertEquals(assignmentId, actual.getAssignmentId());
    assertEquals(studentId, actual.getStudentId());
    assertEquals(submittedAt, actual.getSubmittedAt());
    assertEquals(SubmissionStatus.EVALUATED, actual.getStatus());
    assertEquals(SAMPLE_CODE_BASE64, actual.getCode());
    assertEquals("java", actual.getLanguage());
    assertEquals(SubmissionResult.PASSED, actual.getResult());
    assertEquals(new BigDecimal("97.50"), actual.getScore());
    assertEquals(evaluatedAt, actual.getEvaluatedAt());
    assertEquals("Well done", actual.getFeedback());
    assertNotNull(actual.getTestCaseResults());
    assertEquals(1, actual.getTestCaseResults().size());

    TestCaseResultResponse testCaseResult = actual.getTestCaseResults().getFirst();
    assertEquals(1, testCaseResult.getOrder());
    assertEquals("TC01", testCaseResult.getDescription());
    assertEquals(true, testCaseResult.getPassed());
    assertEquals("output", testCaseResult.getOutput());
    assertEquals("actual", testCaseResult.getActualOutput());
  }

  @Test
  @DisplayName("toTestCaseResultDtos returns null when input list is null")
  @Story("Map entity to response")
  void toTestCaseResultDtosShouldReturnNullWhenInputListIsNull() {
    List<TestCaseResultResponse> actual = mapper.toTestCaseResultDtos(null);

    assertNull(actual);
  }

  private static TestCaseResult sampleTestCaseResult() {
    TestCaseResult result = new TestCaseResult();
    result.setOrder(1);
    result.setDescription("TC01");
    result.setHidden(false);
    result.setWeight(1.0);
    result.setInput("input");
    result.setOutput("output");
    result.setTimeout(1000);
    result.setMemoryLimit(128);
    result.setPassed(true);
    result.setActualOutput("actual");
    result.setErrorMessage(null);
    result.setExecutionTime(0.1);
    result.setMemoryUsed(12.5);
    return result;
  }
}

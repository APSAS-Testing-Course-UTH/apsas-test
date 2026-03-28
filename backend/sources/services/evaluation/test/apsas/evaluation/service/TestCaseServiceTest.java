package apsas.evaluation.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import apsas.evaluation.client.PistonApiClient;
import apsas.evaluation.mapper.PistonRequestMapper;
import apsas.evaluation.mapper.TestCaseMapper;
import apsas.evaluation.model.dto.PistonExecuteRequest;
import apsas.evaluation.model.dto.PistonExecuteResponse;
import apsas.feign.dto.TestCaseDto;
import apsas.shared.models.submission.TestCaseResultResponse;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.List;
import java.util.stream.Stream;
import org.instancio.Instancio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@Epic("Evaluation Service")
@Feature("Test Case Execution")
class TestCaseServiceTest {

  @Mock
  private PistonApiClient pistonApiClient;

  @Mock
  private TestCaseMapper testCaseMapper;

  @Mock
  private PistonRequestMapper pistonRequestMapper;

  @InjectMocks
  private TestCaseService testCaseService;

  @Test
  @Tag("unit")
  @Story("Execute passing test case")
  @Severity(SeverityLevel.CRITICAL)
  @Issue("9")
  @TmsLink("EVL-TCS-001")
  @DisplayName("Returns passed result when output matches after normalization")
  void executeTestCase_shouldReturnPassedResult_whenOutputMatchesAfterNormalization() {
    var testCase = Instancio.create(TestCaseDto.class);
    testCase.setOutput("42\nDone");

    var initialResult = Instancio.create(TestCaseResultResponse.class);
    when(testCaseMapper.toTestCaseResult(testCase)).thenReturn(initialResult);

    var request = new PistonExecuteRequest(
        "java",
        "*",
        List.of(),
        "",
        1000,
        1000,
        -1L
    );
    when(pistonRequestMapper.createExecuteRequest(
        "Y29kZQ==",
        "java",
        testCase
    )).thenReturn(request);

    var runResult =
        new PistonExecuteResponse.ExecutionResult("42\r\nDone   ", "", "42\r\nDone", 0, null);
    var compileResult =
        new PistonExecuteResponse.ExecutionResult("", "", "", 0, null);
    var response = new PistonExecuteResponse(
        "java",
        "21",
        runResult,
        compileResult
    );
    when(pistonApiClient.execute(request)).thenReturn(response);

    var future =
        testCaseService.executeTestCase("Y29kZQ==", "java", testCase);
    var result = future.join();

    assertTrue(result.getPassed());
    assertEquals("42\r\nDone   ", result.getActualOutput());
    assertNotNull(result.getExecutionTime());
    assertTrue(result.getExecutionTime() >= 0);
  }

  @Test
  @Tag("unit")
  @Story("Handle compile failure")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("EVL-TCS-002")
  @DisplayName("Returns failed result when compile exit code is non-zero")
  void executeTestCase_shouldReturnFailedResult_whenCompileErrorOccurs() {
    var testCase = Instancio.create(TestCaseDto.class);
    var initialResult = Instancio.create(TestCaseResultResponse.class);
    when(testCaseMapper.toTestCaseResult(testCase)).thenReturn(initialResult);

    var request = new PistonExecuteRequest(
        "java",
        "*",
        List.of(),
        "",
        1000,
        1000,
        -1L
    );
    when(pistonRequestMapper.createExecuteRequest(
        "Y29kZQ==",
        "java",
        testCase
    )).thenReturn(request);

    var runResult =
        new PistonExecuteResponse.ExecutionResult("", "", "", 0, null);
    var compileResult =
        new PistonExecuteResponse.ExecutionResult("", "syntax error", "compiler output", 1, null);
    when(pistonApiClient.execute(request)).thenReturn(new PistonExecuteResponse(
        "java",
        "21",
        runResult,
        compileResult
    ));

    var result = testCaseService.executeTestCase("Y29kZQ==", "java", testCase)
        .join();

    assertFalse(result.getPassed());
    assertTrue(result.getErrorMessage().contains("Compilation error"));
    assertEquals("compiler output", result.getActualOutput());
  }

  @Test
  @Tag("unit")
  @Story("Handle runtime failure")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("EVL-TCS-003")
  @DisplayName("Returns failed result when runtime exit code is non-zero")
  void executeTestCase_shouldReturnFailedResult_whenRuntimeErrorOccurs() {
    var testCase = Instancio.create(TestCaseDto.class);
    var initialResult = Instancio.create(TestCaseResultResponse.class);
    when(testCaseMapper.toTestCaseResult(testCase)).thenReturn(initialResult);

    var request = new PistonExecuteRequest(
        "java",
        "*",
        List.of(),
        "",
        1000,
        1000,
        -1L
    );
    when(pistonRequestMapper.createExecuteRequest(
        "Y29kZQ==",
        "java",
        testCase
    )).thenReturn(request);

    var runResult =
        new PistonExecuteResponse.ExecutionResult("", "runtime error", "stacktrace", 137, null);
    var compileResult =
        new PistonExecuteResponse.ExecutionResult("", "", "", 0, null);
    when(pistonApiClient.execute(request)).thenReturn(new PistonExecuteResponse(
        "java",
        "21",
        runResult,
        compileResult
    ));

    var result = testCaseService.executeTestCase("Y29kZQ==", "java", testCase)
        .join();

    assertFalse(result.getPassed());
    assertTrue(result.getErrorMessage().contains("Runtime error"));
    assertEquals("stacktrace", result.getActualOutput());
  }

  @Test
  @Tag("unit")
  @Story("Handle output mismatch")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("EVL-TCS-004")
  @DisplayName("Returns failed result when normalized outputs do not match")
  void executeTestCase_shouldReturnFailedResult_whenOutputMismatchOccurs() {
    var testCase = Instancio.create(TestCaseDto.class);
    testCase.setOutput("expected output");

    var initialResult = Instancio.create(TestCaseResultResponse.class);
    when(testCaseMapper.toTestCaseResult(testCase)).thenReturn(initialResult);

    var request = new PistonExecuteRequest(
        "java",
        "*",
        List.of(),
        "",
        1000,
        1000,
        -1L
    );
    when(pistonRequestMapper.createExecuteRequest(
        "Y29kZQ==",
        "java",
        testCase
    )).thenReturn(request);

    var runResult =
        new PistonExecuteResponse.ExecutionResult("actual output", "", "actual output", 0, null);
    var compileResult =
        new PistonExecuteResponse.ExecutionResult("", "", "", 0, null);
    when(pistonApiClient.execute(request)).thenReturn(new PistonExecuteResponse(
        "java",
        "21",
        runResult,
        compileResult
    ));

    var result = testCaseService.executeTestCase("Y29kZQ==", "java", testCase)
        .join();

    assertFalse(result.getPassed());
    assertEquals("Output mismatch", result.getErrorMessage());
  }

  @Test
  @Tag("unit")
  @Story("Handle execution exception")
  @Severity(SeverityLevel.CRITICAL)
  @Issue("9")
  @TmsLink("EVL-TCS-005")
  @DisplayName("Returns failed result when piston client throws exception")
  void executeTestCase_shouldReturnFailedResult_whenClientThrowsException() {
    var testCase = Instancio.create(TestCaseDto.class);

    var initialResult = Instancio.create(TestCaseResultResponse.class);
    when(testCaseMapper.toTestCaseResult(testCase)).thenReturn(initialResult);

    var request = new PistonExecuteRequest(
        "java",
        "*",
        List.of(),
        "",
        1000,
        1000,
        -1L
    );
    when(pistonRequestMapper.createExecuteRequest(
        "Y29kZQ==",
        "java",
        testCase
    )).thenReturn(request);
    when(pistonApiClient.execute(request)).thenThrow(new RuntimeException("piston timeout"));

    var result = testCaseService.executeTestCase("Y29kZQ==", "java", testCase)
        .join();

    assertFalse(result.getPassed());
    assertTrue(result.getErrorMessage().contains("Execution error"));
  }

  @ParameterizedTest(name = "{0}")
  @Tag("unit")
  @Story("Handle missing expected/actual output")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("EVL-TCS-006")
  @DisplayName("Returns mismatch when one side of output is null")
  @MethodSource("nullOutputScenarios")
  void executeTestCase_shouldReturnMismatch_whenAnyOutputSideIsNull(
      String scenario,
      String expectedOutput,
      String actualOutput
  ) {
    var testCase = Instancio.create(TestCaseDto.class);
    testCase.setOutput(expectedOutput);

    var initialResult = Instancio.create(TestCaseResultResponse.class);
    when(testCaseMapper.toTestCaseResult(testCase)).thenReturn(initialResult);

    var request = new PistonExecuteRequest(
        "java",
        "*",
        List.of(),
        "",
        1000,
        1000,
        -1L
    );
    when(pistonRequestMapper.createExecuteRequest(
        "Y29kZQ==",
        "java",
        testCase
    )).thenReturn(request);

    var runResult =
        new PistonExecuteResponse.ExecutionResult(actualOutput, "", "", 0, null);
    var compileResult =
        new PistonExecuteResponse.ExecutionResult("", "", "", 0, null);
    when(pistonApiClient.execute(request)).thenReturn(new PistonExecuteResponse(
        "java",
        "21",
        runResult,
        compileResult
    ));

    var result = testCaseService.executeTestCase("Y29kZQ==", "java", testCase)
        .join();

    assertFalse(result.getPassed());
    assertEquals("Output mismatch", result.getErrorMessage());
  }

  @Test
  @Tag("unit")
  @Story("Accept missing compile and run metadata")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("EVL-TCS-007")
  @DisplayName("Treats execution as successful when compile and run codes are absent")
  void executeTestCase_shouldPass_whenCompileAndRunCodesAreNull() {
    var testCase = Instancio.create(TestCaseDto.class);
    testCase.setOutput("ok");

    var initialResult = Instancio.create(TestCaseResultResponse.class);
    when(testCaseMapper.toTestCaseResult(testCase)).thenReturn(initialResult);

    var request = new PistonExecuteRequest(
        "java",
        "*",
        List.of(),
        "",
        1000,
        1000,
        -1L
    );
    when(pistonRequestMapper.createExecuteRequest(
        "Y29kZQ==",
        "java",
        testCase
    )).thenReturn(request);

    var runResult =
        new PistonExecuteResponse.ExecutionResult("ok", "", "ok", null, null);
    when(pistonApiClient.execute(request)).thenReturn(new PistonExecuteResponse(
        "java",
        "21",
        runResult,
        null
    ));

    var result = testCaseService.executeTestCase("Y29kZQ==", "java", testCase)
        .join();

    assertTrue(result.getPassed());
    assertEquals("ok", result.getActualOutput());
  }

  private static Stream<Arguments> nullOutputScenarios() {
    return Stream.of(
        Arguments.of("expected output is null", null, "some-output"),
        Arguments.of("actual output is null", "expected", null)
    );
  }
}

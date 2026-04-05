package apsas.submission.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import apsas.shared.exception.ForbiddenException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.models.pagination.PageResponse;
import apsas.shared.models.submission.TestCaseResultResponse;
import apsas.submission.mapper.SubmissionMapper;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.entity.Submission;
import apsas.submission.model.entity.SubmissionStatus;
import apsas.submission.repository.SubmissionRepository;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.instancio.Instancio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * Unit test cho nhóm use case đọc dữ liệu của SubmissionService.
 *
 * <p>Nhóm này tập trung vào query behavior: list submissions và get by id,
 * bao gồm authorization logic + masking dữ liệu hidden test case cho student.</p>
 */
@ExtendWith(MockitoExtension.class)
@Epic("Submission Service")
@Feature("Service Layer - Query")
@Issue("12")
class SubmissionServiceQueryTest {

  private static final String SECRET_INPUT = "secret-input";
  private static final String SECRET_OUTPUT = "secret-output";

  @Mock
  private SubmissionRepository submissionRepository;

  @Mock
  private SubmissionMapper submissionMapper;

  @InjectMocks
  private SubmissionService submissionService;

  /** Verify student list view luôn mask hidden input/output. */
  @Test
  @Tag("unit")
  @Story("List submissions for student")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-SVC-001")
  @DisplayName("Masks hidden test case input and output for student list view")
  void getAllSubmissions_shouldMaskHiddenTestCases_whenRequesterIsStudent() {
    UUID studentId = UUID.randomUUID();
    UUID assignmentId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 10);

    Submission submission = Instancio.create(Submission.class);
    submission.setStudentId(studentId);
    Page<Submission> page = new PageImpl<>(List.of(submission), pageable, 1);

    TestCaseResultResponse hidden = Instancio.create(TestCaseResultResponse.class);
    hidden.setHidden(true);
    hidden.setInput(SECRET_INPUT);
    hidden.setOutput(SECRET_OUTPUT);

    TestCaseResultResponse visible = Instancio.create(TestCaseResultResponse.class);
    visible.setHidden(false);
    visible.setInput("public-input");
    visible.setOutput("public-output");

    SubmissionResponse response = Instancio.create(SubmissionResponse.class);
    response.setTestCaseResults(new ArrayList<>(List.of(hidden, visible)));

    when(submissionRepository.findByFilters(assignmentId, studentId, null, pageable))
        .thenReturn(page);
    when(submissionMapper.toResponse(submission)).thenReturn(response);

    PageResponse<SubmissionResponse> actual = submissionService.getAllSubmissions(
        studentId,
        assignmentId,
        UUID.randomUUID(),
        null,
        false,
        pageable
    );

    assertEquals(1, actual.content().size());
    SubmissionResponse first = actual.content().getFirst();
    assertEquals("***", first.getTestCaseResults().get(0).getInput());
    assertEquals("***", first.getTestCaseResults().get(0).getOutput());
    assertEquals("public-input", first.getTestCaseResults().get(1).getInput());
    assertEquals("public-output", first.getTestCaseResults().get(1).getOutput());
  }

  /** Verify instructor filter chạy đúng và không bị mask dữ liệu hidden. */
  @Test
  @Tag("unit")
  @Story("List submissions for instructor")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-SVC-002")
  @DisplayName("Uses instructor filters and keeps hidden test case details unchanged")
  void getAllSubmissions_shouldUseInstructorFilters_whenRequesterIsInstructor() {
    UUID studentId = UUID.randomUUID();
    UUID assignmentId = UUID.randomUUID();
    UUID filterStudentId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 10);

    Submission submission = Instancio.create(Submission.class);
    Page<Submission> page = new PageImpl<>(List.of(submission), pageable, 1);

    TestCaseResultResponse hidden = Instancio.create(TestCaseResultResponse.class);
    hidden.setHidden(true);
    hidden.setInput(SECRET_INPUT);
    hidden.setOutput(SECRET_OUTPUT);

    SubmissionResponse response = Instancio.create(SubmissionResponse.class);
    response.setTestCaseResults(new ArrayList<>(List.of(hidden)));

    when(submissionRepository.findByFilters(
        assignmentId,
        filterStudentId,
        SubmissionStatus.EVALUATED,
        pageable
    )).thenReturn(page);
    when(submissionMapper.toResponse(submission)).thenReturn(response);

    PageResponse<SubmissionResponse> actual = submissionService.getAllSubmissions(
        studentId,
        assignmentId,
        filterStudentId,
        SubmissionStatus.EVALUATED,
        true,
        pageable
    );

    assertEquals(1, actual.content().size());
    assertEquals(SECRET_INPUT, actual.content().getFirst().getTestCaseResults().getFirst().getInput());
    assertEquals(SECRET_OUTPUT, actual.content().getFirst().getTestCaseResults().getFirst().getOutput());
  }

  /** Verify nhánh not found khi get by id. */
  @Test
  @Tag("unit")
  @Story("Get submission by id")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-SVC-003")
  @DisplayName("Throws not found when submission id does not exist")
  void getSubmissionById_shouldThrowNotFoundException_whenSubmissionMissing() {
    UUID submissionId = UUID.randomUUID();
    UUID requesterId = UUID.randomUUID();

    when(submissionRepository.findById(submissionId)).thenReturn(Optional.empty());

    NotFoundException ex = assertThrows(
        NotFoundException.class,
        () -> submissionService.getSubmissionById(submissionId, requesterId, false)
    );

    assertTrue(ex.getMessage().contains("Submission not found with id"));
  }

  /** Verify forbidden khi student truy cập submission của người khác. */
  @Test
  @Tag("unit")
  @Story("Get submission by id")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-SVC-004")
  @DisplayName("Throws forbidden when student tries to access another student submission")
  void getSubmissionById_shouldThrowForbiddenException_whenStudentAccessesOthersSubmission() {
    UUID submissionId = UUID.randomUUID();
    UUID ownerId = UUID.randomUUID();
    UUID requesterId = UUID.randomUUID();

    Submission submission = Instancio.create(Submission.class);
    submission.setId(submissionId);
    submission.setStudentId(ownerId);

    when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));

    ForbiddenException ex = assertThrows(
        ForbiddenException.class,
        () -> submissionService.getSubmissionById(submissionId, requesterId, false)
    );

    assertTrue(ex.getMessage().contains("You are not authorized to view this submission"));
  }

  /** Verify student đọc bài của mình vẫn nhận response đã mask hidden case. */
  @Test
  @Tag("unit")
  @Story("Get submission by id")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-SVC-005")
  @DisplayName("Masks hidden test case details when student reads own submission")
  void getSubmissionById_shouldMaskHiddenTestCases_whenStudentReadsOwnSubmission() {
    UUID submissionId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();

    Submission submission = Instancio.create(Submission.class);
    submission.setId(submissionId);
    submission.setStudentId(studentId);

    TestCaseResultResponse hidden = Instancio.create(TestCaseResultResponse.class);
    hidden.setHidden(true);
    hidden.setInput("input-hidden");
    hidden.setOutput("output-hidden");

    TestCaseResultResponse visible = Instancio.create(TestCaseResultResponse.class);
    visible.setHidden(false);
    visible.setInput("input-visible");
    visible.setOutput("output-visible");

    SubmissionResponse mapped = Instancio.create(SubmissionResponse.class);
    mapped.setTestCaseResults(new ArrayList<>(List.of(hidden, visible)));

    when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
    when(submissionMapper.toResponse(submission)).thenReturn(mapped);

    SubmissionResponse actual = submissionService.getSubmissionById(submissionId, studentId, false);

    assertEquals("***", actual.getTestCaseResults().get(0).getInput());
    assertEquals("***", actual.getTestCaseResults().get(0).getOutput());
    assertEquals("input-visible", actual.getTestCaseResults().get(1).getInput());
    assertEquals("output-visible", actual.getTestCaseResults().get(1).getOutput());
  }

  /**
   * Verify instructor có thể xem submission của student khác và dữ liệu hidden không bị mask.
   */
  @Test
  @Tag("unit")
  @Story("Get submission by id")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-SVC-006")
  @DisplayName("Returns unmasked submission when requester is instructor")
  void getSubmissionById_shouldReturnUnmaskedResult_whenRequesterIsInstructor() {
    UUID submissionId = UUID.randomUUID();
    UUID ownerId = UUID.randomUUID();

    Submission submission = Instancio.create(Submission.class);
    submission.setId(submissionId);
    submission.setStudentId(ownerId);

    TestCaseResultResponse hidden = Instancio.create(TestCaseResultResponse.class);
    hidden.setHidden(true);
    hidden.setInput(SECRET_INPUT);
    hidden.setOutput(SECRET_OUTPUT);

    SubmissionResponse mapped = Instancio.create(SubmissionResponse.class);
    mapped.setTestCaseResults(new ArrayList<>(List.of(hidden)));

    when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
    when(submissionMapper.toResponse(submission)).thenReturn(mapped);

    SubmissionResponse actual = submissionService.getSubmissionById(
        submissionId,
        UUID.randomUUID(),
        true
    );

    assertEquals(SECRET_INPUT, actual.getTestCaseResults().getFirst().getInput());
    assertEquals(SECRET_OUTPUT, actual.getTestCaseResults().getFirst().getOutput());
  }

  /**
   * Verify student đọc submission với testCaseResults null không bị lỗi do null guard.
   */
  @Test
  @Tag("unit")
  @Story("Get submission by id")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-SVC-007")
  @DisplayName("Returns response safely when student submission has null test case results")
  void getSubmissionById_shouldReturnResponse_whenTestCaseResultsIsNull() {
    UUID submissionId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();

    Submission submission = Instancio.create(Submission.class);
    submission.setId(submissionId);
    submission.setStudentId(studentId);

    SubmissionResponse mapped = Instancio.create(SubmissionResponse.class);
    mapped.setId(submissionId);
    mapped.setTestCaseResults(null);

    when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
    when(submissionMapper.toResponse(submission)).thenReturn(mapped);

    SubmissionResponse actual = submissionService.getSubmissionById(submissionId, studentId, false);

    assertEquals(submissionId, actual.getId());
    assertNull(actual.getTestCaseResults());
  }
}

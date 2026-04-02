package apsas.notification.listener;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import apsas.feign.client.AssignmentFeignClient;
import apsas.feign.client.SubmissionFeignClient;
import apsas.feign.client.UserFeignClient;
import apsas.feign.dto.AssignmentResponse;
import apsas.feign.dto.SubmissionResponse;
import apsas.feign.dto.UserResponse;
import apsas.notification.service.NotificationDispatcher;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent;
import apsas.shared.models.submission.TestCaseResultResponse;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Unit test cho SubmissionEventListener.
 *
 * Xác minh workflow đọc dữ liệu liên dịch vụ và fallback business-logic khi thiếu thông tin chấm bài.
 */
@ExtendWith(MockitoExtension.class)
@Tag("unit")
@Epic("Notification Service")
@Feature("Submission Event Listener")
class SubmissionEventListenerTest {

  private static final String SUBMISSION_URL_TEMPLATE = "https://apsas/submissions/%id%";
  private static final String STUDENT_EMAIL = "student@example.com";

  @Mock
  private NotificationDispatcher notificationDispatcher;

  @Mock
  private SubmissionFeignClient submissionFeignClient;

  @Mock
  private AssignmentFeignClient assignmentFeignClient;

  @Mock
  private UserFeignClient userFeignClient;

  @InjectMocks
  private SubmissionEventListener submissionEventListener;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(
        submissionEventListener,
        "submissionUrlTemplate",
        SUBMISSION_URL_TEMPLATE);
  }

  @Test
  @Story("Handle submission evaluated event")
  @TmsLink("NTF-LSN-SUB-001")
  @DisplayName("Dispatches submission evaluated notification when all dependencies exist")
  void handleSubmissionEvaluatedShouldDispatchNotificationWhenDependenciesAreAvailable() {
    UUID submissionId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();
    UUID assignmentId = UUID.randomUUID();

    SubmissionEvaluatedEvent event =
        new SubmissionEvaluatedEvent(
            submissionId,
            SubmissionEvaluatedEvent.Status.EVALUATED,
            SubmissionEvaluatedEvent.Result.PASSED,
            new BigDecimal("80.0"),
            List.of(
                new TestCaseResultResponse(
                    1,
                    "TC1",
                    false,
                    1.0,
                    "in",
                    "out",
                    1000,
                    64,
                    true,
                    "out",
                    null,
                    1.0,
                    8.0),
                new TestCaseResultResponse(
                    2,
                    "TC2",
                    false,
                    1.0,
                    "in2",
                    "out2",
                    1000,
                    64,
                    false,
                    "wrong",
                    null,
                    1.2,
                    9.0)),
            null);

    SubmissionResponse submission = new SubmissionResponse();
    submission.setId(submissionId);
    submission.setStudentId(studentId);
    submission.setAssignmentId(assignmentId);
    submission.setFeedback("");

    UserResponse student = new UserResponse();
    student.setId(studentId);
    student.setEmail(STUDENT_EMAIL);
    student.setFirstName("Nam");

    AssignmentResponse assignment = new AssignmentResponse();
    assignment.setId(assignmentId);
    assignment.setTitle("Assignment 1");

    when(submissionFeignClient.getSubmissionById(submissionId)).thenReturn(submission);
    when(userFeignClient.getUserById(studentId)).thenReturn(student);
    when(assignmentFeignClient.getAssignmentById(assignmentId)).thenReturn(assignment);

    submissionEventListener.handleSubmissionEvaluated(event);

    verify(notificationDispatcher)
        .sendSubmissionEvaluatedNotification(
            studentId,
            STUDENT_EMAIL,
            "Nam",
            "Assignment 1",
            80,
            true,
            1,
            2,
            "N/A",
            "Chúc mừng! Bạn đã hoàn thành bài tập thành công.",
            "https://apsas/submissions/" + submissionId);
  }

  @Test
  @Story("Handle submission evaluated event")
  @TmsLink("NTF-LSN-SUB-002")
  @DisplayName("Returns early when submission data is missing")
  void handleSubmissionEvaluatedShouldReturnEarlyWhenSubmissionIsMissing() {
    UUID submissionId = UUID.randomUUID();
    SubmissionEvaluatedEvent event =
        new SubmissionEvaluatedEvent(
            submissionId,
            SubmissionEvaluatedEvent.Status.EVALUATED,
            SubmissionEvaluatedEvent.Result.PASSED,
            BigDecimal.TEN,
            List.of(),
            null);

    when(submissionFeignClient.getSubmissionById(submissionId)).thenReturn(null);

    submissionEventListener.handleSubmissionEvaluated(event);

    verify(submissionFeignClient).getSubmissionById(submissionId);
    verifyNoInteractions(userFeignClient, assignmentFeignClient, notificationDispatcher);
  }

  @Test
  @Story("Handle submission evaluated event")
  @TmsLink("NTF-LSN-SUB-003")
  @DisplayName("Returns early when student or assignment data is missing")
  void handleSubmissionEvaluatedShouldReturnEarlyWhenStudentOrAssignmentMissing() {
    UUID submissionId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();
    UUID assignmentId = UUID.randomUUID();

    SubmissionEvaluatedEvent event =
        new SubmissionEvaluatedEvent(
            submissionId,
            SubmissionEvaluatedEvent.Status.EVALUATED,
            SubmissionEvaluatedEvent.Result.FAILED,
            new BigDecimal("40.0"),
            List.of(),
            null);

    SubmissionResponse submission = new SubmissionResponse();
    submission.setId(submissionId);
    submission.setStudentId(studentId);
    submission.setAssignmentId(assignmentId);

    when(submissionFeignClient.getSubmissionById(submissionId)).thenReturn(submission);
    when(userFeignClient.getUserById(studentId)).thenReturn(null);

    submissionEventListener.handleSubmissionEvaluated(event);

    verify(submissionFeignClient).getSubmissionById(submissionId);
    verify(userFeignClient).getUserById(studentId);
    verifyNoInteractions(notificationDispatcher);
  }

  @Test
  @Story("Handle submission evaluated event")
  @TmsLink("NTF-LSN-SUB-004")
  @DisplayName("Returns early when assignment data is missing")
  void handleSubmissionEvaluatedShouldReturnEarlyWhenAssignmentIsMissing() {
    UUID submissionId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();
    UUID assignmentId = UUID.randomUUID();

    SubmissionEvaluatedEvent event =
        new SubmissionEvaluatedEvent(
            submissionId,
            SubmissionEvaluatedEvent.Status.EVALUATED,
            SubmissionEvaluatedEvent.Result.FAILED,
            new BigDecimal("40.0"),
            List.of(),
            null);

    SubmissionResponse submission = new SubmissionResponse();
    submission.setId(submissionId);
    submission.setStudentId(studentId);
    submission.setAssignmentId(assignmentId);

    UserResponse student = new UserResponse();
    student.setId(studentId);

    when(submissionFeignClient.getSubmissionById(submissionId)).thenReturn(submission);
    when(userFeignClient.getUserById(studentId)).thenReturn(student);
    when(assignmentFeignClient.getAssignmentById(assignmentId)).thenReturn(null);

    submissionEventListener.handleSubmissionEvaluated(event);

    verify(submissionFeignClient).getSubmissionById(submissionId);
    verify(userFeignClient).getUserById(studentId);
    verify(assignmentFeignClient).getAssignmentById(assignmentId);
    verifyNoInteractions(notificationDispatcher);
  }

  @Test
  @Story("Handle submission evaluated event")
  @TmsLink("NTF-LSN-SUB-005")
  @DisplayName("Uses failed fallback feedback and zero score when score and testcase list are missing")
  void handleSubmissionEvaluatedShouldUseFailedFallbackWhenScoreAndTestcasesAreMissing() {
    UUID submissionId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();
    UUID assignmentId = UUID.randomUUID();

    SubmissionEvaluatedEvent event =
        new SubmissionEvaluatedEvent(
            submissionId,
            SubmissionEvaluatedEvent.Status.EVALUATED,
            SubmissionEvaluatedEvent.Result.FAILED,
            null,
            null,
            null);

    SubmissionResponse submission = new SubmissionResponse();
    submission.setId(submissionId);
    submission.setStudentId(studentId);
    submission.setAssignmentId(assignmentId);
    submission.setFeedback(null);

    UserResponse student = new UserResponse();
    student.setId(studentId);
    student.setEmail(STUDENT_EMAIL);
    student.setFirstName("Nam");

    AssignmentResponse assignment = new AssignmentResponse();
    assignment.setId(assignmentId);
    assignment.setTitle("Assignment 2");

    when(submissionFeignClient.getSubmissionById(submissionId)).thenReturn(submission);
    when(userFeignClient.getUserById(studentId)).thenReturn(student);
    when(assignmentFeignClient.getAssignmentById(assignmentId)).thenReturn(assignment);

    submissionEventListener.handleSubmissionEvaluated(event);

    verify(notificationDispatcher)
        .sendSubmissionEvaluatedNotification(
            studentId,
            STUDENT_EMAIL,
            "Nam",
            "Assignment 2",
            0,
            false,
            0,
            0,
            "N/A",
            "Hãy xem lại kết quả các test case và thử lại.",
            "https://apsas/submissions/" + submissionId);
  }
}

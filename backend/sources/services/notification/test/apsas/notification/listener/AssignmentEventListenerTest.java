package apsas.notification.listener;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import apsas.feign.client.AssignmentFeignClient;
import apsas.feign.client.UserFeignClient;
import apsas.feign.dto.AssignmentResponse;
import apsas.feign.dto.UserResponse;
import apsas.notification.service.NotificationDispatcher;
import apsas.shared.messaging.event.AssignmentPublishedEvent;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.time.LocalDateTime;
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
 * Unit test cho AssignmentEventListener.
 *
 * Tập trung kiểm tra workflow nghiệp vụ: lấy assignment, lọc student active, và dispatch notification.
 */
@ExtendWith(MockitoExtension.class)
@Tag("unit")
@Epic("Notification Service")
@Feature("Assignment Event Listener")
class AssignmentEventListenerTest {
  private static final String ASSIGNMENT_URL_TEMPLATE = "https://apsas/assignments/%id%";
  private static final String ASSIGNMENT_BASE_URL = "https://apsas/assignments/";
  private static final String ASSIGNMENT_TITLE = "Assignment 1";
  private static final String STUDENT_ROLE = "STUDENT";
  private static final String ACTIVE_EMAIL = "active@student.com";
  private static final String ACTIVE_NAME = "Active";

  @Mock
  private NotificationDispatcher notificationDispatcher;

  @Mock
  private AssignmentFeignClient assignmentFeignClient;

  @Mock
  private UserFeignClient userFeignClient;

  @InjectMocks
  private AssignmentEventListener assignmentEventListener;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(
        assignmentEventListener,
        "assignmentUrlTemplate",
        ASSIGNMENT_URL_TEMPLATE);
  }

  @Test
  @Story("Handle assignment published event")
  @TmsLink("NTF-LSN-ASG-001")
  @DisplayName("Sends notification only to active students")
  void handleAssignmentPublishedShouldNotifyOnlyActiveStudents() {
    UUID assignmentId = UUID.randomUUID();
    AssignmentPublishedEvent event =
        new AssignmentPublishedEvent(assignmentId, ASSIGNMENT_TITLE, LocalDateTime.now());

    AssignmentResponse assignment = new AssignmentResponse();
    assignment.setId(assignmentId);
    assignment.setTitle(ASSIGNMENT_TITLE);
    assignment.setDueDate(LocalDateTime.of(2026, 4, 10, 23, 59));

    UserResponse activeStudent = new UserResponse();
    activeStudent.setId(UUID.randomUUID());
    activeStudent.setEmail(ACTIVE_EMAIL);
    activeStudent.setFirstName(ACTIVE_NAME);
    activeStudent.setIsActive(true);

    UserResponse inactiveStudent = new UserResponse();
    inactiveStudent.setId(UUID.randomUUID());
    inactiveStudent.setEmail("inactive@student.com");
    inactiveStudent.setFirstName("Inactive");
    inactiveStudent.setIsActive(false);

    when(assignmentFeignClient.getAssignmentById(assignmentId)).thenReturn(assignment);
    when(userFeignClient.getUsersByRole(STUDENT_ROLE))
        .thenReturn(List.of(activeStudent, inactiveStudent));

    assignmentEventListener.handleAssignmentPublished(event);

    verify(notificationDispatcher)
        .sendAssignmentPublishedNotification(
            activeStudent.getId(),
            ACTIVE_EMAIL,
            ACTIVE_NAME,
            ASSIGNMENT_TITLE,
            "2026-04-10T23:59",
            ASSIGNMENT_BASE_URL + assignmentId);
    verify(notificationDispatcher, never())
        .sendAssignmentPublishedNotification(
            inactiveStudent.getId(),
            "inactive@student.com",
            "Inactive",
            ASSIGNMENT_TITLE,
            "2026-04-10T23:59",
            ASSIGNMENT_BASE_URL + assignmentId);
  }

  @Test
  @Story("Handle assignment published event")
  @TmsLink("NTF-LSN-ASG-002")
  @DisplayName("Returns early when assignment detail is missing")
  void handleAssignmentPublishedShouldReturnEarlyWhenAssignmentMissing() {
    UUID assignmentId = UUID.randomUUID();
    AssignmentPublishedEvent event =
        new AssignmentPublishedEvent(assignmentId, ASSIGNMENT_TITLE, LocalDateTime.now());

    when(assignmentFeignClient.getAssignmentById(assignmentId)).thenReturn(null);

    assignmentEventListener.handleAssignmentPublished(event);

    verify(assignmentFeignClient).getAssignmentById(assignmentId);
    verify(userFeignClient, never()).getUsersByRole(STUDENT_ROLE);
    verifyNoInteractions(notificationDispatcher);
  }

  @Test
  @Story("Handle assignment published event")
  @TmsLink("NTF-LSN-ASG-003")
  @DisplayName("Returns early when student list is empty")
  void handleAssignmentPublishedShouldReturnEarlyWhenStudentListEmpty() {
    UUID assignmentId = UUID.randomUUID();
    AssignmentPublishedEvent event =
        new AssignmentPublishedEvent(assignmentId, ASSIGNMENT_TITLE, LocalDateTime.now());

    AssignmentResponse assignment = new AssignmentResponse();
    assignment.setId(assignmentId);
    assignment.setTitle(ASSIGNMENT_TITLE);

    when(assignmentFeignClient.getAssignmentById(assignmentId)).thenReturn(assignment);
    when(userFeignClient.getUsersByRole(STUDENT_ROLE)).thenReturn(List.of());

    assignmentEventListener.handleAssignmentPublished(event);

    verifyNoInteractions(notificationDispatcher);
  }

  @Test
  @Story("Handle assignment published event")
  @TmsLink("NTF-LSN-ASG-004")
  @DisplayName("Uses no-deadline fallback text when assignment due date is null")
  void handleAssignmentPublishedShouldUseNoDeadlineFallbackWhenDueDateIsNull() {
    UUID assignmentId = UUID.randomUUID();
    AssignmentPublishedEvent event =
        new AssignmentPublishedEvent(assignmentId, ASSIGNMENT_TITLE, LocalDateTime.now());

    AssignmentResponse assignment = new AssignmentResponse();
    assignment.setId(assignmentId);
    assignment.setTitle(ASSIGNMENT_TITLE);
    assignment.setDueDate(null);

    UserResponse activeStudent = new UserResponse();
    activeStudent.setId(UUID.randomUUID());
    activeStudent.setEmail(ACTIVE_EMAIL);
    activeStudent.setFirstName(ACTIVE_NAME);
    activeStudent.setIsActive(true);

    when(assignmentFeignClient.getAssignmentById(assignmentId)).thenReturn(assignment);
    when(userFeignClient.getUsersByRole(STUDENT_ROLE)).thenReturn(List.of(activeStudent));

    assignmentEventListener.handleAssignmentPublished(event);

    verify(notificationDispatcher)
        .sendAssignmentPublishedNotification(
            activeStudent.getId(),
            ACTIVE_EMAIL,
            ACTIVE_NAME,
            ASSIGNMENT_TITLE,
            "No deadline",
            ASSIGNMENT_BASE_URL + assignmentId);
  }

  @Test
  @Story("Handle assignment published event")
  @TmsLink("NTF-LSN-ASG-005")
  @DisplayName("Swallows exception when upstream dependency throws")
  void handleAssignmentPublishedShouldNotThrowWhenDependencyFails() {
    AssignmentPublishedEvent event =
        new AssignmentPublishedEvent(UUID.randomUUID(), ASSIGNMENT_TITLE, LocalDateTime.now());

    when(assignmentFeignClient.getAssignmentById(event.getAssignmentId()))
        .thenThrow(new RuntimeException("upstream-failed"));

    assertDoesNotThrow(() -> assignmentEventListener.handleAssignmentPublished(event));
    verifyNoInteractions(notificationDispatcher);
  }
}

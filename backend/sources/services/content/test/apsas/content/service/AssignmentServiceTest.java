package apsas.content.service;

import apsas.content.mapper.AssignmentMapper;
import apsas.content.model.dto.AssignmentResponse;
import apsas.content.model.dto.CreateAssignmentRequest;
import apsas.content.model.dto.UpdateAssignmentRequest;
import apsas.content.model.dto.UpdateAssignmentScheduleRequest;
import apsas.content.model.entity.Assignment;
import apsas.content.model.entity.AssignmentStatus;
import apsas.content.model.entity.DifficultyLevel;
import apsas.content.model.entity.Skill;
import apsas.content.model.entity.TestCase;
import apsas.content.model.entity.Tutorial;
import apsas.content.repository.AssignmentRepository;
import apsas.content.repository.SkillRepository;
import apsas.content.repository.TutorialRepository;
import apsas.shared.exception.BadRequestException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.exception.UnauthorizedException;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.AssignmentPublishedEvent;
import apsas.shared.messaging.event.AssignmentScheduleUpdatedEvent;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.models.pagination.PageResponse;
import apsas.shared.security.UserPrincipal;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AssignmentService")
@Epic("Content Service")
@Feature("Assignment Management")
@Issue("19")
class AssignmentServiceTest {

  private static final BigDecimal DEFAULT_MAX_SCORE = new BigDecimal("100.00");
  private static final int DAYS_UNTIL_DUE = 7;
  private static final int DEFAULT_PAGE_SIZE = 10;
  private static final int DEFAULT_PAGE_NUMBER = 0;
  private static final String INVALID_DATE_MESSAGE = "Due date must be after start date";
  private static final String NOT_DRAFT_MESSAGE = "Only draft assignments can be published";
  private static final String ALREADY_ARCHIVED_MESSAGE = "already archived";

  @Mock
  private AssignmentRepository assignmentRepository;

  @Mock
  private SkillRepository skillRepository;

  @Mock
  private TutorialRepository tutorialRepository;

  @Mock
  private AssignmentMapper assignmentMapper;

  @Mock
  private EventPublisher eventPublisher;

  @InjectMocks
  private AssignmentService assignmentService;

  private UUID assignmentId;
  private UUID creatorId;
  private UUID skillId;
  private UUID tutorialId;
  private Assignment assignment;
  private AssignmentResponse assignmentResponse;
  private CreateAssignmentRequest createRequest;
  private UpdateAssignmentRequest updateRequest;

  @BeforeEach
  void setUp() {
    assignmentId = UUID.randomUUID();
    creatorId = UUID.randomUUID();
    skillId = UUID.randomUUID();
    tutorialId = UUID.randomUUID();

    LocalDateTime now = LocalDateTime.now();
    LocalDateTime future = now.plusDays(DAYS_UNTIL_DUE);

    assignment = new Assignment();
    assignment.setId(assignmentId);
    assignment.setTitle("Java Assignment");
    assignment.setDescription("A Java assignment");
    assignment.setDifficultyLevel(DifficultyLevel.MEDIUM);
    assignment.setCreatorId(creatorId);
    assignment.setStartDate(now);
    assignment.setDueDate(future);
    assignment.setMaxScore(DEFAULT_MAX_SCORE);
    assignment.setStatus(AssignmentStatus.DRAFT);
    assignment.setLanguages(new String[]{"Java", "Python"});
    assignment.setTestCases(new java.util.ArrayList<>());
    assignment.setSkills(new HashSet<>());
    assignment.setTutorials(new HashSet<>());

    assignmentResponse = new AssignmentResponse();
    assignmentResponse.setId(assignmentId);
    assignmentResponse.setTitle("Java Assignment");
    assignmentResponse.setTestCases(new java.util.ArrayList<>());

    createRequest = new CreateAssignmentRequest();
    createRequest.setTitle("Java Assignment");
    createRequest.setDescription("A Java assignment");
    createRequest.setDifficultyLevel(DifficultyLevel.MEDIUM);
    createRequest.setStartDate(now);
    createRequest.setDueDate(future);
    createRequest.setMaxScore(DEFAULT_MAX_SCORE);
    createRequest.setLanguages(new String[]{"Java"});
    createRequest.setTestCases(new java.util.ArrayList<>());

    updateRequest = new UpdateAssignmentRequest();
    updateRequest.setTitle("Updated Java Assignment");
    updateRequest.setDescription("Updated description");
  }

  @Nested
  @DisplayName("getAllAssignments")
  @Story("Retrieve assignments with role-based filtering")
  class GetAllAssignmentsTests {

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-001")
    @DisplayName("shouldReturnPublishedAssignments_whenNoPrincipalProvided")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Public users should see only published assignments")
    void shouldReturnPublishedAssignments_whenNoPrincipalProvided() {
      // Arrange
      Pageable pageable = PageRequest.of(DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
      Page<Assignment> assignmentPage = new PageImpl<>(List.of(assignment), pageable, 1);

      when(assignmentRepository.findByStatus(AssignmentStatus.PUBLISHED, pageable))
          .thenReturn(assignmentPage);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      PageResponse<AssignmentResponse> result = assignmentService.getAllAssignments(pageable, null);

      // Assert
      assertThat(result.content()).hasSize(1);
      verify(assignmentRepository).findByStatus(AssignmentStatus.PUBLISHED, pageable);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-002")
    @DisplayName("shouldReturnContentProviderAssignments_whenPrincipalIsContentProvider")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Content providers see only their own assignments")
    void shouldReturnContentProviderAssignments_whenPrincipalIsContentProvider() {
      // Arrange
      Pageable pageable = PageRequest.of(DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
      UserPrincipal principal = new UserPrincipal(
          creatorId, "email@test.com", "First", "Last", "CONTENT_PROVIDER", true
      );

      Page<Assignment> assignmentPage = new PageImpl<>(List.of(assignment), pageable, 1);

      when(assignmentRepository.findByCreatorId(creatorId, pageable))
          .thenReturn(assignmentPage);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      PageResponse<AssignmentResponse> result = assignmentService.getAllAssignments(pageable, principal);

      // Assert
      assertThat(result.content()).hasSize(1);
      verify(assignmentRepository).findByCreatorId(creatorId, pageable);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-003")
    @DisplayName("shouldMaskHiddenTestCases_whenUserIsStudent")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Student users cannot see hidden test case values")
    void shouldMaskHiddenTestCases_whenUserIsStudent() {
      // Arrange
      Pageable pageable = PageRequest.of(DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
      UserPrincipal studentPrincipal = new UserPrincipal(
          UUID.randomUUID(), "student@test.com", "First", "Last", "STUDENT", true
      );

      Page<Assignment> assignmentPage = new PageImpl<>(List.of(assignment), pageable, 1);

      TestCase hiddenTestCase = new TestCase();
      hiddenTestCase.setHidden(true);
      hiddenTestCase.setInput("secret_input");
      hiddenTestCase.setOutput("secret_output");

      assignmentResponse.setTestCases(List.of(hiddenTestCase));

      when(assignmentRepository.findByStatus(AssignmentStatus.PUBLISHED, pageable))
          .thenReturn(assignmentPage);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      PageResponse<AssignmentResponse> result = assignmentService.getAllAssignments(pageable, studentPrincipal);

      // Assert
      assertThat(result.content().getFirst().getTestCases().getFirst().getInput()).isEqualTo("***");
      assertThat(result.content().getFirst().getTestCases().getFirst().getOutput()).isEqualTo("***");
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-004")
    @DisplayName("shouldNotMaskHiddenTestCases_whenUserIsInstructor")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Instructor users see all test case values including hidden")
    void shouldNotMaskHiddenTestCases_whenUserIsInstructor() {
      // Arrange
      Pageable pageable = PageRequest.of(DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
      UserPrincipal instructorPrincipal = new UserPrincipal(
          UUID.randomUUID(), "instructor@test.com", "First", "Last", "INSTRUCTOR", true
      );

      Page<Assignment> assignmentPage = new PageImpl<>(List.of(assignment), pageable, 1);

      TestCase hiddenTestCase = new TestCase();
      hiddenTestCase.setHidden(true);
      hiddenTestCase.setInput("secret_input");
      hiddenTestCase.setOutput("secret_output");

      assignmentResponse.setTestCases(List.of(hiddenTestCase));

      when(assignmentRepository.findByStatus(AssignmentStatus.PUBLISHED, pageable))
          .thenReturn(assignmentPage);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      PageResponse<AssignmentResponse> result = assignmentService.getAllAssignments(pageable, instructorPrincipal);

      // Assert
      assertThat(result.content().getFirst().getTestCases().getFirst().getInput())
          .isNotEqualTo("***");
    }
  }

  @Nested
  @DisplayName("getAssignmentById")
  @Story("Retrieve single assignment with authorization checks")
  class GetAssignmentByIdTests {

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-001")
    @DisplayName("shouldReturnAssignment_whenAssignmentExists")
    @Severity(SeverityLevel.NORMAL)
    @Description("Retrieve an existing assignment by ID")
    void shouldReturnAssignment_whenAssignmentExists() {
      // Arrange
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      AssignmentResponse result = assignmentService.getAssignmentById(assignmentId);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(assignmentId);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-005")
    @DisplayName("shouldThrowNotFoundException_whenAssignmentDoesNotExist")
    void shouldThrowNotFoundException_whenAssignmentDoesNotExist() {
      // Arrange
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.getAssignmentById(assignmentId))
          .isInstanceOf(NotFoundException.class);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-002")
    @DisplayName("shouldAllowContentProviderToViewOwnAssignments")
    void shouldAllowContentProviderToViewOwnAssignments_whenCreatorMatches() {
      // Arrange
      UserPrincipal principal = new UserPrincipal(
          creatorId, "email@test.com", "First", "Last", "CONTENT_PROVIDER", true
      );

      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      AssignmentResponse result = assignmentService.getAssignmentById(assignmentId, principal);

      // Assert
      assertThat(result).isNotNull();
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-006")
    @DisplayName("shouldThrowUnauthorizedException_whenContentProviderViewsOtherAssignment")
    void shouldThrowUnauthorizedException_whenContentProviderViewsOtherAssignment() {
      // Arrange
      UUID otherCreatorId = UUID.randomUUID();
      UserPrincipal principal = new UserPrincipal(
          otherCreatorId, "email@test.com", "First", "Last", "CONTENT_PROVIDER", true
      );

      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.getAssignmentById(assignmentId, principal))
          .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-003")
    @DisplayName("shouldAllowStudentToViewPublishedAssignments")
    void shouldAllowStudentToViewPublishedAssignments_whenStatusIsPublished() {
      // Arrange
      UserPrincipal studentPrincipal = new UserPrincipal(
          UUID.randomUUID(), "student@test.com", "First", "Last", "STUDENT", true
      );

      Assignment publishedAssignment = new Assignment();
      publishedAssignment.setStatus(AssignmentStatus.PUBLISHED);
      publishedAssignment.setId(assignmentId);

      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(publishedAssignment));
      when(assignmentMapper.toResponse(publishedAssignment)).thenReturn(assignmentResponse);

      // Act
      AssignmentResponse result = assignmentService.getAssignmentById(assignmentId, studentPrincipal);

      // Assert
      assertThat(result).isNotNull();
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-005")
    @DisplayName("shouldThrowNotFoundException_whenStudentViewsDraftAssignment")
    void shouldThrowNotFoundException_whenStudentViewsDraftAssignment() {
      // Arrange
      UserPrincipal studentPrincipal = new UserPrincipal(
          UUID.randomUUID(), "student@test.com", "First", "Last", "STUDENT", true
      );

      assignment.setStatus(AssignmentStatus.DRAFT);

      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.getAssignmentById(assignmentId, studentPrincipal))
          .isInstanceOf(NotFoundException.class);
    }
  }

  @Nested
  @DisplayName("createAssignment")
  class CreateAssignmentTests {

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-007")
    @DisplayName("shouldCreateAssignment_whenRequestIsValid")
    void shouldCreateAssignment_whenRequestIsValid() {
      // Arrange
      Skill skill = new Skill();
      skill.setId(skillId);

      createRequest.setSkillIds(Set.of(skillId));

      when(assignmentMapper.toEntity(createRequest, creatorId)).thenReturn(assignment);
      when(skillRepository.findAllById(Set.of(skillId))).thenReturn(List.of(skill));
      when(assignmentRepository.save(assignment)).thenReturn(assignment);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      AssignmentResponse result = assignmentService.createAssignment(createRequest, creatorId);

      // Assert
      assertThat(result).isNotNull();
      verify(assignmentRepository, times(1)).save(assignment);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-008")
    @DisplayName("shouldThrowBadRequestException_whenDueDateBeforeStartDate")
    void shouldThrowBadRequestException_whenDueDateBeforeStartDate() {
      // Arrange
      LocalDateTime now = LocalDateTime.now();
      createRequest.setStartDate(now.plusDays(DAYS_UNTIL_DUE));
      createRequest.setDueDate(now);

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.createAssignment(createRequest, creatorId))
          .isInstanceOf(BadRequestException.class)
          .hasMessageContaining(INVALID_DATE_MESSAGE);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-008")
    @DisplayName("shouldThrowBadRequestException_whenSkillIdsAreInvalid")
    void shouldThrowBadRequestException_whenSkillIdsAreInvalid() {
      // Arrange
      createRequest.setSkillIds(Set.of(skillId));

      when(assignmentMapper.toEntity(createRequest, creatorId)).thenReturn(assignment);
      when(skillRepository.findAllById(Set.of(skillId))).thenReturn(List.of());

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.createAssignment(createRequest, creatorId))
          .isInstanceOf(BadRequestException.class)
          .hasMessageContaining("skill IDs are invalid");
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-008")
    @DisplayName("shouldThrowBadRequestException_whenTutorialIdsAreInvalid")
    void shouldThrowBadRequestException_whenTutorialIdsAreInvalid() {
      // Arrange
      createRequest.setTutorialIds(Set.of(tutorialId));

      when(assignmentMapper.toEntity(createRequest, creatorId)).thenReturn(assignment);
      when(tutorialRepository.findAllById(Set.of(tutorialId))).thenReturn(List.of());

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.createAssignment(createRequest, creatorId))
          .isInstanceOf(BadRequestException.class)
          .hasMessageContaining("tutorial IDs are invalid");
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-007")
    @DisplayName("shouldSetSkillsAndTutorials_whenBothProvided")
    void shouldSetSkillsAndTutorials_whenBothProvided() {
      // Arrange
      Skill skill = new Skill();
      skill.setId(skillId);
      Tutorial tutorial = new Tutorial();
      tutorial.setId(tutorialId);

      createRequest.setSkillIds(Set.of(skillId));
      createRequest.setTutorialIds(Set.of(tutorialId));

      when(assignmentMapper.toEntity(createRequest, creatorId)).thenReturn(assignment);
      when(skillRepository.findAllById(Set.of(skillId))).thenReturn(List.of(skill));
      when(tutorialRepository.findAllById(Set.of(tutorialId))).thenReturn(List.of(tutorial));
      when(assignmentRepository.save(assignment)).thenReturn(assignment);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      assignmentService.createAssignment(createRequest, creatorId);

      // Assert
      ArgumentCaptor<Assignment> captor = ArgumentCaptor.forClass(Assignment.class);
      verify(assignmentRepository).save(captor.capture());
      assertThat(captor.getValue().getSkills()).hasSize(1);
      assertThat(captor.getValue().getTutorials()).hasSize(1);
    }
  }

  @Nested
  @DisplayName("updateAssignment")
  class UpdateAssignmentTests {

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-009")
    @DisplayName("shouldUpdateAssignment_whenUserIsCreator")
    void shouldUpdateAssignment_whenUserIsCreator() {
      // Arrange
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
      doNothing().when(assignmentMapper).updateEntity(assignment, updateRequest);
      when(assignmentRepository.save(assignment)).thenReturn(assignment);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      AssignmentResponse result = assignmentService.updateAssignment(assignmentId, updateRequest, creatorId);

      // Assert
      assertThat(result).isNotNull();
      verify(assignmentRepository, times(1)).save(assignment);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-010")
    @DisplayName("shouldThrowUnauthorizedException_whenUserIsNotCreator")
    void shouldThrowUnauthorizedException_whenUserIsNotCreator() {
      // Arrange
      UUID differentUserId = UUID.randomUUID();
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.updateAssignment(assignmentId, updateRequest, differentUserId))
          .isInstanceOf(UnauthorizedException.class);

      verify(assignmentRepository, never()).save(any());
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-005")
    @DisplayName("shouldThrowNotFoundException_whenAssignmentDoesNotExist")
    void shouldThrowNotFoundException_whenAssignmentDoesNotExist() {
      // Arrange
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.updateAssignment(assignmentId, updateRequest, creatorId))
          .isInstanceOf(NotFoundException.class);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-009")
    @DisplayName("shouldValidateDates_whenDateUpdated")
    void shouldValidateDates_whenDateUpdated() {
      // Arrange
      UpdateAssignmentRequest invalidDateRequest = new UpdateAssignmentRequest();
      invalidDateRequest.setStartDate(LocalDateTime.now().plusDays(7));
      invalidDateRequest.setDueDate(LocalDateTime.now());

      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.updateAssignment(assignmentId, invalidDateRequest, creatorId))
          .isInstanceOf(BadRequestException.class);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-009")
    @DisplayName("shouldUpdateSkillsIfProvided")
    void shouldUpdateSkills_whenSkillIdsProvided() {
      // Arrange
      Skill newSkill = new Skill();
      newSkill.setId(UUID.randomUUID());

      updateRequest.setSkillIds(Set.of(newSkill.getId()));

      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
      doNothing().when(assignmentMapper).updateEntity(assignment, updateRequest);
      when(skillRepository.findAllById(Set.of(newSkill.getId()))).thenReturn(List.of(newSkill));
      when(assignmentRepository.save(assignment)).thenReturn(assignment);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      assignmentService.updateAssignment(assignmentId, updateRequest, creatorId);

      // Assert
      verify(skillRepository, times(1)).findAllById(any());
    }
  }

  @Nested
  @DisplayName("updateAssignmentSchedule")
  class UpdateAssignmentScheduleTests {

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-017")
    @DisplayName("shouldUpdateSchedule_whenDatesAreValid")
    void shouldUpdateSchedule_whenDatesAreValid() {
      // Arrange
      LocalDateTime newStart = LocalDateTime.now().plusDays(1);
      LocalDateTime newDue = LocalDateTime.now().plusDays(DAYS_UNTIL_DUE);

      UpdateAssignmentScheduleRequest request = new UpdateAssignmentScheduleRequest();
      request.setStartDate(newStart);
      request.setDueDate(newDue);

      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
      when(assignmentRepository.save(assignment)).thenReturn(assignment);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      AssignmentResponse result = assignmentService.updateAssignmentSchedule(assignmentId, request);

      // Assert
      assertThat(result).isNotNull();
      verify(eventPublisher, times(1)).publish(
          eq(RabbitMqConfig.ASSIGNMENT_SCHEDULE_UPDATED_ROUTING_KEY),
          any(AssignmentScheduleUpdatedEvent.class)
      );
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-017")
    @DisplayName("shouldPublishEvent_afterScheduleUpdate")
    void shouldPublishEvent_whenScheduleUpdated() {
      // Arrange
      LocalDateTime newStart = LocalDateTime.now().plusDays(1);
      LocalDateTime newDue = LocalDateTime.now().plusDays(DAYS_UNTIL_DUE);

      UpdateAssignmentScheduleRequest request = new UpdateAssignmentScheduleRequest();
      request.setStartDate(newStart);
      request.setDueDate(newDue);

      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
      when(assignmentRepository.save(assignment)).thenReturn(assignment);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      assignmentService.updateAssignmentSchedule(assignmentId, request);

      // Assert
      ArgumentCaptor<AssignmentScheduleUpdatedEvent> eventCaptor = 
          ArgumentCaptor.forClass(AssignmentScheduleUpdatedEvent.class);
      verify(eventPublisher).publish(
          eq(RabbitMqConfig.ASSIGNMENT_SCHEDULE_UPDATED_ROUTING_KEY),
          eventCaptor.capture()
      );
      assertThat(eventCaptor.getValue().getAssignmentId()).isEqualTo(assignmentId);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-008")
    @DisplayName("shouldThrowBadRequestException_whenDueDateBeforeStartDate")
    void shouldThrowBadRequestException_whenDueDateBeforeStartDate() {
      // Arrange
      LocalDateTime now = LocalDateTime.now();
      UpdateAssignmentScheduleRequest request = new UpdateAssignmentScheduleRequest();
      request.setStartDate(now.plusDays(DAYS_UNTIL_DUE));
      request.setDueDate(now);

      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.updateAssignmentSchedule(assignmentId, request))
          .isInstanceOf(BadRequestException.class);

      verify(eventPublisher, never()).publish(any(), any());
    }
  }

  @Nested
  @DisplayName("deleteAssignment")
  class DeleteAssignmentTests {

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-011")
    @DisplayName("shouldDeleteAssignment_whenUserIsCreator")
    void shouldDeleteAssignment_whenUserIsCreator() {
      // Arrange
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act
      assignmentService.deleteAssignment(assignmentId, creatorId);

      // Assert
      verify(assignmentRepository, times(1)).deleteById(assignmentId);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-012")
    @DisplayName("shouldThrowUnauthorizedException_whenUserIsNotCreator")
    void shouldThrowUnauthorizedException_whenUserIsNotCreator() {
      // Arrange
      UUID differentUserId = UUID.randomUUID();
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.deleteAssignment(assignmentId, differentUserId))
          .isInstanceOf(UnauthorizedException.class);

      verify(assignmentRepository, never()).deleteById(any());
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-005")
    @DisplayName("shouldThrowNotFoundException_whenAssignmentDoesNotExist")
    void shouldThrowNotFoundException_whenAssignmentDoesNotExist() {
      // Arrange
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.deleteAssignment(assignmentId, creatorId))
          .isInstanceOf(NotFoundException.class);

      verify(assignmentRepository, never()).deleteById(any());
    }
  }

  @Nested
  @DisplayName("publishAssignment")
  class PublishAssignmentTests {

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-013")
    @DisplayName("shouldPublishAssignment_whenStatusIsDraft")
    void shouldPublishAssignment_whenStatusIsDraft() {
      // Arrange
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
      when(assignmentRepository.save(assignment)).thenReturn(assignment);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      AssignmentResponse result = assignmentService.publishAssignment(assignmentId, creatorId);

      // Assert
      assertThat(result).isNotNull();
      verify(eventPublisher, times(1)).publish(
          eq(RabbitMqConfig.ASSIGNMENT_PUBLISHED_ROUTING_KEY),
          any(AssignmentPublishedEvent.class)
      );
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-014")
    @DisplayName("shouldThrowBadRequestException_whenAssignmentIsNotDraft")
    void shouldThrowBadRequestException_whenAssignmentIsNotDraft() {
      // Arrange
      assignment.setStatus(AssignmentStatus.PUBLISHED);
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.publishAssignment(assignmentId, creatorId))
          .isInstanceOf(BadRequestException.class)
          .hasMessageContaining(NOT_DRAFT_MESSAGE);

      verify(eventPublisher, never()).publish(any(), any());
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-010")
    @DisplayName("shouldThrowUnauthorizedException_whenUserIsNotCreator")
    void shouldThrowUnauthorizedException_whenUserIsNotCreator() {
      // Arrange
      UUID differentUserId = UUID.randomUUID();
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.publishAssignment(assignmentId, differentUserId))
          .isInstanceOf(UnauthorizedException.class);

      verify(eventPublisher, never()).publish(any(), any());
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-013")
    @DisplayName("shouldPublishEvent_withCorrectData")
    void shouldPublishEvent_whenDataIsCorrect() {
      // Arrange
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
      when(assignmentRepository.save(assignment)).thenReturn(assignment);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      assignmentService.publishAssignment(assignmentId, creatorId);

      // Assert
      ArgumentCaptor<AssignmentPublishedEvent> eventCaptor = 
          ArgumentCaptor.forClass(AssignmentPublishedEvent.class);
      verify(eventPublisher).publish(
          eq(RabbitMqConfig.ASSIGNMENT_PUBLISHED_ROUTING_KEY),
          eventCaptor.capture()
      );
      assertThat(eventCaptor.getValue().getAssignmentId()).isEqualTo(assignmentId);
      assertThat(eventCaptor.getValue().getTitle()).isEqualTo(assignment.getTitle());
    }
  }

  @Nested
  @DisplayName("archiveAssignment")
  class ArchiveAssignmentTests {

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-015")
    @DisplayName("shouldArchiveAssignment_whenStatusIsNotArchived")
    void shouldArchiveAssignment_whenStatusIsNotArchived() {
      // Arrange
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
      when(assignmentRepository.save(assignment)).thenReturn(assignment);
      when(assignmentMapper.toResponse(assignment)).thenReturn(assignmentResponse);

      // Act
      AssignmentResponse result = assignmentService.archiveAssignment(assignmentId, creatorId);

      // Assert
      assertThat(result).isNotNull();
      ArgumentCaptor<Assignment> captor = ArgumentCaptor.forClass(Assignment.class);
      verify(assignmentRepository).save(captor.capture());
      assertThat(captor.getValue().getStatus()).isEqualTo(AssignmentStatus.ARCHIVED);
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-016")
    @DisplayName("shouldThrowBadRequestException_whenAlreadyArchived")
    void shouldThrowBadRequestException_whenAlreadyArchived() {
      // Arrange
      assignment.setStatus(AssignmentStatus.ARCHIVED);
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.archiveAssignment(assignmentId, creatorId))
          .isInstanceOf(BadRequestException.class)
          .hasMessageContaining(ALREADY_ARCHIVED_MESSAGE);

      verify(assignmentRepository, never()).save(any());
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-012")
    @DisplayName("shouldThrowUnauthorizedException_whenUserIsNotCreator")
    void shouldThrowUnauthorizedException_whenUserIsNotCreator() {
      // Arrange
      UUID differentUserId = UUID.randomUUID();
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.archiveAssignment(assignmentId, differentUserId))
          .isInstanceOf(UnauthorizedException.class);

      verify(assignmentRepository, never()).save(any());
    }

    @Test
    @Tag("unit")
    @TmsLink("CNT-SVC-005")
    @DisplayName("shouldThrowNotFoundException_whenAssignmentDoesNotExist")
    void shouldThrowNotFoundException_whenAssignmentDoesNotExist() {
      // Arrange
      when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> assignmentService.archiveAssignment(assignmentId, creatorId))
          .isInstanceOf(NotFoundException.class);
    }
  }
}


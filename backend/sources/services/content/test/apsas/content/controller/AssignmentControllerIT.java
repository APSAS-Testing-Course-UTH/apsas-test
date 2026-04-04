package apsas.content.controller;

import apsas.content.model.entity.AssignmentStatus;
import apsas.content.model.entity.DifficultyLevel;
import apsas.shared.security.UserPrincipals;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.qameta.allure.Feature;
import io.qameta.allure.Description;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tag("integration")
@Feature("Assignment Management API")
@Story("Boundary value integration tests for AssignmentController")
@DisplayName("AssignmentControllerIT")
class AssignmentControllerIT extends BaseContentControllerIT {

  @Autowired
  private MockMvc mockMvc;

  @BeforeEach
  void cleanDatabase() {
    assignmentRepository.deleteAll();
    tutorialRepository.deleteAll();
    skillRepository.deleteAll();
  }

  @Nested
  class ValidCases {

    @Test
    @TmsLink("CONT-ASS-001")
    @DisplayName("Create assignment succeeds when maxScore equals min boundary (0.0)")
    @Description("BVA: create assignment with maxScore at minimum boundary value 0.0, valid payload, and content provider role; expect HTTP 201 and persisted maxScore equals 0.0.")
    @Story("Create assignment")
    void should_createAssignment_when_maxScoreAtMinBoundary() throws Exception {
      String payload = createAssignmentPayload("Boundary assignment", "0.0", "java", true).toString();

      mockMvc.perform(post("/api/v1/assignments")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isCreated())
          .andExpect(jsonPath("$.maxScore").value(0.0));
    }

    @Test
    @TmsLink("CONT-ASS-002")
    @DisplayName("Create assignment succeeds when maxScore equals max boundary (999.99)")
    @Description("BVA: create assignment with maxScore at maximum allowed boundary 999.99 using valid inputs; expect HTTP 201 and response maxScore equals 999.99.")
    @Story("Create assignment")
    void should_createAssignment_when_maxScoreAtMaxBoundary() throws Exception {
      String payload = createAssignmentPayload("Boundary assignment", "999.99", "java", true).toString();

      mockMvc.perform(post("/api/v1/assignments")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isCreated())
          .andExpect(jsonPath("$.maxScore").value(999.99));
    }

    @Test
    @TmsLink("CONT-ASS-003")
    @DisplayName("Update schedule succeeds when dates are valid")
    @Description("Equivalence test: update schedule with dueDate after startDate on existing assignment using instructor role; expect HTTP 200 and both schedule fields present.")
    @Story("Update assignment schedule")
    void should_updateAssignmentSchedule_when_datesValid() throws Exception {
      UUID creatorId = UUID.randomUUID();
      var assignment = createAssignment(creatorId, AssignmentStatus.DRAFT, false);

      ObjectNode payload = objectMapper.createObjectNode()
          .put("startDate", LocalDateTime.now().plusDays(3).toString())
          .put("dueDate", LocalDateTime.now().plusDays(4).toString());

      mockMvc.perform(patch("/api/v1/assignments/{id}/schedule", assignment.getId())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("INSTRUCTOR", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload.toString()))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.startDate").exists())
          .andExpect(jsonPath("$.dueDate").exists());
    }

    @Test
    @TmsLink("CONT-ASS-004")
    @DisplayName("Student sees hidden test case values masked")
    @Description("Edge case: student reads published assignment containing hidden test cases; expect HTTP 200 and hidden input/output values masked as ***.")
    @Story("Get assignment by id")
    void should_maskHiddenTestCases_when_studentGetsAssignmentById() throws Exception {
      UUID creatorId = UUID.randomUUID();
      var assignment = createAssignment(creatorId, AssignmentStatus.PUBLISHED, true);

      mockMvc.perform(get("/api/v1/assignments/{id}", assignment.getId())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("STUDENT", UUID.randomUUID())))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.testCases[1].input").value("***"))
          .andExpect(jsonPath("$.testCases[1].output").value("***"));
    }
  }

  @Nested
  class InvalidCases {

    @Test
    @TmsLink("CONT-ASS-005")
    @DisplayName("Create assignment fails when maxScore is below min boundary (-0.01)")
    @Description("BVA negative case: maxScore below minimum boundary at -0.01 while other fields are valid; expect HTTP 400 with maxScore validation message.")
    @Story("Create assignment")
    void should_returnBadRequest_when_maxScoreBelowMinBoundary() throws Exception {
      String payload = createAssignmentPayload("Boundary assignment", "-0.01", "java", true).toString();

      mockMvc.perform(post("/api/v1/assignments")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors.maxScore").value("Max score must be positive"));
    }

    @Test
    @TmsLink("CONT-ASS-006")
    @DisplayName("Create assignment fails when maxScore is above max boundary (1000.00)")
    @Description("BVA negative case: maxScore above maximum boundary at 1000.00 with otherwise valid payload; expect HTTP 400 and maxScore upper-bound error.")
    @Story("Create assignment")
    void should_returnBadRequest_when_maxScoreAboveMaxBoundary() throws Exception {
      String payload = createAssignmentPayload("Boundary assignment", "1000.00", "java", true).toString();

      mockMvc.perform(post("/api/v1/assignments")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors.maxScore").value("Max score must not exceed 999.99"));
    }

    @Test
    @TmsLink("CONT-ASS-007")
    @DisplayName("Create assignment fails when title length exceeds max boundary (256)")
    @Description("BVA negative case: title length is 256 characters (max+1) with valid remaining fields; expect HTTP 400 and title length validation error.")
    @Story("Create assignment")
    void should_returnBadRequest_when_titleAboveMaxBoundary() throws Exception {
      String payload = createAssignmentPayload("z".repeat(256), "100.00", "java", true).toString();

      mockMvc.perform(post("/api/v1/assignments")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors.title").value("Title must not exceed 255 characters"));
    }

    @Test
    @TmsLink("CONT-ASS-008")
    @DisplayName("Create assignment fails when languages list is empty")
    @Description("BVA negative case: languages collection violates minimum size by being empty; expect HTTP 400 and languages-required validation message.")
    @Story("Create assignment")
    void should_returnBadRequest_when_languagesBelowMinBoundary() throws Exception {
      String payload = createAssignmentPayload("Boundary assignment", "100.00", null, true).toString();

      mockMvc.perform(post("/api/v1/assignments")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors.languages").value("At least one language is required"));
    }

    @Test
    @TmsLink("CONT-ASS-009")
    @DisplayName("Create assignment fails when test cases list is empty")
    @Description("BVA negative case: testCases collection violates minimum size by being empty while other fields are valid; expect HTTP 400 and testCases-required error.")
    @Story("Create assignment")
    void should_returnBadRequest_when_testCasesBelowMinBoundary() throws Exception {
      String payload = createAssignmentPayload("Boundary assignment", "100.00", "java", false).toString();

      mockMvc.perform(post("/api/v1/assignments")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors.testCases").value("At least one test case is required"));
    }

    @Test
    @TmsLink("CONT-ASS-010")
    @DisplayName("Create assignment denied when role is not content provider")
    @Description("Authorization equivalence: student role attempts to create assignment with valid payload; expect HTTP 403 forbidden.")
    @Story("Create assignment")
    void should_returnForbidden_when_createAssignmentWithStudentRole() throws Exception {
      String payload = createAssignmentPayload("Boundary assignment", "100.00", "java", true).toString();

      mockMvc.perform(post("/api/v1/assignments")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("STUDENT", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isForbidden());
    }

    @Test
    @TmsLink("CONT-ASS-011")
    @DisplayName("Update schedule fails when dueDate is before startDate")
    @Description("Edge validation: update schedule where dueDate is earlier than startDate; expect HTTP 400 with business validation detail message.")
    @Story("Update assignment schedule")
    void should_returnBadRequest_when_scheduleDueDateBeforeStartDate() throws Exception {
      UUID creatorId = UUID.randomUUID();
      var assignment = createAssignment(creatorId, AssignmentStatus.DRAFT, false);

      ObjectNode payload = objectMapper.createObjectNode()
          .put("startDate", LocalDateTime.now().plusDays(4).toString())
          .put("dueDate", LocalDateTime.now().plusDays(3).toString());

      mockMvc.perform(patch("/api/v1/assignments/{id}/schedule", assignment.getId())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("INSTRUCTOR", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload.toString()))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.detail").value("Due date must be after start date"));
    }

    @Test
    @TmsLink("CONT-ASS-012")
    @DisplayName("Update schedule denied when role is not instructor")
    @Description("Authorization equivalence: student role calls schedule update endpoint with valid dates; expect HTTP 403 forbidden.")
    @Story("Update assignment schedule")
    void should_returnForbidden_when_updateScheduleWithStudentRole() throws Exception {
      UUID creatorId = UUID.randomUUID();
      var assignment = createAssignment(creatorId, AssignmentStatus.DRAFT, false);

      ObjectNode payload = objectMapper.createObjectNode()
          .put("startDate", LocalDateTime.now().plusDays(3).toString())
          .put("dueDate", LocalDateTime.now().plusDays(5).toString());

      mockMvc.perform(patch("/api/v1/assignments/{id}/schedule", assignment.getId())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("STUDENT", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload.toString()))
          .andExpect(status().isForbidden());
    }
  }

  @Nested
  class EdgeCases {

    @Test
    @TmsLink("CONT-ASS-013")
    @DisplayName("Student receives not found for draft assignment")
    @Description("Edge access case: student requests assignment in DRAFT status; expect HTTP 404 because draft resources are not visible to students.")
    @Story("Get assignment by id")
    void should_returnNotFound_when_studentGetsDraftAssignment() throws Exception {
      UUID creatorId = UUID.randomUUID();
      var assignment = createAssignment(creatorId, AssignmentStatus.DRAFT, false);

      mockMvc.perform(get("/api/v1/assignments/{id}", assignment.getId())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("STUDENT", UUID.randomUUID())))
          .andExpect(status().isNotFound());
    }

    @Test
    @TmsLink("CONT-ASS-014")
    @DisplayName("Publish assignment succeeds for creator on draft assignment")
    @Description("State transition test: assignment creator publishes a draft assignment; expect HTTP 200 and assignment status changes to PUBLISHED.")
    @Story("Publish assignment")
    void should_publishAssignment_when_creatorPublishesDraft() throws Exception {
      UUID creatorId = UUID.randomUUID();
      var assignment = createAssignment(creatorId, AssignmentStatus.DRAFT, false);

      mockMvc.perform(post("/api/v1/assignments/{id}/publish", assignment.getId())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", creatorId)))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.status").value("PUBLISHED"));
    }

    @Test
    @TmsLink("CONT-ASS-015")
    @DisplayName("Archive assignment fails when assignment already archived")
    @Description("Edge state case: archive endpoint called on already archived assignment by creator; expect HTTP 400 and already-archived detail message.")
    @Story("Archive assignment")
    void should_returnBadRequest_when_archiveAlreadyArchivedAssignment() throws Exception {
      UUID creatorId = UUID.randomUUID();
      var assignment = createAssignment(creatorId, AssignmentStatus.ARCHIVED, false);

      mockMvc.perform(post("/api/v1/assignments/{id}/archive", assignment.getId())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", creatorId)))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.detail").value("Assignment is already archived"));
    }
  }

  private ObjectNode createAssignmentPayload(
      String title,
      String maxScore,
      String language,
      boolean includeTestCases
  ) {
    ObjectNode payload = objectMapper.createObjectNode()
        .put("title", title)
        .put("description", "Assignment description")
        .put("difficultyLevel", DifficultyLevel.EASY.name())
        .put("startDate", LocalDateTime.now().plusDays(1).toString())
        .put("dueDate", LocalDateTime.now().plusDays(2).toString())
        .put("maxScore", maxScore);

    ArrayNode languages = payload.putArray("languages");
    if (language != null) {
      languages.add(language);
    }

    ArrayNode testCases = payload.putArray("testCases");
    if (includeTestCases) {
      testCases.addObject()
          .put("order", 1)
          .put("description", "sample")
          .put("hidden", false)
          .put("weight", 1.0)
          .put("input", "1 2")
          .put("output", "3")
          .put("timeout", 5)
          .put("memoryLimit", 256);
    }

    return payload;
  }
}


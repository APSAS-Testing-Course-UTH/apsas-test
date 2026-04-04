package apsas.content.controller;

import apsas.content.model.entity.AssignmentStatus;
import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tag("integration")
@Feature("Internal Assignment API")
@Story("Integration tests for InternalAssignmentController")
@DisplayName("InternalAssignmentControllerIT")
class InternalAssignmentControllerIT extends BaseContentControllerIT {

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
    @TmsLink("CONT-INT-001")
    @DisplayName("Get internal assignment by id returns assignment")
    @Description("Equivalence test: fetch internal assignment by valid existing UUID; expect HTTP 200 and assignment fields in response.")
    @Story("Get internal assignment by id")
    void should_returnAssignment_when_getInternalAssignmentById() throws Exception {
      UUID creatorId = UUID.randomUUID();
      var assignment = createAssignment(creatorId, AssignmentStatus.PUBLISHED, false);

      mockMvc.perform(get("/internal/assignments/{id}", assignment.getId()))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.id").value(assignment.getId().toString()))
          .andExpect(jsonPath("$.title").exists());
    }

    @Test
    @TmsLink("CONT-INT-002")
    @DisplayName("Get internal assignments by batch returns list")
    @Description("Equivalence test: batch endpoint receives one valid existing assignment id; expect HTTP 200 with corresponding assignment array.")
    @Story("Get internal assignments by batch")
    void should_returnAssignments_when_getBatchAssignments() throws Exception {
      UUID creatorId = UUID.randomUUID();
      var assignment = createAssignment(creatorId, AssignmentStatus.PUBLISHED, false);
      String payload = "[\"" + assignment.getId() + "\"]";

      mockMvc.perform(post("/internal/assignments/batch")
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$[0].id").value(assignment.getId().toString()))
          .andExpect(jsonPath("$[0].testCases").isArray());
    }

    @Test
    @TmsLink("CONT-INT-003")
    @DisplayName("Get internal assignments by empty batch returns empty list")
    @Description("Edge case: batch endpoint receives empty id list; expect HTTP 200 and empty response array.")
    @Story("Get internal assignments by batch")
    void should_returnEmptyList_when_getBatchAssignmentsWithEmptyList() throws Exception {
      mockMvc.perform(post("/internal/assignments/batch")
              .contentType(MediaType.APPLICATION_JSON)
              .content("[]"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$").isArray())
          .andExpect(jsonPath("$.length()").value(0));
    }
  }

  @Nested
  class InvalidCases {

    @Test
    @TmsLink("CONT-INT-004")
    @DisplayName("Get internal assignment by id fails when id format is invalid")
    @Description("Negative validation case: internal assignment id path variable is not a UUID; expect HTTP 400 bad request.")
    @Story("Get internal assignment by id")
    void should_returnBadRequest_when_internalAssignmentIdInvalidFormat() throws Exception {
      mockMvc.perform(get("/internal/assignments/{id}", "invalid-uuid"))
          .andExpect(status().isBadRequest());
    }

    @Test
    @TmsLink("CONT-INT-005")
    @DisplayName("Get internal assignments by batch fails when one id is unknown")
    @Description("Edge lookup case: batch endpoint contains unknown assignment UUID; expect HTTP 404 not found.")
    @Story("Get internal assignments by batch")
    void should_returnNotFound_when_batchContainsUnknownId() throws Exception {
      String payload = "[\"" + UUID.randomUUID() + "\"]";

      mockMvc.perform(post("/internal/assignments/batch")
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isNotFound());
    }
  }
}

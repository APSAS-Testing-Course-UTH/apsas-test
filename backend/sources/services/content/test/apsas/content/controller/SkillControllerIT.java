package apsas.content.controller;

import apsas.shared.security.UserPrincipals;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tag("integration")
@Feature("Skill Management API")
@Story("Boundary value integration tests for SkillController")
@DisplayName("SkillControllerIT")
@ActiveProfiles("test")
class SkillControllerIT extends BaseContentControllerIT {

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
    @TmsLink("CONT-SKL-001")
    @DisplayName("Create skill with name length at max boundary (255)")
    @Description("BVA: create skill with name length exactly 255 characters and valid description; expect HTTP 201 and response returns the same name.")
    @Story("Create skill")
    void should_createSkill_when_nameAtMaxBoundary() throws Exception {
      String maxLengthName = "a".repeat(255);
      String payload = objectMapper.createObjectNode()
          .put("name", maxLengthName)
          .put("description", "valid")
          .toString();

      mockMvc.perform(post("/api/v1/skills")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isCreated())
          .andExpect(jsonPath("$.name").value(maxLengthName));
    }

    @Test
    @TmsLink("CONT-SKL-002")
    @DisplayName("List skills with page below minimum uses clamped boundary")
    @Description("Edge pagination case: list endpoint called with page=-1 and size above nominal value; expect HTTP 200 and returned content is still accessible.")
    @Story("List skills")
    void should_listSkills_when_pageBelowMinimumBoundary() throws Exception {
      createSkill("java");

      mockMvc.perform(get("/api/v1/skills")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("STUDENT", UUID.randomUUID()))
              .param("page", "-1")
              .param("size", "101"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.content.length()").value(1));
    }
  }

  @Nested
  class InvalidCases {

    @Test
    @TmsLink("CONT-SKL-003")
    @DisplayName("Create skill fails when name is blank")
    @Description("Equivalence negative case: create skill with blank name and valid description; expect HTTP 400 with required-name validation error.")
    @Story("Create skill")
    void should_returnBadRequest_when_nameBlank() throws Exception {
      String payload = objectMapper.createObjectNode()
          .put("name", "   ")
          .put("description", "invalid")
          .toString();

      mockMvc.perform(post("/api/v1/skills")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors.name").value("Skill name is required"));
    }

    @Test
    @TmsLink("CONT-SKL-004")
    @DisplayName("Create skill fails when name length exceeds max boundary (256)")
    @Description("BVA negative case: name length at 256 characters (max+1) during create request; expect HTTP 400 and max-length validation message.")
    @Story("Create skill")
    void should_returnBadRequest_when_nameAboveMaxBoundary() throws Exception {
      String aboveMaxName = "a".repeat(256);
      String payload = objectMapper.createObjectNode()
          .put("name", aboveMaxName)
          .put("description", "invalid")
          .toString();

      mockMvc.perform(post("/api/v1/skills")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors.name").value("Skill name must not exceed 255 characters"));
    }

    @Test
    @TmsLink("CONT-SKL-005")
    @DisplayName("Update skill fails when name length exceeds max boundary (256)")
    @Description("BVA negative case: update request sets skill name to 256 characters while target skill exists; expect HTTP 400 and max-length validation error.")
    @Story("Update skill")
    void should_returnBadRequest_when_updateNameAboveMaxBoundary() throws Exception {
      var skill = createSkill("spring");
      String payload = objectMapper.createObjectNode()
          .put("name", "b".repeat(256))
          .toString();

      mockMvc.perform(patch("/api/v1/skills/{id}", skill.getId())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors.name").value("Skill name must not exceed 255 characters"));
    }

    @Test
    @TmsLink("CONT-SKL-006")
    @DisplayName("Create skill denied when role is not content provider")
    @Description("Authorization equivalence: student role attempts skill creation with valid payload; expect HTTP 403 forbidden.")
    @Story("Create skill")
    void should_returnForbidden_when_createSkillWithStudentRole() throws Exception {
      String payload = objectMapper.createObjectNode()
          .put("name", "python")
          .put("description", "valid")
          .toString();

      mockMvc.perform(post("/api/v1/skills")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("STUDENT", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isForbidden());
    }
  }

  @Nested
  class EdgeCases {

    @Test
    @TmsLink("CONT-SKL-007")
    @DisplayName("Get skill by id returns not found for non-existing id")
    @Description("Edge lookup case: query skill by random UUID that does not exist; expect HTTP 404 and problem detail in response body.")
    @Story("Get skill by id")
    void should_returnNotFound_when_skillDoesNotExist() throws Exception {
      mockMvc.perform(get("/api/v1/skills/{id}", UUID.randomUUID())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("STUDENT", UUID.randomUUID())))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.detail").exists());
    }

    @Test
    @TmsLink("CONT-SKL-008")
    @DisplayName("Delete skill returns not found for non-existing id")
    @Description("Edge deletion case: delete operation against unknown skill UUID; expect HTTP 404 with detail field present.")
    @Story("Delete skill")
    void should_returnNotFound_when_deleteMissingSkill() throws Exception {
      mockMvc.perform(delete("/api/v1/skills/{id}", UUID.randomUUID())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID())))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.detail").exists());
    }
  }
}

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
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tag("integration")
@Feature("Tutorial Management API")
@Story("Boundary value integration tests for TutorialController")
@DisplayName("TutorialControllerIT")
class TutorialControllerIT extends BaseContentControllerIT {

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
    @TmsLink("CONT-TUT-001")
    @DisplayName("Create tutorial with title length at max boundary (255)")
    @Description("BVA: create tutorial with title length exactly 255 and valid content/tags; expect HTTP 201 with tutorial metadata in response.")
    @Story("Create tutorial")
    void should_createTutorial_when_titleAtMaxBoundary() throws Exception {
      var payloadNode = objectMapper.createObjectNode()
          .put("title", "t".repeat(255))
          .put("content", "valid content");
      payloadNode.putArray("tags").add("java");
      String payload = payloadNode.toString();

      mockMvc.perform(post("/api/v1/tutorials")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isCreated())
          .andExpect(jsonPath("$.title").exists())
          .andExpect(jsonPath("$.creatorId").exists());
    }

    @Test
    @TmsLink("CONT-TUT-002")
    @DisplayName("List tutorials with size at max boundary (100)")
    @Description("BVA: list tutorials using size at upper boundary 100 and valid page index; expect HTTP 200 and one seeded tutorial returned.")
    @Story("List tutorials")
    void should_listTutorials_when_sizeAtMaxBoundary() throws Exception {
      createTutorial(UUID.randomUUID(), "Java Basics");

      mockMvc.perform(get("/api/v1/tutorials")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("STUDENT", UUID.randomUUID()))
              .param("page", "0")
              .param("size", "100"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.content.length()").value(1));
    }
  }

  @Nested
  class InvalidCases {

    @Test
    @TmsLink("CONT-TUT-003")
    @DisplayName("Create tutorial fails when title length exceeds max boundary (256)")
    @Description("BVA negative case: create tutorial with title length 256 (max+1) and valid content; expect HTTP 400 with title max-length error.")
    @Story("Create tutorial")
    void should_returnBadRequest_when_titleAboveMaxBoundary() throws Exception {
      String payload = objectMapper.createObjectNode()
          .put("title", "x".repeat(256))
          .put("content", "valid content")
          .toString();

      mockMvc.perform(post("/api/v1/tutorials")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors.title").value("Title must not exceed 255 characters"));
    }

    @Test
    @TmsLink("CONT-TUT-004")
    @DisplayName("Create tutorial fails when content is blank")
    @Description("Equivalence negative case: create tutorial with blank content and valid title; expect HTTP 400 with content-required validation message.")
    @Story("Create tutorial")
    void should_returnBadRequest_when_contentBlank() throws Exception {
      String payload = objectMapper.createObjectNode()
          .put("title", "Tutorial")
          .put("content", " ")
          .toString();

      mockMvc.perform(post("/api/v1/tutorials")
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", UUID.randomUUID()))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors.content").value("Content is required"));
    }

    @Test
    @TmsLink("CONT-TUT-005")
    @DisplayName("Update tutorial denied when requester is not owner")
    @Description("Authorization edge case: non-owner content provider attempts to update tutorial; expect HTTP 401 and unauthorized detail message.")
    @Story("Update tutorial")
    void should_returnUnauthorized_when_updateByNonOwner() throws Exception {
      UUID ownerId = UUID.randomUUID();
      UUID otherId = UUID.randomUUID();
      var tutorial = createTutorial(ownerId, "Original tutorial");

      String payload = objectMapper.createObjectNode()
          .put("title", "Updated title")
          .toString();

      mockMvc.perform(patch("/api/v1/tutorials/{id}", tutorial.getId())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", otherId))
              .contentType(MediaType.APPLICATION_JSON)
              .content(payload))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.detail").value("You are not authorized to update this tutorial"));
    }
  }

  @Nested
  class EdgeCases {

    @Test
    @TmsLink("CONT-TUT-006")
    @DisplayName("Get tutorial by id returns not found for unknown id")
    @Description("Edge lookup case: request tutorial by random UUID not present in storage; expect HTTP 404 and problem detail payload.")
    @Story("Get tutorial by id")
    void should_returnNotFound_when_tutorialDoesNotExist() throws Exception {
      mockMvc.perform(get("/api/v1/tutorials/{id}", UUID.randomUUID())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("STUDENT", UUID.randomUUID())))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.detail").exists());
    }

    @Test
    @TmsLink("CONT-TUT-007")
    @DisplayName("Delete tutorial denied when requester is not owner")
    @Description("Authorization edge case: non-owner content provider attempts to delete tutorial; expect HTTP 401 with unauthorized detail message.")
    @Story("Delete tutorial")
    void should_returnUnauthorized_when_deleteByNonOwner() throws Exception {
      UUID ownerId = UUID.randomUUID();
      UUID otherId = UUID.randomUUID();
      var tutorial = createTutorial(ownerId, "Tutorial to delete");

      mockMvc.perform(delete("/api/v1/tutorials/{id}", tutorial.getId())
              .header(UserPrincipals.USER_INFO_HEADER, userInfoHeader("CONTENT_PROVIDER", otherId)))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.detail").value("You are not authorized to delete this tutorial"));
    }
  }
}


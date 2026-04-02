package apsas.evaluation.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.evaluation.EvaluationServiceApplication;
import apsas.evaluation.model.dto.RuntimeResponse;
import apsas.evaluation.service.EvaluationService;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SuppressWarnings("SpringBootApplicationProperties")
@SpringBootTest(
    classes = EvaluationServiceApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = {"piston.api.url=http://localhost:2000"}
)
@AutoConfigureMockMvc
@ActiveProfiles("it")
@Tag("integration")
@Epic("Evaluation Service")
@Feature("Controller Layer")
class EvaluationControllerIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private EvaluationService evaluationService;

  @Test
  @DisplayName("Returns supported runtimes as JSON")
  @Description("Verifies the runtimes endpoint returns the service response with HTTP 200.")
  @Story("Fetch supported runtimes")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("EVL-CTL-001")
  void getSupportedRuntimes_shouldReturnOkWithRuntimes_whenEndpointIsCalled() throws Exception {
    var runtimes = List.of(
        new RuntimeResponse("java", "21.0.0", List.of("java", "jdk"), "openjdk"),
        new RuntimeResponse("python", "3.11.8", List.of("python", "py"), "cpython")
    );
    when(evaluationService.getSupportedRuntimes()).thenReturn(runtimes);

    mockMvc.perform(get("/api/v1/runtimes")
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$[0].language").value("java"))
        .andExpect(jsonPath("$[0].version").value("21.0.0"))
        .andExpect(jsonPath("$[0].aliases[1]").value("jdk"))
        .andExpect(jsonPath("$[1].language").value("python"))
        .andExpect(jsonPath("$[1].runtime").value("cpython"));
  }
}

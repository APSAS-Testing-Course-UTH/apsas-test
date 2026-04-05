package apsas.notification;

import static org.mockito.Mockito.mockStatic;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.SpringApplication;

@Tag("unit")
@Epic("Notification Service")
@Feature("Application Bootstrap")
class NotificationServiceApplicationTest {

  @Test
  @Story("Application startup")
  @TmsLink("NTF-APP-001")
  @DisplayName("Delegates startup to SpringApplication.run with provided arguments")
  void mainShouldDelegateToSpringApplicationRun() {
    String[] args = {"--spring.profiles.active=test"};

    try (MockedStatic<SpringApplication> springApplication = mockStatic(SpringApplication.class)) {
      NotificationServiceApplication.main(args);

      springApplication.verify(() -> SpringApplication.run(NotificationServiceApplication.class, args));
    }
  }
}

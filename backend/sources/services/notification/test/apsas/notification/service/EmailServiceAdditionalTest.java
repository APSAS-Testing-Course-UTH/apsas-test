package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.spring6.SpringTemplateEngine;

/**
 * Unit test bổ sung cho EmailService nhằm mở rộng coverage các nhánh chưa được phủ.
 */
@Tag("unit")
@Epic("Notification Service")
@Feature("Email Service - Additional Coverage")
class EmailServiceAdditionalTest {

  @Test
  @Story("Build password reset payload")
  @TmsLink("NTF-EMAIL-001")
  @DisplayName("Builds expected variables when sending password reset email")
  void sendPasswordResetEmailShouldBuildExpectedVariables() {
    JavaMailSender mailSender = org.mockito.Mockito.mock(JavaMailSender.class);
    SpringTemplateEngine templateEngine = org.mockito.Mockito.mock(SpringTemplateEngine.class);
    EmailService service = spy(new EmailService(mailSender, templateEngine));
    ReflectionTestUtils.setField(service, "resetPasswordUrlTemplate", "https://host/reset/%token%");
    doNothing().when(service).sendEmail(anyString(), anyString(), anyString(), anyMap());

    service.sendPasswordResetEmail("to@example.com", "Lan", "reset-123");

    @SuppressWarnings("unchecked")
    ArgumentCaptor<Map<String, Object>> variablesCaptor = ArgumentCaptor.forClass(Map.class);
    verify(service).sendEmail(anyString(), anyString(), anyString(), variablesCaptor.capture());

    assertEquals("Lan", variablesCaptor.getValue().get("firstName"));
    assertEquals("https://host/reset/reset-123", variablesCaptor.getValue().get("resetUrl"));
  }

  @Test
  @Story("Send html email")
  @TmsLink("NTF-EMAIL-002")
  @DisplayName("Sends MIME email successfully when template rendering is successful")
  void sendEmailShouldSendMimeMessageWhenTemplateIsRenderedSuccessfully() throws Exception {
    JavaMailSender mailSender = org.mockito.Mockito.mock(JavaMailSender.class);
    SpringTemplateEngine templateEngine = org.mockito.Mockito.mock(SpringTemplateEngine.class);
    EmailService service = new EmailService(mailSender, templateEngine);
    ReflectionTestUtils.setField(service, "fromEmail", "no-reply@example.com");
    ReflectionTestUtils.setField(service, "fromName", "APSAS");

    MimeMessage mimeMessage = new MimeMessage((Session) null);
    when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    when(templateEngine.process(anyString(), any())).thenReturn("<html><body>ok</body></html>");

    service.sendEmail(
        "to@example.com",
        "Subject",
        "email/template",
        Map.of("firstName", "Lan")
    );

    verify(mailSender).send(mimeMessage);
    assertEquals("Subject", mimeMessage.getSubject());
    assertNotNull(mimeMessage.getFrom());
    assertNotNull(mimeMessage.getAllRecipients());
  }
}

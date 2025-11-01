package apsas.notification.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true")
public class FirebaseConfig {
  @Value("${firebase.project-id}")
  private String projectId;

  @Value("${firebase.credentials.type}")
  private String credentialsType;

  @Value("${firebase.credentials.project-id}")
  private String credentialsProjectId;

  @Value("${firebase.credentials.private-key-id}")
  private String privateKeyId;

  @Value("${firebase.credentials.private-key}")
  private String privateKey;

  @Value("${firebase.credentials.client-email}")
  private String clientEmail;

  @Value("${firebase.credentials.client-id}")
  private String clientId;

  @Bean
  public FirebaseApp firebaseApp() throws IOException {
    if (FirebaseApp.getApps().isEmpty()) {
      String credentialsJson =
          String.format(
              """
              {
                "type": "%s",
                "project_id": "%s",
                "private_key_id": "%s",
                "private_key": "%s",
                "client_email": "%s",
                "client_id": "%s",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/%s"
              }
              """,
              credentialsType,
              credentialsProjectId,
              privateKeyId,
              privateKey.replace("\\n", "\n"),
              clientEmail,
              clientId,
              clientEmail.replace("@", "%40")
          );

      GoogleCredentials credentials =
          GoogleCredentials.fromStream(
              new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8)));

      FirebaseOptions options =
          FirebaseOptions.builder().setCredentials(credentials).setProjectId(projectId).build();

      FirebaseApp app = FirebaseApp.initializeApp(options);
      log.info("Firebase App initialized successfully for project: {}", projectId);
      return app;
    } else {
      log.info("Firebase App already initialized");
      return FirebaseApp.getInstance();
    }
  }
}

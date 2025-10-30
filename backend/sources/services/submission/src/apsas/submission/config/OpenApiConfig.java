package apsas.submission.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI submissionServiceOpenAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Submission Service API")
                .description("API for managing student submissions and evaluations")
                .version("1.0.0"))
        .servers(List.of(new Server().url("http://localhost:8080").description("Local server")))
        .schemaRequirement(
            "Bearer Authentication",
            new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT"));
  }
}

package apsas.evaluation.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI evaluationServiceOpenAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Evaluation Service API")
                .description(
                    "API for evaluating student code submissions against predefined test cases")
                .version("v1.0"));
  }
}

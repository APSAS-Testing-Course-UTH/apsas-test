package apsas.shared.apidocs;


import java.util.List;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ProblemDetail;

import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
@ConditionalOnWebApplication(
        type = ConditionalOnWebApplication.Type.SERVLET
)
public class OpenApiConfig {
    public static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    @Value(
        "${spring.application.name}"
    )
    private String applicationName;

    @Bean
    OpenApiCustomizer openApiCustomizer() {
        return openApi -> {
                  openApi.getInfo().setTitle("API APSAS " + applicationName);
                  openApi.getInfo().setDescription("Tài liệu API cho APSAS " + applicationName);
                  openApi.getInfo().setVersion("1.0");
            openApi.servers(
                    List.of(
                            new Server().url("/").description("mặc định")
                    )
            );
            openApi.getComponents()
                    .addSecuritySchemes(
                            SECURITY_SCHEME_NAME,
                            new SecurityScheme()
                                    .type(SecurityScheme.Type.HTTP)
                                    .scheme("bearer")
                                    .bearerFormat("JWT")
                    );
            openApi.getComponents()
                    .addSchemas(
                            "ProblemDetail",
                            new Schema<>()
                                    .name("ProblemDetail")
                                    .description("Chi tiết lỗi theo chuẩn RFC 9457")
                                    .type("object")
                                    .addProperty(
                                            "type",
                                            new Schema<>().type("string").format("uri").description("Loại lỗi (URI)")
                                    )
                                    .addProperty("title", new Schema<>().type("string").description("Tiêu đề lỗi"))
                                    .addProperty(
                                            "status",
                                            new Schema<>().type("integer").format("int32").description("Mã trạng thái HTTP")
                                    )
                                    .addProperty("detail", new Schema<>().type("string").description("Mô tả chi tiết lỗi"))
                                    .addProperty(
                                            "instance",
                                            new Schema<>().type("string").format("uri").description("Đường dẫn instance lỗi")
                                    )
                    );
        };
    }

    @Bean
    OperationCustomizer operationCustomizer() {
                return (operation, handlerMethod) -> {
                        operation.getResponses()
                        .addApiResponse(
                                ApiResponses.DEFAULT,
                                new ApiResponse()
                                .description("Phản hồi lỗi mặc định")
                                .content(new Content()
                                        .addMediaType("application/problem+json",
                                                new MediaType()
                                                        .schema(new Schema<ProblemDetail>()
                                                                .$ref("#/components/schemas/ProblemDetail")
                                                        )
                                        )
                                )
                        );
                        return operation;
                };
    }
}

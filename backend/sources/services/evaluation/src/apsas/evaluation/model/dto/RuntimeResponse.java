package apsas.evaluation.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Supported programming language runtime information")
public record RuntimeResponse(
    @Schema(description = "Name of the programming language", example = "java") String language,
    @Schema(description = "Version of the runtime", example = "21.0.0") String version,
    @Schema(
            description = "List of alternative names for the language",
            example = "[\"java\", \"java-21\"]")
        List<String> aliases,
    @Schema(
            description = "Name of the runtime, only provided if alternative runtimes exist",
            example = "openjdk")
        String runtime) {}

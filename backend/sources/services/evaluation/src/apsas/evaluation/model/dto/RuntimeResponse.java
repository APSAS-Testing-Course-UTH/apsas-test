package apsas.evaluation.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Thông tin runtime của ngôn ngữ lập trình được hỗ trợ")
public record RuntimeResponse(
    @Schema(description = "Tên ngôn ngữ lập trình", example = "java") String language,
    @Schema(description = "Phiên bản của runtime", example = "21.0.0") String version,
    @Schema(
        description = "Danh sách tên thay thế cho ngôn ngữ",
        example = "[\"java\", \"java-21\"]"
    )
    List<String> aliases,
    @Schema(
        description = "Tên runtime, chỉ cung cấp nếu có nhiều runtime thay thế",
        example = "openjdk"
    )
    String runtime
) {}

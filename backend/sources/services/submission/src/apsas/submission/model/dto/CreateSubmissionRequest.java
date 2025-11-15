package apsas.submission.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "Yêu cầu tạo bài nộp")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CreateSubmissionRequest {
  @Schema(description = "ID của bài tập", example = "123e4567-e89b-12d3-a456-426614174000")
  @NotNull(message = "Assignment ID is required")
  private UUID assignmentId;

  @Schema(
      description = "Mã nguồn của bài nộp (Base64 encoded)",
      example = "Y29uc29sZS5sb2coJ0hlbGxvIHdvcmxkJyk7"
  )
  @NotBlank(message = "Code is required")
  private String code;

  @Schema(description = "Ngôn ngữ lập trình", example = "javascript")
  @NotBlank(message = "Language is required")
  private String language;
}

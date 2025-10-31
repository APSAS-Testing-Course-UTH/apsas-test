package apsas.submission.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CreateSubmissionRequest {
  @NotNull(message = "Assignment ID is required")
  private UUID assignmentId;

  @NotBlank(message = "Code is required")
  private String code;

  @NotBlank(message = "Language is required")
  private String language;

}

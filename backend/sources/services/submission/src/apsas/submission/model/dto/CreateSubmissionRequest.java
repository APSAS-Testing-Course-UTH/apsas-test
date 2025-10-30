package apsas.submission.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreateSubmissionRequest {

  @NotNull(message = "Assignment ID is required")
  private UUID assignmentId;

  @NotBlank(message = "Code is required")
  private String code;

  @NotBlank(message = "Language is required")
  private String language;

  // Getters and Setters
  public UUID getAssignmentId() {
    return assignmentId;
  }

  public void setAssignmentId(UUID assignmentId) {
    this.assignmentId = assignmentId;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getLanguage() {
    return language;
  }

  public void setLanguage(String language) {
    this.language = language;
  }
}

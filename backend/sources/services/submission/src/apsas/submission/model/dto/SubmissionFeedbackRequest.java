package apsas.submission.model.dto;

import jakarta.validation.constraints.NotBlank;

public class SubmissionFeedbackRequest {

  @NotBlank(message = "Feedback is required")
  private String feedback;

  // Getters and Setters
  public String getFeedback() {
    return feedback;
  }

  public void setFeedback(String feedback) {
    this.feedback = feedback;
  }
}

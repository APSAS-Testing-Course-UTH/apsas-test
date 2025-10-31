package apsas.submission.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionFeedbackRequest {
  @NotBlank(message = "Feedback is required")
  private String feedback;

}

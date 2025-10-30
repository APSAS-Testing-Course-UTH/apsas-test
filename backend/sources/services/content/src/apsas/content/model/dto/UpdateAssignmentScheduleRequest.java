package apsas.content.model.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateAssignmentScheduleRequest {
  @NotNull(message = "Start date is required")
  private LocalDateTime startDate;

  @NotNull(message = "Due date is required")
  private LocalDateTime dueDate;
}

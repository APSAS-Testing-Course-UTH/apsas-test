package apsas.feign.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionResponse {
  private UUID id;
  private UUID assignmentId;
  private UUID studentId;
  private LocalDateTime submittedAt;
  private String status;
  private String code;
  private String language;
  private String result;
  private BigDecimal score;
  private List<TestCaseResultDto> testCaseResults;
  private LocalDateTime evaluatedAt;
  private String feedback;
}

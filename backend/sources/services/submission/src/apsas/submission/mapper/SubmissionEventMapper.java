package apsas.submission.mapper;

import apsas.shared.messaging.model.SubmissionResult;
import apsas.shared.messaging.model.SubmissionStatus;
import apsas.shared.models.submission.TestCaseResultDto;
import apsas.submission.model.entity.TestCaseResult;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubmissionEventMapper {
  apsas.submission.model.entity.SubmissionStatus toEntityStatus(SubmissionStatus status);

  apsas.submission.model.entity.SubmissionResult toEntityResult(SubmissionResult result);

  TestCaseResult toEntityTestCaseResult(TestCaseResultDto dto);
}

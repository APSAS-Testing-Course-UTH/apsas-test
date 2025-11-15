package apsas.submission.mapper;

import apsas.shared.messaging.event.SubmissionEvaluatedEvent.Result;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent.Status;
import apsas.shared.models.submission.TestCaseResultResponse;
import apsas.submission.model.entity.SubmissionResult;
import apsas.submission.model.entity.SubmissionStatus;
import apsas.submission.model.entity.TestCaseResult;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubmissionEventMapper {
  SubmissionStatus toEntityStatus(Status status);

  SubmissionResult toEntityResult(Result result);

  TestCaseResult toEntityTestCaseResult(TestCaseResultResponse dto);
}

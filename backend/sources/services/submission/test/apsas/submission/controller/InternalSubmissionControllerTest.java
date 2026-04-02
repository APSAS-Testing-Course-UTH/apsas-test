package apsas.submission.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.feign.dto.SubmissionResponse;
import apsas.shared.models.pagination.PageResponse;
import apsas.submission.mapper.FeignSubmissionMapper;
import apsas.submission.service.SubmissionService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit test cho InternalSubmissionController.
 *
 * Đảm bảo API nội bộ ủy quyền đúng sang service và mapper.
 */
@ExtendWith(MockitoExtension.class)
@Tag("unit")
@Epic("Submission Service")
@Feature("Internal API")
@Owner("HuynhSang2005")
class InternalSubmissionControllerTest {

  @Mock
  private SubmissionService submissionService;

  @Mock
  private FeignSubmissionMapper feignSubmissionMapper;

  @InjectMocks
  private InternalSubmissionController internalSubmissionController;

  @Test
  @Story("Get internal submission by id")
  @TmsLink("SUB-INT-001")
  @DisplayName("Maps submission detail for internal single-id query")
  void getSubmissionByIdShouldMapFeignResponse() {
    UUID submissionId = UUID.randomUUID();
    apsas.submission.model.dto.SubmissionResponse serviceResponse =
        new apsas.submission.model.dto.SubmissionResponse();
    serviceResponse.setId(submissionId);
    SubmissionResponse feignResponse = new SubmissionResponse();
    feignResponse.setId(submissionId);

    when(submissionService.getSubmissionById(submissionId, null, true)).thenReturn(serviceResponse);
    when(feignSubmissionMapper.toFeignDto(serviceResponse)).thenReturn(feignResponse);

    SubmissionResponse actual = internalSubmissionController.getSubmissionById(submissionId);

    assertEquals(submissionId, actual.getId());
    verify(submissionService).getSubmissionById(submissionId, null, true);
    verify(feignSubmissionMapper).toFeignDto(serviceResponse);
  }

  @Test
  @Story("Get internal submissions by batch ids")
  @TmsLink("SUB-INT-002")
  @DisplayName("Maps batch submissions for internal query")
  void getBatchSubmissionsShouldReturnMappedList() {
    UUID idOne = UUID.randomUUID();
    UUID idTwo = UUID.randomUUID();

    apsas.submission.model.dto.SubmissionResponse serviceOne =
        new apsas.submission.model.dto.SubmissionResponse();
    serviceOne.setId(idOne);
    apsas.submission.model.dto.SubmissionResponse serviceTwo =
        new apsas.submission.model.dto.SubmissionResponse();
    serviceTwo.setId(idTwo);

    SubmissionResponse feignOne = new SubmissionResponse();
    feignOne.setId(idOne);
    SubmissionResponse feignTwo = new SubmissionResponse();
    feignTwo.setId(idTwo);

    when(submissionService.getSubmissionById(idOne, null, true)).thenReturn(serviceOne);
    when(submissionService.getSubmissionById(idTwo, null, true)).thenReturn(serviceTwo);
    when(feignSubmissionMapper.toFeignDto(serviceOne)).thenReturn(feignOne);
    when(feignSubmissionMapper.toFeignDto(serviceTwo)).thenReturn(feignTwo);

    List<SubmissionResponse> actual = internalSubmissionController.getBatchSubmissions(List.of(idOne, idTwo));

    assertEquals(2, actual.size());
    assertEquals(idOne, actual.getFirst().getId());
    assertEquals(idTwo, actual.getLast().getId());
  }

  @Test
  @Story("Get internal submissions by student")
  @TmsLink("SUB-INT-003")
  @DisplayName("Queries submissions by student and maps to feign dto")
  void getSubmissionsByStudentShouldQueryServiceWithStudentId() {
    UUID studentId = UUID.randomUUID();
    UUID submissionId = UUID.randomUUID();

    apsas.submission.model.dto.SubmissionResponse serviceResponse =
        new apsas.submission.model.dto.SubmissionResponse();
    serviceResponse.setId(submissionId);
    SubmissionResponse feignResponse = new SubmissionResponse();
    feignResponse.setId(submissionId);

    when(submissionService.getAllSubmissions(studentId, null, null, null, true, null))
        .thenReturn(new PageResponse<>(List.of(serviceResponse), 0, 10, 1, 1, true, true, false, false));
    when(feignSubmissionMapper.toFeignDto(serviceResponse)).thenReturn(feignResponse);

    List<SubmissionResponse> actual = internalSubmissionController.getSubmissionsByStudent(studentId);

    assertEquals(1, actual.size());
    assertEquals(submissionId, actual.getFirst().getId());
    verify(submissionService).getAllSubmissions(studentId, null, null, null, true, null);
  }

  @Test
  @Story("Get internal submissions by assignment")
  @TmsLink("SUB-INT-004")
  @DisplayName("Queries submissions by assignment and maps to feign dto")
  void getSubmissionsByAssignmentShouldQueryServiceWithAssignmentId() {
    UUID assignmentId = UUID.randomUUID();
    UUID submissionId = UUID.randomUUID();

    apsas.submission.model.dto.SubmissionResponse serviceResponse =
        new apsas.submission.model.dto.SubmissionResponse();
    serviceResponse.setId(submissionId);
    SubmissionResponse feignResponse = new SubmissionResponse();
    feignResponse.setId(submissionId);

    when(submissionService.getAllSubmissions(null, assignmentId, null, null, true, null))
        .thenReturn(new PageResponse<>(List.of(serviceResponse), 0, 10, 1, 1, true, true, false, false));
    when(feignSubmissionMapper.toFeignDto(serviceResponse)).thenReturn(feignResponse);

    List<SubmissionResponse> actual = internalSubmissionController.getSubmissionsByAssignment(assignmentId);

    assertEquals(1, actual.size());
    assertEquals(submissionId, actual.getFirst().getId());
    verify(submissionService).getAllSubmissions(null, assignmentId, null, null, true, null);
  }
}

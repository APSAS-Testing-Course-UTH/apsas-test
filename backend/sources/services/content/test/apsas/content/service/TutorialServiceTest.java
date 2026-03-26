package apsas.content.service;

import apsas.content.mapper.TutorialMapper;
import apsas.content.model.dto.CreateTutorialRequest;
import apsas.content.model.dto.TutorialResponse;
import apsas.content.model.dto.UpdateTutorialRequest;
import apsas.content.model.entity.Tutorial;
import apsas.content.repository.TutorialRepository;
import apsas.shared.exception.NotFoundException;
import apsas.shared.exception.UnauthorizedException;
import apsas.shared.models.pagination.PageResponse;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TutorialService")
class TutorialServiceTest {

  @Mock
  private TutorialRepository tutorialRepository;

  @Mock
  private TutorialMapper tutorialMapper;

  @InjectMocks
  private TutorialService tutorialService;

  private UUID tutorialId;
  private UUID creatorId;
  private Tutorial tutorial;
  private TutorialResponse tutorialResponse;
  private CreateTutorialRequest createRequest;
  private UpdateTutorialRequest updateRequest;

  @BeforeEach
  void setUp() {
    tutorialId = UUID.randomUUID();
    creatorId = UUID.randomUUID();

    tutorial = new Tutorial();
    tutorial.setId(tutorialId);
    tutorial.setTitle("Java Basics");
    tutorial.setContent("Learn Java fundamentals");
    tutorial.setCreatorId(creatorId);
    tutorial.setCreatedAt(LocalDateTime.now());
    tutorial.setUpdatedAt(LocalDateTime.now());

    tutorialResponse = new TutorialResponse();
    tutorialResponse.setId(tutorialId);
    tutorialResponse.setTitle("Java Basics");
    tutorialResponse.setContent("Learn Java fundamentals");

    createRequest = new CreateTutorialRequest();
    createRequest.setTitle("Java Basics");
    createRequest.setContent("Learn Java fundamentals");

    updateRequest = new UpdateTutorialRequest();
    updateRequest.setTitle("Java Advanced");
    updateRequest.setContent("Learn advanced Java");
  }

  @Nested
  @DisplayName("getAllTutorials")
  class GetAllTutorialsTests {

    @Test
    @DisplayName("shouldReturnPageOfTutorials_whenCalled")
    void shouldReturnPageOfTutorials() {
      // Arrange
      Pageable pageable = PageRequest.of(0, 10);
      Page<Tutorial> tutorialPage = new PageImpl<>(java.util.List.of(tutorial), pageable, 1);

      when(tutorialRepository.findAll(pageable)).thenReturn(tutorialPage);
      when(tutorialMapper.toResponse(tutorial)).thenReturn(tutorialResponse);

      // Act
      PageResponse<TutorialResponse> result = tutorialService.getAllTutorials(pageable);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.content()).hasSize(1).contains(tutorialResponse);
      verify(tutorialRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("shouldReturnEmptyPage_whenNoTutorialsExist")
    void shouldReturnEmptyPage() {
      // Arrange
      Pageable pageable = PageRequest.of(0, 10);
      Page<Tutorial> emptyPage = new PageImpl<>(java.util.List.of(), pageable, 0);

      when(tutorialRepository.findAll(pageable)).thenReturn(emptyPage);

      // Act
      PageResponse<TutorialResponse> result = tutorialService.getAllTutorials(pageable);

      // Assert
      assertThat(result.content()).isEmpty();
      verify(tutorialRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("shouldHandleMultiplePages_whenPaginationApplied")
    void shouldHandleMultiplePages() {
      // Arrange
      Pageable pageable = PageRequest.of(1, 5);
      Tutorial tutorial2 = new Tutorial();
      tutorial2.setId(UUID.randomUUID());
      tutorial2.setTitle("Python Basics");

      TutorialResponse tutorialResponse2 = new TutorialResponse();
      tutorialResponse2.setId(tutorial2.getId());
      tutorialResponse2.setTitle("Python Basics");

      Page<Tutorial> tutorialPage = new PageImpl<>(java.util.List.of(tutorial, tutorial2), pageable, 2);

      when(tutorialRepository.findAll(pageable)).thenReturn(tutorialPage);
      when(tutorialMapper.toResponse(tutorial)).thenReturn(tutorialResponse);
      when(tutorialMapper.toResponse(tutorial2)).thenReturn(tutorialResponse2);

      // Act
      PageResponse<TutorialResponse> result = tutorialService.getAllTutorials(pageable);

      // Assert
      assertThat(result.content()).hasSize(2);
    }
  }

  @Nested
  @DisplayName("getTutorialById")
  class GetTutorialByIdTests {

    @Test
    @DisplayName("shouldReturnTutorialResponse_whenTutorialExists")
    void shouldReturnTutorialResponse() {
      // Arrange
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));
      when(tutorialMapper.toResponse(tutorial)).thenReturn(tutorialResponse);

      // Act
      TutorialResponse result = tutorialService.getTutorialById(tutorialId);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(tutorialId);
      assertThat(result.getTitle()).isEqualTo("Java Basics");
      verify(tutorialRepository, times(1)).findById(tutorialId);
    }

    @Test
    @DisplayName("shouldThrowNotFoundException_whenTutorialDoesNotExist")
    void shouldThrowNotFoundException() {
      // Arrange
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> tutorialService.getTutorialById(tutorialId))
          .isInstanceOf(NotFoundException.class)
          .hasMessageContaining("Tutorial not found with id:");

      verify(tutorialRepository, times(1)).findById(tutorialId);
    }

    @Test
    @DisplayName("shouldCallMapperToResponse_whenTutorialFound")
    void shouldCallMapperToResponse() {
      // Arrange
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));
      when(tutorialMapper.toResponse(tutorial)).thenReturn(tutorialResponse);

      // Act
      tutorialService.getTutorialById(tutorialId);

      // Assert
      verify(tutorialMapper, times(1)).toResponse(tutorial);
    }
  }

  @Nested
  @DisplayName("createTutorial")
  class CreateTutorialTests {

    @Test
    @DisplayName("shouldCreateTutorial_whenRequestIsValid")
    void shouldCreateTutorial() {
      // Arrange
      Tutorial createdTutorial = new Tutorial();
      createdTutorial.setId(UUID.randomUUID());
      createdTutorial.setTitle("Java Basics");
      createdTutorial.setContent("Learn Java fundamentals");
      createdTutorial.setCreatorId(creatorId);

      when(tutorialMapper.toEntity(createRequest, creatorId)).thenReturn(tutorial);
      when(tutorialRepository.save(tutorial)).thenReturn(createdTutorial);
      when(tutorialMapper.toResponse(createdTutorial)).thenReturn(tutorialResponse);

      // Act
      TutorialResponse result = tutorialService.createTutorial(createRequest, creatorId);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getTitle()).isEqualTo("Java Basics");
      verify(tutorialRepository, times(1)).save(any());
      verify(tutorialMapper, times(1)).toEntity(createRequest, creatorId);
    }

    @Test
    @DisplayName("shouldMapperReceiveCreatorId_whenCreatingTutorial")
    void shouldMapperReceiveCreatorId() {
      // Arrange
      when(tutorialMapper.toEntity(createRequest, creatorId)).thenReturn(tutorial);
      when(tutorialRepository.save(tutorial)).thenReturn(tutorial);
      when(tutorialMapper.toResponse(tutorial)).thenReturn(tutorialResponse);

      // Act
      tutorialService.createTutorial(createRequest, creatorId);

      // Assert
      ArgumentCaptor<CreateTutorialRequest> requestCaptor = ArgumentCaptor.forClass(CreateTutorialRequest.class);
      ArgumentCaptor<UUID> creatorCaptor = ArgumentCaptor.forClass(UUID.class);
      verify(tutorialMapper).toEntity(requestCaptor.capture(), creatorCaptor.capture());
      assertThat(creatorCaptor.getValue()).isEqualTo(creatorId);
    }

    @Test
    @DisplayName("shouldSaveTutorialToRepository_whenRequestIsValid")
    void shouldSaveTutorialToRepository() {
      // Arrange
      when(tutorialMapper.toEntity(createRequest, creatorId)).thenReturn(tutorial);
      when(tutorialRepository.save(tutorial)).thenReturn(tutorial);
      when(tutorialMapper.toResponse(tutorial)).thenReturn(tutorialResponse);

      // Act
      tutorialService.createTutorial(createRequest, creatorId);

      // Assert
      ArgumentCaptor<Tutorial> captor = ArgumentCaptor.forClass(Tutorial.class);
      verify(tutorialRepository).save(captor.capture());
      assertThat(captor.getValue()).isEqualTo(tutorial);
    }
  }

  @Nested
  @DisplayName("updateTutorial")
  class UpdateTutorialTests {

    @Test
    @DisplayName("shouldUpdateTutorial_whenUserIsCreator")
    void shouldUpdateTutorial() {
      // Arrange
      Tutorial updatedTutorial = new Tutorial();
      updatedTutorial.setId(tutorialId);
      updatedTutorial.setTitle("Java Advanced");
      updatedTutorial.setCreatorId(creatorId);

      TutorialResponse updatedResponse = new TutorialResponse();
      updatedResponse.setId(tutorialId);
      updatedResponse.setTitle("Java Advanced");

      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));
      doNothing().when(tutorialMapper).updateEntity(tutorial, updateRequest);
      when(tutorialRepository.save(tutorial)).thenReturn(updatedTutorial);
      when(tutorialMapper.toResponse(updatedTutorial)).thenReturn(updatedResponse);

      // Act
      TutorialResponse result = tutorialService.updateTutorial(tutorialId, updateRequest, creatorId);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getTitle()).isEqualTo("Java Advanced");
      verify(tutorialRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("shouldThrowUnauthorizedException_whenUserIsNotCreator")
    void shouldThrowUnauthorizedException() {
      // Arrange
      UUID differentUserId = UUID.randomUUID();
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));

      // Act & Assert
      assertThatThrownBy(() -> tutorialService.updateTutorial(tutorialId, updateRequest, differentUserId))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("not authorized to update");

      verify(tutorialRepository, never()).save(any());
    }

    @Test
    @DisplayName("shouldThrowNotFoundException_whenTutorialDoesNotExist")
    void shouldThrowNotFoundException() {
      // Arrange
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> tutorialService.updateTutorial(tutorialId, updateRequest, creatorId))
          .isInstanceOf(NotFoundException.class)
          .hasMessageContaining("Tutorial not found with id:");

      verify(tutorialRepository, never()).save(any());
    }

    @Test
    @DisplayName("shouldCallMapper_whenUpdatingTutorial")
    void shouldCallMapper() {
      // Arrange
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));
      doNothing().when(tutorialMapper).updateEntity(tutorial, updateRequest);
      when(tutorialRepository.save(tutorial)).thenReturn(tutorial);
      when(tutorialMapper.toResponse(tutorial)).thenReturn(tutorialResponse);

      // Act
      tutorialService.updateTutorial(tutorialId, updateRequest, creatorId);

      // Assert
      verify(tutorialMapper, times(1)).updateEntity(tutorial, updateRequest);
    }

    @Test
    @DisplayName("shouldVerifyCreatorIdMatch_beforeUpdating")
    void shouldVerifyCreatorIdMatch() {
      // Arrange
      UUID wrongCreatorId = UUID.randomUUID();
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));

      // Act & Assert
      assertThatThrownBy(() -> tutorialService.updateTutorial(tutorialId, updateRequest, wrongCreatorId))
          .isInstanceOf(UnauthorizedException.class);

      verify(tutorialMapper, never()).updateEntity(any(), any());
    }
  }

  @Nested
  @DisplayName("deleteTutorial")
  class DeleteTutorialTests {

    @Test
    @DisplayName("shouldDeleteTutorial_whenUserIsCreator")
    void shouldDeleteTutorial() {
      // Arrange
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));

      // Act
      tutorialService.deleteTutorial(tutorialId, creatorId);

      // Assert
      verify(tutorialRepository, times(1)).deleteById(tutorialId);
    }

    @Test
    @DisplayName("shouldThrowUnauthorizedException_whenUserIsNotCreator")
    void shouldThrowUnauthorizedException() {
      // Arrange
      UUID differentUserId = UUID.randomUUID();
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));

      // Act & Assert
      assertThatThrownBy(() -> tutorialService.deleteTutorial(tutorialId, differentUserId))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("not authorized to delete");

      verify(tutorialRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("shouldThrowNotFoundException_whenTutorialDoesNotExist")
    void shouldThrowNotFoundException() {
      // Arrange
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> tutorialService.deleteTutorial(tutorialId, creatorId))
          .isInstanceOf(NotFoundException.class)
          .hasMessageContaining("Tutorial not found with id:");

      verify(tutorialRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("shouldCallRepositoryDelete_withCorrectId")
    void shouldCallRepositoryDelete() {
      // Arrange
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));

      // Act
      tutorialService.deleteTutorial(tutorialId, creatorId);

      // Assert
      ArgumentCaptor<UUID> captor = ArgumentCaptor.forClass(UUID.class);
      verify(tutorialRepository).deleteById(captor.capture());
      assertThat(captor.getValue()).isEqualTo(tutorialId);
    }

    @Test
    @DisplayName("shouldVerifyCreatorIdMatch_beforeDeleting")
    void shouldVerifyCreatorIdMatch() {
      // Arrange
      UUID wrongCreatorId = UUID.randomUUID();
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));

      // Act & Assert
      assertThatThrownBy(() -> tutorialService.deleteTutorial(tutorialId, wrongCreatorId))
          .isInstanceOf(UnauthorizedException.class);

      verify(tutorialRepository, never()).deleteById(any());
    }
  }
}


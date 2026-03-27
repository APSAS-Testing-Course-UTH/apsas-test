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
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
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
@Epic("Content Service")
@Feature("Tutorial Management")
class TutorialServiceTest {

  private static final String JAVA_BASICS_TITLE = "Java Basics";
  private static final String JAVA_BASICS_CONTENT = "Learn Java fundamentals";
  private static final String JAVA_ADVANCED_TITLE = "Java Advanced";
  private static final String JAVA_ADVANCED_CONTENT = "Learn advanced Java";

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
    tutorial.setTitle(JAVA_BASICS_TITLE);
    tutorial.setContent(JAVA_BASICS_CONTENT);
    tutorial.setCreatorId(creatorId);
    tutorial.setCreatedAt(LocalDateTime.now());
    tutorial.setUpdatedAt(LocalDateTime.now());

    tutorialResponse = new TutorialResponse();
    tutorialResponse.setId(tutorialId);
    tutorialResponse.setTitle(JAVA_BASICS_TITLE);
    tutorialResponse.setContent(JAVA_BASICS_CONTENT);

    createRequest = new CreateTutorialRequest();
    createRequest.setTitle(JAVA_BASICS_TITLE);
    createRequest.setContent(JAVA_BASICS_CONTENT);

    updateRequest = new UpdateTutorialRequest();
    updateRequest.setTitle(JAVA_ADVANCED_TITLE);
    updateRequest.setContent(JAVA_ADVANCED_CONTENT);
  }

  @Nested
  @DisplayName("getAllTutorials")
  @Story("Retrieve paginated list of tutorials")
  class GetAllTutorialsTests {

    @Test
    @DisplayName("shouldReturnPageOfTutorials_whenCalled")
    @Severity(SeverityLevel.NORMAL)
    @Description("Retrieve all tutorials with pagination")
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
  @Story("Retrieve specific tutorial by ID")
  class GetTutorialByIdTests {

    @Test
    @DisplayName("shouldReturnTutorialResponse_whenTutorialExists")
    @Severity(SeverityLevel.NORMAL)
    @Description("Retrieve an existing tutorial by ID")
    void shouldReturnTutorialResponse() {
      // Arrange
      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));
      when(tutorialMapper.toResponse(tutorial)).thenReturn(tutorialResponse);

      // Act
      TutorialResponse result = tutorialService.getTutorialById(tutorialId);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(tutorialId);
      assertThat(result.getTitle()).isEqualTo(JAVA_BASICS_TITLE);
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
  @Story("Create new tutorials by creators")
  class CreateTutorialTests {

    @Test
    @DisplayName("shouldCreateTutorial_whenRequestIsValid")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Create a new tutorial with valid request")
    void shouldCreateTutorial() {
      // Arrange
      Tutorial createdTutorial = new Tutorial();
      createdTutorial.setId(UUID.randomUUID());
      createdTutorial.setTitle(JAVA_BASICS_TITLE);
      createdTutorial.setContent(JAVA_BASICS_CONTENT);
      createdTutorial.setCreatorId(creatorId);

      when(tutorialMapper.toEntity(createRequest, creatorId)).thenReturn(tutorial);
      when(tutorialRepository.save(tutorial)).thenReturn(createdTutorial);
      when(tutorialMapper.toResponse(createdTutorial)).thenReturn(tutorialResponse);

      // Act
      TutorialResponse result = tutorialService.createTutorial(createRequest, creatorId);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getTitle()).isEqualTo(JAVA_BASICS_TITLE);
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

    @Test
    @DisplayName("shouldHandleNullContent_whenCreating")
    @Severity(SeverityLevel.NORMAL)
    @Description("Null content in create request should be handled")
    void shouldHandleNullContent_whenCreating() {
      // Arrange
      CreateTutorialRequest nullContentRequest = new CreateTutorialRequest();
      nullContentRequest.setTitle(JAVA_BASICS_TITLE);
      nullContentRequest.setContent(null);

      Tutorial tutorialWithNull = new Tutorial();
      tutorialWithNull.setTitle(JAVA_BASICS_TITLE);
      tutorialWithNull.setContent(null);

      when(tutorialMapper.toEntity(nullContentRequest, creatorId))
          .thenReturn(tutorialWithNull);
      when(tutorialRepository.save(tutorialWithNull))
          .thenReturn(tutorialWithNull);
      when(tutorialMapper.toResponse(tutorialWithNull))
          .thenReturn(tutorialResponse);

      // Act
      TutorialResponse result = tutorialService.createTutorial(nullContentRequest, creatorId);

      // Assert
      assertThat(result).isNotNull();
      verify(tutorialRepository, times(1)).save(any());
    }
  }

  @Nested
  @DisplayName("updateTutorial")
  @Story("Update tutorials with authorization")
  class UpdateTutorialTests {

    @Test
    @DisplayName("shouldUpdateTutorial_whenUserIsCreator")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Update a tutorial when user is the creator")
    void shouldUpdateTutorial() {
      // Arrange
      Tutorial updatedTutorial = new Tutorial();
      updatedTutorial.setId(tutorialId);
      updatedTutorial.setTitle(JAVA_ADVANCED_TITLE);
      updatedTutorial.setCreatorId(creatorId);

      TutorialResponse updatedResponse = new TutorialResponse();
      updatedResponse.setId(tutorialId);
      updatedResponse.setTitle(JAVA_ADVANCED_TITLE);

      when(tutorialRepository.findById(tutorialId)).thenReturn(Optional.of(tutorial));
      doNothing().when(tutorialMapper).updateEntity(tutorial, updateRequest);
      when(tutorialRepository.save(tutorial)).thenReturn(updatedTutorial);
      when(tutorialMapper.toResponse(updatedTutorial)).thenReturn(updatedResponse);

      // Act
      TutorialResponse result = tutorialService.updateTutorial(tutorialId, updateRequest, creatorId);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getTitle()).isEqualTo(JAVA_ADVANCED_TITLE);
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
  @Story("Delete tutorials with ownership verification")
  class DeleteTutorialTests {

    @Test
    @DisplayName("shouldDeleteTutorial_whenUserIsCreator")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Delete a tutorial when user is the creator")
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


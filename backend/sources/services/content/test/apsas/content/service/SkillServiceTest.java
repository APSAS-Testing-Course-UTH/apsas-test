package apsas.content.service;

import apsas.content.mapper.SkillMapper;
import apsas.content.model.dto.CreateSkillRequest;
import apsas.content.model.dto.SkillResponse;
import apsas.content.model.dto.UpdateSkillRequest;
import apsas.content.model.entity.Skill;
import apsas.content.repository.SkillRepository;
import apsas.shared.exception.BadRequestException;
import apsas.shared.exception.NotFoundException;
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
@DisplayName("SkillService")
@Epic("Content Service")
@Feature("Skill Management")
class SkillServiceTest {

  private static final String JAVA_SKILL_NAME = "Java";
  private static final String JAVA_DESCRIPTION = "Java programming language";
  private static final String ADVANCED_JAVA_NAME = "Java Advanced";
  private static final String ADVANCED_JAVA_DESC = "Advanced Java";

  @Mock
  private SkillRepository skillRepository;

  @Mock
  private SkillMapper skillMapper;

  @InjectMocks
  private SkillService skillService;

  private UUID skillId;
  private Skill skill;
  private SkillResponse skillResponse;
  private CreateSkillRequest createRequest;
  private UpdateSkillRequest updateRequest;

  @BeforeEach
  void setUp() {
    skillId = UUID.randomUUID();

    skill = new Skill();
    skill.setId(skillId);
    skill.setName(JAVA_SKILL_NAME);
    skill.setDescription(JAVA_DESCRIPTION);
    skill.setCreatedAt(LocalDateTime.now());
    skill.setUpdatedAt(LocalDateTime.now());

    skillResponse = new SkillResponse();
    skillResponse.setId(skillId);
    skillResponse.setName(JAVA_SKILL_NAME);
    skillResponse.setDescription(JAVA_DESCRIPTION);

    createRequest = new CreateSkillRequest();
    createRequest.setName(JAVA_SKILL_NAME);
    createRequest.setDescription(JAVA_DESCRIPTION);

    updateRequest = new UpdateSkillRequest();
    updateRequest.setName(ADVANCED_JAVA_NAME);
    updateRequest.setDescription(ADVANCED_JAVA_DESC);
  }

  @Nested
  @DisplayName("getAllSkills")
  @Story("Retrieve paginated list of skills")
  class GetAllSkillsTests {

    @Test
    @DisplayName("shouldReturnPageOfSkills_whenCalled")
    @Severity(SeverityLevel.NORMAL)
    @Description("Retrieve all skills with pagination")
    void shouldReturnPageOfSkills() {
      // Arrange
      Pageable pageable = PageRequest.of(0, 10);
      Page<Skill> skillPage = new PageImpl<>(java.util.List.of(skill), pageable, 1);

      when(skillRepository.findAll(pageable)).thenReturn(skillPage);
      when(skillMapper.toResponse(skill)).thenReturn(skillResponse);

      // Act
      PageResponse<SkillResponse> result = skillService.getAllSkills(pageable);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.content()).hasSize(1).contains(skillResponse);
      verify(skillRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("shouldReturnEmptyPage_whenNoSkillsExist")
    void shouldReturnEmptyPage() {
      // Arrange
      Pageable pageable = PageRequest.of(0, 10);
      Page<Skill> emptyPage = new PageImpl<>(java.util.List.of(), pageable, 0);

      when(skillRepository.findAll(pageable)).thenReturn(emptyPage);

      // Act
      PageResponse<SkillResponse> result = skillService.getAllSkills(pageable);

      // Assert
      assertThat(result.content()).isEmpty();
      verify(skillRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("shouldReturnMultiplePages_whenPaginationParametersApplied")
    void shouldReturnMultiplePages() {
      // Arrange
      Pageable pageable = PageRequest.of(1, 5);
      Skill skill2 = new Skill();
      skill2.setId(UUID.randomUUID());
      skill2.setName("Python");
      
      SkillResponse skillResponse2 = new SkillResponse();
      skillResponse2.setId(skill2.getId());
      skillResponse2.setName("Python");

      Page<Skill> skillPage = new PageImpl<>(java.util.List.of(skill, skill2), pageable, 2);

      when(skillRepository.findAll(pageable)).thenReturn(skillPage);
      when(skillMapper.toResponse(skill)).thenReturn(skillResponse);
      when(skillMapper.toResponse(skill2)).thenReturn(skillResponse2);

      // Act
      PageResponse<SkillResponse> result = skillService.getAllSkills(pageable);

      // Assert
      assertThat(result.content()).hasSize(2);
    }
  }

  @Nested
  @DisplayName("getSkillById")
  @Story("Retrieve specific skill by ID")
  class GetSkillByIdTests {

    @Test
    @DisplayName("shouldReturnSkillResponse_whenSkillExists")
    @Severity(SeverityLevel.NORMAL)
    @Description("Retrieve an existing skill by ID")
    void shouldReturnSkillResponse() {
      // Arrange
      when(skillRepository.findById(skillId)).thenReturn(Optional.of(skill));
      when(skillMapper.toResponse(skill)).thenReturn(skillResponse);

      // Act
      SkillResponse result = skillService.getSkillById(skillId);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(skillId);
      assertThat(result.getName()).isEqualTo(JAVA_SKILL_NAME);
      verify(skillRepository, times(1)).findById(skillId);
    }

    @Test
    @DisplayName("shouldThrowNotFoundException_whenSkillDoesNotExist")
    void shouldThrowNotFoundException() {
      // Arrange
      when(skillRepository.findById(skillId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> skillService.getSkillById(skillId))
          .isInstanceOf(NotFoundException.class)
          .hasMessageContaining("Skill not found with id:");

      verify(skillRepository, times(1)).findById(skillId);
    }

    @Test
    @DisplayName("shouldCallMapperToResponse_whenSkillFound")
    void shouldCallMapperToResponse() {
      // Arrange
      when(skillRepository.findById(skillId)).thenReturn(Optional.of(skill));
      when(skillMapper.toResponse(skill)).thenReturn(skillResponse);

      // Act
      skillService.getSkillById(skillId);

      // Assert
      verify(skillMapper, times(1)).toResponse(skill);
    }
  }

  @Nested
  @DisplayName("createSkill")
  @Story("Create new skills with duplicate name validation")
  class CreateSkillTests {

    @Test
    @DisplayName("shouldCreateSkill_whenRequestIsValid")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Create a new skill with unique name")
    void shouldCreateSkill() {
      // Arrange
      Skill createdSkill = new Skill();
      createdSkill.setId(UUID.randomUUID());
      createdSkill.setName(JAVA_SKILL_NAME);
      createdSkill.setDescription(JAVA_DESCRIPTION);

      when(skillRepository.existsByName(JAVA_SKILL_NAME)).thenReturn(false);
      when(skillMapper.toEntity(createRequest)).thenReturn(skill);
      when(skillRepository.save(skill)).thenReturn(createdSkill);
      when(skillMapper.toResponse(createdSkill)).thenReturn(skillResponse);

      // Act
      SkillResponse result = skillService.createSkill(createRequest);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getName()).isEqualTo(JAVA_SKILL_NAME);
      verify(skillRepository, times(1)).existsByName(JAVA_SKILL_NAME);
      verify(skillRepository, times(1)).save(skill);
    }

    @Test
    @DisplayName("shouldThrowBadRequestException_whenSkillNameAlreadyExists")
    void shouldThrowBadRequestException() {
      // Arrange
      when(skillRepository.existsByName(JAVA_SKILL_NAME)).thenReturn(true);

      // Act & Assert
      assertThatThrownBy(() -> skillService.createSkill(createRequest))
          .isInstanceOf(BadRequestException.class)
          .hasMessageContaining("already exists");

      verify(skillRepository, never()).save(any());
    }

    @Test
    @DisplayName("shouldCallMapper_whenCreatingSkill")
    void shouldCallMapper() {
      // Arrange
      when(skillRepository.existsByName(JAVA_SKILL_NAME)).thenReturn(false);
      when(skillMapper.toEntity(createRequest)).thenReturn(skill);
      when(skillRepository.save(skill)).thenReturn(skill);
      when(skillMapper.toResponse(skill)).thenReturn(skillResponse);

      // Act
      skillService.createSkill(createRequest);

      // Assert
      verify(skillMapper, times(1)).toEntity(createRequest);
      verify(skillMapper, times(1)).toResponse(any());
    }

    @Test
    @DisplayName("shouldSaveSkill_whenNameIsUnique")
    void shouldSaveSkill() {
      // Arrange
      when(skillRepository.existsByName(JAVA_SKILL_NAME)).thenReturn(false);
      when(skillMapper.toEntity(createRequest)).thenReturn(skill);
      when(skillRepository.save(skill)).thenReturn(skill);
      when(skillMapper.toResponse(skill)).thenReturn(skillResponse);

      // Act
      skillService.createSkill(createRequest);

      // Assert
      ArgumentCaptor<Skill> captor = ArgumentCaptor.forClass(Skill.class);
      verify(skillRepository).save(captor.capture());
      assertThat(captor.getValue().getName()).isEqualTo(JAVA_SKILL_NAME);
    }
  }

  @Nested
  @DisplayName("updateSkill")
  @Story("Update existing skills")
  class UpdateSkillTests {

    @Test
    @DisplayName("shouldUpdateSkill_whenRequestIsValid")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Update a skill with valid new name")
    void shouldUpdateSkill() {
      // Arrange
      Skill updatedSkill = new Skill();
      updatedSkill.setId(skillId);
      updatedSkill.setName("Java Advanced");
      updatedSkill.setDescription("Advanced Java");

      SkillResponse updatedResponse = new SkillResponse();
      updatedResponse.setId(skillId);
      updatedResponse.setName("Java Advanced");

      when(skillRepository.findById(skillId)).thenReturn(Optional.of(skill));
      when(skillRepository.existsByName("Java Advanced")).thenReturn(false);
      doNothing().when(skillMapper).updateEntity(skill, updateRequest);
      when(skillRepository.save(skill)).thenReturn(updatedSkill);
      when(skillMapper.toResponse(updatedSkill)).thenReturn(updatedResponse);

      // Act
      SkillResponse result = skillService.updateSkill(skillId, updateRequest);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getName()).isEqualTo("Java Advanced");
      verify(skillRepository, times(1)).findById(skillId);
      verify(skillRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("shouldThrowNotFoundException_whenSkillDoesNotExist")
    void shouldThrowNotFoundException() {
      // Arrange
      when(skillRepository.findById(skillId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> skillService.updateSkill(skillId, updateRequest))
          .isInstanceOf(NotFoundException.class);

      verify(skillRepository, never()).save(any());
    }

    @Test
    @DisplayName("shouldThrowBadRequestException_whenNewNameAlreadyExists")
    void shouldThrowBadRequestException() {
      // Arrange
      when(skillRepository.findById(skillId)).thenReturn(Optional.of(skill));
      when(skillRepository.existsByName("Java Advanced")).thenReturn(true);

      // Act & Assert
      assertThatThrownBy(() -> skillService.updateSkill(skillId, updateRequest))
          .isInstanceOf(BadRequestException.class)
          .hasMessageContaining("already exists");

      verify(skillRepository, never()).save(any());
    }

    @Test
    @DisplayName("shouldNotCheckDuplicate_whenNameIsNotChanged")
    void shouldNotCheckDuplicate_whenNameNotChanged() {
      // Arrange
      UpdateSkillRequest sameNameRequest = new UpdateSkillRequest();
      sameNameRequest.setName("Java"); // same as original
      sameNameRequest.setDescription("New description");

      when(skillRepository.findById(skillId)).thenReturn(Optional.of(skill));
      doNothing().when(skillMapper).updateEntity(skill, sameNameRequest);
      when(skillRepository.save(skill)).thenReturn(skill);
      when(skillMapper.toResponse(skill)).thenReturn(skillResponse);

      // Act
      skillService.updateSkill(skillId, sameNameRequest);

      // Assert
      verify(skillRepository, never()).existsByName(any());
    }

    @Test
    @DisplayName("shouldUpdateOnlyDescription_whenNameIsNull")
    @Severity(SeverityLevel.NORMAL)
    @Description("Update skill with null description should preserve existing description")
    void shouldUpdateOnlyDescription() {
      // Arrange
      UpdateSkillRequest partialRequest = new UpdateSkillRequest();
      partialRequest.setName(null);
      partialRequest.setDescription("New description");

      when(skillRepository.findById(skillId)).thenReturn(Optional.of(skill));
      doNothing().when(skillMapper).updateEntity(skill, partialRequest);
      when(skillRepository.save(skill)).thenReturn(skill);
      when(skillMapper.toResponse(skill)).thenReturn(skillResponse);

      // Act
      skillService.updateSkill(skillId, partialRequest);

      // Assert
      verify(skillRepository, times(1)).save(skill);
    }

    @Test
    @DisplayName("shouldHandleNullDescription_whenUpdating")
    @Severity(SeverityLevel.NORMAL)
    @Description("Update skill with null description should not fail")
    void shouldHandleNullDescription_whenUpdating() {
      // Arrange
      UpdateSkillRequest nullDescRequest = new UpdateSkillRequest();
      nullDescRequest.setName(ADVANCED_JAVA_NAME);
      nullDescRequest.setDescription(null);

      when(skillRepository.findById(skillId)).thenReturn(Optional.of(skill));
      when(skillRepository.existsByName(ADVANCED_JAVA_NAME)).thenReturn(false);
      doNothing().when(skillMapper).updateEntity(skill, nullDescRequest);
      when(skillRepository.save(skill)).thenReturn(skill);
      when(skillMapper.toResponse(skill)).thenReturn(skillResponse);

      // Act
      SkillResponse result = skillService.updateSkill(skillId, nullDescRequest);

      // Assert
      assertThat(result).isNotNull();
      verify(skillRepository, times(1)).save(skill);
    }
  }

  @Nested
  @DisplayName("deleteSkill")
  @Story("Delete skills")
  class DeleteSkillTests {

    @Test
    @DisplayName("shouldDeleteSkill_whenSkillExists")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Delete an existing skill")
    void shouldDeleteSkill() {
      // Arrange
      when(skillRepository.existsById(skillId)).thenReturn(true);

      // Act
      skillService.deleteSkill(skillId);

      // Assert
      verify(skillRepository, times(1)).deleteById(skillId);
    }

    @Test
    @DisplayName("shouldThrowNotFoundException_whenSkillDoesNotExist")
    void shouldThrowNotFoundException() {
      // Arrange
      when(skillRepository.existsById(skillId)).thenReturn(false);

      // Act & Assert
      assertThatThrownBy(() -> skillService.deleteSkill(skillId))
          .isInstanceOf(NotFoundException.class)
          .hasMessageContaining("Skill not found with id:");

      verify(skillRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("shouldCallRepositoryDelete_whenSkillExists")
    void shouldCallRepositoryDelete() {
      // Arrange
      when(skillRepository.existsById(skillId)).thenReturn(true);

      // Act
      skillService.deleteSkill(skillId);

      // Assert
      ArgumentCaptor<UUID> captor = ArgumentCaptor.forClass(UUID.class);
      verify(skillRepository).deleteById(captor.capture());
      assertThat(captor.getValue()).isEqualTo(skillId);
    }
  }
}


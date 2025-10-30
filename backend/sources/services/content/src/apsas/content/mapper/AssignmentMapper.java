package apsas.content.mapper;

import apsas.content.model.dto.AssignmentResponse;
import apsas.content.model.dto.CreateAssignmentRequest;
import apsas.content.model.dto.UpdateAssignmentRequest;
import apsas.content.model.entity.Assignment;
import apsas.content.model.entity.AssignmentStatus;
import apsas.content.model.entity.Skill;
import apsas.content.model.entity.Tutorial;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class AssignmentMapper {

  private final SkillMapper skillMapper;
  private final TutorialMapper tutorialMapper;

  public AssignmentMapper(SkillMapper skillMapper, TutorialMapper tutorialMapper) {
    this.skillMapper = skillMapper;
    this.tutorialMapper = tutorialMapper;
  }

  public Assignment toEntity(CreateAssignmentRequest request, UUID creatorId) {
    Assignment assignment = new Assignment();
    assignment.setTitle(request.getTitle());
    assignment.setDescription(request.getDescription());
    assignment.setDifficultyLevel(request.getDifficultyLevel());
    assignment.setCreatorId(creatorId);
    assignment.setStartDate(request.getStartDate());
    assignment.setDueDate(request.getDueDate());
    assignment.setMaxScore(request.getMaxScore());
    assignment.setStatus(AssignmentStatus.DRAFT);
    assignment.setLanguages(request.getLanguages());
    assignment.setTestCases(request.getTestCases());
    return assignment;
  }

  public void updateEntity(Assignment assignment, UpdateAssignmentRequest request) {
    if (request.getTitle() != null) {
      assignment.setTitle(request.getTitle());
    }
    if (request.getDescription() != null) {
      assignment.setDescription(request.getDescription());
    }
    if (request.getDifficultyLevel() != null) {
      assignment.setDifficultyLevel(request.getDifficultyLevel());
    }
    if (request.getStartDate() != null) {
      assignment.setStartDate(request.getStartDate());
    }
    if (request.getDueDate() != null) {
      assignment.setDueDate(request.getDueDate());
    }
    if (request.getMaxScore() != null) {
      assignment.setMaxScore(request.getMaxScore());
    }
    if (request.getLanguages() != null) {
      assignment.setLanguages(request.getLanguages());
    }
    if (request.getTestCases() != null) {
      assignment.setTestCases(request.getTestCases());
    }
  }

  public void updateSkills(Assignment assignment, Set<Skill> skills) {
    assignment.getSkills().clear();
    if (skills != null) {
      assignment.getSkills().addAll(skills);
    }
  }

  public void updateTutorials(Assignment assignment, Set<Tutorial> tutorials) {
    assignment.getTutorials().clear();
    if (tutorials != null) {
      assignment.getTutorials().addAll(tutorials);
    }
  }

  public AssignmentResponse toResponse(Assignment assignment) {
    AssignmentResponse response = new AssignmentResponse();
    response.setId(assignment.getId());
    response.setTitle(assignment.getTitle());
    response.setDescription(assignment.getDescription());
    response.setDifficultyLevel(assignment.getDifficultyLevel());
    response.setCreatorId(assignment.getCreatorId());
    response.setCreatedAt(assignment.getCreatedAt());
    response.setUpdatedAt(assignment.getUpdatedAt());
    response.setStartDate(assignment.getStartDate());
    response.setDueDate(assignment.getDueDate());
    response.setMaxScore(assignment.getMaxScore());
    response.setStatus(assignment.getStatus());
    response.setLanguages(assignment.getLanguages());
    response.setTestCases(assignment.getTestCases());

    // Map skills
    if (assignment.getSkills() != null) {
      response.setSkills(
          assignment.getSkills().stream().map(skillMapper::toResponse).collect(Collectors.toSet()));
    } else {
      response.setSkills(new HashSet<>());
    }

    // Map tutorials
    if (assignment.getTutorials() != null) {
      response.setTutorials(
          assignment.getTutorials().stream()
              .map(tutorialMapper::toResponse)
              .collect(Collectors.toSet()));
    } else {
      response.setTutorials(new HashSet<>());
    }

    return response;
  }
}
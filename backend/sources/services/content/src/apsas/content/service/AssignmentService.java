package apsas.content.service;

import apsas.content.mapper.AssignmentMapper;
import apsas.content.model.dto.AssignmentResponse;
import apsas.content.model.dto.CreateAssignmentRequest;
import apsas.content.model.dto.UpdateAssignmentRequest;
import apsas.content.model.dto.UpdateAssignmentScheduleRequest;
import apsas.content.model.entity.Assignment;
import apsas.content.model.entity.AssignmentStatus;
import apsas.content.model.entity.Skill;
import apsas.content.model.entity.Tutorial;
import apsas.content.repository.AssignmentRepository;
import apsas.content.repository.SkillRepository;
import apsas.content.repository.TutorialRepository;
import apsas.shared.exception.BadRequestException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.exception.UnauthorizedException;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.AssignmentPublishedEvent;
import apsas.shared.messaging.event.AssignmentScheduleUpdatedEvent;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.models.pagination.PageResponse;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssignmentService {
  private final AssignmentRepository assignmentRepository;
  private final SkillRepository skillRepository;
  private final TutorialRepository tutorialRepository;
  private final AssignmentMapper assignmentMapper;
  private final EventPublisher eventPublisher;

  @Transactional(readOnly = true)
  public PageResponse<AssignmentResponse> getAllAssignments(Pageable pageable) {
    Page<Assignment> assignmentPage = assignmentRepository.findAll(pageable);
    Page<AssignmentResponse> responsePage = assignmentPage.map(assignmentMapper::toResponse);
    return PageResponse.of(responsePage);
  }

  @Transactional(readOnly = true)
  public AssignmentResponse getAssignmentById(UUID id) {
    Assignment assignment =
        assignmentRepository
            .findById(id)
            .orElseThrow(
                () -> new NotFoundException("Assignment not found with id: " + id));
    return assignmentMapper.toResponse(assignment);
  }

  @Transactional
  public AssignmentResponse createAssignment(CreateAssignmentRequest request, UUID creatorId) {
    validateDates(request.getStartDate(), request.getDueDate());

    Assignment assignment = assignmentMapper.toEntity(request, creatorId);

    // Set skills
    if (request.getSkillIds() != null && !request.getSkillIds().isEmpty()) {
      Set<Skill> skills = new HashSet<>(skillRepository.findAllById(request.getSkillIds()));
      if (skills.size() != request.getSkillIds().size()) {
        throw new BadRequestException("One or more skill IDs are invalid");
      }
      assignment.setSkills(skills);
    }

    // Set tutorials
    if (request.getTutorialIds() != null && !request.getTutorialIds().isEmpty()) {
      Set<Tutorial> tutorials =
          new HashSet<>(tutorialRepository.findAllById(request.getTutorialIds()));
      if (tutorials.size() != request.getTutorialIds().size()) {
        throw new BadRequestException("One or more tutorial IDs are invalid");
      }
      assignment.setTutorials(tutorials);
    }

    Assignment savedAssignment = assignmentRepository.save(assignment);
    return assignmentMapper.toResponse(savedAssignment);
  }

  @Transactional
  public AssignmentResponse updateAssignment(
      UUID id, UpdateAssignmentRequest request, UUID userId) {
    Assignment assignment =
        assignmentRepository
            .findById(id)
            .orElseThrow(
                () -> new NotFoundException("Assignment not found with id: " + id));

    if (!assignment.getCreatorId().equals(userId)) {
      throw new UnauthorizedException("You are not authorized to update this assignment");
    }

    if (request.getStartDate() != null || request.getDueDate() != null) {
      LocalDateTime startDate =
          request.getStartDate() != null ? request.getStartDate() : assignment.getStartDate();
      LocalDateTime dueDate =
          request.getDueDate() != null ? request.getDueDate() : assignment.getDueDate();
      validateDates(startDate, dueDate);
    }

    assignmentMapper.updateEntity(assignment, request);

    // Update skills
    if (request.getSkillIds() != null) {
      Set<Skill> skills = new HashSet<>(skillRepository.findAllById(request.getSkillIds()));
      if (skills.size() != request.getSkillIds().size()) {
        throw new BadRequestException("One or more skill IDs are invalid");
      }
      assignment.getSkills().clear();
      assignment.getSkills().addAll(skills);
    }

    // Update tutorials
    if (request.getTutorialIds() != null) {
      Set<Tutorial> tutorials =
          new HashSet<>(tutorialRepository.findAllById(request.getTutorialIds()));
      if (tutorials.size() != request.getTutorialIds().size()) {
        throw new BadRequestException("One or more tutorial IDs are invalid");
      }
      assignment.getTutorials().clear();
      assignment.getTutorials().addAll(tutorials);
    }

    Assignment updatedAssignment = assignmentRepository.save(assignment);
    return assignmentMapper.toResponse(updatedAssignment);
  }

  @Transactional
  public AssignmentResponse updateAssignmentSchedule(
      UUID id, UpdateAssignmentScheduleRequest request) {
    Assignment assignment =
        assignmentRepository
            .findById(id)
            .orElseThrow(
                () -> new NotFoundException("Assignment not found with id: " + id));

    validateDates(request.getStartDate(), request.getDueDate());

    assignment.setStartDate(request.getStartDate());
    assignment.setDueDate(request.getDueDate());

    Assignment updatedAssignment = assignmentRepository.save(assignment);

    // Publish event for schedule update
    AssignmentScheduleUpdatedEvent event =
        new AssignmentScheduleUpdatedEvent(
            assignment.getId(), request.getStartDate(), request.getDueDate(), LocalDateTime.now());
    eventPublisher.publish(RabbitMqConfig.ASSIGNMENT_SCHEDULE_UPDATED_ROUTING_KEY, event);

    return assignmentMapper.toResponse(updatedAssignment);
  }

  @Transactional
  public void deleteAssignment(UUID id, UUID userId) {
    Assignment assignment =
        assignmentRepository
            .findById(id)
            .orElseThrow(
                () -> new NotFoundException("Assignment not found with id: " + id));

    if (!assignment.getCreatorId().equals(userId)) {
      throw new UnauthorizedException("You are not authorized to delete this assignment");
    }

    assignmentRepository.deleteById(id);
  }

  @Transactional
  public AssignmentResponse publishAssignment(UUID id, UUID userId) {
    Assignment assignment =
        assignmentRepository
            .findById(id)
            .orElseThrow(
                () -> new NotFoundException("Assignment not found with id: " + id));

    if (!assignment.getCreatorId().equals(userId)) {
      throw new UnauthorizedException("You are not authorized to publish this assignment");
    }

    if (assignment.getStatus() != AssignmentStatus.DRAFT) {
      throw new BadRequestException("Only draft assignments can be published");
    }

    assignment.setStatus(AssignmentStatus.PUBLISHED);
    Assignment publishedAssignment = assignmentRepository.save(assignment);

    // Publish event for assignment publication
    AssignmentPublishedEvent event =
        new AssignmentPublishedEvent(
            assignment.getId(), assignment.getTitle(), LocalDateTime.now());
    eventPublisher.publish(RabbitMqConfig.ASSIGNMENT_PUBLISHED_ROUTING_KEY, event);

    return assignmentMapper.toResponse(publishedAssignment);
  }

  @Transactional
  public AssignmentResponse archiveAssignment(UUID id, UUID userId) {
    Assignment assignment =
        assignmentRepository
            .findById(id)
            .orElseThrow(
                () -> new NotFoundException("Assignment not found with id: " + id));

    if (!assignment.getCreatorId().equals(userId)) {
      throw new UnauthorizedException("You are not authorized to archive this assignment");
    }

    if (assignment.getStatus() == AssignmentStatus.ARCHIVED) {
      throw new BadRequestException("Assignment is already archived");
    }

    assignment.setStatus(AssignmentStatus.ARCHIVED);
    Assignment archivedAssignment = assignmentRepository.save(assignment);

    return assignmentMapper.toResponse(archivedAssignment);
  }

  private void validateDates(LocalDateTime startDate, LocalDateTime dueDate) {
    if (startDate != null && dueDate != null && dueDate.isBefore(startDate)) {
      throw new BadRequestException("Due date must be after start date");
    }
  }
}

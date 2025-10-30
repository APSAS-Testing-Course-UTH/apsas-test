package apsas.content.service;

import apsas.content.exception.BadRequestException;
import apsas.content.exception.ResourceNotFoundException;
import apsas.content.mapper.SkillMapper;
import apsas.content.model.dto.CreateSkillRequest;
import apsas.content.model.dto.SkillResponse;
import apsas.content.model.dto.UpdateSkillRequest;
import apsas.content.model.entity.Skill;
import apsas.content.repository.SkillRepository;
import apsas.shared.common.dto.PageResponse;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SkillService {

  private final SkillRepository skillRepository;
  private final SkillMapper skillMapper;

  public SkillService(SkillRepository skillRepository, SkillMapper skillMapper) {
    this.skillRepository = skillRepository;
    this.skillMapper = skillMapper;
  }

  @Transactional(readOnly = true)
  public List<SkillResponse> getAllSkills() {
    return skillRepository.findAll().stream()
        .map(skillMapper::toResponse)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public PageResponse<SkillResponse> getAllSkills(Pageable pageable) {
    Page<Skill> skillPage = skillRepository.findAll(pageable);
    Page<SkillResponse> responsePage = skillPage.map(skillMapper::toResponse);
    return PageResponse.of(responsePage);
  }

  @Transactional(readOnly = true)
  public SkillResponse getSkillById(UUID id) {
    Skill skill =
        skillRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));
    return skillMapper.toResponse(skill);
  }

  @Transactional
  public SkillResponse createSkill(CreateSkillRequest request) {
    if (skillRepository.existsByName(request.getName())) {
      throw new BadRequestException("Skill with name '" + request.getName() + "' already exists");
    }

    Skill skill = skillMapper.toEntity(request);
    Skill savedSkill = skillRepository.save(skill);
    return skillMapper.toResponse(savedSkill);
  }

  @Transactional
  public SkillResponse updateSkill(UUID id, UpdateSkillRequest request) {
    Skill skill =
        skillRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));

    if (request.getName() != null && !request.getName().equals(skill.getName())) {
      if (skillRepository.existsByName(request.getName())) {
        throw new BadRequestException("Skill with name '" + request.getName() + "' already exists");
      }
    }

    skillMapper.updateEntity(skill, request);
    Skill updatedSkill = skillRepository.save(skill);
    return skillMapper.toResponse(updatedSkill);
  }

  @Transactional
  public void deleteSkill(UUID id) {
    if (!skillRepository.existsById(id)) {
      throw new ResourceNotFoundException("Skill not found with id: " + id);
    }
    skillRepository.deleteById(id);
  }
}
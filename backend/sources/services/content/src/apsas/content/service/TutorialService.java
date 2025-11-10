package apsas.content.service;

import apsas.content.mapper.TutorialMapper;
import apsas.content.model.dto.CreateTutorialRequest;
import apsas.content.model.dto.TutorialResponse;
import apsas.content.model.dto.UpdateTutorialRequest;
import apsas.content.model.entity.Tutorial;
import apsas.content.repository.TutorialRepository;
import apsas.shared.cache.CacheConfig;
import apsas.shared.exception.NotFoundException;
import apsas.shared.exception.UnauthorizedException;
import apsas.shared.models.pagination.PageResponse;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TutorialService {
  private final TutorialRepository tutorialRepository;
  private final TutorialMapper tutorialMapper;

  @Transactional(readOnly = true)
  public PageResponse<TutorialResponse> getAllTutorials(Pageable pageable) {
    Page<Tutorial> tutorialPage = tutorialRepository.findAll(pageable);
    Page<TutorialResponse> responsePage = tutorialPage.map(tutorialMapper::toResponse);
    return PageResponse.of(responsePage);
  }

  @Cacheable(value = CacheConfig.TUTORIALS_CACHE, key = "#id", unless = "#result == null")
  @Transactional(readOnly = true)
  public TutorialResponse getTutorialById(UUID id) {
    Tutorial tutorial =
        tutorialRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Tutorial not found with id: " + id));
    return tutorialMapper.toResponse(tutorial);
  }

  @Transactional
  public TutorialResponse createTutorial(CreateTutorialRequest request, UUID creatorId) {
    Tutorial tutorial = tutorialMapper.toEntity(request, creatorId);
    Tutorial savedTutorial = tutorialRepository.save(tutorial);
    return tutorialMapper.toResponse(savedTutorial);
  }

  @CachePut(value = CacheConfig.TUTORIALS_CACHE, key = "#id")
  @Transactional
  public TutorialResponse updateTutorial(UUID id, UpdateTutorialRequest request, UUID userId) {
    Tutorial tutorial =
        tutorialRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Tutorial not found with id: " + id));

    if (!tutorial.getCreatorId().equals(userId)) {
      throw new UnauthorizedException("You are not authorized to update this tutorial");
    }

    tutorialMapper.updateEntity(tutorial, request);
    Tutorial updatedTutorial = tutorialRepository.save(tutorial);
    return tutorialMapper.toResponse(updatedTutorial);
  }

  @CacheEvict(value = CacheConfig.TUTORIALS_CACHE, key = "#id")
  @Transactional
  public void deleteTutorial(UUID id, UUID userId) {
    Tutorial tutorial =
        tutorialRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Tutorial not found with id: " + id));

    if (!tutorial.getCreatorId().equals(userId)) {
      throw new UnauthorizedException("You are not authorized to delete this tutorial");
    }

    tutorialRepository.deleteById(id);
  }
}

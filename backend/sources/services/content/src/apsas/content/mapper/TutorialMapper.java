package apsas.content.mapper;

import apsas.content.model.dto.CreateTutorialRequest;
import apsas.content.model.dto.TutorialResponse;
import apsas.content.model.dto.UpdateTutorialRequest;
import apsas.content.model.entity.Tutorial;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class TutorialMapper {

  public Tutorial toEntity(CreateTutorialRequest request, UUID creatorId) {
    Tutorial tutorial = new Tutorial();
    tutorial.setTitle(request.getTitle());
    tutorial.setContent(request.getContent());
    tutorial.setCreatorId(creatorId);
    tutorial.setTags(request.getTags());
    return tutorial;
  }

  public void updateEntity(Tutorial tutorial, UpdateTutorialRequest request) {
    if (request.getTitle() != null) {
      tutorial.setTitle(request.getTitle());
    }
    if (request.getContent() != null) {
      tutorial.setContent(request.getContent());
    }
    if (request.getTags() != null) {
      tutorial.setTags(request.getTags());
    }
  }

  public TutorialResponse toResponse(Tutorial tutorial) {
    TutorialResponse response = new TutorialResponse();
    response.setId(tutorial.getId());
    response.setTitle(tutorial.getTitle());
    response.setContent(tutorial.getContent());
    response.setCreatorId(tutorial.getCreatorId());
    response.setCreatedAt(tutorial.getCreatedAt());
    response.setUpdatedAt(tutorial.getUpdatedAt());
    response.setTags(tutorial.getTags());
    return response;
  }
}
package apsas.content.controller;

import apsas.content.model.entity.Assignment;
import apsas.content.model.entity.AssignmentStatus;
import apsas.content.model.entity.DifficultyLevel;
import apsas.content.model.entity.Skill;
import apsas.content.model.entity.TestCase;
import apsas.content.model.entity.Tutorial;
import apsas.content.repository.AssignmentRepository;
import apsas.content.repository.SkillRepository;
import apsas.content.repository.TutorialRepository;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.security.UserPrincipal;
import apsas.shared.security.UserPrincipals;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.qameta.allure.Epic;
import io.qameta.allure.Owner;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.convention.TestBean;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
    "spring.config.name=application-test",
    "spring.cloud.config.enabled=false",
    "spring.cloud.config.import-check.enabled=false",
    "spring.cloud.discovery.enabled=false",
    "eureka.client.enabled=false",
    "logging.level.org.springframework.jdbc.datasource.init=DEBUG"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Epic("Content Service")
@Owner("qa-team")
abstract class BaseContentControllerIT {

  @TestBean
  @SuppressWarnings("unused")
  CacheManager cacheManager;

  static CacheManager cacheManager() {
    return new ConcurrentMapCacheManager();
  }

  @Autowired
  protected ObjectMapper objectMapper;

  @Autowired
  protected AssignmentRepository assignmentRepository;

  @Autowired
  protected SkillRepository skillRepository;

  @Autowired
  protected TutorialRepository tutorialRepository;

  @MockitoBean
  protected EventPublisher eventPublisher;

  protected String userInfoHeader(String role, UUID userId) {
    UserPrincipal principal = UserPrincipal.builder()
        .userId(userId)
        .email(role.toLowerCase() + "@apsas.dev")
        .firstName("Test")
        .lastName("User")
        .role(role)
        .isActive(true)
        .build();

    return UserPrincipals.toBase64(principal)
        .orElseThrow(() -> new IllegalStateException("Cannot encode principal header"));
  }

  protected Skill createSkill(String name) {
    Skill skill = new Skill();
    skill.setName(name);
    skill.setDescription("Description for " + name);
    return skillRepository.save(skill);
  }

  protected Tutorial createTutorial(UUID creatorId, String title) {
    Tutorial tutorial = new Tutorial();
    tutorial.setTitle(title);
    tutorial.setContent("Tutorial content");
    tutorial.setCreatorId(creatorId);
    tutorial.setTags(new String[]{"tag-1"});
    return tutorialRepository.save(tutorial);
  }

  protected Assignment createAssignment(
      UUID creatorId,
      AssignmentStatus status,
      boolean includeHiddenTestCase
  ) {
    Assignment assignment = new Assignment();
    assignment.setTitle("Assignment " + UUID.randomUUID());
    assignment.setDescription("Assignment description");
    assignment.setDifficultyLevel(DifficultyLevel.EASY);
    assignment.setCreatorId(creatorId);
    assignment.setStartDate(LocalDateTime.now().plusDays(1));
    assignment.setDueDate(LocalDateTime.now().plusDays(2));
    assignment.setMaxScore(new BigDecimal("100.00"));
    assignment.setStatus(status);
    assignment.setLanguages(new String[]{"java"});

    TestCase visible = new TestCase();
    visible.setOrder(1);
    visible.setDescription("visible");
    visible.setHidden(false);
    visible.setInput("in");
    visible.setOutput("out");
    visible.setWeight(1.0);
    visible.setTimeout(5);
    visible.setMemoryLimit(256);

    if (includeHiddenTestCase) {
      TestCase hidden = new TestCase();
      hidden.setOrder(2);
      hidden.setDescription("hidden");
      hidden.setHidden(true);
      hidden.setInput("secret-input");
      hidden.setOutput("secret-output");
      hidden.setWeight(1.0);
      hidden.setTimeout(5);
      hidden.setMemoryLimit(256);
      assignment.setTestCases(List.of(visible, hidden));
    } else {
      assignment.setTestCases(List.of(visible));
    }

    return assignmentRepository.save(assignment);
  }
}

package apsas.content.model.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

@Setter
@Getter
@Entity
@Table(name = "assignments", schema = "content")
public class Assignment {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(name = "difficulty_level", nullable = false, length = 50)
  private DifficultyLevel difficultyLevel;

  @Column(name = "creator_id", nullable = false)
  private UUID creatorId;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @Column(name = "start_date")
  private LocalDateTime startDate;

  @Column(name = "due_date")
  private LocalDateTime dueDate;

  @Column(name = "max_score", nullable = false, precision = 5, scale = 2)
  private BigDecimal maxScore;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private AssignmentStatus status;

  @Type(JsonType.class)
  @Column(nullable = false, columnDefinition = "jsonb")
  private String[] languages;

  @Type(JsonType.class)
  @Column(name = "test_cases", nullable = false, columnDefinition = "jsonb")
  private List<TestCase> testCases;

  @ManyToMany
  @JoinTable(
      name = "assignment_skills",
      schema = "content",
      joinColumns = @JoinColumn(name = "assignment_id"),
      inverseJoinColumns = @JoinColumn(name = "skill_id")
  )
  private Set<Skill> skills = new HashSet<>();

  @ManyToMany
  @JoinTable(
      name = "assignment_tutorials",
      schema = "content",
      joinColumns = @JoinColumn(name = "assignment_id"),
      inverseJoinColumns = @JoinColumn(name = "tutorial_id")
  )
  private Set<Tutorial> tutorials = new HashSet<>();

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}

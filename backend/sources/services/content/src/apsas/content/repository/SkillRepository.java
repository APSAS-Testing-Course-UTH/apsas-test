package apsas.content.repository;

import apsas.content.model.entity.Skill;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {
  boolean existsByName(String name);
}

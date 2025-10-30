package apsas.content.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import apsas.content.model.entity.Tutorial;

@Repository
public interface TutorialRepository extends JpaRepository<Tutorial, UUID> {}

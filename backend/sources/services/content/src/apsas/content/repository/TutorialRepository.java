package apsas.content.repository;

import apsas.content.model.entity.Tutorial;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TutorialRepository extends JpaRepository<Tutorial, UUID> {}

package apsas.content.repository;

import apsas.content.model.entity.Assignment;
import apsas.content.model.entity.AssignmentStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
  Page<Assignment> findByStatus(AssignmentStatus status, Pageable pageable);

  Page<Assignment> findByCreatorId(UUID creatorId, Pageable pageable);
}

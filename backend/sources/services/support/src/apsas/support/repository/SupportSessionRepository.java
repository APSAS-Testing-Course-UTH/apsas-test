package apsas.support.repository;

import apsas.support.model.entity.SupportSession;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportSessionRepository extends JpaRepository<SupportSession, UUID> {

  List<SupportSession> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

  Page<SupportSession> findByStudentIdOrderByCreatedAtDesc(UUID studentId, Pageable pageable);

  List<SupportSession> findByIsClosedOrderByCreatedAtDesc(Boolean isClosed);
}

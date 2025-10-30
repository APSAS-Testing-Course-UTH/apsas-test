package apsas.submission.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import apsas.submission.model.entity.Submission;
import apsas.submission.model.entity.SubmissionStatus;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

  List<Submission> findByStudentId(UUID studentId);

  List<Submission> findByAssignmentId(UUID assignmentId);

  List<Submission> findByAssignmentIdAndStudentId(UUID assignmentId, UUID studentId);

  @Query(
      "SELECT s FROM Submission s WHERE "
          + "(:assignmentId IS NULL OR s.assignmentId = :assignmentId) AND "
          + "(:studentId IS NULL OR s.studentId = :studentId) AND "
          + "(:status IS NULL OR s.status = :status) "
          + "ORDER BY s.submittedAt DESC")
  List<Submission> findByFilters(
      @Param("assignmentId") UUID assignmentId,
      @Param("studentId") UUID studentId,
      @Param("status") SubmissionStatus status);

  @Query(
      "SELECT s FROM Submission s WHERE "
          + "(:assignmentId IS NULL OR s.assignmentId = :assignmentId) AND "
          + "(:studentId IS NULL OR s.studentId = :studentId) AND "
          + "(:status IS NULL OR s.status = :status)")
  Page<Submission> findByFilters(
      @Param("assignmentId") UUID assignmentId,
      @Param("studentId") UUID studentId,
      @Param("status") SubmissionStatus status,
      Pageable pageable);
}

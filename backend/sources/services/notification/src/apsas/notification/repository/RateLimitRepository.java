package apsas.notification.repository;

import apsas.notification.model.entity.RateLimit;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RateLimitRepository extends JpaRepository<RateLimit, UUID> {

  Optional<RateLimit> findByUserIdAndNotificationTypeAndWindowStart(
      UUID userId, String notificationType, LocalDateTime windowStart);

  @Modifying
  @Query("DELETE FROM RateLimit r WHERE r.windowStart < :expiryTime")
  void deleteExpiredWindows(@Param("expiryTime") LocalDateTime expiryTime);
}

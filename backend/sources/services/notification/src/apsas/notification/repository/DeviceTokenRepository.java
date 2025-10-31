package apsas.notification.repository;

import apsas.notification.model.entity.DeviceToken;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {

  Optional<DeviceToken> findByToken(String token);

  List<DeviceToken> findByUserIdAndIsActive(UUID userId, Boolean isActive);

  List<DeviceToken> findByUserId(UUID userId);

  boolean existsByToken(String token);

  void deleteByToken(String token);
}

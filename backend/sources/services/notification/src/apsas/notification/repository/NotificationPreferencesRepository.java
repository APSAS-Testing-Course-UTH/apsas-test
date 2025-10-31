package apsas.notification.repository;

import apsas.notification.model.entity.NotificationPreferences;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationPreferencesRepository
    extends JpaRepository<NotificationPreferences, UUID> {

  Optional<NotificationPreferences> findByUserId(UUID userId);

  boolean existsByUserId(UUID userId);
}

package apsas.identity.repository;

import apsas.identity.model.entity.EmailVerificationToken;
import apsas.identity.model.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationTokenRepository
    extends JpaRepository<EmailVerificationToken, UUID> {

  Optional<EmailVerificationToken> findByToken(String token);

  Optional<EmailVerificationToken> findByUser(User user);
}

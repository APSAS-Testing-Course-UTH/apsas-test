package apsas.identity.repository;

import apsas.identity.model.entity.User;
import apsas.identity.model.entity.UserRole;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);

  List<User> findByRole(UserRole role);

  Page<User> findByRole(UserRole role, Pageable pageable);
}

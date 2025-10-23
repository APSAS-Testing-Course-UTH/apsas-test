package apsas.identity.security;

import apsas.identity.model.entity.User;
import apsas.identity.repository.UserRepository;
import apsas.shared.security.UserPrincipal;
import java.util.UUID;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

  public CustomUserDetailsService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
    try {
      var user = getUser(userId);
      return new UserPrincipal(
          user.getId(),
          user.getEmail(),
          user.getFirstName(),
          user.getLastName(),
          user.getRole().name(),
          user.getIsActive());
    } catch (IllegalArgumentException e) {
      throw new UsernameNotFoundException("Invalid user ID format: " + userId);
    }
  }

  private User getUser(String username) {
    if (username.contains("@")) {
      return userRepository
          .findByEmail(username)
          .orElseThrow(
              () -> new UsernameNotFoundException("User not found with email: " + username));
    }
    try {
      UUID userId = UUID.fromString(username);
      return userRepository
          .findById(userId)
          .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + username));
    } catch (IllegalArgumentException e) {
      throw new UsernameNotFoundException("Invalid user ID format: " + username);
    }
  }
}
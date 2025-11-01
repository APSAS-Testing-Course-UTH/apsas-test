package apsas.feign.client;

import apsas.feign.dto.UserResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Feign client for calling Identity Service internal endpoints. This client is used by other
 * microservices to fetch user details.
 */
@FeignClient(name = "identity-service", path = "/internal/users")
public interface UserFeignClient {

  /**
   * Get user by ID
   *
   * @param id User ID
   * @return User details
   */
  @GetMapping("/{id}")
  UserResponse getUserById(
      @PathVariable
      UUID id
  );

  /**
   * Get multiple users by their IDs in a batch
   *
   * @param userIds List of user IDs
   * @return List of user details
   */
  @PostMapping("/batch")
  List<UserResponse> getBatchUsers(
      @RequestBody
      List<UUID> userIds
  );

  /**
   * Get users filtered by role
   *
   * @param role User role (STUDENT, INSTRUCTOR, CONTENT_PROVIDER, ADMIN)
   * @return List of users with the specified role
   */
  @GetMapping("/by-role")
  List<UserResponse> getUsersByRole(
      @RequestParam("role")
      String role
  );
}

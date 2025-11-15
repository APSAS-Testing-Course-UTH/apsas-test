package apsas.portal.admin.client;

import apsas.portal.admin.dto.CreateUserRequest;
import apsas.portal.admin.dto.UserResponse;
import apsas.shared.models.pagination.PageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "identity-service")
public interface IdentityServiceClient {
  @GetMapping("/api/v1/users")
  PageResponse<UserResponse> getAllUsers(
      @RequestParam
      Integer page,
      @RequestParam
      Integer size
  );

  @GetMapping("/api/v1/users/role/{role}")
  PageResponse<UserResponse> getUsersByRole(
      @PathVariable
      String role,
      @RequestParam
      Integer page,
      @RequestParam
      Integer size
  );

  @GetMapping("/api/v1/users/{id}")
  UserResponse getUserById(
      @PathVariable
      String id
  );

  @PostMapping("/api/v1/users")
  UserResponse createUser(
      @RequestBody
      CreateUserRequest request
  );

  @PostMapping("/api/v1/users/{id}/activate")
  UserResponse activateUser(
      @PathVariable
      String id
  );

  @PostMapping("/api/v1/users/{id}/deactivate")
  UserResponse deactivateUser(
      @PathVariable
      String id
  );

  @DeleteMapping("/api/v1/users/{id}")
  void deleteUser(
      @PathVariable
      String id
  );
}

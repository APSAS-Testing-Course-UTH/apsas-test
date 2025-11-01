package apsas.identity.controller;

import apsas.identity.mapper.FeignUserMapper;
import apsas.identity.service.UserService;
import io.swagger.v3.oas.annotations.Hidden;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Internal API controller for inter-service communication. Not exposed through API Gateway - only
 * accessible within the service mesh.
 */
@Hidden // Hide from public Swagger docs
@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

  private final UserService userService;
  private final FeignUserMapper feignUserMapper;

  /**
   * Internal endpoint to get user details for other services Used by notification service and other
   * internal services
   *
   * @param id User ID
   * @return User details DTO
   */
  @GetMapping("/{id}")
  public apsas.feign.dto.UserResponse getUserInternal(
      @PathVariable
      UUID id
  ) {
    return feignUserMapper.toFeignDto(userService.getUserById(id));
  }

  /**
   * Internal endpoint to get multiple users by IDs Useful for batch operations
   *
   * @param ids List of user IDs
   * @return List of user details
   */
  @PostMapping("/batch")
  public List<apsas.feign.dto.UserResponse> getUsersBatchInternal(
      @RequestBody
      List<UUID> ids
  ) {
    return userService.findUsersByIds(ids).stream()
        .map(feignUserMapper::toFeignDto)
        .collect(Collectors.toList());
  }

  /**
   * Internal endpoint to get users by role
   *
   * @param role User role filter
   * @return List of user details
   */
  @GetMapping("/by-role")
  public List<apsas.feign.dto.UserResponse> getUsersByRoleInternal(
      @RequestParam
      String role
  ) {
    return userService.getUsersByRole(role).stream()
        .map(feignUserMapper::toFeignDto)
        .collect(Collectors.toList());
  }
}

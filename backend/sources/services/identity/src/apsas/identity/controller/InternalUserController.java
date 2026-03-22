package apsas.identity.controller;

import apsas.identity.mapper.FeignUserMapper;
import apsas.identity.service.UserService;
import io.swagger.v3.oas.annotations.Hidden;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bộ điều khiển API nội bộ phục vụ giao tiếp giữa các dịch vụ trong hệ thống APSAS. Không công khai
 * qua API Gateway, chỉ truy cập trong service mesh.
 */
@Hidden // Hide from public Swagger docs
@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

  private final UserService userService;
  private final FeignUserMapper feignUserMapper;

  /**
   * API nội bộ lấy thông tin người dùng theo ID. Được sử dụng bởi các dịch vụ như notification và
   * các dịch vụ nội bộ khác.
   *
   * @param id ID người dùng
   * @return DTO thông tin người dùng
   */
  @GetMapping("/{id}")
  public apsas.feign.dto.UserResponse getUserInternal(@PathVariable UUID id) {
    return feignUserMapper.toFeignDto(userService.getUserById(id));
  }

  /**
   * API nội bộ lấy thông tin nhiều người dùng theo danh sách ID. Hữu ích cho các thao tác hàng loạt
   * giữa các dịch vụ.
   *
   * @param ids Danh sách ID người dùng
   * @return Danh sách DTO thông tin người dùng
   */
  @PostMapping("/batch")
  public List<apsas.feign.dto.UserResponse> getUsersBatchInternal(@RequestBody List<UUID> ids) {
    return userService.findUsersByIds(ids).stream().map(feignUserMapper::toFeignDto).toList();
  }

  /**
   * API nội bộ lấy danh sách người dùng theo vai trò.
   *
   * @param role Bộ lọc vai trò người dùng
   * @return Danh sách DTO thông tin người dùng
   */
  @GetMapping("/by-role")
  public List<apsas.feign.dto.UserResponse> getUsersByRoleInternal(@RequestParam String role) {
    return userService.getUsersByRole(role).stream().map(feignUserMapper::toFeignDto).toList();
  }
}

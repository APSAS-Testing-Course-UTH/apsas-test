package apsas.shared.security;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Đại diện cho thông tin người dùng trong hệ thống bảo mật.
 *
 * @param userId    ID người dùng
 * @param email     Địa chỉ email người dùng
 * @param firstName Tên người dùng
 * @param lastName  Họ người dùng
 * @param role      Vai trò của người dùng
 * @param isActive  Trạng thái tài khoản người dùng
 */
@Builder
public record UserPrincipal(
    UUID userId,
    String email,
    String firstName,
    String lastName,
    String role,
    boolean isActive
) implements UserDetails {
  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role));
  }

  @Override
  public String getPassword() {
    return null;
  }

  @Override
  public String getUsername() {
    return userId.toString();
  }

  @Override
  public boolean isAccountNonLocked() {
    return isActive;
  }

  @Override
  public boolean isEnabled() {
    return isActive;
  }
}

package apsas.portal.admin.security;

import apsas.shared.security.UserPrincipal;
import java.util.Collection;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;

public record PrincipalWrapper(
    @NonNull UserPrincipal principal,
    @NonNull Jwt jwt
) implements UserDetails {
  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return principal.getAuthorities();
  }

  @Override
  public String getPassword() {
    return jwt.getTokenValue();
  }

  @Override
  public String getUsername() {
    return principal.email();
  }

  @Override
  public boolean isAccountNonExpired() {
    return principal.isAccountNonExpired();
  }

  @Override
  public boolean isAccountNonLocked() {
    return principal.isAccountNonLocked();
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return principal.isCredentialsNonExpired();
  }

  @Override
  public boolean isEnabled() {
    return principal.isEnabled();
  }
}

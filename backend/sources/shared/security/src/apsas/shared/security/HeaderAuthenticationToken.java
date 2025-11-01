package apsas.shared.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;

/**
 * Lớp đại diện cho token xác thực dựa trên thông tin người dùng trong header.
 */
public class HeaderAuthenticationToken extends AbstractAuthenticationToken {
  private final UserPrincipal principal;

  public HeaderAuthenticationToken(UserPrincipal principal) {
    super(principal.getAuthorities());
    this.principal = principal;
    super.setAuthenticated(true);
  }

  @Override
  public void setAuthenticated(boolean authenticated) {}

  @Override
  public Object getCredentials() {
    return null;
  }

  @Override
  public Object getPrincipal() {
    return principal;
  }
}

package apsas.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Lớp lọc xác thực người dùng dựa trên thông tin trong header của yêu cầu HTTP.
 */
public class HeaderAuthenticationFilter extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(
      @NonNull
      HttpServletRequest request,
      @NonNull
      HttpServletResponse response,
      FilterChain filterChain
  )
      throws ServletException, IOException {
    UserPrincipals.fromHeader(request)
        .ifPresent(
            principal -> {
              var token = new HeaderAuthenticationToken(principal);
              SecurityContextHolder.getContext().setAuthentication(token);
            });

    filterChain.doFilter(request, response);
  }
}

package apsas.portal.admin.controller;

import apsas.portal.admin.security.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
@Slf4j
public class AuthController {
  private final CustomUserDetailsService customUserDetailsService;

  @GetMapping("/login-token")
  public String login(
      @RequestParam(required = false)
      String token,
      HttpServletRequest request
  ) {
    if (token == null || token.trim().isEmpty()) {
      return "redirect:/login?error";
    }

    try {
      var userDetails = customUserDetailsService.loadUserByUsername(token);

      boolean isAdmin = userDetails.getAuthorities().stream()
          .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

      if (!isAdmin) {
        log.warn("Non-admin user attempted to access admin portal: {}", userDetails.getUsername());
        return "redirect:/login?error";
      }

      var authentication = new UsernamePasswordAuthenticationToken(
          userDetails,
          token,
          userDetails.getAuthorities()
      );

      SecurityContextHolder.getContext().setAuthentication(authentication);

      request.getSession().setAttribute(
          HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
          SecurityContextHolder.getContext()
      );

      log.info("Admin user logged in successfully: {}", userDetails.getUsername());
      return "redirect:/";
    } catch (Exception e) {
      log.warn("Failed to authenticate with token", e);
      return "redirect:/login?error";
    }
  }
}

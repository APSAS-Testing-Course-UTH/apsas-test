package apsas.portal.admin.config;

import apsas.portal.admin.security.PrincipalWrapper;
import apsas.shared.security.UserPrincipals;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
public class FeignConfig {

  @Bean
  public RequestInterceptor requestInterceptor() {
    return requestTemplate -> {
      var authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication == null
          || !(authentication.getPrincipal() instanceof PrincipalWrapper wrapper)) {
        return;
      }

      UserPrincipals.toBase64(wrapper.principal()).ifPresent(userInfo ->
          requestTemplate.header(UserPrincipals.USER_INFO_HEADER, userInfo)
      );
    };
  }
}

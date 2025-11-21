package apsas.portal.admin.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class UiBaseUrlAspect {
  @SuppressWarnings("unused")
  @Around(
      "execution(public String de.codecentric.boot.admin.server.ui.web.UiController.getBaseUrl(..))"
  )
  public Object removePortFromBaseUrl(ProceedingJoinPoint joinPoint) {
    return "/";
  }
}

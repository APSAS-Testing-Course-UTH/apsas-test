package apsas.support;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"apsas"})
public class SupportServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(SupportServiceApplication.class, args);
  }
}

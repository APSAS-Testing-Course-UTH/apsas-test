package apsas.evaluation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@ComponentScan(basePackages = {"apsas"})
@EnableFeignClients
@EnableRetry
public class EvaluationServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(EvaluationServiceApplication.class, args);
  }
}

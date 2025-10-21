package apsas.evaluation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"apsas"})
public class EvaluationServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(EvaluationServiceApplication.class, args);
  }
}

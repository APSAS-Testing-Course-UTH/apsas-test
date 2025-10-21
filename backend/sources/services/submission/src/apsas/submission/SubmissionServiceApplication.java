package apsas.submission;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"apsas"})
public class SubmissionServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(SubmissionServiceApplication.class, args);
  }
}

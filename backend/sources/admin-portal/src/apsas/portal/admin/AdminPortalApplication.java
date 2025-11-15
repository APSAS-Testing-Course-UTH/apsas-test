package apsas.portal.admin;

import de.codecentric.boot.admin.server.config.EnableAdminServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableAdminServer
@EnableDiscoveryClient
@EnableFeignClients
public class AdminPortalApplication {
  public static void main(String[] args) {
    SpringApplication.run(AdminPortalApplication.class, args);
  }
}

package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

import org.junit.jupiter.api.Test;

class EmailDeliveryExceptionTest {

  @Test
  void constructor_preservesMessageAndCause() {
    RuntimeException cause = new RuntimeException("root-cause");

    EmailDeliveryException exception = new EmailDeliveryException("delivery-failed", cause);

    assertEquals("delivery-failed", exception.getMessage());
    assertSame(cause, exception.getCause());
  }
}

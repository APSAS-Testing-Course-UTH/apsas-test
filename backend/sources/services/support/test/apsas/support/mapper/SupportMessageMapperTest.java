package apsas.support.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import apsas.support.model.dto.SupportMessageResponse;
import apsas.support.model.entity.SupportMessage;
import apsas.support.model.entity.SupportSession;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * Unit test cho mapper chuyển đổi SupportMessage.
 */
@Tag("unit")
@Feature("Support Message Mapper")
class SupportMessageMapperTest {

  private final SupportMessageMapper mapper = new SupportMessageMapperImpl();

  @Test
  @DisplayName("toDto returns null when source message is null")
  @Story("Map support message")
  void toDtoShouldReturnNullWhenMessageIsNull() {
    SupportMessageResponse actual = mapper.toDto(null);

    assertNull(actual);
  }

  @Test
  @DisplayName("toDto maps sessionId as null when session is absent")
  @Story("Map support message")
  void toDtoShouldMapNullSessionIdWhenSessionIsMissing() {
    UUID messageId = UUID.randomUUID();
    UUID senderId = UUID.randomUUID();
    LocalDateTime createdAt = LocalDateTime.now();

    SupportMessage message = new SupportMessage();
    message.setId(messageId);
    message.setSession(null);
    message.setSenderId(senderId);
    message.setContent("Hello");
    message.setIsInstructor(false);
    message.setIsRead(true);
    message.setCreatedAt(createdAt);

    SupportMessageResponse actual = mapper.toDto(message);

    assertEquals(messageId, actual.id());
    assertNull(actual.sessionId());
    assertEquals(senderId, actual.senderId());
    assertEquals("Hello", actual.content());
    assertEquals(false, actual.isInstructor());
    assertEquals(true, actual.isRead());
    assertEquals(createdAt, actual.createdAt());
  }

  @Test
  @DisplayName("toDto maps all fields when session exists")
  @Story("Map support message")
  void toDtoShouldMapAllFieldsWhenSessionExists() {
    UUID messageId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    UUID senderId = UUID.randomUUID();
    LocalDateTime createdAt = LocalDateTime.now();

    SupportSession session = new SupportSession();
    session.setId(sessionId);

    SupportMessage message = new SupportMessage();
    message.setId(messageId);
    message.setSession(session);
    message.setSenderId(senderId);
    message.setContent("Can you help me?");
    message.setIsInstructor(true);
    message.setIsRead(false);
    message.setCreatedAt(createdAt);

    SupportMessageResponse actual = mapper.toDto(message);

    assertEquals(messageId, actual.id());
    assertEquals(sessionId, actual.sessionId());
    assertEquals(senderId, actual.senderId());
    assertEquals("Can you help me?", actual.content());
    assertEquals(true, actual.isInstructor());
    assertEquals(false, actual.isRead());
    assertEquals(createdAt, actual.createdAt());
  }
}

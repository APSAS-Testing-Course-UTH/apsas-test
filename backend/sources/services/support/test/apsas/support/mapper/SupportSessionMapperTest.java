package apsas.support.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import apsas.support.model.dto.SupportSessionResponse;
import apsas.support.model.entity.SupportMessage;
import apsas.support.model.entity.SupportSession;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

/**
 * Unit test cho mapper chuyển đổi SupportSession.
 */
@Tag("unit")
@Feature("Support Session Mapper")
@SpringJUnitConfig(classes = {SupportSessionMapperImpl.class, SupportMessageMapperImpl.class})
class SupportSessionMapperTest {

  @Autowired
  private SupportSessionMapper mapper;

  @Test
  @DisplayName("toDto returns null when source session is null")
  @Story("Map support session")
  void toDtoShouldReturnNullWhenSessionIsNull() {
    SupportSessionResponse actual = mapper.toDto(null);

    assertNull(actual);
  }

  @Test
  @DisplayName("toDto maps null messages when source messages is null")
  @Story("Map support session")
  void toDtoShouldMapNullMessagesWhenMessageListIsNull() {
    UUID sessionId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();
    LocalDateTime createdAt = LocalDateTime.now();

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(studentId);
    session.setInstructorId(null);
    session.setIsClosed(false);
    session.setCreatedAt(createdAt);
    session.setClosedAt(null);
    session.setMessages(null);

    SupportSessionResponse actual = mapper.toDto(session);

    assertNotNull(actual);
    assertEquals(sessionId, actual.id());
    assertEquals(studentId, actual.studentId());
    assertEquals(false, actual.isClosed());
    assertEquals(createdAt, actual.createdAt());
    assertNull(actual.messages());
  }

  @Test
  @DisplayName("toDto maps nested messages when source has message list")
  @Story("Map support session")
  void toDtoShouldMapNestedMessagesWhenMessageListHasData() {
    UUID sessionId = UUID.randomUUID();
    UUID studentId = UUID.randomUUID();
    UUID instructorId = UUID.randomUUID();
    UUID messageId = UUID.randomUUID();
    UUID senderId = UUID.randomUUID();
    LocalDateTime createdAt = LocalDateTime.now();
    LocalDateTime closedAt = LocalDateTime.now().plusMinutes(5);

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(studentId);
    session.setInstructorId(instructorId);
    session.setIsClosed(true);
    session.setCreatedAt(createdAt);
    session.setClosedAt(closedAt);

    SupportMessage message = new SupportMessage();
    message.setId(messageId);
    message.setSession(session);
    message.setSenderId(senderId);
    message.setContent("I need help");
    message.setIsInstructor(false);
    message.setIsRead(false);
    message.setCreatedAt(createdAt.plusMinutes(1));
    session.setMessages(List.of(message));

    SupportSessionResponse actual = mapper.toDto(session);

    assertNotNull(actual);
    assertEquals(sessionId, actual.id());
    assertEquals(studentId, actual.studentId());
    assertEquals(instructorId, actual.instructorId());
    assertEquals(true, actual.isClosed());
    assertEquals(createdAt, actual.createdAt());
    assertEquals(closedAt, actual.closedAt());
    assertNotNull(actual.messages());
    assertEquals(1, actual.messages().size());
    assertEquals(messageId, actual.messages().getFirst().id());
    assertEquals(sessionId, actual.messages().getFirst().sessionId());
    assertEquals(senderId, actual.messages().getFirst().senderId());
    assertEquals("I need help", actual.messages().getFirst().content());
  }
}

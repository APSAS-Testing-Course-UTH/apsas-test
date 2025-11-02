package apsas.support.helper

import apsas.support.model.entity.SupportMessage
import apsas.support.model.entity.SupportSession
import apsas.support.repository.SupportMessageRepository
import apsas.support.repository.SupportSessionRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class TestDataHelper(
    private val sessionRepository: SupportSessionRepository,
    private val messageRepository: SupportMessageRepository,
) {
    fun createSupportSession(
        studentId: UUID = UUID.randomUUID(),
        instructorId: UUID? = null,
        isClosed: Boolean = false,
    ): SupportSession {
        val session = SupportSession()
        session.studentId = studentId
        session.instructorId = instructorId
        session.isClosed = isClosed
        return sessionRepository.save(session)
    }

    fun createSupportSessionWithMessage(
        studentId: UUID = UUID.randomUUID(),
        initialMessage: String = "I need help",
        instructorId: UUID? = null,
        isClosed: Boolean = false,
    ): SupportSession {
        val session =
            createSupportSession(
                studentId = studentId,
                instructorId = instructorId,
                isClosed = isClosed,
            )

        val message = SupportMessage()
        message.senderId = studentId
        message.content = initialMessage
        message.isInstructor = false
        message.isRead = false
        session.addMessage(message)

        return sessionRepository.save(session)
    }

    fun createInstructorMessage(
        sessionId: UUID,
        senderId: UUID,
        content: String = "I can help you with this",
    ): SupportMessage {
        val session = sessionRepository.findById(sessionId).orElseThrow()
        val message = SupportMessage()
        message.senderId = senderId
        message.content = content
        message.isInstructor = true
        message.isRead = false
        message.session = session
        return messageRepository.save(message)
    }

    fun cleanupAll() {
        messageRepository.deleteAll()
        sessionRepository.deleteAll()
    }
}

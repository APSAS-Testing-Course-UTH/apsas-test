package apsas.content.helper

import apsas.content.model.dto.CreateAssignmentRequest
import apsas.content.model.dto.CreateSkillRequest
import apsas.content.model.dto.CreateTutorialRequest
import apsas.content.model.dto.UpdateAssignmentRequest
import apsas.content.model.dto.UpdateAssignmentScheduleRequest
import apsas.content.model.dto.UpdateSkillRequest
import apsas.content.model.dto.UpdateTutorialRequest
import apsas.content.model.entity.DifficultyLevel
import apsas.content.model.entity.TestCase
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

object TestDataFactory {
    fun createTestCase(
        order: Int = 1,
        description: String = "Test case description",
        hidden: Boolean = false,
        weight: Double = 1.0,
        input: String = "test input",
        output: String = "test output",
        timeout: Int = 5000,
        memoryLimit: Int = 256,
    ): TestCase {
        val testCase = TestCase()
        testCase.order = order
        testCase.description = description
        testCase.hidden = hidden
        testCase.weight = weight
        testCase.input = input
        testCase.output = output
        testCase.timeout = timeout
        testCase.memoryLimit = memoryLimit
        return testCase
    }

    fun createAssignmentRequest(
        title: String = "Test Assignment",
        description: String = "Test assignment description",
        difficultyLevel: DifficultyLevel = DifficultyLevel.EASY,
        startDate: LocalDateTime? = null,
        dueDate: LocalDateTime? = null,
        maxScore: BigDecimal = BigDecimal("100.00"),
        languages: Array<String> = arrayOf("java", "python"),
        testCases: List<TestCase> = listOf(createTestCase()),
        skillIds: Set<UUID>? = null,
        tutorialIds: Set<UUID>? = null,
    ): CreateAssignmentRequest {
        val request = CreateAssignmentRequest()
        request.title = title
        request.description = description
        request.difficultyLevel = difficultyLevel
        request.startDate = startDate
        request.dueDate = dueDate
        request.maxScore = maxScore
        request.languages = languages
        request.testCases = testCases
        request.skillIds = skillIds
        request.tutorialIds = tutorialIds
        return request
    }

    fun createUpdateAssignmentRequest(
        title: String = "Updated Assignment",
        description: String = "Updated assignment description",
        difficultyLevel: DifficultyLevel = DifficultyLevel.MEDIUM,
        maxScore: BigDecimal = BigDecimal("150.00"),
        languages: Array<String> = arrayOf("java", "python", "javascript"),
        testCases: List<TestCase> = listOf(createTestCase(order = 1), createTestCase(order = 2)),
        skillIds: Set<UUID>? = null,
        tutorialIds: Set<UUID>? = null,
    ): UpdateAssignmentRequest {
        val request = UpdateAssignmentRequest()
        request.title = title
        request.description = description
        request.difficultyLevel = difficultyLevel
        request.maxScore = maxScore
        request.languages = languages
        request.testCases = testCases
        request.skillIds = skillIds
        request.tutorialIds = tutorialIds
        return request
    }

    fun createUpdateAssignmentScheduleRequest(
        startDate: LocalDateTime? = LocalDateTime.now(),
        dueDate: LocalDateTime? = LocalDateTime.now().plusDays(7),
    ): UpdateAssignmentScheduleRequest {
        val request = UpdateAssignmentScheduleRequest()
        request.startDate = startDate
        request.dueDate = dueDate
        return request
    }

    fun createSkillRequest(
        name: String = "Test Skill",
        description: String = "Test skill description",
    ): CreateSkillRequest {
        val request = CreateSkillRequest()
        request.name = name
        request.description = description
        return request
    }

    fun createUpdateSkillRequest(
        name: String = "Updated Skill",
        description: String = "Updated skill description",
    ): UpdateSkillRequest {
        val request = UpdateSkillRequest()
        request.name = name
        request.description = description
        return request
    }

    fun createTutorialRequest(
        title: String = "Test Tutorial",
        content: String = "Test tutorial content",
        tags: Array<String> = arrayOf("test", "tutorial"),
    ): CreateTutorialRequest {
        val request = CreateTutorialRequest()
        request.title = title
        request.content = content
        request.tags = tags
        return request
    }

    fun createUpdateTutorialRequest(
        title: String = "Updated Tutorial",
        content: String = "Updated tutorial content",
        tags: Array<String> = arrayOf("updated", "tutorial"),
    ): UpdateTutorialRequest {
        val request = UpdateTutorialRequest()
        request.title = title
        request.content = content
        request.tags = tags
        return request
    }
}

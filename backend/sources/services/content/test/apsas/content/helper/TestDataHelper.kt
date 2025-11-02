package apsas.content.helper

import apsas.content.model.entity.Assignment
import apsas.content.model.entity.AssignmentStatus
import apsas.content.model.entity.DifficultyLevel
import apsas.content.model.entity.Skill
import apsas.content.model.entity.TestCase
import apsas.content.model.entity.Tutorial
import apsas.content.repository.AssignmentRepository
import apsas.content.repository.SkillRepository
import apsas.content.repository.TutorialRepository
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Component
class TestDataHelper(
    private val assignmentRepository: AssignmentRepository,
    private val skillRepository: SkillRepository,
    private val tutorialRepository: TutorialRepository,
) {
    fun createSkill(
        name: String = "Test Skill ${UUID.randomUUID()}",
        description: String = "Test skill description",
    ): Skill {
        val skill = Skill()
        skill.name = name
        skill.description = description
        return skillRepository.save(skill)
    }

    fun createTutorial(
        title: String = "Test Tutorial",
        content: String = "Test tutorial content",
        creatorId: UUID = UUID.randomUUID(),
        tags: Array<String> = arrayOf("test", "tutorial"),
    ): Tutorial {
        val tutorial = Tutorial()
        tutorial.title = title
        tutorial.content = content
        tutorial.creatorId = creatorId
        tutorial.tags = tags
        return tutorialRepository.save(tutorial)
    }

    fun createAssignment(
        title: String = "Test Assignment",
        description: String = "Test assignment description",
        difficultyLevel: DifficultyLevel = DifficultyLevel.EASY,
        creatorId: UUID = UUID.randomUUID(),
        startDate: LocalDateTime? = null,
        dueDate: LocalDateTime? = null,
        maxScore: BigDecimal = BigDecimal("100.00"),
        status: AssignmentStatus = AssignmentStatus.DRAFT,
        languages: Array<String> = arrayOf("java", "python"),
        testCases: List<TestCase> = listOf(createDefaultTestCase()),
        skills: Set<Skill> = emptySet(),
        tutorials: Set<Tutorial> = emptySet(),
    ): Assignment {
        val assignment = Assignment()
        assignment.title = title
        assignment.description = description
        assignment.difficultyLevel = difficultyLevel
        assignment.creatorId = creatorId
        assignment.startDate = startDate
        assignment.dueDate = dueDate
        assignment.maxScore = maxScore
        assignment.status = status
        assignment.languages = languages
        assignment.testCases = testCases
        assignment.skills = skills.toMutableSet()
        assignment.tutorials = tutorials.toMutableSet()
        return assignmentRepository.save(assignment)
    }

    fun createPublishedAssignment(
        title: String = "Published Assignment",
        creatorId: UUID = UUID.randomUUID(),
        startDate: LocalDateTime = LocalDateTime.now().minusDays(1),
        dueDate: LocalDateTime = LocalDateTime.now().plusDays(7),
    ): Assignment =
        createAssignment(
            title = title,
            creatorId = creatorId,
            startDate = startDate,
            dueDate = dueDate,
            status = AssignmentStatus.PUBLISHED,
        )

    fun createArchivedAssignment(
        title: String = "Archived Assignment",
        creatorId: UUID = UUID.randomUUID(),
    ): Assignment =
        createAssignment(
            title = title,
            creatorId = creatorId,
            status = AssignmentStatus.ARCHIVED,
        )

    fun cleanupAll() {
        assignmentRepository.deleteAll()
        tutorialRepository.deleteAll()
        skillRepository.deleteAll()
    }

    companion object {
        fun createDefaultTestCase(
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
    }
}

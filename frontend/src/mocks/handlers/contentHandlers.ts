import { http, HttpResponse } from 'msw'
import type {
  ContentServiceTutorialResponse,
  ContentServiceSkillResponse,
  ContentServiceAssignmentResponse,
  ContentServicePageResponseTutorialResponse,
  ContentServicePageResponseSkillResponse,
  ContentServicePageResponseAssignmentResponse,
  ContentServiceCreateTutorialRequest,
  ContentServiceCreateSkillRequest,
  ContentServiceCreateAssignmentRequest,
  ContentServiceUpdateTutorialRequest,
  ContentServiceUpdateSkillRequest,
  ContentServiceUpdateAssignmentRequest,
  ContentServiceUpdateAssignmentScheduleRequest,
} from '@/api/types.gen'
import { withAuth } from '../middleware/withAuth'
import { UserRole } from '../middleware/withAuth'
import { MSW_BASE_URL } from '../config'
import {
  MOCK_DATA_REGISTRY,
} from '../factory/mockDataRegistry'

console.log('[Content Handlers] Using centralized mock data registry')
console.log('[Content Handlers] Base URL:', MSW_BASE_URL)
console.log('[Content Handlers] Loaded assignments:', Object.keys(MOCK_DATA_REGISTRY.assignments).length)

// ⚠️ IMPORTANT: All assignment data comes from centralized registry
// NO extra mock data added here - ensures consistency across all services
const mockAssignments = MOCK_DATA_REGISTRY.assignments
const mockTutorials = MOCK_DATA_REGISTRY.tutorials
const mockSkills = MOCK_DATA_REGISTRY.skills

export const contentHandlers = [
  // ============================================
  // TUTORIAL ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/tutorials
   * Get all tutorials with pagination and sorting
   */
  http.get('**/api/v1/tutorials',
    withAuth(({ request }: { request: Request }) => {
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page')) || 0
      const size = Number(url.searchParams.get('size')) || 10

      const tutorials = Object.values(mockTutorials)
      const totalElements = tutorials.length
      const totalPages = Math.ceil(totalElements / size)
      const startIndex = page * size
      const endIndex = startIndex + size

      const response: ContentServicePageResponseTutorialResponse = {
        content: tutorials.slice(startIndex, endIndex),
        pageNumber: page,
        pageSize: size,
        totalElements: Number(BigInt(totalElements)) as any,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
        hasNext: page < totalPages - 1,
        hasPrevious: page > 0,
      }

      return HttpResponse.json(response, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/tutorials
   * Create a new tutorial (Provider only)
   */
  http.post('**/api/v1/tutorials',
    withAuth(async ({ request }: { request: Request }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('provider') ? UserRole.PROVIDER : UserRole.STUDENT

      // Only providers can create tutorials
      if (userRole !== UserRole.PROVIDER) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only content providers can create tutorials' },
          { status: 403 }
        )
      }

      const body: ContentServiceCreateTutorialRequest = await request.json()

      // Validate required fields
      if (!body.title || !body.content) {
        return HttpResponse.json(
          { error: 'Bad Request', message: 'Title and content are required' },
          { status: 400 }
        )
      }

      const tutorialId = crypto.randomUUID()
      const newTutorial: ContentServiceTutorialResponse = {
        id: tutorialId,
        title: body.title,
        content: body.content,
        creatorId: 'provider-001', // In real app, get from token
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: body.tags || [],
      }

      mockTutorials[tutorialId] = newTutorial

      return HttpResponse.json(newTutorial, { status: 200 })
    })
  ),

  /**
   * GET /api/v1/tutorials/{id}
   * Get tutorial by ID
   */
  http.get('**/api/v1/tutorials/:id',
    withAuth(({ params }: { params: { id: string } }) => {
      if (!params?.id) {
        return HttpResponse.json(
          { error: 'Bad Request', message: 'Invalid tutorial ID' },
          { status: 400 }
        )
      }
      const tutorial = mockTutorials[params.id]

      if (!tutorial) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Tutorial not found' },
          { status: 404 }
        )
      }

      return HttpResponse.json(tutorial, { status: 200 })
    })
  ),

  /**
   * PATCH /api/v1/tutorials/{id}
   * Update tutorial (Provider only)
   */
  http.patch('**/api/v1/tutorials/:id',
    withAuth(async ({ request, params }: { request: Request, params: { id: string } }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('provider') ? UserRole.PROVIDER : UserRole.STUDENT

      // Only providers can update tutorials
      if (userRole !== UserRole.PROVIDER) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only content providers can update tutorials' },
          { status: 403 }
        )
      }

      const tutorial = mockTutorials[params.id]
      if (!tutorial) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Tutorial not found' },
          { status: 404 }
        )
      }

      const body: ContentServiceUpdateTutorialRequest = await request.json()

      const updatedTutorial: ContentServiceTutorialResponse = {
        ...tutorial,
        title: body.title ?? tutorial.title,
        content: body.content ?? tutorial.content,
        tags: body.tags ?? tutorial.tags,
        updatedAt: new Date(),
      }

      mockTutorials[params.id] = updatedTutorial

      return HttpResponse.json(updatedTutorial, { status: 200 })
    })
  ),

  /**
   * DELETE /api/v1/tutorials/{id}
   * Delete tutorial (Provider only)
   */
  http.delete('**/api/v1/tutorials/:id',
    withAuth(({ request, params }: { request: Request, params: { id: string } }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('provider') ? UserRole.PROVIDER : UserRole.STUDENT

      // Only providers can delete tutorials
      if (userRole !== UserRole.PROVIDER) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only content providers can delete tutorials' },
          { status: 403 }
        )
      }

      const tutorial = mockTutorials[params.id]
      if (!tutorial) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Tutorial not found' },
          { status: 404 }
        )
      }

      delete mockTutorials[params.id]

      return HttpResponse.json(
        { message: 'Tutorial deleted successfully' },
        { status: 200 }
      )
    })
  ),

  // ============================================
  // SKILL ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/skills
   * Get all skills with pagination and sorting
   */
  http.get('**/api/v1/skills',
    withAuth(({ request }: { request: Request }) => {
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page')) || 0
      const size = Number(url.searchParams.get('size')) || 10

      const skills = Object.values(mockSkills)
      const totalElements = skills.length
      const totalPages = Math.ceil(totalElements / size)
      const startIndex = page * size
      const endIndex = startIndex + size

      const response: ContentServicePageResponseSkillResponse = {
        content: skills.slice(startIndex, endIndex),
        pageNumber: page,
        pageSize: size,
        totalElements: Number(BigInt(totalElements)) as any,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
        hasNext: page < totalPages - 1,
        hasPrevious: page > 0,
      }

      return HttpResponse.json(response, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/skills
   * Create a new skill (Provider only)
   */
  http.post('**/api/v1/skills',
    withAuth(async ({ request }: { request: Request }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('provider') ? UserRole.PROVIDER : UserRole.STUDENT

      // Only providers can create skills
      if (userRole !== UserRole.PROVIDER) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only content providers can create skills' },
          { status: 403 }
        )
      }

      const body: ContentServiceCreateSkillRequest = await request.json()

      // Validate required fields
      if (!body.name) {
        return HttpResponse.json(
          { error: 'Bad Request', message: 'Name is required' },
          { status: 400 }
        )
      }

      const skillId = crypto.randomUUID()
      const newSkill: ContentServiceSkillResponse = {
        id: skillId,
        name: body.name,
        description: body.description || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockSkills[skillId] = newSkill

      return HttpResponse.json(newSkill, { status: 200 })
    })
  ),

  /**
   * GET /api/v1/skills/{id}
   * Get skill by ID
   */
  http.get('**/api/v1/skills/:id',
    withAuth(({ params }: { params: { id: string } }) => {
      const skill = mockSkills[params.id]

      if (!skill) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Skill not found' },
          { status: 404 }
        )
      }

      return HttpResponse.json(skill, { status: 200 })
    })
  ),

  /**
   * PATCH /api/v1/skills/{id}
   * Update skill (Provider only)
   */
  http.patch('**/api/v1/skills/:id',
    withAuth(async ({ request, params }: { request: Request, params: { id: string } }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('provider') ? UserRole.PROVIDER : UserRole.STUDENT

      // Only providers can update skills
      if (userRole !== UserRole.PROVIDER) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only content providers can update skills' },
          { status: 403 }
        )
      }

      const skill = mockSkills[params.id]
      if (!skill) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Skill not found' },
          { status: 404 }
        )
      }

      const body: ContentServiceUpdateSkillRequest = await request.json()

      const updatedSkill: ContentServiceSkillResponse = {
        ...skill,
        name: body.name ?? skill.name,
        description: body.description ?? skill.description,
        updatedAt: new Date(),
      }

      mockSkills[params.id] = updatedSkill

      return HttpResponse.json(updatedSkill, { status: 200 })
    })
  ),

  /**
   * DELETE /api/v1/skills/{id}
   * Delete skill (Provider only)
   */
  http.delete('**/api/v1/skills/:id',
    withAuth(({ request, params }: { request: Request, params: { id: string } }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('provider') ? UserRole.PROVIDER : UserRole.STUDENT

      // Only providers can delete skills
      if (userRole !== UserRole.PROVIDER) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only content providers can delete skills' },
          { status: 403 }
        )
      }

      const skill = mockSkills[params.id]
      if (!skill) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Skill not found' },
          { status: 404 }
        )
      }

      delete mockSkills[params.id]

      return HttpResponse.json(
        { message: 'Skill deleted successfully' },
        { status: 200 }
      )
    })
  ),

  // ============================================
  // ASSIGNMENT ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/assignments
   * Get all assignments with pagination and sorting
   */
  http.get('**/api/v1/assignments',
    withAuth(({ request }: { request: Request }) => {
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page')) || 0
      const size = Number(url.searchParams.get('size')) || 10

      const assignments = Object.values(mockAssignments)
      const totalElements = assignments.length
      const totalPages = Math.ceil(totalElements / size)
      const startIndex = page * size
      const endIndex = startIndex + size

      const response: ContentServicePageResponseAssignmentResponse = {
        content: assignments.slice(startIndex, endIndex),
        pageNumber: page,
        pageSize: size,
        totalElements: Number(BigInt(totalElements)) as any,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
        hasNext: page < totalPages - 1,
        hasPrevious: page > 0,
      }

      return HttpResponse.json(response, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/assignments
   * Create a new assignment (Provider only)
   */
  http.post('**/api/v1/assignments',
    withAuth(async ({ request }: { request: Request }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('provider') ? UserRole.PROVIDER : UserRole.STUDENT

      // Only providers can create assignments
      if (userRole !== UserRole.PROVIDER) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only content providers can create assignments' },
          { status: 403 }
        )
      }

      const body: ContentServiceCreateAssignmentRequest = await request.json()

      // Validate required fields
      if (!body.title || !body.description || !body.difficultyLevel || !body.languages || !body.testCases) {
        return HttpResponse.json(
          { error: 'Bad Request', message: 'Missing required fields' },
          { status: 400 }
        )
      }

      const assignmentId = crypto.randomUUID()
      const newAssignment: ContentServiceAssignmentResponse = {
        id: assignmentId,
        title: body.title,
        description: body.description,
        difficultyLevel: body.difficultyLevel,
        creatorId: 'provider-001', // In real app, get from token
        createdAt: new Date(),
        updatedAt: new Date(),
        startDate: body.startDate,
        dueDate: body.dueDate,
        maxScore: body.maxScore,
        status: 'DRAFT',
        languages: body.languages,
        testCases: body.testCases,
        skills: body.skillIds ? body.skillIds.map(id => mockSkills[id]).filter(Boolean) : [],
        tutorials: body.tutorialIds ? body.tutorialIds.map(id => mockTutorials[id]).filter(Boolean) : [],
      }

      mockAssignments[assignmentId] = newAssignment

      return HttpResponse.json(newAssignment, { status: 200 })
    })
  ),

  /**
   * GET /api/v1/assignments/{id}
   * Get assignment by ID with relationships
   */
  http.get('**/api/v1/assignments/:id',
    ({ params }: { params: { id: string } }) => {
      const assignment = mockAssignments[params.id]

      if (!assignment) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Assignment not found' },
          { status: 404 }
        )
      }

      return HttpResponse.json(assignment, { status: 200 })
    }
  ),

  /**
   * PATCH /api/v1/assignments/{id}
   * Update assignment (Provider only)
   */
  http.patch('**/api/v1/assignments/:id',
    withAuth(async ({ request, params }: { request: Request, params: { id: string } }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('provider') ? UserRole.PROVIDER : UserRole.STUDENT

      // Only providers can update assignments
      if (userRole !== UserRole.PROVIDER) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only content providers can update assignments' },
          { status: 403 }
        )
      }

      const assignment = mockAssignments[params.id]
      if (!assignment) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Assignment not found' },
          { status: 404 }
        )
      }

      const body: ContentServiceUpdateAssignmentRequest = await request.json()

      const updatedAssignment: ContentServiceAssignmentResponse = {
        ...assignment,
        title: body.title ?? assignment.title,
        description: body.description ?? assignment.description,
        difficultyLevel: body.difficultyLevel ?? assignment.difficultyLevel,
        startDate: body.startDate ?? assignment.startDate,
        dueDate: body.dueDate ?? assignment.dueDate,
        maxScore: body.maxScore ?? assignment.maxScore,
        languages: body.languages ?? assignment.languages,
        testCases: body.testCases ?? assignment.testCases,
        skills: body.skillIds ? body.skillIds.map(id => mockSkills[id]).filter(Boolean) : assignment.skills,
        tutorials: body.tutorialIds ? body.tutorialIds.map(id => mockTutorials[id]).filter(Boolean) : assignment.tutorials,
        updatedAt: new Date(),
      }

      mockAssignments[params.id] = updatedAssignment

      return HttpResponse.json(updatedAssignment, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/assignments/{id}/publish
   * Publish assignment (Provider only)
   */
  http.post('**/api/v1/assignments/:id/publish',
    withAuth(({ request, params }: { request: Request, params: { id: string } }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('provider') ? UserRole.PROVIDER : UserRole.STUDENT

      // Only providers can publish assignments
      if (userRole !== UserRole.PROVIDER) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only content providers can publish assignments' },
          { status: 403 }
        )
      }

      const assignment = mockAssignments[params.id]
      if (!assignment) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Assignment not found' },
          { status: 404 }
        )
      }

      const updatedAssignment: ContentServiceAssignmentResponse = {
        ...assignment,
        status: 'PUBLISHED',
        updatedAt: new Date(),
      }

      mockAssignments[params.id] = updatedAssignment

      return HttpResponse.json(updatedAssignment, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/assignments/{id}/archive
   * Archive assignment (Provider only)
   */
  http.post('**/api/v1/assignments/:id/archive',
    withAuth(({ request, params }: { request: Request, params: { id: string } }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('provider') ? UserRole.PROVIDER : UserRole.STUDENT

      // Only providers can archive assignments
      if (userRole !== UserRole.PROVIDER) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only content providers can archive assignments' },
          { status: 403 }
        )
      }

      const assignment = mockAssignments[params.id]
      if (!assignment) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Assignment not found' },
          { status: 404 }
        )
      }

      const updatedAssignment: ContentServiceAssignmentResponse = {
        ...assignment,
        status: 'ARCHIVED',
        updatedAt: new Date(),
      }

      mockAssignments[params.id] = updatedAssignment

      return HttpResponse.json(updatedAssignment, { status: 200 })
    })
  ),

  /**
   * PATCH /api/v1/assignments/{id}/schedule
   * Update assignment schedule (Instructor only)
   */
  http.patch('**/api/v1/assignments/:id/schedule',
    withAuth(async ({ request, params }: { request: Request, params: { id: string } }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('instructor') ? UserRole.INSTRUCTOR : UserRole.STUDENT

      // Only instructors can update assignment schedules
      if (userRole !== UserRole.INSTRUCTOR) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only instructors can update assignment schedules' },
          { status: 403 }
        )
      }

      const assignment = mockAssignments[params.id]
      if (!assignment) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Assignment not found' },
          { status: 404 }
        )
      }

      const body: ContentServiceUpdateAssignmentScheduleRequest = await request.json()

      // Validate required fields
      if (!body.startDate || !body.dueDate) {
        return HttpResponse.json(
          { error: 'Bad Request', message: 'startDate and dueDate are required' },
          { status: 400 }
        )
      }

      const updatedAssignment: ContentServiceAssignmentResponse = {
        ...assignment,
        startDate: body.startDate,
        dueDate: body.dueDate,
        updatedAt: new Date(),
      }

      mockAssignments[params.id] = updatedAssignment

      return HttpResponse.json(updatedAssignment, { status: 200 })
    })
  ),
]

# MSW-1: Handlers cho APSAS Services

**Version:** MSW 2.0 | **Target:** React 18+, Vite, Bun.js, TypeScript  
**Status:** Production-Ready | **Last Updated:** October 2025

---

## 📌 Giới Thiệu

Tài liệu này cung cấp **handlers cho tất cả 5 APSAS services**:
- ✅ **Identity Service** - Authentication, user management, profile
- ✅ **Submission Service** - Student code submissions, feedback
- ✅ **Evaluation Service** - Code runtime support, evaluation
- ✅ **Content Service** - Tutorials, skills, assignments
- ✅ **Support Service** - Support sessions, messaging

Mỗi handler được tối ưu cho **role-based access** (Admin, Lecturer, Student, Provider).

---

## 🔐 Identity Service Handlers

### Endpoints Mapping

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/login` | - | User login |
| POST | `/api/auth/register` | - | New user registration |
| POST | `/api/auth/forgot-password` | - | Request password reset |
| POST | `/api/auth/reset-password` | - | Reset password with token |
| POST | `/api/auth/verify-email` | - | Verify email with token |
| POST | `/api/auth/resend-verification` | - | Resend verification email |
| GET | `/api/v1/users/me` | Authenticated | Get current user profile |
| PUT | `/api/v1/users/me` | Authenticated | Update current user profile |
| POST | `/api/v1/users/me/change-password` | Authenticated | Change password |
| GET | `/api/v1/users` | Admin | List all users with pagination |
| POST | `/api/v1/users` | Admin | Create new user |
| GET | `/api/v1/users/{userId}` | Admin | Get user by ID |
| DELETE | `/api/v1/users/{userId}` | Admin | Delete user |
| PUT | `/api/v1/users/{userId}/activate` | Admin | Activate user |
| PUT | `/api/v1/users/{userId}/deactivate` | Admin | Deactivate user |
| GET | `/api/v1/users/role/{role}` | Admin | Get users by role |

### Handler Implementation

Create `src/mocks/handlers/authHandlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import type {
  IdentityServiceLoginResponses,
  IdentityServiceUserResponse,
  IdentityServicePageResponseUserResponse,
} from '@/api/types.gen';
import { MOCK_CREDENTIALS, MOCK_USERS } from '../fixtures/credentials';
import { withAuth } from '../middleware/withAuth';

const BASE_URL = 'http://localhost:3000';

export const authHandlers = [
  // ============================================
  // PUBLIC ENDPOINTS (No Auth Required)
  // ============================================

  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token
   */
  http.post(`${BASE_URL}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as {
      email: string;
      password: string;
    };

    // Validate credentials
    const matchedRole = Object.entries(MOCK_CREDENTIALS).find(
      ([_, creds]) => creds.email === body.email && creds.password === body.password
    );

    if (!matchedRole) {
      return HttpResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const [role] = matchedRole;
    const user = MOCK_USERS[role];

    // Return AuthResponse with token
    return HttpResponse.json(
      {
        token: MOCK_CREDENTIALS[role as keyof typeof MOCK_CREDENTIALS].token,
        type: 'Bearer',
        user,
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `token=${MOCK_CREDENTIALS[role as keyof typeof MOCK_CREDENTIALS].token}; Path=/; HttpOnly; SameSite=Strict`,
        },
      }
    );
  }),

  /**
   * POST /api/auth/register
   * Register new user account (Student role by default)
   */
  http.post(`${BASE_URL}/api/auth/register`, async ({ request }) => {
    const body = await request.json() as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    // Validate input
    if (!body.email || !body.password || body.password.length < 8) {
      return HttpResponse.json(
        { error: 'Invalid input. Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    const newUser: IdentityServiceUserResponse = {
      id: crypto.randomUUID(),
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: 'STUDENT',
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        token: `mock-token-${newUser.id}`,
        type: 'Bearer',
        user: newUser,
      },
      { status: 200 }
    );
  }),

  /**
   * POST /api/auth/forgot-password
   * Request password reset link
   */
  http.post(`${BASE_URL}/api/auth/forgot-password`, async ({ request }) => {
    const body = await request.json() as { email: string };

    // Validate email format
    if (!body.email || !body.email.includes('@')) {
      return HttpResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { message: 'Password reset link sent to email' },
      { status: 200 }
    );
  }),

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   */
  http.post(`${BASE_URL}/api/auth/reset-password`, async ({ request }) => {
    const body = await request.json() as {
      token: string;
      newPassword: string;
    };

    // Validate token and password
    if (!body.token || !body.newPassword || body.newPassword.length < 8) {
      return HttpResponse.json(
        { error: 'Invalid token or password' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  }),

  /**
   * POST /api/auth/verify-email
   * Verify email with token
   */
  http.post(`${BASE_URL}/api/auth/verify-email`, async ({ request }) => {
    const body = await request.json() as { token: string };

    if (!body.token) {
      return HttpResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  }),

  /**
   * POST /api/auth/resend-verification
   * Resend email verification link
   */
  http.post(`${BASE_URL}/api/auth/resend-verification`, async ({ request }) => {
    const body = await request.json() as { email: string };

    if (!body.email) {
      return HttpResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { message: 'Verification email sent' },
      { status: 200 }
    );
  }),

  // ============================================
  // AUTHENTICATED ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/users/me
   * Get current user profile (Authenticated users only)
   */
  http.get(
    `${BASE_URL}/api/v1/users/me`,
    withAuth(({ request }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1];

      // Match token to user (for mock purposes)
      const userRole = Object.entries(MOCK_CREDENTIALS).find(
        ([_, creds]) => creds.token === token
      )?.[0];

      if (!userRole) {
        return HttpResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json(MOCK_USERS[userRole], { status: 200 });
    })
  ),

  /**
   * PUT /api/v1/users/me
   * Update current user profile
   */
  http.put(
    `${BASE_URL}/api/v1/users/me`,
    withAuth(async ({ request }) => {
      const body = await request.json() as {
        firstName?: string;
        lastName?: string;
      };

      const token = request.headers.get('Authorization')?.split(' ')[1];
      const userRole = Object.entries(MOCK_CREDENTIALS).find(
        ([_, creds]) => creds.token === token
      )?.[0];

      if (!userRole) {
        return HttpResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const updatedUser: IdentityServiceUserResponse = {
        ...MOCK_USERS[userRole],
        firstName: body.firstName || MOCK_USERS[userRole].firstName,
        lastName: body.lastName || MOCK_USERS[userRole].lastName,
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json(updatedUser, { status: 200 });
    })
  ),

  /**
   * POST /api/v1/users/me/change-password
   * Change password for current user
   */
  http.post(
    `${BASE_URL}/api/v1/users/me/change-password`,
    withAuth(async ({ request }) => {
      const body = await request.json() as {
        currentPassword: string;
        newPassword: string;
      };

      // Validate passwords
      if (!body.currentPassword || !body.newPassword || body.newPassword.length < 8) {
        return HttpResponse.json(
          { error: 'Invalid password format' },
          { status: 400 }
        );
      }

      return HttpResponse.json(
        { message: 'Password changed successfully' },
        { status: 200 }
      );
    })
  ),

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/users
   * Get all users with pagination (Admin only)
   */
  http.get(
    `${BASE_URL}/api/v1/users`,
    withAuth(({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page')) || 0;
      const size = Number(url.searchParams.get('size')) || 10;

      // Mock paginated response
      const mockUsers = Object.values(MOCK_USERS);
      const total = mockUsers.length;

      const response: IdentityServicePageResponseUserResponse = {
        content: mockUsers.slice(page * size, (page + 1) * size),
        pageNumber: page,
        pageSize: size,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        first: page === 0,
        last: page >= Math.ceil(total / size) - 1,
        hasNext: page < Math.ceil(total / size) - 1,
        hasPrevious: page > 0,
      };

      return HttpResponse.json(response, { status: 200 });
    })
  ),

  /**
   * POST /api/v1/users
   * Create new user (Admin only)
   */
  http.post(
    `${BASE_URL}/api/v1/users`,
    withAuth(async ({ request }) => {
      const body = await request.json() as {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: 'STUDENT' | 'INSTRUCTOR' | 'CONTENT_PROVIDER' | 'ADMIN';
      };

      const newUser: IdentityServiceUserResponse = {
        id: crypto.randomUUID(),
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json(newUser, { status: 200 });
    })
  ),

  /**
   * GET /api/v1/users/{userId}
   * Get user by ID (Admin only)
   */
  http.get(
    `${BASE_URL}/api/v1/users/:userId`,
    withAuth(({ params }) => {
      const { userId } = params;

      // Find user by ID (for mock, return first user)
      const user = Object.values(MOCK_USERS)[0];

      if (!user || user.id !== userId) {
        return HttpResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json(user, { status: 200 });
    })
  ),

  /**
   * DELETE /api/v1/users/{userId}
   * Delete user (Admin only)
   */
  http.delete(
    `${BASE_URL}/api/v1/users/:userId`,
    withAuth(() => {
      return HttpResponse.json(
        { message: 'User deleted successfully' },
        { status: 200 }
      );
    })
  ),

  /**
   * PUT /api/v1/users/{userId}/activate
   * Activate user (Admin only)
   */
  http.put(
    `${BASE_URL}/api/v1/users/:userId/activate`,
    withAuth(() => {
      return HttpResponse.json(
        { ...Object.values(MOCK_USERS)[0], isActive: true },
        { status: 200 }
      );
    })
  ),

  /**
   * PUT /api/v1/users/{userId}/deactivate
   * Deactivate user (Admin only)
   */
  http.put(
    `${BASE_URL}/api/v1/users/:userId/deactivate`,
    withAuth(() => {
      return HttpResponse.json(
        { ...Object.values(MOCK_USERS)[0], isActive: false },
        { status: 200 }
      );
    })
  ),

  /**
   * GET /api/v1/users/role/{role}
   * Get users by role with pagination (Admin only)
   */
  http.get(
    `${BASE_URL}/api/v1/users/role/:role`,
    withAuth(({ request, params }) => {
      const { role } = params;
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page')) || 0;
      const size = Number(url.searchParams.get('size')) || 10;

      // Filter users by role
      const roleUsers = Object.values(MOCK_USERS).filter(u => u.role === role);

      const response: IdentityServicePageResponseUserResponse = {
        content: roleUsers.slice(page * size, (page + 1) * size),
        pageNumber: page,
        pageSize: size,
        totalElements: roleUsers.length,
        totalPages: Math.ceil(roleUsers.length / size),
        first: page === 0,
        last: page >= Math.ceil(roleUsers.length / size) - 1,
        hasNext: page < Math.ceil(roleUsers.length / size) - 1,
        hasPrevious: page > 0,
      };

      return HttpResponse.json(response, { status: 200 });
    })
  ),
];
```

---

## 📝 Submission Service Handlers

### Endpoints Mapping

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/submissions` | Student/Instructor | List submissions (filtered) |
| POST | `/api/v1/submissions` | Student | Create new submission |
| GET | `/api/v1/submissions/{id}` | Student/Instructor | ✅ Get submission with test results |
| POST | `/api/v1/submissions/{id}/feedback` | Instructor | ✅ Provide feedback (enhanced) |

### Handler Implementation

Create `src/mocks/handlers/submissionHandlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import type {
  SubmissionServiceSubmissionResponse,
  SubmissionServicePageResponseSubmissionResponse,
  SubmissionServiceTestCaseResultResponse,
} from '@/api/types.gen';
import { withAuth } from '../middleware/withAuth';
import { randomDelay } from '../middleware/delay';

const BASE_URL = 'http://localhost:3000';

/**
 * Mock submissions database
 * In real app, this would be stored on backend
 */
const mockSubmissions: Record<string, SubmissionServiceSubmissionResponse> = {
  'sub-001': {
    id: 'sub-001',
    assignmentId: 'assign-001',
    studentId: '00000000-0000-0000-0000-000000000003',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'EVALUATED',
    code: 'function hello() { return "Hello World"; }',
    language: 'javascript',
    result: 'PASSED',
    score: 100,
    testCaseResults: [
      {
        order: 1,
        description: 'Test basic functionality',
        hidden: false,
        weight: 1.0,
        input: 'hello()',
        output: 'Hello World',
        timeout: 5000,
        memoryLimit: 128,
        passed: true,
        actualOutput: 'Hello World',
        executionTime: 12.5,
        memoryUsed: 2.3,
      },
    ],
    evaluatedAt: new Date().toISOString(),
    feedback: 'Great submission!',
  },
};

export const submissionHandlers = [
  /**
   * GET /api/v1/submissions
   * List all submissions with filters
   * - Students see only their own
   * - Instructors can filter by assignmentId, studentId
   */
  http.get(
    `${BASE_URL}/api/v1/submissions`,
    withAuth(({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page')) || 0;
      const size = Number(url.searchParams.get('size')) || 10;
      const assignmentId = url.searchParams.get('assignmentId');
      const studentId = url.searchParams.get('studentId');

      let filtered = Object.values(mockSubmissions);

      if (assignmentId) {
        filtered = filtered.filter(s => s.assignmentId === assignmentId);
      }
      if (studentId) {
        filtered = filtered.filter(s => s.studentId === studentId);
      }

      const response: SubmissionServicePageResponseSubmissionResponse = {
        content: filtered.slice(page * size, (page + 1) * size),
        pageNumber: page,
        pageSize: size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        first: page === 0,
        last: page >= Math.ceil(filtered.length / size) - 1,
        hasNext: page < Math.ceil(filtered.length / size) - 1,
        hasPrevious: page > 0,
      };

      return HttpResponse.json(response, { status: 200 });
    })
  ),

  /**
   * POST /api/v1/submissions
   * Create new submission (Students only)
   */
  http.post(
    `${BASE_URL}/api/v1/submissions`,
    withAuth(async ({ request }) => {
      const body = await request.json() as {
        assignmentId: string;
        code: string;
        language: string;
      };

      // Simulate evaluation delay
      await randomDelay(500, 1500);

      const newSubmission: SubmissionServiceSubmissionResponse = {
        id: crypto.randomUUID(),
        assignmentId: body.assignmentId,
        studentId: '00000000-0000-0000-0000-000000000003',
        submittedAt: new Date().toISOString(),
        status: 'PENDING',
        code: body.code,
        language: body.language,
        result: 'PASSED',
        score: 85,
        testCaseResults: [],
      };

      return HttpResponse.json(newSubmission, { status: 200 });
    })
  ),

  /**
   * GET /api/v1/submissions/{id}
   * Get submission by ID
   */
  http.get(
    `${BASE_URL}/api/v1/submissions/:id`,
    withAuth(({ params }) => {
      const { id } = params;
      const submission = mockSubmissions[id];

      if (!submission) {
        return HttpResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json(submission, { status: 200 });
    })
  ),

  /**
   * POST /api/v1/submissions/{id}/feedback
   * Provide feedback for submission (Instructors only)
   */
  http.post(
    `${BASE_URL}/api/v1/submissions/:id/feedback`,
    withAuth(async ({ request, params }) => {
      const { id } = params;
      const body = await request.json() as { feedback: string };

      const submission = mockSubmissions[id];

      if (!submission) {
        return HttpResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        );
      }

      const updated: SubmissionServiceSubmissionResponse = {
        ...submission,
        feedback: body.feedback,
        updatedAt: new Date().toISOString(),
      };

      mockSubmissions[id] = updated;

      return HttpResponse.json(updated, { status: 200 });
    })
  ),
];
```

---

## 🔬 Evaluation Service Handlers

### Endpoints Mapping

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/runtimes` | Get supported programming runtimes |

### Handler Implementation

Create `src/mocks/handlers/evaluationHandlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import type { EvaluationServiceRuntimeResponse } from '@/api/types.gen';

const BASE_URL = 'http://localhost:3000';

export const evaluationHandlers = [
  /**
   * GET /api/v1/runtimes
   * Get supported programming language runtimes
   */
  http.get(`${BASE_URL}/api/v1/runtimes`, () => {
    const runtimes: EvaluationServiceRuntimeResponse[] = [
      {
        language: 'javascript',
        version: '18.0.0',
        aliases: ['js', 'node'],
        runtime: 'Node.js',
      },
      {
        language: 'python',
        version: '3.11.0',
        aliases: ['py', 'python3'],
        runtime: 'CPython',
      },
      {
        language: 'java',
        version: '21.0.0',
        aliases: ['java', 'jdk'],
        runtime: 'OpenJDK',
      },
      {
        language: 'cpp',
        version: '17.0.0',
        aliases: ['c++', 'cpp'],
        runtime: 'GCC',
      },
      {
        language: 'typescript',
        version: '5.0.0',
        aliases: ['ts', 'typescript'],
        runtime: 'Node.js',
      },
    ];

    return HttpResponse.json(runtimes, { status: 200 });
  }),
];
```

---

## 📚 Content Service Handlers

### Endpoints Mapping

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/tutorials` | All | List tutorials |
| POST | `/api/v1/tutorials` | Provider | Create tutorial |
| GET | `/api/v1/tutorials/{id}` | All | Get tutorial details |
| PATCH | `/api/v1/tutorials/{id}` | Provider | ✅ Update tutorial (enhanced) |
| DELETE | `/api/v1/tutorials/{id}` | Provider | Delete tutorial |
| GET | `/api/v1/skills` | All | List skills |
| POST | `/api/v1/skills` | Provider | Create skill |
| PATCH | `/api/v1/skills/{id}` | Provider | ✅ Update skill (enhanced) |
| GET | `/api/v1/assignments` | All | List assignments |
| POST | `/api/v1/assignments` | Provider | Create assignment |
| GET | `/api/v1/assignments/{id}` | All | ✅ Get assignment with relationships |
| PATCH | `/api/v1/assignments/{id}` | Provider | ✅ Update assignment (enhanced) |
| POST | `/api/v1/assignments/{id}/publish` | Provider | Publish assignment |
| POST | `/api/v1/assignments/{id}/archive` | Provider | Archive assignment |
| PATCH | `/api/v1/assignments/{id}/schedule` | Instructor | ✅ Update assignment schedule (enhanced) |

### Handler Implementation

Create `src/mocks/handlers/contentHandlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import type {
  ContentServiceTutorialResponse,
  ContentServiceSkillResponse,
  ContentServiceAssignmentResponse,
  ContentServicePageResponseTutorialResponse,
  ContentServicePageResponseSkillResponse,
  ContentServicePageResponseAssignmentResponse,
} from '@/api/types.gen';
import { withAuth } from '../middleware/withAuth';

const BASE_URL = 'http://localhost:3000';

const mockTutorials: Record<string, ContentServiceTutorialResponse> = {
  'tut-001': {
    id: 'tut-001',
    title: 'JavaScript Basics',
    content: 'Learn JavaScript fundamentals...',
    creatorId: '00000000-0000-0000-0000-000000000004',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['javascript', 'beginner'],
  },
};

const mockSkills: Record<string, ContentServiceSkillResponse> = {
  'skill-001': {
    id: 'skill-001',
    name: 'JavaScript Functions',
    description: 'Understand functions in JavaScript',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const mockAssignments: Record<string, ContentServiceAssignmentResponse> = {
  'assign-001': {
    id: 'assign-001',
    title: 'Build a Calculator',
    description: 'Create a simple calculator application',
    difficultyLevel: 'MEDIUM',
    creatorId: '00000000-0000-0000-0000-000000000002',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 604800000).toISOString(),
    maxScore: 100,
    status: 'PUBLISHED',
    languages: ['javascript', 'python'],
    testCases: [
      {
        order: 1,
        description: 'Test 1+1 equals 2',
        hidden: false,
        weight: 1.0,
        input: '1+1',
        output: '2',
        timeout: 5000,
        memoryLimit: 128,
      },
    ],
    skills: [],
    tutorials: [],
  },
};

export const contentHandlers = [
  // TUTORIALS
  http.get(
    `${BASE_URL}/api/v1/tutorials`,
    withAuth(({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page')) || 0;
      const size = Number(url.searchParams.get('size')) || 10;

      const tutorials = Object.values(mockTutorials);

      const response: ContentServicePageResponseTutorialResponse = {
        content: tutorials.slice(page * size, (page + 1) * size),
        pageNumber: page,
        pageSize: size,
        totalElements: tutorials.length,
        totalPages: Math.ceil(tutorials.length / size),
        first: page === 0,
        last: page >= Math.ceil(tutorials.length / size) - 1,
        hasNext: page < Math.ceil(tutorials.length / size) - 1,
        hasPrevious: page > 0,
      };

      return HttpResponse.json(response, { status: 200 });
    })
  ),

  http.post(
    `${BASE_URL}/api/v1/tutorials`,
    withAuth(async ({ request }) => {
      const body = await request.json() as {
        title: string;
        content: string;
        tags?: string[];
      };

      const newTutorial: ContentServiceTutorialResponse = {
        id: crypto.randomUUID(),
        title: body.title,
        content: body.content,
        creatorId: '00000000-0000-0000-0000-000000000004',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: body.tags || [],
      };

      return HttpResponse.json(newTutorial, { status: 200 });
    })
  ),

  http.get(
    `${BASE_URL}/api/v1/tutorials/:id`,
    withAuth(({ params }) => {
      const tutorial = mockTutorials[params.id];
      return tutorial
        ? HttpResponse.json(tutorial, { status: 200 })
        : HttpResponse.json({ error: 'Not found' }, { status: 404 });
    })
  ),

  // SKILLS
  http.get(
    `${BASE_URL}/api/v1/skills`,
    withAuth(({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page')) || 0;
      const size = Number(url.searchParams.get('size')) || 10;

      const skills = Object.values(mockSkills);

      const response: ContentServicePageResponseSkillResponse = {
        content: skills.slice(page * size, (page + 1) * size),
        pageNumber: page,
        pageSize: size,
        totalElements: skills.length,
        totalPages: Math.ceil(skills.length / size),
        first: page === 0,
        last: page >= Math.ceil(skills.length / size) - 1,
        hasNext: page < Math.ceil(skills.length / size) - 1,
        hasPrevious: page > 0,
      };

      return HttpResponse.json(response, { status: 200 });
    })
  ),

  http.post(
    `${BASE_URL}/api/v1/skills`,
    withAuth(async ({ request }) => {
      const body = await request.json() as {
        name: string;
        description?: string;
      };

      const newSkill: ContentServiceSkillResponse = {
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json(newSkill, { status: 200 });
    })
  ),

  // ASSIGNMENTS
  http.get(
    `${BASE_URL}/api/v1/assignments`,
    withAuth(({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page')) || 0;
      const size = Number(url.searchParams.get('size')) || 10;

      const assignments = Object.values(mockAssignments);

      const response: ContentServicePageResponseAssignmentResponse = {
        content: assignments.slice(page * size, (page + 1) * size),
        pageNumber: page,
        pageSize: size,
        totalElements: assignments.length,
        totalPages: Math.ceil(assignments.length / size),
        first: page === 0,
        last: page >= Math.ceil(assignments.length / size) - 1,
        hasNext: page < Math.ceil(assignments.length / size) - 1,
        hasPrevious: page > 0,
      };

      return HttpResponse.json(response, { status: 200 });
    })
  ),

  http.post(
    `${BASE_URL}/api/v1/assignments`,
    withAuth(async ({ request }) => {
      const body = await request.json() as Omit<
        ContentServiceAssignmentResponse,
        'id' | 'creatorId' | 'createdAt' | 'updatedAt'
      >;

      const newAssignment: ContentServiceAssignmentResponse = {
        ...body,
        id: crypto.randomUUID(),
        creatorId: '00000000-0000-0000-0000-000000000004',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'DRAFT',
      };

      return HttpResponse.json(newAssignment, { status: 200 });
    })
  ),

  http.get(
    `${BASE_URL}/api/v1/assignments/:id`,
    withAuth(({ params }) => {
      const assignment = mockAssignments[params.id];
      return assignment
        ? HttpResponse.json(assignment, { status: 200 })
        : HttpResponse.json({ error: 'Not found' }, { status: 404 });
    })
  ),

  http.post(
    `${BASE_URL}/api/v1/assignments/:id/publish`,
    withAuth(({ params }) => {
      const assignment = mockAssignments[params.id];
      if (!assignment) {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      }

      return HttpResponse.json(
        { ...assignment, status: 'PUBLISHED' },
        { status: 200 }
      );
    })
  ),
];
```

---

## 💬 Support Service Handlers

### Endpoints Mapping

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/support/sessions` | All | List support sessions |
| POST | `/api/v1/support/sessions` | Student | Create support session |
| GET | `/api/v1/support/sessions/{id}` | All | ✅ Get session with message read status |
| POST | `/api/v1/support/sessions/{id}/close` | Student | Close session |

### Handler Implementation

Create `src/mocks/handlers/supportHandlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import type {
  SupportServicePageResponseSupportSessionDto,
  SupportServiceSupportSessionDto,
  SupportServiceSupportMessageDto,
} from '@/api/types.gen';
import { withAuth } from '../middleware/withAuth';

const BASE_URL = 'http://localhost:3000';

const mockSessions: Record<string, SupportServiceSupportSessionDto> = {
  'sess-001': {
    id: 'sess-001',
    studentId: '00000000-0000-0000-0000-000000000003',
    instructorId: '00000000-0000-0000-0000-000000000002',
    isClosed: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    closedAt: undefined,
    messages: [
      {
        id: 'msg-001',
        senderId: '00000000-0000-0000-0000-000000000003',
        content: 'I need help with assignment 1',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg-002',
        senderId: '00000000-0000-0000-0000-000000000002',
        content: 'Sure, I can help. What part are you stuck on?',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 3500000).toISOString(),
      },
    ],
  },
};

export const supportHandlers = [
  /**
   * GET /api/v1/support/sessions
   * List support sessions
   * - Students see only their own
   * - Instructors see all
   */
  http.get(
    `${BASE_URL}/api/v1/support/sessions`,
    withAuth(({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page')) || 0;
      const size = Number(url.searchParams.get('size')) || 10;

      const sessions = Object.values(mockSessions);

      const response: SupportServicePageResponseSupportSessionDto = {
        content: sessions.slice(page * size, (page + 1) * size),
        pageNumber: page,
        pageSize: size,
        totalElements: sessions.length,
        totalPages: Math.ceil(sessions.length / size),
        first: page === 0,
        last: page >= Math.ceil(sessions.length / size) - 1,
        hasNext: page < Math.ceil(sessions.length / size) - 1,
        hasPrevious: page > 0,
      };

      return HttpResponse.json(response, { status: 200 });
    })
  ),

  /**
   * POST /api/v1/support/sessions
   * Create new support session (Students only)
   */
  http.post(
    `${BASE_URL}/api/v1/support/sessions`,
    withAuth(async ({ request }) => {
      const body = await request.json() as { initialMessage: string };

      const newSession: SupportServiceSupportSessionDto = {
        id: crypto.randomUUID(),
        studentId: '00000000-0000-0000-0000-000000000003',
        instructorId: '00000000-0000-0000-0000-000000000002',
        isClosed: false,
        createdAt: new Date().toISOString(),
        closedAt: undefined,
        messages: [
          {
            id: crypto.randomUUID(),
            senderId: '00000000-0000-0000-0000-000000000003',
            content: body.initialMessage,
            isInstructor: false,
            isRead: true,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      return HttpResponse.json(newSession, { status: 201 });
    })
  ),

  /**
   * GET /api/v1/support/sessions/{id}
   * Get support session by ID
   */
  http.get(
    `${BASE_URL}/api/v1/support/sessions/:id`,
    withAuth(({ params }) => {
      const session = mockSessions[params.id];

      if (!session) {
        return HttpResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json(session, { status: 200 });
    })
  ),

  /**
   * POST /api/v1/support/sessions/{id}/close
   * Close support session (Student who created it only)
   */
  http.post(
    `${BASE_URL}/api/v1/support/sessions/:id/close`,
    withAuth(({ params }) => {
      const { id } = params;
      const session = mockSessions[id];

      if (!session) {
        return HttpResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      if (session.isClosed) {
        return HttpResponse.json(
          { error: 'Session already closed' },
          { status: 400 }
        );
      }

      const updated: SupportServiceSupportSessionDto = {
        ...session,
        isClosed: true,
        closedAt: new Date().toISOString(),
      };

      mockSessions[id] = updated;

      return HttpResponse.json(updated, { status: 200 });
    })
  ),
];
```

---

## 📦 Export All Handlers

Create `src/mocks/handlers/index.ts`:

```typescript
export { authHandlers } from './authHandlers';
export { submissionHandlers } from './submissionHandlers';
export { evaluationHandlers } from './evaluationHandlers';
export { contentHandlers } from './contentHandlers';
export { supportHandlers } from './supportHandlers';
```

---

## 🧪 Testing Handlers

### Example: Test Login Handler

```typescript
import { describe, it, expect } from 'vitest';
import { MOCK_CREDENTIALS, MOCK_USERS } from '@/mocks/fixtures/credentials';

describe('Auth Handlers', () => {
  it('should login with valid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: MOCK_CREDENTIALS.student.email,
        password: MOCK_CREDENTIALS.student.password,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.user.role).toBe('STUDENT');
  });

  it('should reject invalid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid@email.com',
        password: 'wrongpassword',
      }),
    });

    expect(response.status).toBe(401);
  });
});
```

---

## ✅ Verification Checklist

- [ ] All 5 handler files created (auth, submission, evaluation, content, support)
- [ ] `withAuth` middleware applied to protected endpoints
- [ ] Mock credentials and users configured
- [ ] Pagination implemented correctly
- [ ] Response types match generated API types
- [ ] Error responses for invalid requests
- [ ] Handlers imported in `src/mocks/handlers/index.ts`
- [ ] All services imported in `browser.ts` and `server.ts`
- [ ] Base URL matches API config

---

## 🚨 Common Patterns

### 1. Paginated Responses

```typescript
const response: SomePageResponse = {
  content: items.slice(page * size, (page + 1) * size),
  pageNumber: page,
  pageSize: size,
  totalElements: items.length,
  totalPages: Math.ceil(items.length / size),
  first: page === 0,
  last: page >= Math.ceil(items.length / size) - 1,
  hasNext: page < Math.ceil(items.length / size) - 1,
  hasPrevious: page > 0,
};
```

### 2. Protected Endpoints

```typescript
http.get('/protected-endpoint', withAuth(({ request }) => {
  // Your handler logic here
  // Auth is already validated by withAuth middleware
}))
```

### 3. Query Parameters

```typescript
http.get('/search', ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const limit = url.searchParams.get('limit');
  // Process search...
}));
```

---

## 🎯 Enhanced Features & Advanced Mocking

### 1. Test Case Result Tracking (Submission Service)

Mock detailed code execution results with the complete TestCaseResult structure:

```typescript
http.get(`${BASE_URL}/api/v1/submissions/:id`, ({ request, params }) => {
  const { id } = params;
  
  const submission: SubmissionServiceSubmissionResponse = {
    id,
    assignmentId: 'assign-001',
    studentId: 'student-001',
    submittedAt: new Date().toISOString(),
    status: 'EVALUATED',
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
    result: 'PASSED',
    score: 95,
    
    // Complete test case results with execution metrics
    testCaseResults: [
      {
        order: 1,
        description: 'Test: add(2, 3) should equal 5',
        hidden: false,
        weight: 1.0,
        input: '2 3',
        output: '5',
        timeout: 5000,
        memoryLimit: 256,
        passed: true,
        actualOutput: '5',
        errorMessage: null,
        executionTime: 0.234,  // milliseconds
        memoryUsed: 12.5,      // MB
      },
      {
        order: 2,
        description: 'Test: add(-1, 1) should equal 0',
        hidden: false,
        weight: 1.0,
        input: '-1 1',
        output: '0',
        timeout: 5000,
        memoryLimit: 256,
        passed: true,
        actualOutput: '0',
        errorMessage: null,
        executionTime: 0.156,
        memoryUsed: 11.8,
      },
      {
        order: 3,
        description: 'Edge case: large numbers',
        hidden: true,  // Hidden test
        weight: 2.0,
        input: '999999999 999999999',
        output: '1999999998',
        timeout: 5000,
        memoryLimit: 256,
        passed: true,
        actualOutput: '1999999998',
        errorMessage: null,
        executionTime: 0.342,
        memoryUsed: 14.2,
      },
    ],
    evaluatedAt: new Date().toISOString(),
    feedback: 'Great job! All tests passed.',
  };

  return HttpResponse.json(submission);
});
```

**Key Fields:**
- `executionTime` - Code execution duration in milliseconds
- `memoryUsed` - Memory consumption in MB
- `actualOutput` - Actual program output vs expected `output`
- `errorMessage` - Runtime error if execution failed
- `weight` - Test case importance (used for scoring)

---

### 2. Assignment Scheduling (Content Service)

Mock instructor-only schedule update endpoint:

```typescript
http.patch(
  `${BASE_URL}/api/v1/assignments/:id/schedule`,
  withAuth(async ({ request, params }) => {
    const { id } = params;
    const auth = request.headers.get('Authorization');
    
    // Only instructors can schedule
    const role = getRoleFromToken(auth);
    if (role !== 'INSTRUCTOR') {
      return HttpResponse.json(
        { error: 'Only instructors can schedule assignments' },
        { status: 403 }
      );
    }

    const body = await request.json() as {
      startDate: string;  // ISO date-time
      dueDate: string;    // ISO date-time
    };

    const assignment: ContentServiceAssignmentResponse = {
      id,
      title: 'JavaScript Basics Assignment',
      description: 'Learn functions and scope',
      difficultyLevel: 'EASY',
      creatorId: 'provider-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startDate: body.startDate,  // Updated by instructor
      dueDate: body.dueDate,      // Updated by instructor
      maxScore: 100,
      status: 'PUBLISHED',
      languages: ['javascript', 'typescript'],
      testCases: [],
      skills: [],
      tutorials: [],
    };

    return HttpResponse.json(assignment);
  })
);
```

**Only Instructors Can:**
- Update start and due dates
- Extend deadlines
- Close assignments early

---

### 3. Complete PATCH Operations

Update endpoints for tutorials, skills, and assignments:

```typescript
// PATCH /api/v1/tutorials/{id}
http.patch(
  `${BASE_URL}/api/v1/tutorials/:id`,
  withAuth(async ({ request, params }) => {
    const { id } = params;
    const body = await request.json() as {
      title?: string;
      content?: string;
      tags?: string[];
    };

    return HttpResponse.json({
      id,
      title: body.title || 'Updated Tutorial',
      content: body.content || 'Updated content...',
      creatorId: 'provider-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: body.tags || [],
    });
  })
);

// PATCH /api/v1/skills/{id}
http.patch(
  `${BASE_URL}/api/v1/skills/:id`,
  withAuth(async ({ request, params }) => {
    const body = await request.json() as {
      name?: string;
      description?: string;
    };

    return HttpResponse.json({
      id: params.id,
      name: body.name || 'Updated Skill',
      description: body.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  })
);

// PATCH /api/v1/assignments/{id}
http.patch(
  `${BASE_URL}/api/v1/assignments/:id`,
  withAuth(async ({ request, params }) => {
    const body = await request.json() as Partial<ContentServiceAssignmentResponse>;

    return HttpResponse.json({
      id: params.id,
      title: body.title || 'Updated Assignment',
      description: body.description || '',
      difficultyLevel: body.difficultyLevel || 'MEDIUM',
      creatorId: 'provider-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startDate: body.startDate || new Date().toISOString(),
      dueDate: body.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: body.maxScore || 100,
      status: body.status || 'DRAFT',
      languages: body.languages || ['javascript'],
      testCases: body.testCases || [],
      skills: body.skills || [],
      tutorials: body.tutorials || [],
    });
  })
);
```

---

### 4. Message Read Status Tracking (Support Service)

Mock read/unread message tracking:

```typescript
http.get(
  `${BASE_URL}/api/v1/support/sessions/:id`,
  withAuth(async ({ params }) => {
    const session: SupportServiceSupportSessionDto = {
      id: params.id,
      studentId: 'student-001',
      instructorId: 'instructor-001',
      isClosed: false,
      createdAt: new Date().toISOString(),
      closedAt: null,
      messages: [
        {
          id: 'msg-001',
          senderId: 'student-001',
          content: 'I need help with this assignment',
          isInstructor: false,
          isRead: true,     // Instructor has read this
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg-002',
          senderId: 'instructor-001',
          content: 'Sure! What specific part do you need help with?',
          isInstructor: true,
          isRead: false,    // Student hasn't read instructor's response yet
          createdAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        },
        {
          id: 'msg-003',
          senderId: 'student-001',
          content: 'The loop part in section 3',
          isInstructor: false,
          isRead: true,
          createdAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        },
      ],
    };

    return HttpResponse.json(session);
  })
);
```

**Message Status:**
- `isRead: true` - Recipient has seen message
- `isRead: false` - Awaiting recipient to read
- Useful for notifications and "unread" badges

---

### 5. Skill & Tutorial Relationships

Mock complex assignment with linked resources:

```typescript
http.get(
  `${BASE_URL}/api/v1/assignments/:id`,
  withAuth(async ({ params }) => {
    const assignment: ContentServiceAssignmentResponse = {
      id: params.id,
      title: 'Advanced JavaScript Patterns',
      description: 'Learn closures, currying, and composition',
      difficultyLevel: 'HARD',
      creatorId: 'provider-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: 100,
      status: 'PUBLISHED',
      languages: ['javascript', 'typescript'],
      testCases: [
        {
          order: 1,
          description: 'Test closure implementation',
          hidden: false,
          weight: 1.0,
          input: 'counter()',
          output: '0',
          timeout: 5000,
          memoryLimit: 256,
        },
      ],
      
      // Related skills - learning outcomes
      skills: [
        {
          id: 'skill-001',
          name: 'Closures & Scope',
          description: 'Understanding function closures',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'skill-002',
          name: 'Functional Programming',
          description: 'Pure functions and composition',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

      // Related tutorials - learning materials
      tutorials: [
        {
          id: 'tut-001',
          title: 'Understanding Closures',
          content: 'A closure is...',
          creatorId: 'provider-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['closures', 'javascript', 'scope'],
        },
        {
          id: 'tut-002',
          title: 'Functional Programming Basics',
          content: 'Functional programming is...',
          creatorId: 'provider-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['functional', 'composition', 'pure-functions'],
        },
      ],
    };

    return HttpResponse.json(assignment);
  })
);
```

**Relationships:**
- `skills[]` - Skills students learn from this assignment
- `tutorials[]` - Tutorials students should read first
- Enable better learning path recommendations

---

### 6. Sorting & Filtering with Edge Cases

Complete query parameter handling:

```typescript
http.get(`${BASE_URL}/api/v1/submissions`, ({ request }) => {
  const url = new URL(request.url);
  
  // Pagination
  const page = parseInt(url.searchParams.get('page') || '0');
  const size = parseInt(url.searchParams.get('size') || '10');
  
  // Filtering
  const assignmentId = url.searchParams.get('assignmentId');
  const studentId = url.searchParams.get('studentId');
  const status = url.searchParams.get('status') as 'PENDING' | 'EVALUATED' | 'FAILED' | null;
  
  // Sorting: format "field1,direction;field2,direction"
  const sort = url.searchParams.get('sort');
  const sortCriteria = sort
    ? sort.split(';').map(s => {
        const [field, direction] = s.split(',');
        return { field, direction: direction?.toLowerCase() || 'asc' };
      })
    : [{ field: 'submittedAt', direction: 'desc' }];

  // Build filter logic
  let submissions = ALL_SUBMISSIONS;
  if (assignmentId) submissions = submissions.filter(s => s.assignmentId === assignmentId);
  if (studentId) submissions = submissions.filter(s => s.studentId === studentId);
  if (status) submissions = submissions.filter(s => s.status === status);

  // Apply sorting (simplified)
  submissions.sort((a, b) => {
    for (const { field, direction } of sortCriteria) {
      const aVal = a[field as keyof typeof a];
      const bVal = b[field as keyof typeof b];
      
      if (aVal !== bVal) {
        const cmp = aVal > bVal ? 1 : -1;
        return direction === 'desc' ? -cmp : cmp;
      }
    }
    return 0;
  });

  // Paginate
  const totalElements = submissions.length;
  const totalPages = Math.ceil(totalElements / size);
  const start = page * size;
  const content = submissions.slice(start, start + size);

  return HttpResponse.json({
    content,
    pageNumber: page,
    pageSize: size,
    totalElements,
    totalPages,
    first: page === 0,
    last: page === totalPages - 1,
    hasNext: page < totalPages - 1,
    hasPrevious: page > 0,
  });
});
```

---

### 7. Error Scenarios & Validation

Comprehensive error handling:

```typescript
// Email validation
http.post(`${BASE_URL}/api/auth/register`, async ({ request }) => {
  const body = await request.json() as any;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return HttpResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    );
  }

  // Validate password strength
  if (body.password.length < 8) {
    return HttpResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  // Check if user already exists (mock logic)
  if (EXISTING_USERS.find(u => u.email === body.email)) {
    return HttpResponse.json(
      { error: 'Email already registered' },
      { status: 409 }
    );
  }

  // Success
  return HttpResponse.json({
    token: `mock-token-${crypto.randomUUID()}`,
    type: 'Bearer',
    user: { /* ... */ },
  });
});

// Role validation
http.post(
  `${BASE_URL}/api/v1/assignments`,
  withAuth(async ({ request }) => {
    const role = getRoleFromToken(request.headers.get('Authorization'));
    
    if (role !== 'CONTENT_PROVIDER') {
      return HttpResponse.json(
        { error: 'Only content providers can create assignments' },
        { status: 403 }
      );
    }

    // Process creation...
  })
);

// Resource not found
http.get(`${BASE_URL}/api/v1/assignments/:id`, ({ params }) => {
  if (params.id === 'invalid-id') {
    return HttpResponse.json(
      { error: 'Assignment not found' },
      { status: 404 }
    );
  }
  // Return assignment...
});
```

---

## 📊 Coverage Summary

| Feature | Status | Example |
|---------|--------|---------|
| Test Case Results | ✅ Complete | Execution time, memory, actual output |
| Sorting & Filtering | ✅ Complete | Multi-field sort, status filter |
| Pagination | ✅ Complete | Page math, first/last detection |
| Role-Based Access | ✅ Complete | withAuth middleware |
| Error Handling | ✅ Enhanced | Validation, 404, 403 errors |
| Relationships | ✅ Enhanced | Skills, tutorials linked to assignments |
| Read Status | ✅ Enhanced | Message isRead tracking |
| Scheduling | ✅ Enhanced | Instructor-only date updates |
| PATCH Operations | ✅ Enhanced | Update tutorials, skills, assignments |

---

## 📚 Next Steps

1. **Create tests**: Go to `MSW-2-Testing-Patterns.md`
2. **E2E testing**: Go to `MSW-3-E2E-Testing.md` (Optional)
3. **Integrate with TanStack Query**: See `copilot-api-guide.md`

---

## 🔗 Resources

- **APSAS API Specs**: `openapi/` directory
- **Generated Types**: `src/api/types.gen.ts`
- **MSW Official Docs**: https://mswjs.io/docs
- **Request Handlers**: https://mswjs.io/docs/http/intercepting-requests/

---

**Created:** October 2025  
**Maintainer:** APSAS Development Team  
**Version:** 1.0

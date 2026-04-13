# AGENTS.md

## Project Overview

This folder contains APSAS end-to-end tests using:

- CodeceptJS test runner
- Playwright browser automation
- Allure reporting via `allure-codeceptjs`

E2E is expected to run against the real stack (gateway + backend services + piston + frontend), not a mock-only flow.

## Scope and Boundaries

- Make E2E changes inside `e2e/` only unless a request explicitly requires cross-project edits.
- Keep scenarios focused on observable behavior.
- Prefer minimal, targeted changes over broad refactors.

## Rules

- E2E tests include focus areas: `identity`, `content`, `submission`, `evaluation`, `support`.
- Each scenario must have Allure metadata: `epic`, `feature`, `story`, `severity`, `tag("e2e")`, `tag("regression")`, `tms`.
- Use shared steps in `steps_file.ts` for common flows (e.g. login).
- Attach screenshots on failure for UI debugging.
- Organize tests in `tests/<service>/<feature>.test.ts` structure.

## Setup Commands

Run all commands from `e2e/`.

Preferred setup:

```bash
bun install
bun run setup:playwright
```

## Development Workflow

Fast local checks:

```bash
npx codeceptjs check
bun run test
bun run test:parallel
```

Single-command with real stack:

```bash
bun run test:e2e
```

Run against already-running app:

```bash
APP_URL=http://localhost:5173 bun run test:real
```

Full real-stack workflow:

```bash
bun run stack:up
bun run test:real
bun run stack:down
```

Single-command CI-style workflow:

```bash
bun run test:ci
```

## Testing Instructions

### Test Locations and Naming

- Test files: `tests/**/*.test.ts`
- Shared helper steps: `steps_file.ts`
- Main config: `codecept.conf.js`

### Runtime Expectations

- Default base URL is `http://localhost:5173`.
- Override URL with `APP_URL`.
- Headless mode is controlled by `CI`.

### Seed Accounts and Data for Tests

Use the following seeded accounts/data when writing or running E2E scenarios:

### 👥 Người Dùng (Identity Service)

#### Admin (Quản Trị Viên)

| Email       | Password | Tên                  | Role  |
| ----------- | -------- | -------------------- | ----- |
| admin@apsas | admin    | System Administrator | ADMIN |

#### Instructors (Giảng Viên)

| Email             | Password           | Tên         | Role       |
| ----------------- | ------------------ | ----------- | ---------- |
| instructor1@apsas | SecurePassword123! | Tuấn Nguyễn | INSTRUCTOR |
| instructor2@apsas | SecurePassword123! | Hương Vũ    | INSTRUCTOR |
| instructor3@apsas | SecurePassword123! | Vinh Trần   | INSTRUCTOR |

#### Content Providers (Nhà Cung Cấp Nội Dung)

| Email                  | Password           | Tên     | Role             |
| ---------------------- | ------------------ | ------- | ---------------- |
| contentprovider1@apsas | SecurePassword123! | Minh Lê | CONTENT_PROVIDER |
| contentprovider2@apsas | SecurePassword123! | Lan Đỗ  | CONTENT_PROVIDER |

#### Students (Sinh Viên)

| Email           | Password           | Tên         | Role    |
| --------------- | ------------------ | ----------- | ------- |
| student1@apsas  | SecurePassword123! | An Trần     | STUDENT |
| student2@apsas  | SecurePassword123! | Quang Phạm  | STUDENT |
| student3@apsas  | SecurePassword123! | Bình Ngô    | STUDENT |
| student4@apsas  | SecurePassword123! | Duy Lâm     | STUDENT |
| student5@apsas  | SecurePassword123! | Hải Phan    | STUDENT |
| student6@apsas  | SecurePassword123! | Linh Võ     | STUDENT |
| student7@apsas  | SecurePassword123! | Nam Bùi     | STUDENT |
| student8@apsas  | SecurePassword123! | Phúc Đặng   | STUDENT |
| student9@apsas  | SecurePassword123! | Quỳnh Trịnh | STUDENT |
| student10@apsas | SecurePassword123! | Thảo Hoàng  | STUDENT |

### 📚 Bài Tập (Content Service)

Hệ thống có sẵn **5 bài tập lập trình** cơ bản:

| #   | Tiêu Đề                     | Độ Khó | Nhà Cung Cấp           | Điểm Tối Đa | Mô Tả                 |
| --- | --------------------------- | ------ | ---------------------- | ----------- | --------------------- |
| 1   | Hello World                 | EASY   | contentprovider1@apsas | 10          | In ra "Hello, World!" |
| 2   | Tính Tổng Hai Số            | EASY   | contentprovider2@apsas | 15          | Đọc 2 số, in ra tổng  |
| 3   | Kiểm Tra Số Chẵn Hay Lẻ     | EASY   | contentprovider1@apsas | 15          | Kiểm tra chẵn/lẻ      |
| 4   | Tìm Số Lớn Nhất Trong Ba Số | EASY   | contentprovider2@apsas | 20          | Tìm max của 3 số      |
| 5   | Tính Giai Thừa (Factorial)  | MEDIUM | contentprovider1@apsas | 25          | Tính n!               |

**Chi tiết các bài tập:**

- Mỗi bài tập có **12 test cases** (6 công khai + 6 ẩn)
- Hỗ trợ các ngôn ngữ: C, C++, Java, Kotlin, JavaScript, TypeScript
- Mỗi test case có timeout (2000ms) và memory limit (256MB)

### 🎓 Kỹ Năng Lập Trình (Skills)

Hệ thống có sẵn **8 kỹ năng** được ánh xạ với các bài tập:

1. **Basic Output** - In ra dữ liệu
2. **Basic Input** - Đọc dữ liệu
3. **Arithmetic Operations** - Phép toán cơ bản
4. **Conditional Logic** - Lệnh if/else
5. **Loops and Iteration** - Vòng lặp
6. **Recursion** - Hàm đệ quy
7. **Variables and Data Types** - Biến và kiểu dữ liệu
8. **Mathematical Calculation** - Tính toán toán học

### 📖 Hướng Dẫn (Tutorials)

Hệ thống có sẵn **8 hướng dẫn chi tiết** bằng Markdown:

1. **Hướng Dẫn In Ra Dữ Liệu** - Giới thiệu print/printf/cout
2. **Hướng Dẫn Đọc Dữ Liệu** - Giới thiệu input/scanf/cin
3. **Hướng Dẫn Phép Toán Cơ Bản** - Các phép +, -, \*, /, %
4. **Hướng Dẫn Điều Kiện** - If/else và toán tử so sánh
5. **Hướng Dẫn Vòng Lặp** - For/while/do-while
6. **Hướng Dẫn Hàm Đệ Quy** - Recursion và base case
7. **Hướng Dẫn Biến và Kiểu Dữ Liệu** - Variables declaration
8. **Hướng Dẫn Tính Toán Toán Học** - Math library functions

### 📊 Bài Nộp (Submissions)

Hệ thống có sẵn **10 bài nộp ví dụ** từ các sinh viên khác nhau:

- **6 bài PASSED** (100% test cases)
- **1 bài PARTIAL** (91.7% test cases - timeout issue)
- **1 bài FAILED** (0% test cases - missing I/O)
- Các bài nộp bằng **nhiều ngôn ngữ khác nhau** (Python, C, C++, Java, JavaScript, Kotlin)

**Hữu ích để:**

- Tham khảo cách triển khai khác nhau
- Kiểm tra công cụ chấm điểm (Evaluation Service)
- Kiểm tra giao diện hiển thị kết quả

### E2E Stack Composition

`docker-compose.e2e.yaml` starts:

- backend infrastructure (PostgreSQL, RabbitMQ, Redis)
- APSAS backend services and API gateway
- Piston API
- frontend with `VITE_ENABLE_MSW=false`

## CodeceptJS + Allure Authoring Guidelines

Use these conventions when writing or updating `tests/*.test.ts`.

### Scenario Design Rules

- One business behavior per `Scenario`.
- Prefer user-facing selectors (label, visible text, role) before CSS fallbacks.
- Avoid fixed sleeps; wait on meaningful UI states.
- Reuse shared actions in `steps_file.ts` for repeated flows.
- Keep data deterministic and independent between scenarios.

### Required Allure Metadata for Scenarios

Apply backend-style reporting discipline to e2e scenarios so triage is consistent.
Each scenario should set:

- `allure.epic(...)` - Current service or major feature area ("identity", "content", "submission", "evaluation", "support")
- `allure.feature(...)` - Specific feature under test ("authentication", "assignment management", "submission flow", "evaluation flow", "support flow")
- `allure.story(...)` - User story or behavior being tested ("student login", "instructor creates assignment", "student submits solution", "evaluator reviews submission", "user contacts support")
- `allure.severity("critical" | "normal" | "minor")`
- `allure.tag("e2e")`
- `allure.tag("regression")`
- `allure.tms("TMS-123")` - Test case ID

Also, the test must include screenshot attachments on failure for UI debugging.

- `allure.attachment(name: string, content: Buffer | string, options: ContentType | string | AttachmentOptions): PromiseLike<void>`
- `allure.attachmentPath(name: string, path: string, options: ContentType | string | Omit<AttachmentOptions, "encoding">): PromiseLike<void>`

```ts
const allure = require("allure-js-commons");
const { ContentType } = require("allure-js-commons");

Feature("Test My Website");

Scenario("Test Authentication", async () => {
  // ...

  await allure.attachment(
    "Text file",
    "This is the file content.",
    ContentType.TEXT,
  );

  await allure.attachmentPath("Screenshot", "/path/to/image.png", {
    contentType: ContentType.PNG,
    fileExtension: "png",
  });
});
```

Recommended pattern:

```ts
import allure from "allure-codeceptjs";

Feature("Authentication");

Scenario("student logs in with valid credentials", async ({ I }) => {
  await allure.epic("identity");
  await allure.feature("Authentication");
  await allure.story("Student Login");
  await allure.severity("critical");
  await allure.tag("e2e");
  await allure.tag("regression");

  I.amOnPage("/login");
  I.fillField("Email", "student1@apsas");
  I.fillField("Mật khẩu", "SecurePassword123!");
  I.click("Đăng nhập");
  I.waitForNavigation();
  I.dontSeeInCurrentUrl("/login");
});
```

## Allure Report Commands

Generate and open report:

```bash
bun run test:allure
bun run allure:open
```

Serve directly from raw results:

```bash
bun run allure:serve
```

Artifacts:

- Raw results: `allure-results/`
- Generated HTML report: `allure-report/`
- Codecept output/screenshots: `output/`

## Code Style Guidelines

- Follow existing JavaScript style used in nearby test files.
- Use clear, behavior-oriented scenario names.
- Keep helper methods in `steps_file.ts` semantic and reusable.
- Do not reformat unrelated files.

## Security and Data Handling

- Do not commit real credentials, secrets, or tokens.
- Use seeded/test accounts and environment variables only.
- Never attach sensitive values in Allure artifacts.

## Build and Execution Notes

- `test:e2e` performs stack-up, real test run, and stack-down through npm lifecycle hooks.
- `postinstall` and `setup:playwright` ensure browser binary/dependencies are installed.
- API gateway is reachable at `http://localhost:8080` during real-stack runs.

## Pull Request Checklist

Before opening or updating a PR with E2E changes:

```bash
npx codeceptjs check
bun run test
```

For integration confidence:

```bash
bun run test:ci
```

Do not commit generated artifacts:

- `output/`
- `allure-results/`
- `allure-report/`

## Troubleshooting

- Missing browser/system deps: run `bun run setup:playwright`.
- Stack startup issues: verify Docker daemon and retry `bun run stack:up`.
- Frontend unreachable: confirm `http://localhost:5173` is ready before running tests.
- Config updates: run `npx codeceptjs check` after editing `codecept.conf.js` or TypeScript test files.

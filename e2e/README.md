# APSAS E2E Tests

End-to-end tests for APSAS using [CodeceptJS](https://codecept.io/) + [Playwright](https://playwright.dev/).

> E2E uses the real backend stack (not MSW mock mode). Smoke/mock-only test scenarios are removed.

## Prerequisites

- Node.js 18+
- Docker + Docker Compose

## Setup

```bash
cd e2e
bun install
```

## Running Tests

### Run full E2E stack (backend + piston + frontend) and execute tests

```bash
bun run test:e2e
```

This uses Docker Compose (`docker-compose.e2e.yaml`) to:

1. Start backend infrastructure + backend services + piston API
2. Start frontend with `VITE_ENABLE_MSW=false`
3. Wait for services to become healthy
4. Run CodeceptJS against `http://localhost:5173`
5. Tear down the stack after tests finish

### Manage stack manually

```bash
bun run stack:up
bun run test:real
bun run stack:down
```

### Run with parallel workers

```bash
bun run test:parallel
```

## Allure Report

Generate and view Allure reports from CodeceptJS results:

```bash
# Run tests and generate report
bun run test:allure

# Open generated report
bun run allure:open
```

You can also serve directly from raw results:

```bash
bun run allure:serve
```

## Project Structure

```
e2e/
├── tests/             # Test files (*.test.ts)
│   └── login.test.ts
├── steps_file.ts      # Custom step definitions (shared helpers)
├── codecept.conf.js   # CodeceptJS configuration
├── docker-compose.e2e.yaml # Full E2E runtime stack
├── tsconfig.json      # TypeScript configuration
├── allure-results/    # Raw Allure results (git-ignored)
├── allure-report/     # Generated Allure report (git-ignored)
├── output/            # Screenshots, test artifacts (git-ignored)
└── package.json
```

## Writing Tests

Tests follow the [BDD-style Gherkin syntax](https://codecept.io/basics/#writing-tests):

```ts
Feature("My Feature")

Scenario("does something", ({ I }) => {
  I.amOnPage("/some-path")
  I.see("Expected text")
  I.fillField("Label", "value")
  I.click("Button text")
})
```

See [CodeceptJS Playwright helper docs](https://codecept.io/helpers/Playwright/) for all available actions.

## Test Accounts

Use accounts available in your backend seed data/environment.

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

## CI Integration

Set the `CI` environment variable to run tests in headless mode (GitHub Actions sets this automatically):

```bash
CI=true bun test
```

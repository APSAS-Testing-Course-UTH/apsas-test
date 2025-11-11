-- Content Provider 1 ID: 29ada301-a1f4-41d5-a8fb-dbb8618f2f1d
-- Content Provider 2 ID: bd3c3370-b0cd-4a3b-ab70-07028213daa0


-- ============================================================================
-- ASSIGNMENT 1: Hello World - In ra "Hello, World!"
-- ============================================================================
INSERT INTO content.assignments (id, title, description, difficulty_level, creator_id,
                                 start_date, due_date, max_score, status, languages, test_cases)
VALUES ('550e8400-e29b-41d4-a716-446655440001',
        'Hello World',
        $$# Hello World

Bài tập đầu tiên của bạn! Hãy viết một chương trình in ra dòng chữ **"Hello, World!"** lên màn hình.

## Yêu cầu
- In ra chính xác chuỗi "Hello, World!"
- Không có ký tự thừa trước hoặc sau
- In ra đúng một dòng$$,
        'EASY',
        '29ada301-a1f4-41d5-a8fb-dbb8618f2f1d',
        NOW(),
        NOW() + INTERVAL '30 days',
        10.00,
        'DRAFT',
        '[
          "c",
          "cpp",
          "java",
          "kotlin",
          "javascript",
          "typescript"
        ]'::jsonb,
        '[
          {
            "order": 1,
            "description": "Test case 1: Basic hello world",
            "hidden": false,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 2,
            "description": "Test case 2: Verify exact output",
            "hidden": false,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 3,
            "description": "Test case 3: No extra whitespace",
            "hidden": false,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 4,
            "description": "Test case 4: Single line output",
            "hidden": false,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 5,
            "description": "Test case 5: Case sensitive",
            "hidden": false,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 6,
            "description": "Test case 6: Hidden test 1",
            "hidden": true,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 7,
            "description": "Test case 7: Hidden test 2",
            "hidden": true,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 8,
            "description": "Test case 8: Hidden test 3",
            "hidden": true,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 9,
            "description": "Test case 9: Hidden test 4",
            "hidden": true,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 10,
            "description": "Test case 10: Hidden test 5",
            "hidden": true,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 11,
            "description": "Test case 11: Hidden test 6",
            "hidden": true,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 12,
            "description": "Test case 12: Performance test",
            "hidden": true,
            "weight": 1.0,
            "input": "",
            "output": "Hello, World!",
            "timeout": 5,
            "memoryLimit": 256
          }
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ASSIGNMENT 2: Tính tổng hai số nguyên
-- ============================================================================
INSERT INTO content.assignments (id, title, description, difficulty_level, creator_id,
                                 start_date, due_date, max_score, status, languages, test_cases)
VALUES ('550e8400-e29b-41d4-a716-446655440002',
        'Tính Tổng Hai Số',
        $$# Sum of Two Numbers

Viết chương trình nhập vào **hai số nguyên** và in ra **tổng** của chúng.

## Yêu cầu
- Đọc hai số từ input (cách nhau bởi dấu cách hoặc xuống dòng)
- Tính tổng hai số
- In ra kết quả

## Ví dụ
- Input: `5 3`
- Output: `8`$$,
        'EASY',
        'bd3c3370-b0cd-4a3b-ab70-07028213daa0',
        NOW(),
        NOW() + INTERVAL '30 days',
        15.00,
        'DRAFT',
        '[
          "c",
          "cpp",
          "java",
          "kotlin",
          "javascript",
          "typescript"
        ]'::jsonb,
        '[
          {
            "order": 1,
            "description": "Basic sum: 5 + 3",
            "hidden": false,
            "weight": 1.0,
            "input": "5 3",
            "output": "8",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 2,
            "description": "Sum with zero: 10 + 0",
            "hidden": false,
            "weight": 1.0,
            "input": "10 0",
            "output": "10",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 3,
            "description": "Negative numbers: -5 + 3",
            "hidden": false,
            "weight": 1.0,
            "input": "-5 3",
            "output": "-2",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 4,
            "description": "Large numbers: 1000000 + 2000000",
            "hidden": false,
            "weight": 1.0,
            "input": "1000000 2000000",
            "output": "3000000",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 5,
            "description": "Two negatives: -10 + -20",
            "hidden": false,
            "weight": 1.0,
            "input": "-10 -20",
            "output": "-30",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 6,
            "description": "Hidden test 1: 100 + 200",
            "hidden": true,
            "weight": 1.0,
            "input": "100 200",
            "output": "300",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 7,
            "description": "Hidden test 2: -100 + 100",
            "hidden": true,
            "weight": 1.0,
            "input": "-100 100",
            "output": "0",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 8,
            "description": "Hidden test 3: 7 + 8",
            "hidden": true,
            "weight": 1.0,
            "input": "7 8",
            "output": "15",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 9,
            "description": "Hidden test 4: 999 + 1",
            "hidden": true,
            "weight": 1.0,
            "input": "999 1",
            "output": "1000",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 10,
            "description": "Hidden test 5: -1 + -1",
            "hidden": true,
            "weight": 1.0,
            "input": "-1 -1",
            "output": "-2",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 11,
            "description": "Hidden test 6: 50 + 50",
            "hidden": true,
            "weight": 1.0,
            "input": "50 50",
            "output": "100",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 12,
            "description": "Hidden test 7: 333 + 667",
            "hidden": true,
            "weight": 1.0,
            "input": "333 667",
            "output": "1000",
            "timeout": 5,
            "memoryLimit": 256
          }
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ASSIGNMENT 3: Kiểm tra số chẵn hay lẻ
-- ============================================================================
INSERT INTO content.assignments (id, title, description, difficulty_level, creator_id,
                                 start_date, due_date, max_score, status, languages, test_cases)
VALUES ('550e8400-e29b-41d4-a716-446655440003',
        'Kiểm Tra Số Chẵn Hay Lẻ',
        $$# Even or Odd

Viết chương trình nhập vào một **số nguyên** và xác định xem nó là **chẵn** hay **lẻ**.

## Yêu cầu
- Đọc một số nguyên từ input
- Kiểm tra xem số đó là chẵn hay lẻ
- In ra "Even" nếu là chẵn, "Odd" nếu là lẻ

## Ví dụ
- Input: `4`
- Output: `Even`
- Input: `7`
- Output: `Odd`$$,
        'EASY',
        '29ada301-a1f4-41d5-a8fb-dbb8618f2f1d',
        NOW(),
        NOW() + INTERVAL '30 days',
        15.00,
        'DRAFT',
        '[
          "c",
          "cpp",
          "java",
          "kotlin",
          "javascript",
          "typescript"
        ]'::jsonb,
        '[
          {
            "order": 1,
            "description": "Test even: 4",
            "hidden": false,
            "weight": 1.0,
            "input": "4",
            "output": "Even",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 2,
            "description": "Test odd: 7",
            "hidden": false,
            "weight": 1.0,
            "input": "7",
            "output": "Odd",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 3,
            "description": "Zero: 0",
            "hidden": false,
            "weight": 1.0,
            "input": "0",
            "output": "Even",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 4,
            "description": "One: 1",
            "hidden": false,
            "weight": 1.0,
            "input": "1",
            "output": "Odd",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 5,
            "description": "Negative even: -10",
            "hidden": false,
            "weight": 1.0,
            "input": "-10",
            "output": "Even",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 6,
            "description": "Negative odd: -15",
            "hidden": false,
            "weight": 1.0,
            "input": "-15",
            "output": "Odd",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 7,
            "description": "Hidden test 1: 100",
            "hidden": true,
            "weight": 1.0,
            "input": "100",
            "output": "Even",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 8,
            "description": "Hidden test 2: 99",
            "hidden": true,
            "weight": 1.0,
            "input": "99",
            "output": "Odd",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 9,
            "description": "Hidden test 3: -2",
            "hidden": true,
            "weight": 1.0,
            "input": "-2",
            "output": "Even",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 10,
            "description": "Hidden test 4: 1001",
            "hidden": true,
            "weight": 1.0,
            "input": "1001",
            "output": "Odd",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 11,
            "description": "Hidden test 5: 2000",
            "hidden": true,
            "weight": 1.0,
            "input": "2000",
            "output": "Even",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 12,
            "description": "Hidden test 6: -777",
            "hidden": true,
            "weight": 1.0,
            "input": "-777",
            "output": "Odd",
            "timeout": 5,
            "memoryLimit": 256
          }
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ASSIGNMENT 4: Tìm số lớn nhất trong ba số
-- ============================================================================
INSERT INTO content.assignments (id, title, description, difficulty_level, creator_id,
                                 start_date, due_date, max_score, status, languages, test_cases)
VALUES ('550e8400-e29b-41d4-a716-446655440004',
        'Tìm Số Lớn Nhất Trong Ba Số',
        $$# Maximum of Three Numbers

Viết chương trình nhập vào **ba số nguyên** và tìm ra **số lớn nhất** trong ba số đó.

## Yêu cầu
- Đọc ba số từ input (cách nhau bởi dấu cách hoặc xuống dòng)
- Tìm số lớn nhất
- In ra kết quả

## Ví dụ
- Input: `5 10 3`
- Output: `10`
- Input: `-5 -10 -3`
- Output: `-3`$$,
        'EASY',
        'bd3c3370-b0cd-4a3b-ab70-07028213daa0',
        NOW(),
        NOW() + INTERVAL '30 days',
        20.00,
        'DRAFT',
        '[
          "c",
          "cpp",
          "java",
          "kotlin",
          "javascript",
          "typescript"
        ]'::jsonb,
        '[
          {
            "order": 1,
            "description": "Max in middle: 5 10 3",
            "hidden": false,
            "weight": 1.0,
            "input": "5 10 3",
            "output": "10",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 2,
            "description": "Max at end: 3 5 10",
            "hidden": false,
            "weight": 1.0,
            "input": "3 5 10",
            "output": "10",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 3,
            "description": "Max at start: 10 5 3",
            "hidden": false,
            "weight": 1.0,
            "input": "10 5 3",
            "output": "10",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 4,
            "description": "All equal: 5 5 5",
            "hidden": false,
            "weight": 1.0,
            "input": "5 5 5",
            "output": "5",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 5,
            "description": "Negative numbers: -5 -10 -3",
            "hidden": false,
            "weight": 1.0,
            "input": "-5 -10 -3",
            "output": "-3",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 6,
            "description": "Mixed signs: -5 0 10",
            "hidden": false,
            "weight": 1.0,
            "input": "-5 0 10",
            "output": "10",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 7,
            "description": "Hidden test 1: 100 50 75",
            "hidden": true,
            "weight": 1.0,
            "input": "100 50 75",
            "output": "100",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 8,
            "description": "Hidden test 2: 1 1 2",
            "hidden": true,
            "weight": 1.0,
            "input": "1 1 2",
            "output": "2",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 9,
            "description": "Hidden test 3: -100 -50 -200",
            "hidden": true,
            "weight": 1.0,
            "input": "-100 -50 -200",
            "output": "-50",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 10,
            "description": "Hidden test 4: 0 0 0",
            "hidden": true,
            "weight": 1.0,
            "input": "0 0 0",
            "output": "0",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 11,
            "description": "Hidden test 5: 999 500 750",
            "hidden": true,
            "weight": 1.0,
            "input": "999 500 750",
            "output": "999",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 12,
            "description": "Hidden test 6: -1 -2 -3",
            "hidden": true,
            "weight": 1.0,
            "input": "-1 -2 -3",
            "output": "-1",
            "timeout": 5,
            "memoryLimit": 256
          }
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ASSIGNMENT 5: Tính giai thừa (Factorial)
-- ============================================================================
INSERT INTO content.assignments (id, title, description, difficulty_level, creator_id,
                                 start_date, due_date, max_score, status, languages, test_cases)
VALUES ('550e8400-e29b-41d4-a716-446655440005',
        'Tính Giai Thừa (Factorial)',
        $$# Factorial Calculation

Viết chương trình tính **giai thừa** (factorial) của một số nguyên dương.

## Yêu cầu
- Đọc một số nguyên dương n từ input
- Tính n! = n × (n-1) × (n-2) × ... × 1
- In ra kết quả
- 0! = 1

## Ví dụ
- Input: `5`
- Output: `120` (5! = 5 × 4 × 3 × 2 × 1 = 120)
- Input: `0`
- Output: `1` (0! = 1)$$,
        'MEDIUM',
        '29ada301-a1f4-41d5-a8fb-dbb8618f2f1d',
        NOW(),
        NOW() + INTERVAL '30 days',
        25.00,
        'DRAFT',
        '[
          "c",
          "cpp",
          "java",
          "kotlin",
          "javascript",
          "typescript"
        ]'::jsonb,
        '[
          {
            "order": 1,
            "description": "Basic: 5!",
            "hidden": false,
            "weight": 1.0,
            "input": "5",
            "output": "120",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 2,
            "description": "Base case: 0!",
            "hidden": false,
            "weight": 1.0,
            "input": "0",
            "output": "1",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 3,
            "description": "Simple: 1!",
            "hidden": false,
            "weight": 1.0,
            "input": "1",
            "output": "1",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 4,
            "description": "Another: 3!",
            "hidden": false,
            "weight": 1.0,
            "input": "3",
            "output": "6",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 5,
            "description": "4!",
            "hidden": false,
            "weight": 1.0,
            "input": "4",
            "output": "24",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 6,
            "description": "6!",
            "hidden": false,
            "weight": 1.0,
            "input": "6",
            "output": "720",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 7,
            "description": "Hidden test 1: 2!",
            "hidden": true,
            "weight": 1.0,
            "input": "2",
            "output": "2",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 8,
            "description": "Hidden test 2: 7!",
            "hidden": true,
            "weight": 1.0,
            "input": "7",
            "output": "5040",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 9,
            "description": "Hidden test 3: 8!",
            "hidden": true,
            "weight": 1.0,
            "input": "8",
            "output": "40320",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 10,
            "description": "Hidden test 4: 10!",
            "hidden": true,
            "weight": 1.0,
            "input": "10",
            "output": "3628800",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 11,
            "description": "Hidden test 5: 9!",
            "hidden": true,
            "weight": 1.0,
            "input": "9",
            "output": "362880",
            "timeout": 5,
            "memoryLimit": 256
          },
          {
            "order": 12,
            "description": "Hidden test 6: 12!",
            "hidden": true,
            "weight": 1.0,
            "input": "12",
            "output": "479001600",
            "timeout": 5,
            "memoryLimit": 256
          }
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SKILLS - Kỹ năng lập trình
-- ============================================================================
INSERT INTO content.skills (id, name, description)
VALUES ('60000000-0000-0000-0000-000000000001', 'Basic Output',
        'Khả năng in ra dữ liệu lên màn hình sử dụng print/printf/cout'),
       ('60000000-0000-0000-0000-000000000002', 'Basic Input',
        'Khả năng đọc dữ liệu từ người dùng sử dụng input/scanf/cin'),
       ('60000000-0000-0000-0000-000000000003', 'Arithmetic Operations',
        'Khả năng thực hiện các phép toán cơ bản (cộng, trừ, nhân, chia)'),
       ('60000000-0000-0000-0000-000000000004', 'Conditional Logic',
        'Khả năng sử dụng if/else để kiểm tra điều kiện'),
       ('60000000-0000-0000-0000-000000000005', 'Loops and Iteration',
        'Khả năng sử dụng for/while/do-while loops'),
       ('60000000-0000-0000-0000-000000000006', 'Recursion', 'Khả năng viết hàm đệ quy'),
       ('60000000-0000-0000-0000-000000000007', 'Variables and Data Types',
        'Khả năng khai báo và sử dụng biến với các kiểu dữ liệu khác nhau'),
       ('60000000-0000-0000-0000-000000000008', 'Mathematical Calculation',
        'Khả năng thực hiện các tính toán toán học phức tạp')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ASSIGNMENT-SKILL ASSOCIATIONS - Gán kỹ năng cho bài tập
-- ============================================================================

-- Assignment 1: Hello World - Skills: Basic Output, Variables and Data Types
INSERT INTO content.assignment_skills (assignment_id, skill_id)
VALUES ('550e8400-e29b-41d4-a716-446655440001', '60000000-0000-0000-0000-000000000001'),
       ('550e8400-e29b-41d4-a716-446655440001', '60000000-0000-0000-0000-000000000007')
ON CONFLICT (assignment_id, skill_id) DO NOTHING;

-- Assignment 2: Sum of Two Numbers - Skills: Basic Input, Basic Output, Arithmetic Operations, Variables and Data Types
INSERT INTO content.assignment_skills (assignment_id, skill_id)
VALUES ('550e8400-e29b-41d4-a716-446655440002', '60000000-0000-0000-0000-000000000002'),
       ('550e8400-e29b-41d4-a716-446655440002', '60000000-0000-0000-0000-000000000001'),
       ('550e8400-e29b-41d4-a716-446655440002', '60000000-0000-0000-0000-000000000003'),
       ('550e8400-e29b-41d4-a716-446655440002', '60000000-0000-0000-0000-000000000007')
ON CONFLICT (assignment_id, skill_id) DO NOTHING;

-- Assignment 3: Even or Odd - Skills: Conditional Logic, Basic Input, Basic Output, Arithmetic Operations, Variables and Data Types
INSERT INTO content.assignment_skills (assignment_id, skill_id)
VALUES ('550e8400-e29b-41d4-a716-446655440003', '60000000-0000-0000-0000-000000000004'),
       ('550e8400-e29b-41d4-a716-446655440003', '60000000-0000-0000-0000-000000000002'),
       ('550e8400-e29b-41d4-a716-446655440003', '60000000-0000-0000-0000-000000000001'),
       ('550e8400-e29b-41d4-a716-446655440003', '60000000-0000-0000-0000-000000000003'),
       ('550e8400-e29b-41d4-a716-446655440003', '60000000-0000-0000-0000-000000000007')
ON CONFLICT (assignment_id, skill_id) DO NOTHING;

-- Assignment 4: Maximum of Three Numbers - Skills: Conditional Logic, Basic Input, Basic Output, Variables and Data Types
INSERT INTO content.assignment_skills (assignment_id, skill_id)
VALUES ('550e8400-e29b-41d4-a716-446655440004', '60000000-0000-0000-0000-000000000004'),
       ('550e8400-e29b-41d4-a716-446655440004', '60000000-0000-0000-0000-000000000002'),
       ('550e8400-e29b-41d4-a716-446655440004', '60000000-0000-0000-0000-000000000001'),
       ('550e8400-e29b-41d4-a716-446655440004', '60000000-0000-0000-0000-000000000007')
ON CONFLICT (assignment_id, skill_id) DO NOTHING;

-- Assignment 5: Factorial - Skills: Recursion, Loops and Iteration, Basic Input, Basic Output, Arithmetic Operations, Mathematical Calculation, Variables and Data Types
INSERT INTO content.assignment_skills (assignment_id, skill_id)
VALUES ('550e8400-e29b-41d4-a716-446655440005', '60000000-0000-0000-0000-000000000006'),
       ('550e8400-e29b-41d4-a716-446655440005', '60000000-0000-0000-0000-000000000005'),
       ('550e8400-e29b-41d4-a716-446655440005', '60000000-0000-0000-0000-000000000002'),
       ('550e8400-e29b-41d4-a716-446655440005', '60000000-0000-0000-0000-000000000001'),
       ('550e8400-e29b-41d4-a716-446655440005', '60000000-0000-0000-0000-000000000003'),
       ('550e8400-e29b-41d4-a716-446655440005', '60000000-0000-0000-0000-000000000008'),
       ('550e8400-e29b-41d4-a716-446655440005', '60000000-0000-0000-0000-000000000007')
ON CONFLICT (assignment_id, skill_id) DO NOTHING;

-- ============================================================================
-- TUTORIALS - Hướng dẫn chi tiết (với markdown support)
-- ============================================================================

-- Tutorial 1: Hướng dẫn Basic Output
INSERT INTO content.tutorials (id, title, content, creator_id, tags)
VALUES ('70000000-0000-0000-0000-000000000001',
        'Hướng Dẫn In Ra Dữ Liệu (Basic Output)',
        $$# In Ra Dữ Liệu Lên Màn Hình

## Giới Thiệu
Kỹ năng in ra dữ liệu là một trong những kỹ năng cơ bản nhất trong lập trình. Bạn sẽ sử dụng nó trong hầu hết các chương trình.

## Các Cách In Ra Trong Các Ngôn Ngữ Khác Nhau

### C
```c
#include <stdio.h>
int main() {
    printf("Hello, World!\n")
ON CONFLICT (id) DO NOTHING;
    return 0;
}
```

### C++
```cpp
#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
```

### Java
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!")
ON CONFLICT (id) DO NOTHING;
    }
}
```

### Python
```python
print("Hello, World!")
```

### JavaScript
```javascript
console.log("Hello, World!")
ON CONFLICT (id) DO NOTHING;
```

## Lưu Ý Quan Trọng
- Luôn thêm **newline** (`\n`) ở cuối để xuống dòng
- Kiểm tra định dạng output chính xác
- Không in thêm khoảng trắng không cần thiết$$,
        '29ada301-a1f4-41d5-a8fb-dbb8618f2f1d',
        '[
          "basics",
          "output",
          "beginner"
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Tutorial 2: Hướng dẫn Basic Input
INSERT INTO content.tutorials (id, title, content, creator_id, tags)
VALUES ('70000000-0000-0000-0000-000000000002',
        'Hướng Dẫn Đọc Dữ Liệu Từ Người Dùng (Basic Input)',
        $$# Đọc Dữ Liệu Từ Input

## Giới Thiệu
Để tương tác với người dùng, bạn cần học cách đọc dữ liệu đầu vào.

## Các Cách Đọc Input Trong Các Ngôn Ngữ

### C
```c
#include <stdio.h>
int main() {
    int num;
    scanf("%d", &num)
ON CONFLICT (id) DO NOTHING;
    printf("Bạn nhập: %d\n", num)
ON CONFLICT (id) DO NOTHING;
    return 0;
}
```

### C++
```cpp
#include <iostream>
using namespace std;
int main() {
    int num;
    cin >> num;
    cout << "Bạn nhập: " << num << endl;
    return 0;
}
```

### Java
```java
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in)
ON CONFLICT (id) DO NOTHING;
        int num = scanner.nextInt()
ON CONFLICT (id) DO NOTHING;
        System.out.println("Bạn nhập: " + num)
ON CONFLICT (id) DO NOTHING;
    }
}
```

### JavaScript
```javascript
// Node.js với readline
const readline = require('readline')
ON CONFLICT (id) DO NOTHING;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
ON CONFLICT (id) DO NOTHING;
rl.question('Nhập số: ', (answer) => {
    console.log('Bạn nhập: ' + answer)
ON CONFLICT (id) DO NOTHING;
    rl.close()
ON CONFLICT (id) DO NOTHING;
})
ON CONFLICT (id) DO NOTHING;
```

## Lưu Ý
- Luôn kiểm tra định dạng dữ liệu đầu vào
- Xử lý lỗi khi dữ liệu không hợp lệ$$,
        'bd3c3370-b0cd-4a3b-ab70-07028213daa0',
        '[
          "basics",
          "input",
          "beginner"
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Tutorial 3: Hướng dẫn Arithmetic Operations
INSERT INTO content.tutorials (id, title, content, creator_id, tags)
VALUES ('70000000-0000-0000-0000-000000000003',
        'Hướng Dẫn Phép Toán Cơ Bản (Arithmetic Operations)',
        $$# Phép Toán Cơ Bản

## Giới Thiệu
Phép toán cơ bản là nền tảng của hầu hết các chương trình tính toán.

## Các Phép Toán

| Phép Toán | Ký Hiệu | Ví Dụ | Kết Quả |
|-----------|---------|-------|---------|
| Cộng | `+` | `5 + 3` | `8` |
| Trừ | `-` | `5 - 3` | `2` |
| Nhân | `*` | `5 * 3` | `15` |
| Chia | `/` | `6 / 2` | `3` |
| Chia lấy dư | `%` | `7 % 3` | `1` |

## Ví Dụ Code

### C/C++
```c
int a = 10, b = 3;
int sum = a + b;        // 13
int diff = a - b;       // 7
int prod = a * b;       // 30
int div = a / b;        // 3
int mod = a % b;        // 1
```

### Java
```java
int a = 10, b = 3;
int sum = a + b;        // 13
int diff = a - b;       // 7
int prod = a * b;       // 30
int div = a / b;        // 3
int mod = a % b;        // 1
```

## Lưu Ý Quan Trọng
- **Chia lấy dư** chỉ dùng cho số nguyên
- **Thứ tự ưu tiên**: `*`, `/`, `%` trước `+`, `-`
- Sử dụng **ngoặc đơn** để chỉ rõ thứ tự tính toán$$,
        '29ada301-a1f4-41d5-a8fb-dbb8618f2f1d',
        '[
          "basics",
          "arithmetic",
          "math",
          "beginner"
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Tutorial 4: Hướng dẫn Conditional Logic
INSERT INTO content.tutorials (id, title, content, creator_id, tags)
VALUES ('70000000-0000-0000-0000-000000000004',
        'Hướng Dẫn Điều Kiện (Conditional Logic)',
        $$# Lệnh Điều Kiện (If/Else)

## Giới Thiệu
Điều kiện cho phép chương trình của bạn đưa ra quyết định dựa trên các giá trị.

## Cú Pháp If/Else

### C/C++/Java
```java
if (condition) {
    // Code thực thi nếu điều kiện đúng
} else if (condition2) {
    // Code thực thi nếu điều kiện 2 đúng
} else {
    // Code thực thi nếu tất cả điều kiện sai
}
```

## Các Toán Tử So Sánh

| Toán Tử | Ý Nghĩa | Ví Dụ |
|---------|---------|-------|
| `==` | Bằng | `5 == 5` → `true` |
| `!=` | Không bằng | `5 != 3` → `true` |
| `<` | Nhỏ hơn | `3 < 5` → `true` |
| `>` | Lớn hơn | `5 > 3` → `true` |
| `<=` | Nhỏ hơn hoặc bằng | `5 <= 5` → `true` |
| `>=` | Lớn hơn hoặc bằng | `5 >= 5` → `true` |

## Các Toán Tử Logic

- `&&` (AND): Cả hai điều kiện đều đúng
- `||` (OR): Ít nhất một điều kiện đúng
- `!` (NOT): Phủ định điều kiện

## Ví Dụ Thực Tế

### Kiểm Tra Chẵn Lẻ
```java
int num = 4;
if (num % 2 == 0) {
    System.out.println("Even")
ON CONFLICT (id) DO NOTHING;
} else {
    System.out.println("Odd")
ON CONFLICT (id) DO NOTHING;
}
```

### Tìm Số Lớn Nhất
```java
int a = 5, b = 10, c = 3;
if (a >= b && a >= c) {
    System.out.println(a)
ON CONFLICT (id) DO NOTHING;
} else if (b >= a && b >= c) {
    System.out.println(b)
ON CONFLICT (id) DO NOTHING;
} else {
    System.out.println(c)
ON CONFLICT (id) DO NOTHING;
}
```$$,
        'bd3c3370-b0cd-4a3b-ab70-07028213daa0',
        '[
          "basics",
          "conditions",
          "control-flow",
          "intermediate"
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Tutorial 5: Hướng dẫn Loops and Iteration
INSERT INTO content.tutorials (id, title, content, creator_id, tags)
VALUES ('70000000-0000-0000-0000-000000000005',
        'Hướng Dẫn Vòng Lặp (Loops and Iteration)',
        $$# Vòng Lặp (Loops)

## Giới Thiệu
Vòng lặp cho phép bạn lặp lại một block code nhiều lần.

## Các Loại Vòng Lặp

### For Loop
```java
for (int i = 0; i < 5; i++) {
    System.out.println(i)
ON CONFLICT (id) DO NOTHING;
}
// Output: 0, 1, 2, 3, 4
```

### While Loop
```java
int i = 0;
while (i < 5) {
    System.out.println(i)
ON CONFLICT (id) DO NOTHING;
    i++;
}
```

### Do-While Loop
```java
int i = 0;
do {
    System.out.println(i)
ON CONFLICT (id) DO NOTHING;
    i++;
} while (i < 5)
ON CONFLICT (id) DO NOTHING;
```

## Ví Dụ: Tính Tổng

```java
int sum = 0;
for (int i = 1; i <= 5; i++) {
    sum += i;  // sum = sum + i
}
System.out.println(sum);  // Output: 15
```

## Control Statements
- `break`: Thoát khỏi vòng lặp
- `continue`: Bỏ qua vòng lặp hiện tại, chuyển sang vòng tiếp theo$$,
        '29ada301-a1f4-41d5-a8fb-dbb8618f2f1d',
        '[
          "basics",
          "loops",
          "control-flow",
          "intermediate"
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Tutorial 6: Hướng dẫn Recursion
INSERT INTO content.tutorials (id, title, content, creator_id, tags)
VALUES ('70000000-0000-0000-0000-000000000006',
        'Hướng Dẫn Hàm Đệ Quy (Recursion)',
        $$# Hàm Đệ Quy (Recursion)

## Giới Thiệu
Đệ quy (Recursion) là khi một hàm gọi chính nó để giải quyết một vấn đề.

## Các Thành Phần Của Đệ Quy

1. **Base Case**: Điều kiện dừng (không gọi lại hàm)
2. **Recursive Case**: Hàm gọi lại chính nó với đối số nhỏ hơn

## Ví Dụ: Tính Giai Thừa

```java
int factorial(int n) {
    if (n == 0 || n == 1) {  // Base case
        return 1;
    } else {
        return n * factorial(n - 1);  // Recursive case
    }
}

int result = factorial(5);  // 5 * 4 * 3 * 2 * 1 = 120
```

## Ví Dụ: Tính Số Fibonacci

```java
int fibonacci(int n) {
    if (n <= 1) {
        return n;
    } else {
        return fibonacci(n - 1) + fibonacci(n - 2)
ON CONFLICT (id) DO NOTHING;
    }
}
```

## Lưu Ý Quan Trọng
- **Luôn có base case** để tránh infinite recursion
- Đệ quy có thể chậm hơn loop vì overhead của gọi hàm
- Sử dụng **memoization** để tối ưu hóa$$,
        'bd3c3370-b0cd-4a3b-ab70-07028213daa0',
        '[
          "advanced",
          "recursion",
          "functions",
          "intermediate"
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Tutorial 7: Hướng dẫn Variables and Data Types
INSERT INTO content.tutorials (id, title, content, creator_id, tags)
VALUES ('70000000-0000-0000-0000-000000000007',
        'Hướng Dẫn Biến và Kiểu Dữ Liệu (Variables and Data Types)',
        $$# Biến và Kiểu Dữ Liệu

## Giới Thiệu
Biến là nơi lưu trữ dữ liệu, mỗi biến có một kiểu dữ liệu cụ thể.

## Các Kiểu Dữ Liệu Cơ Bản

### Số Nguyên (Integer)
```java
byte a = 10;        // 1 byte: -128 to 127
short b = 1000;     // 2 bytes
int c = 100000;     // 4 bytes (thường dùng)
long d = 10000000000L;  // 8 bytes
```

### Số Thực (Float/Double)
```java
float x = 3.14f;    // 4 bytes
double y = 3.14159; // 8 bytes (thường dùng)
```

### Ký Tự (Char)
```java
char letter = 'A';
```

### Logic (Boolean)
```java
boolean flag = true;
boolean result = false;
```

### Chuỗi (String)
```java
String name = "Hello";
```

## Khai Báo Biến

```java
int age = 25;           // Khai báo và gán giá trị
String name;            // Khai báo (giá trị mặc định là null)
name = "John";          // Gán giá trị sau
```

## Quy Tắc Đặt Tên Biến
- Bắt đầu bằng chữ cái hoặc underscore
- Chỉ chứa chữ cái, chữ số, underscore
- Phân biệt chữ hoa/thường
- Không được là từ khóa (keyword)$$,
        '29ada301-a1f4-41d5-a8fb-dbb8618f2f1d',
        '[
          "basics",
          "variables",
          "data-types",
          "beginner"
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Tutorial 8: Hướng dẫn Mathematical Calculation
INSERT INTO content.tutorials (id, title, content, creator_id, tags)
VALUES ('70000000-0000-0000-0000-000000000008',
        'Hướng Dẫn Tính Toán Toán Học (Mathematical Calculation)',
        $$# Tính Toán Toán Học

## Giới Thiệu
Sử dụng các hàm toán học từ thư viện chuẩn để giải quyết các bài toán phức tạp.

## Các Hàm Toán Học Phổ Biến

### C/C++
```c
#include <math.h>

sqrt(16);           // Căn bậc hai: 4.0
pow(2, 3);          // Lũy thừa: 8.0
abs(-5);            // Giá trị tuyệt đối: 5
ceil(3.2);          // Làm tròn lên: 4.0
floor(3.7);         // Làm tròn xuống: 3.0
round(3.5);         // Làm tròn: 4.0
sin(0);             // Hàm sin
cos(0);             // Hàm cos
```

### Java
```java
Math.sqrt(16);      // 4.0
Math.pow(2, 3);     // 8.0
Math.abs(-5);       // 5
Math.ceil(3.2);     // 4.0
Math.floor(3.7);    // 3.0
Math.round(3.5);    // 4
Math.sin(0);        // Hàm sin
Math.cos(0);        // Hàm cos
```

## Ví Dụ: Tính Diện Tích Hình Tròn

```java
double radius = 5;
double area = Math.PI * Math.pow(radius, 2)
ON CONFLICT (id) DO NOTHING;
System.out.println(area);  // 78.53981633974483
```

## Ví Dụ: Giải Phương Trình Bậc Hai

```java
// ax^2 + bx + c = 0
double a = 1, b = -5, c = 6;
double delta = b * b - 4 * a * c;
double x1 = (-b + Math.sqrt(delta)) / (2 * a)
ON CONFLICT (id) DO NOTHING;
double x2 = (-b - Math.sqrt(delta)) / (2 * a)
ON CONFLICT (id) DO NOTHING;
```$$,
        'bd3c3370-b0cd-4a3b-ab70-07028213daa0',
        '[
          "math",
          "advanced",
          "calculations"
        ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TUTORIAL-SKILL ASSOCIATIONS - Liên kết Tutorials với Skills
-- ============================================================================

-- Tutorial 1 (Basic Output) → Skill 1 (Basic Output)
INSERT INTO content.assignment_tutorials (assignment_id, tutorial_id)
VALUES ('550e8400-e29b-41d4-a716-446655440001', '70000000-0000-0000-0000-000000000001')
ON CONFLICT (assignment_id, tutorial_id) DO NOTHING;

-- Tutorial 2 (Basic Input) → Skill 2 (Basic Input)
INSERT INTO content.assignment_tutorials (assignment_id, tutorial_id)
VALUES ('550e8400-e29b-41d4-a716-446655440002', '70000000-0000-0000-0000-000000000002')
ON CONFLICT (assignment_id, tutorial_id) DO NOTHING;

-- Tutorial 3 (Arithmetic Operations) → Assignment 2 (Sum of Two Numbers)
INSERT INTO content.assignment_tutorials (assignment_id, tutorial_id)
VALUES ('550e8400-e29b-41d4-a716-446655440002', '70000000-0000-0000-0000-000000000003')
ON CONFLICT (assignment_id, tutorial_id) DO NOTHING;

-- Tutorial 4 (Conditional Logic) → Assignment 3 (Even or Odd) và Assignment 4 (Max of Three)
INSERT INTO content.assignment_tutorials (assignment_id, tutorial_id)
VALUES ('550e8400-e29b-41d4-a716-446655440003', '70000000-0000-0000-0000-000000000004'),
       ('550e8400-e29b-41d4-a716-446655440004', '70000000-0000-0000-0000-000000000004')
ON CONFLICT (assignment_id, tutorial_id) DO NOTHING;

-- Tutorial 5 (Loops) → Assignment 5 (Factorial)
INSERT INTO content.assignment_tutorials (assignment_id, tutorial_id)
VALUES ('550e8400-e29b-41d4-a716-446655440005', '70000000-0000-0000-0000-000000000005')
ON CONFLICT (assignment_id, tutorial_id) DO NOTHING;

-- Tutorial 6 (Recursion) → Assignment 5 (Factorial)
INSERT INTO content.assignment_tutorials (assignment_id, tutorial_id)
VALUES ('550e8400-e29b-41d4-a716-446655440005', '70000000-0000-0000-0000-000000000006')
ON CONFLICT (assignment_id, tutorial_id) DO NOTHING;

-- Tutorial 7 (Variables and Data Types) → Tất cả các assignments
INSERT INTO content.assignment_tutorials (assignment_id, tutorial_id)
VALUES ('550e8400-e29b-41d4-a716-446655440001', '70000000-0000-0000-0000-000000000007'),
       ('550e8400-e29b-41d4-a716-446655440002', '70000000-0000-0000-0000-000000000007'),
       ('550e8400-e29b-41d4-a716-446655440003', '70000000-0000-0000-0000-000000000007'),
       ('550e8400-e29b-41d4-a716-446655440004', '70000000-0000-0000-0000-000000000007'),
       ('550e8400-e29b-41d4-a716-446655440005', '70000000-0000-0000-0000-000000000007')
ON CONFLICT (assignment_id, tutorial_id) DO NOTHING;

-- Tutorial 8 (Mathematical Calculation) → Assignment 5 (Factorial)
INSERT INTO content.assignment_tutorials (assignment_id, tutorial_id)
VALUES ('550e8400-e29b-41d4-a716-446655440005', '70000000-0000-0000-0000-000000000008')
ON CONFLICT (assignment_id, tutorial_id) DO NOTHING;

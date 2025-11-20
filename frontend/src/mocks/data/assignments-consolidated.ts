/**
 * CONSOLIDATED MOCK ASSIGNMENT DATA
 * Phase 10: Refactored with nested submissions and performance metrics
 * 
 * Structure:
 * - Each assignment includes nested submissions[] that belong to it
 * - Each assignment includes performanceMetrics calculated from submissions
 * - Each assignment includes studentDeadlines for deadline tracking
 */

import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import { mockSubmissions } from './submissions'

// Current date for relative calculations
const now = new Date()
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

/**
 * Extended Assignment type with nested submissions and metrics
 */
export interface ConsolidatedAssignment extends ContentServiceAssignmentResponse {
  submissions?: Array<{
    id: string
    studentId: string
    submittedAt: Date
    status: 'EVALUATED' | 'PENDING' | 'FAILED'
    result?: 'PASSED' | 'FAILED' | 'PARTIAL'
    score?: number
    language: string
  }>
  performanceMetrics?: {
    totalSubmissions: number
    passedSubmissions: number
    averageScore: number
    passRate: number
    lastSubmittedAt?: Date
  }
  studentDeadlines?: {
    [studentId: string]: {
      deadline: Date
      extension?: {
        grantedUntil: Date
        reason: string
      }
    }
  }
}

/**
 * Helper function to calculate performance metrics from submissions
 */
function calculatePerformanceMetrics(submissions: typeof mockSubmissions) {
  const evaluated = submissions.filter(s => s.status === 'EVALUATED' && s.result)
  const passed = evaluated.filter(s => s.result === 'PASSED')
  const scores = evaluated.filter(s => s.score !== undefined).map(s => s.score || 0)
  
  return {
    totalSubmissions: submissions.length,
    passedSubmissions: passed.length,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    passRate: submissions.length > 0 ? Math.round((passed.length / evaluated.length) * 100) : 0,
    lastSubmittedAt: submissions.length > 0 
      ? (submissions as any).sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0].submittedAt
      : undefined
  }
}

/**
 * Consolidated mock assignments with nested submissions
 */
export const consolidatedMockAssignments: Record<string, ConsolidatedAssignment> = {
  // ===== OVERDUE ASSIGNMENTS =====
  '550e8400-e29b-41d4-a716-446655440100': {
    id: '550e8400-e29b-41d4-a716-446655440100',
    title: 'Tính tổng mảng số nguyên',
    description: `# Bài tập: Tính tổng mảng số nguyên

## Yêu cầu

Viết chương trình tính **tổng các phần tử** trong mảng số nguyên.

### Input
- Một mảng các số nguyên

### Output
- Tổng của tất cả các phần tử trong mảng

### Ví dụ

\`\`\`python
Input: [1, 2, 3, 4, 5]
Output: 15
\`\`\`

> **Lưu ý:** Hãy xử lý cả trường hợp mảng rỗng!`,
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    dueDate: yesterday,
    maxScore: 50,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript'],
    testCases: [
      {
        order: 1,
        description: 'Test với mảng đơn giản',
        hidden: false,
        weight: 1.0,
        input: '[1, 2, 3, 4, 5]',
        output: '15',
        timeout: 1000,
        memoryLimit: 128,
      },
    ],
    skills: [],
    tutorials: [],
    // NESTED: Submissions for this assignment
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440100') as any,
    // NESTED: Performance metrics
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440100')
    ),
    // NESTED: Student-specific deadlines
    studentDeadlines: {
      'student-001': {
        deadline: yesterday,
        extension: undefined
      }
    }
  },

  // ===== DUE TODAY =====
  '550e8400-e29b-41d4-a716-446655440101': {
    id: '550e8400-e29b-41d4-a716-446655440101',
    title: 'Sắp xếp mảng',
    description: `# Thuật toán QuickSort

## Mô tả

Implement thuật toán **sắp xếp nhanh (QuickSort)** để sắp xếp mảng số nguyên theo thứ tự tăng dần.

## Yêu cầu

1. Implement thuật toán QuickSort chuẩn
2. Sắp xếp mảng **tại chỗ** (in-place)
3. Time complexity: **O(n log n)** trung bình

### Input
- Mảng số nguyên chưa sắp xếp

### Output
- Mảng đã được sắp xếp tăng dần

### Ví dụ

\`\`\`python
Input:  [5, 2, 8, 1, 9]
Output: [1, 2, 5, 8, 9]
\`\`\`

## Tips

- Chọn pivot thông minh để tránh worst case
- Xử lý các edge cases (mảng rỗng, 1 phần tử)`,
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    dueDate: now,
    maxScore: 100,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'cpp'],
    testCases: [
      {
        order: 1,
        description: 'Test mảng ngẫu nhiên',
        hidden: false,
        weight: 1.0,
        input: '[5, 2, 8, 1, 9]',
        output: '[1, 2, 5, 8, 9]',
        timeout: 2000,
        memoryLimit: 256,
      },
      {
        order: 2,
        description: 'Test mảng đã sắp xếp',
        hidden: true,
        weight: 1.5,
        input: '[1, 2, 3, 4, 5]',
        output: '[1, 2, 3, 4, 5]',
        timeout: 2000,
        memoryLimit: 256,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440101') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440101')
    ),
    studentDeadlines: {
      'student-001': { deadline: now }
    }
  },

  // ===== DUE TOMORROW =====
  '550e8400-e29b-41d4-a716-446655440102': {
    id: '550e8400-e29b-41d4-a716-446655440102',
    title: 'Tìm kiếm nhị phân',
    description: `# Binary Search Algorithm

## Mô tả

Implement thuật toán **tìm kiếm nhị phân** trong mảng đã được sắp xếp.

## Yêu cầu

### Input
- Một mảng số nguyên **đã sắp xếp tăng dần**
- Giá trị cần tìm \`target\`

### Output
- **Index** của phần tử nếu tìm thấy
- **-1** nếu không tìm thấy

### Ví dụ

\`\`\`python
Input:  arr = [1, 3, 5, 7, 9], target = 5
Output: 2

Input:  arr = [1, 3, 5, 7, 9], target = 4
Output: -1
\`\`\`

## Độ phức tạp yêu cầu

- **Time complexity:** O(log n)
- **Space complexity:** O(1)

> **Gợi ý:** Sử dụng kỹ thuật chia đôi (divide and conquer)`,
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: lastWeek,
    updatedAt: lastWeek,
    startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    dueDate: tomorrow,
    maxScore: 80,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript', 'cpp'],
    testCases: [
      {
        order: 1,
        description: 'Tìm phần tử có trong mảng',
        hidden: false,
        weight: 1.0,
        input: 'arr=[1,3,5,7,9], target=5',
        output: '2',
        timeout: 1000,
        memoryLimit: 128,
      },
      {
        order: 2,
        description: 'Tìm phần tử không có trong mảng',
        hidden: false,
        weight: 1.0,
        input: 'arr=[1,3,5,7,9], target=4',
        output: '-1',
        timeout: 1000,
        memoryLimit: 128,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440102') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440102')
    ),
    studentDeadlines: {
      'student-001': { deadline: tomorrow }
    }
  },

  // ===== NEXT WEEK =====
  '550e8400-e29b-41d4-a716-446655440103': {
    id: '550e8400-e29b-41d4-a716-446655440103',
    title: 'Cây nhị phân tìm kiếm (BST)',
    description: `# Binary Search Tree (BST)

## Mô tả

Implement cấu trúc dữ liệu **Cây nhị phân tìm kiếm** với đầy đủ các thao tác.

## Yêu cầu implement

### Các phương thức cần có:

1. \`insert(value)\` - Chèn node mới vào cây
2. \`search(value)\` - Tìm kiếm node có giá trị cho trước
3. \`delete(value)\` - Xóa node khỏi cây
4. \`inorderTraversal()\` - Duyệt cây theo thứ tự In-order

### Tính chất BST cần đảm bảo:

- Node bên trái < Node gốc
- Node bên phải > Node gốc
- Tất cả subtree phải thỏa mãn tính chất BST

## Ví dụ

\`\`\`python
bst = BST()
bst.insert(5)
bst.insert(3)
bst.insert(7)
bst.insert(1)
bst.insert(9)

bst.search(7)  # True
bst.search(4)  # False

bst.inorderTraversal()  # [1, 3, 5, 7, 9]
\`\`\`

## Độ phức tạp mong đợi

- **Insert:** O(log n) trung bình
- **Search:** O(log n) trung bình
- **Delete:** O(log n) trung bình

> **Lưu ý:** Xử lý cẩn thận trường hợp xóa node có 2 con!`,
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    startDate: yesterday,
    dueDate: nextWeek,
    maxScore: 150,
    status: 'PUBLISHED',
    languages: ['java', 'cpp', 'python'],
    testCases: [
      {
        order: 1,
        description: 'Test insert và search',
        hidden: false,
        weight: 2.0,
        input: 'insert [5,3,7,1,9], search 7',
        output: 'found',
        timeout: 3000,
        memoryLimit: 512,
      },
      {
        order: 2,
        description: 'Test delete node',
        hidden: true,
        weight: 2.0,
        input: 'insert [5,3,7,1,9], delete 3',
        output: 'deleted',
        timeout: 3000,
        memoryLimit: 512,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440103') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440103')
    ),
    studentDeadlines: {
      'student-001': { deadline: nextWeek }
    }
  },

  // ===== DUE IN 2 WEEKS =====
  '550e8400-e29b-41d4-a716-446655440104': {
    id: '550e8400-e29b-41d4-a716-446655440104',
    title: 'Thuật toán đồ thị - Dijkstra',
    description: `# Dijkstra's Shortest Path Algorithm

## Mô tả

Implement **thuật toán Dijkstra** để tìm đường đi ngắn nhất từ một đỉnh nguồn đến tất cả các đỉnh khác trong đồ thị có trọng số.

## Yêu cầu

### Input
- Đồ thị có hướng/vô hướng với trọng số **không âm**
- Đỉnh nguồn \`source\`

### Output
- Mảng khoảng cách ngắn nhất từ \`source\` đến mọi đỉnh khác
- Đường đi ngắn nhất (optional)

## Thuật toán

1. Khởi tạo khoảng cách tất cả đỉnh = ∞, trừ \`source\` = 0
2. Sử dụng **priority queue** (min-heap)
3. Lặp lại:
   - Lấy đỉnh có khoảng cách nhỏ nhất chưa xét
   - Cập nhật khoảng cách các đỉnh kề

### Ví dụ

\`\`\`python
Graph:
  0 --7--> 1
  |      / |
  2    1   8
  |  /     |
  2 --2--> 3

source = 0
Output: [0, 7, 2, 4]  # Khoảng cách từ 0 đến các đỉnh
\`\`\`

## Độ phức tạp

- **Time:** O((V + E) log V) với priority queue
- **Space:** O(V)

> **Lưu ý:** Không hoạt động với cạnh có trọng số âm!`,
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: now,
    updatedAt: now,
    startDate: tomorrow,
    dueDate: inTwoWeeks,
    maxScore: 200,
    status: 'PUBLISHED',
    languages: ['cpp', 'java', 'python'],
    testCases: [
      {
        order: 1,
        description: 'Đồ thị đơn giản 5 đỉnh',
        hidden: false,
        weight: 3.0,
        input: 'graph with 5 vertices',
        output: 'shortest paths',
        timeout: 5000,
        memoryLimit: 1024,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440104') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440104')
    ),
    studentDeadlines: {
      'student-001': { deadline: inTwoWeeks }
    }
  },

  // ===== EASY ASSIGNMENTS FOR BEGINNERS =====
  '550e8400-e29b-41d4-a716-446655440105': {
    id: '550e8400-e29b-41d4-a716-446655440105',
    title: 'Hello World nâng cao',
    description: `# Hello World - Personalized Version

## Bài tập khởi đầu

Viết chương trình in ra lời chào cá nhân hóa.

## Yêu cầu

### Input
- Một chuỗi ký tự là tên người dùng

### Output
- Chuỗi \`"Hello, [Tên]!"\` với tên được thay thế

### Ví dụ

\`\`\`
Input:  Alice
Output: Hello, Alice!

Input:  Bob
Output: Hello, Bob!
\`\`\`

## Gợi ý

- Đọc input từ stdin
- Sử dụng string formatting/concatenation
- In ra stdout

> **Tip:** Đây là bài tập làm quen với I/O cơ bản!`,
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    maxScore: 30,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript', 'cpp'],
    testCases: [
      {
        order: 1,
        description: 'Test với tên đơn giản',
        hidden: false,
        weight: 1.0,
        input: 'Alice',
        output: 'Hello, Alice!',
        timeout: 500,
        memoryLimit: 64,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440105') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440105')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440106': {
    id: '550e8400-e29b-41d4-a716-446655440106',
    title: 'Tính giai thừa',
    description: `# Factorial Calculator

## Mô tả

Viết hàm tính **giai thừa** của một số nguyên dương \`n\`.

## Công thức

\`\`\`
Factorial(n) = n! = 1 × 2 × 3 × ... × n
\`\`\`

### Trường hợp đặc biệt

- \`0! = 1\` (theo định nghĩa)
- \`1! = 1\`

## Yêu cầu

### Input
- Số nguyên không âm \`n\` (0 ≤ n ≤ 20)

### Output
- Giá trị \`n!\`

### Ví dụ

\`\`\`python
Input:  5
Output: 120  # 5! = 5 × 4 × 3 × 2 × 1

Input:  0
Output: 1    # 0! = 1 theo định nghĩa

Input:  3
Output: 6    # 3! = 3 × 2 × 1
\`\`\`

## Gợi ý implement

**Cách 1: Iterative**
\`\`\`python
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result
\`\`\`

**Cách 2: Recursive**
\`\`\`python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
\`\`\`

> **Lưu ý:** Cẩn thận với overflow khi n lớn!`,
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
    maxScore: 60,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript'],
    testCases: [
      {
        order: 1,
        description: 'Factorial of 5',
        hidden: false,
        weight: 1.0,
        input: '5',
        output: '120',
        timeout: 1000,
        memoryLimit: 128,
      },
      {
        order: 2,
        description: 'Factorial of 0',
        hidden: false,
        weight: 1.0,
        input: '0',
        output: '1',
        timeout: 1000,
        memoryLimit: 128,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440106') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440106')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000) }
    }
  },

  // ===== ADDITIONAL ASSIGNMENTS (continued for pagination) =====
  '550e8400-e29b-41d4-a716-446655440107': {
    id: '550e8400-e29b-41d4-a716-446655440107',
    title: 'Regex Pattern Matching',
    description: `# Regular Expressions - Pattern Matching

## Mô tả

Viết chương trình sử dụng **regular expressions** để tìm kiếm và validate các pattern.

## Các pattern cần implement

### 1. Email Validation
- Pattern: \`user@domain.com\`
- Phải có @ và domain hợp lệ

### 2. Phone Number
- Pattern: \`(XXX) XXX-XXXX\` hoặc \`XXX-XXX-XXXX\`

### 3. URL Validation
- Pattern: \`http://\` hoặc \`https://\`

### 4. Date Format
- Pattern: \`DD/MM/YYYY\` hoặc \`YYYY-MM-DD\`

## Ví dứ

\`\`\`python
# Email
validate_email("user@example.com")  # True
validate_email("invalid.email")     # False

# Phone
validate_phone("(123) 456-7890")    # True
validate_phone("123-456-7890")      # True
validate_phone("12345")             # False
\`\`\`

## Yêu cầu

1. Sử dụng regex library của ngôn ngữ
2. Viết test cases cho từng pattern
3. Xử lý edge cases

> **Tip:** Học và thực hành regex trên [regex101.com](https://regex101.com)!`,
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
    maxScore: 90,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440107') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440107')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440108': {
    id: '550e8400-e29b-41d4-a716-446655440108',
    title: 'Hash Table Implementation',
    description: `# Hash Table with Chaining

## Mô tả

Implement một **hash table cơ bản** với xử lý collision bằng **chaining**.

## Các thao tác cần implement

### 1. \`put(key, value)\`
- Thêm hoặc cập nhật key-value pair
- Time: O(1) trung bình

### 2. \`get(key)\`
- Lấy giá trị theo key
- Trả về \`null\` nếu không tồn tại
- Time: O(1) trung bình

### 3. \`remove(key)\`
- Xóa key-value pair
- Time: O(1) trung bình

### 4. \`contains(key)\`
- Kiểm tra key có tồn tại không

## Chi tiết kỹ thuật

### Hash Function
\`\`\`python
def hash(key):
    return sum(ord(c) for c in str(key)) % table_size
\`\`\`

### Collision Resolution: Chaining
- Mỗi bucket chứa một linked list
- Các phần tử cùng hash nối tiếp nhau

### Ví dụ

\`\`\`python
ht = HashTable(size=10)

ht.put("name", "Alice")
ht.put("age", 25)
ht.put("city", "Hanoi")

print(ht.get("name"))    # "Alice"
print(ht.get("age"))     # 25

ht.remove("city")
print(ht.contains("city"))  # False
\`\`\`

## Yêu cầu bổ sung

1. Handle resize khi load factor > 0.75
2. Support cả string và integer keys
3. Xử lý collision hiệu quả

> **Challenge:** Implement dynamic resizing để maintain O(1) performance!`,
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
    maxScore: 180,
    status: 'PUBLISHED',
    languages: ['java', 'cpp', 'python'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440108') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440108')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440109': {
    id: '550e8400-e29b-41d4-a716-446655440109',
    title: 'Simple Linked List',
    description: `# Singly Linked List

## Mô tả

Implement cấu trúc dữ liệu **Singly Linked List** với các thao tác cơ bản.

## Cấu trúc Node

\`\`\`python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
\`\`\`

## Các thao tác cần implement

### 1. \`insert(data)\`
- Thêm node mới vào cuối danh sách
- Time: O(n)

### 2. \`insertAtHead(data)\`
- Thêm node mới vào đầu
- Time: O(1)

### 3. \`delete(data)\`
- Xóa node chứa giá trị \`data\`
- Time: O(n)

### 4. \`search(data)\`
- Tìm kiếm node có giá trị \`data\`
- Trả về \`True/False\`
- Time: O(n)

### 5. \`reverse()\`
- Đảo ngược danh sách liên kết
- Time: O(n)
- Space: O(1) (in-place)

## Ví dụ

\`\`\`python
ll = LinkedList()

ll.insert(1)         # 1
ll.insert(2)         # 1 -> 2
ll.insert(3)         # 1 -> 2 -> 3
ll.insertAtHead(0)   # 0 -> 1 -> 2 -> 3

ll.search(2)         # True
ll.search(5)         # False

ll.delete(2)         # 0 -> 1 -> 3
ll.reverse()         # 3 -> 1 -> 0
\`\`\`

## Tips

- Xử lý cẩn thận con trỏ \`next\`
- Kiểm tra edge cases: list rỗng, 1 node, xóa head/tail

> **Challenge:** Thử implement Doubly Linked List nếu hoàn thành!`,
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    maxScore: 120,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440109') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440109')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440110': {
    id: '550e8400-e29b-41d4-a716-446655440110',
    title: 'Palindrome Checker',
    description: `# Palindrome String Checker

## Mô tả

Viết hàm kiểm tra xem một chuỗi có phải là **palindrome** hay không.

## Palindrome là gì?

Một chuỗi là palindrome nếu **đọc xuôi bằng đọc ngược**.

## Yêu cầu

### Input
- Một chuỗi ký tự

### Output
- \`True\` nếu là palindrome
- \`False\` nếu không phải

### Ví dụ

\`\`\`python
isPalindrome("racecar")    # True
isPalindrome("hello")      # False
isPalindrome("A man a plan a canal Panama")  # True (ignore spaces & case)
isPalindrome("12321")      # True
isPalindrome("12345")      # False
\`\`\`

## Phương pháp giải

### Cách 1: Two Pointers
\`\`\`python
def isPalindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True
\`\`\`

### Cách 2: String Reversal
\`\`\`python
def isPalindrome(s):
    return s == s[::-1]
\`\`\`

## Yêu cầu bổ sung

1. **Ignore spaces** và **punctuation**
2. **Case-insensitive** (A = a)
3. Chỉ xét alphanumeric characters

> **Tip:** Sử dụng \`.lower()\` và \`.isalnum()\` để xử lý!`,
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    maxScore: 40,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440110') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440110')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440111': {
    id: '550e8400-e29b-41d4-a716-446655440111',
    title: 'Merge Two Sorted Arrays',
    description: `# Merge Two Sorted Arrays

## Mô tả

Ghép hai mảng **đã được sắp xếp** thành một mảng đã sắp xếp.

## Yêu cầu

### Input
- Hai mảng số nguyên đã sắp xếp tăng dần

### Output
- Một mảng mới chứa tất cả phần tử, đã sắp xếp tăng dần

### Ví dụ

\`\`\`python
Input:
  arr1 = [1, 3, 5, 7]
  arr2 = [2, 4, 6, 8]
  
Output:
  [1, 2, 3, 4, 5, 6, 7, 8]
\`\`\`

\`\`\`python
Input:
  arr1 = [1, 2, 3]
  arr2 = [4, 5, 6]
  
Output:
  [1, 2, 3, 4, 5, 6]
\`\`\`

## Thuật toán - Two Pointers

\`\`\`python
def merge(arr1, arr2):
    result = []
    i, j = 0, 0
    
    while i < len(arr1) and j < len(arr2):
        if arr1[i] <= arr2[j]:
            result.append(arr1[i])
            i += 1
        else:
            result.append(arr2[j])
            j += 1
    
    # Thêm phần tử còn lại
    result.extend(arr1[i:])
    result.extend(arr2[j:])
    
    return result
\`\`\`

## Độ phức tạp

- **Time:** O(n + m) - n, m là độ dài 2 mảng
- **Space:** O(n + m) - mảng kết quả

## Edge Cases cần xử lý

1. Một mảng rỗng
2. Hai mảng rỗng
3. Mảng có phần tử trùng lặp

> **Application:** Đây là bước quan trọng trong **Merge Sort**!`,
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
    maxScore: 50,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'cpp'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440111') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440111')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440112': {
    id: '550e8400-e29b-41d4-a716-446655440112',
    title: 'Two Sum Problem',
    description: `# Two Sum - LeetCode Classic

## Mô tả

Cho một mảng các số và một giá trị \`target\`, tìm **hai số** trong mảng có tổng bằng \`target\`.

## Yêu cầu

### Input
- Mảng số nguyên \`nums\`
- Số nguyên \`target\`

### Output
- Mảng chứa **indices** của hai số
- Hoặc \`None\` nếu không tìm thấy

### Constraints
- Mỗi input chỉ có **đúng 1** lời giải
- Không được dùng chính phần tử đó 2 lần

## Ví dụ

\`\`\`python
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]  # nums[0] + nums[1] = 2 + 7 = 9
\`\`\`

\`\`\`python
Input:  nums = [3, 2, 4], target = 6
Output: [1, 2]  # nums[1] + nums[2] = 2 + 4 = 6
\`\`\`

## Phương pháp giải

### Cách 1: Brute Force - O(n²)
\`\`\`python
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            return [i, j]
\`\`\`

### Cách 2: Hash Map - O(n) ⭐
\`\`\`python
def twoSum(nums, target):
    seen = {}  # {value: index}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return None
\`\`\`

## Độ phức tạp tối ưu

- **Time:** O(n)
- **Space:** O(n)

> **Interview Tip:** Đây là bài LeetCode #1 - rất phổ biến trong phỏng vấn!`,
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    maxScore: 100,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440112') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440112')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440113': {
    id: '550e8400-e29b-41d4-a716-446655440113',
    title: 'Queue Implementation',
    description: `# Queue Data Structure

## Mô tả

Implement cấu trúc dữ liệu **Queue** (hàng đợi) với các thao tác cơ bản.

## Nguyên tắc FIFO

**First In, First Out** - Phần tử vào trước ra trước

## Các thao tác cần implement

### 1. \`enqueue(item)\`
- Thêm phần tử vào **cuối** queue
- Time: O(1)

### 2. \`dequeue()\`
- Lấy và xóa phần tử ở **đầu** queue
- Trả về \`None\` nếu queue rỗng
- Time: O(1)

### 3. \`peek()\`
- Xem phần tử đầu **không xóa**
- Time: O(1)

### 4. \`isEmpty()\`
- Kiểm tra queue có rỗng không
- Time: O(1)

### 5. \`size()\`
- Trả về số lượng phần tử

## Ví dụ

\`\`\`python
queue = Queue()

queue.enqueue(1)    # [1]
queue.enqueue(2)    # [1, 2]
queue.enqueue(3)    # [1, 2, 3]

queue.peek()        # 1 (không xóa)
queue.dequeue()     # 1 (xóa và trả về)
queue.dequeue()     # 2

queue.size()        # 1
queue.isEmpty()     # False
\`\`\`

## Cách implement

### Cách 1: Sử dụng List
\`\`\`python
class Queue:
    def __init__(self):
        self.items = []
    
    def enqueue(self, item):
        self.items.append(item)
    
    def dequeue(self):
        return self.items.pop(0) if self.items else None
\`\`\`

### Cách 2: Sử dụng Linked List (hiệu quả hơn)

## Ứng dụng thực tế

- Task scheduling
- BFS algorithm
- Print queue management

> **Tip:** Python có sẵn \`collections.deque\` nhưng hãy tự implement để học!`,
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    maxScore: 110,
    status: 'PUBLISHED',
    languages: ['java', 'python', 'cpp'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440113') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440113')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440114': {
    id: '550e8400-e29b-41d4-a716-446655440114',
    title: 'Stack Implementation',
    description: `# Stack Data Structure

## Mô tả

Implement cấu trúc dữ liệu **Stack** (ngăn xếp) với các thao tác cơ bản.

## Nguyên tắc LIFO

**Last In, First Out** - Vào sau ra trước

## Các thao tác cần implement

### 1. \`push(item)\`
- Đẩy phần tử vào **đỉnh** stack
- Time: O(1)

### 2. \`pop()\`
- Lấy và xóa phần tử ở **đỉnh** stack
- Trả về \`None\` nếu stack rỗng
- Time: O(1)

### 3. \`peek()\` / \`top()\`
- Xem phần tử đỉnh **không xóa**
- Time: O(1)

### 4. \`isEmpty()\`
- Kiểm tra stack có rỗng không

### 5. \`size()\`
- Trả về số phần tử trong stack

## Ví dụ

\`\`\`python
stack = Stack()

stack.push(1)       # [1]
stack.push(2)       # [1, 2]
stack.push(3)       # [1, 2, 3]

stack.peek()        # 3 (không xóa)
stack.pop()         # 3 (xóa và trả về)
stack.pop()         # 2

stack.size()        # 1
stack.isEmpty()     # False
\`\`\`

## Implementation

\`\`\`python
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        return self.items.pop() if self.items else None
    
    def peek(self):
        return self.items[-1] if self.items else None
    
    def isEmpty(self):
        return len(self.items) == 0
\`\`\`

## Ứng dụng thực tế

- **Function call stack** trong programming
- **Undo/Redo** functionality
- **Expression evaluation** (postfix, infix)
- **DFS** algorithm
- **Browser history** (back button)

> **Interview Question:** Câu hỏi kinh điển - implement stack bằng 2 queues!`,
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
    maxScore: 105,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440114') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440114')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440115': {
    id: '550e8400-e29b-41d4-a716-446655440115',
    title: 'Bubble Sort Implementation',
    description: `# Bubble Sort Algorithm

## Mô tả

Implement thuật toán **Bubble Sort** để sắp xếp mảng tăng dần.

## Cách hoạt động

1. So sánh cặp phần tử kề nhau
2. **Swap** nếu không đúng thứ tự
3. Lặp lại cho đến khi mảng đã sắp xếp

## Ví dụ minh họa

\`\`\`
Pass 1: [5, 2, 8, 1, 9]
        [2, 5, 8, 1, 9]  (swap 5, 2)
        [2, 5, 8, 1, 9]
        [2, 5, 1, 8, 9]  (swap 8, 1)
        [2, 5, 1, 8, 9]

Pass 2: [2, 5, 1, 8, 9]
        [2, 1, 5, 8, 9]  (swap 5, 1)
        ...
        
Final:  [1, 2, 5, 8, 9]
\`\`\`

## Implementation

### Basic Version
\`\`\`python
def bubbleSort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
\`\`\`

### Optimized Version
\`\`\`python
def bubbleSort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:  # Đã sắp xếp
            break
    return arr
\`\`\`

## Độ phức tạp

- **Worst case:** O(n²) - mảng ngược
- **Best case:** O(n) - mảng đã sắp xếp (với optimization)
- **Average:** O(n²)
- **Space:** O(1) - in-place sorting

## Pros & Cons

✅ **Pros:**
- Đơn giản, dễ hiểu
- Stable sort
- In-place sorting

❌ **Cons:**
- Chậm với mảng lớn
- Không hiệu quả cho production

> **Learning Purpose:** Đây là thuật toán để **học**, không dùng thực tế!`,
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
    maxScore: 55,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440115') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440115')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440116': {
    id: '550e8400-e29b-41d4-a716-446655440116',
    title: 'Merge Sort Implementation',
    description: `# Merge Sort Algorithm

## Mô tả

Implement thuật toán **Merge Sort** - một trong những thuật toán sắp xếp hiệu quả nhất.

## Kỹ thuật: Divide and Conquer

### 3 bước chính:

1. **Divide:** Chia mảng thành 2 nửa
2. **Conquer:** Đệ quy sắp xếp 2 nửa
3. **Merge:** Ghép 2 mảng đã sắp xếp

## Ví dụ minh họa

\`\`\`
[38, 27, 43, 3, 9, 82, 10]
         |
    [38, 27, 43, 3]    [9, 82, 10]
         |                  |
   [38, 27]  [43, 3]   [9, 82]  [10]
      |         |          |
   [38] [27] [43] [3]  [9] [82]  [10]
      ↓         ↓          ↓
   [27, 38]  [3, 43]  [9, 82, 10]
         ↓                  ↓
    [3, 27, 38, 43]   [9, 10, 82]
              ↓
    [3, 9, 10, 27, 38, 43, 82]
\`\`\`

## Implementation

\`\`\`python
def mergeSort(arr):
    if len(arr) <= 1:
        return arr
    
    # Divide
    mid = len(arr) // 2
    left = mergeSort(arr[:mid])
    right = mergeSort(arr[mid:])
    
    # Merge
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result
\`\`\`

## Độ phức tạp

- **Time Complexity:** **O(n log n)** trong mọi trường hợp ⭐
- **Space Complexity:** O(n) - cần bộ nhớ phụ

## Ưu điểm

✅ Stable sort
✅ Độ phức tạp ổn định O(n log n)
✅ Hiệu quả với mảng lớn
✅ Dùng trong thực tế (Java's Arrays.sort cho objects)

> **Production Ready:** Đây là thuật toán **thực tế**, không chỉ để học!`,
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
    maxScore: 160,
    status: 'PUBLISHED',
    languages: ['cpp', 'java', 'python'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440116') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440116')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440117': {
    id: '550e8400-e29b-41d4-a716-446655440117',
    title: 'Fibonacci Sequence',
    description: `# Fibonacci Number Calculator

## Mô tả

Tính số **Fibonacci** thứ \`n\` với **cả hai cách**: iterative và recursive.

## Dãy Fibonacci

\`\`\`
F(0) = 0
F(1) = 1
F(n) = F(n-1) + F(n-2) với n ≥ 2
\`\`\`

### Dãy số:
\`\`\`
0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, ...
\`\`\`

## Yêu cầu implement

Implement **2 phương pháp**:

### 1. Recursive (Simple)

\`\`\`python
def fibonacci_recursive(n):
    if n <= 1:
        return n
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)
\`\`\`

- **Time:** O(2ⁿ) - rất chậm! 🐢
- **Space:** O(n) - call stack

### 2. Iterative (Efficient)

\`\`\`python
def fibonacci_iterative(n):
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
\`\`\`

- **Time:** O(n) ⭐
- **Space:** O(1)

### 3. Dynamic Programming (Bonus)

\`\`\`python
def fibonacci_dp(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]
\`\`\`

- **Time:** O(n)
- **Space:** O(n)

## Test Cases

\`\`\`python
fibonacci(0)  → 0
fibonacci(1)  → 1
fibonacci(2)  → 1
fibonacci(5)  → 5
fibonacci(10) → 55
fibonacci(20) → 6765
\`\`\`

## So sánh Performance

| n | Recursive | Iterative |
|---|-----------|----------|
| 10 | Fast | Instant |
| 30 | Slow | Instant |
| 40 | Very Slow | Instant |
| 50 | Timeout! | Instant |

> **Interview Tip:** Luôn chọn iterative trong production code!`,
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
    maxScore: 70,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440117') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440117')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440019': {
    id: '550e8400-e29b-41d4-a716-446655440019',
    title: 'Longest Common Subsequence',
    description: `# Longest Common Subsequence (LCS)

## Mô tả

Tìm **longest common subsequence** (LCS) của hai chuỗi sử dụng **Dynamic Programming**.

## LCS là gì?

Subsequence là dãy các ký tự xuất hiện theo **thứ tự** (không nhất thiết liên tiếp).

### Ví dụ

\`\`\`
String 1: "ABCDGH"
String 2: "AEDFHR"

Common subsequences: "A", "AD", "AH", "ADH", ...
Longest: "ADH" (length = 3)
\`\`\`

\`\`\`
String 1: "AGGTAB"
String 2: "GXTXAYB"

LCS: "GTAB" (length = 4)
\`\`\`

## Thuật toán DP

### Công thức

\`\`\`
Nếu s1[i] == s2[j]:
    dp[i][j] = 1 + dp[i-1][j-1]
Ngược lại:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
\`\`\`

### Implementation

\`\`\`python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = 1 + dp[i-1][j-1]
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]
\`\`\`

## Độ phức tạp

- **Time:** O(m × n)
- **Space:** O(m × n)

## Yêu cầu bổ sung

1. Trả về **độ dài** LCS
2. Trả về **chuỗi** LCS (backtrack)

### Backtracking để lấy chuỗi

\`\`\`python
def getLCS(s1, s2, dp):
    result = []
    i, j = len(s1), len(s2)
    
    while i > 0 and j > 0:
        if s1[i-1] == s2[j-1]:
            result.append(s1[i-1])
            i -= 1
            j -= 1
        elif dp[i-1][j] > dp[i][j-1]:
            i -= 1
        else:
            j -= 1
    
    return ''.join(reversed(result))
\`\`\`

## Ứng dụng

- **Diff tools** (git diff, file comparison)
- **DNA sequence alignment**
- **Plagiarism detection**

> **Classic DP Problem:** Một trong những bài DP kinh điển nhất!`,
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
    maxScore: 170,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'cpp'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440019') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440019')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440020': {
    id: '550e8400-e29b-41d4-a716-446655440020',
    title: 'Prime Number Checker',
    description: `# Prime Number Checker

## Mô tả

Viết hàm kiểm tra xem một số có phải là **số nguyên tố** hay không.

## Số nguyên tố là gì?

Số nguyên tố (prime number) là số tự nhiên **lớn hơn 1** chỉ chia hết cho **1 và chính nó**.

### Ví dụ

\`\`\`
Prime:     2, 3, 5, 7, 11, 13, 17, 19, 23, 29, ...
Not Prime: 1, 4, 6, 8, 9, 10, 12, 14, 15, ...
\`\`\`

## Phương pháp implement

### Cách 1: Brute Force - O(n)

\`\`\`python
def isPrime(n):
    if n <= 1:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    
    for i in range(3, n, 2):
        if n % i == 0:
            return False
    return True
\`\`\`

### Cách 2: Optimized - O(√n) ⭐

\`\`\`python
def isPrime(n):
    if n <= 1:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    
    # Chỉ cần kiểm tra đến √n
    import math
    for i in range(3, int(math.sqrt(n)) + 1, 2):
        if n % i == 0:
            return False
    return True
\`\`\`

**Tại sao √n?**
- Nếu n = a × b, thì hoặc a ≤ √n hoặc b ≤ √n
- Không cần kiểm tra quá √n

## Test Cases

\`\`\`python
isPrime(1)   → False  # Không phải số nguyên tố
isPrime(2)   → True   # Số nguyên tố duy nhất chẵn
isPrime(17)  → True
isPrime(18)  → False  # 18 = 2 × 9
isPrime(97)  → True
isPrime(100) → False  # 100 = 10 × 10
\`\`\`

## Độ phức tạp

| Method | Time Complexity |
|--------|----------------|
| Brute Force | O(n) |
| Optimized | **O(√n)** |
| Sieve of Eratosthenes | O(n log log n) |

## Bonus Challenge

Implement **Sieve of Eratosthenes** để tìm tất cả số nguyên tố ≤ n.

\`\`\`python
def sieveOfEratosthenes(n):
    primes = [True] * (n + 1)
    primes[0] = primes[1] = False
    
    for i in range(2, int(n**0.5) + 1):
        if primes[i]:
            for j in range(i*i, n + 1, i):
                primes[j] = False
    
    return [i for i in range(n + 1) if primes[i]]
\`\`\`

> **Fun Fact:** Có vô số số nguyên tố (Euclid đã chứng minh từ 300 BC)!`,
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
    maxScore: 45,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440020') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440020')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440021': {
    id: '550e8400-e29b-41d4-a716-446655440021',
    title: 'Graph DFS & BFS',
    description: `# Graph Traversal: DFS & BFS

## Mô tả

Implement **hai thuật toán duyệt đồ thị** quan trọng nhất:
- **Depth-First Search (DFS)**
- **Breadth-First Search (BFS)**

## 1. Depth-First Search (DFS)

### Chiến lược
- Đi **sâu** trước khi quay lại
- Sử dụng **Stack** (hoặc recursion)

### Implementation (Recursive)

\`\`\`python
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(start)
    print(start, end=' ')
    
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    
    return visited
\`\`\`

### Implementation (Iterative)

\`\`\`python
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            print(node, end=' ')
            stack.extend(graph[node])
    
    return visited
\`\`\`

## 2. Breadth-First Search (BFS)

### Chiến lược
- Duyệt theo **từng lớp** (level by level)
- Sử dụng **Queue**

### Implementation

\`\`\`python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    
    while queue:
        node = queue.popleft()
        print(node, end=' ')
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return visited
\`\`\`

## Ví dụ Đồ thị

\`\`\`
Graph:
    A --- B --- C
    |     |     |
    D --- E --- F

adjacency_list = {
    'A': ['B', 'D'],
    'B': ['A', 'C', 'E'],
    'C': ['B', 'F'],
    'D': ['A', 'E'],
    'E': ['B', 'D', 'F'],
    'F': ['C', 'E']
}

DFS từ A: A B C F E D
BFS từ A: A B D C E F
\`\`\`

## So sánh DFS vs BFS

| Feature | DFS | BFS |
|---------|-----|-----|
| Data Structure | Stack | Queue |
| Memory | O(h) | O(w) |
| Đường đi ngắn nhất | ❌ No | ✅ Yes |
| Detect Cycle | ✅ Yes | ✅ Yes |
| Connected Components | ✅ Yes | ✅ Yes |

*h = chiều cao cây, w = độ rộng lớn nhất*

## Ứng dụng

### DFS:
- Topological sorting
- Detect cycles
- Path finding
- Maze solving

### BFS:
- **Shortest path** (unweighted graph)
- Level-order traversal
- Social network analysis

## Độ phức tạp

- **Time:** O(V + E) - V vertices, E edges
- **Space:** O(V)

> **Interview Tip:** Luôn hỏi "Weighted hay unweighted graph?" trước khi chọn DFS/BFS!`,
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000),
    maxScore: 190,
    status: 'PUBLISHED',
    languages: ['java', 'python', 'cpp'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440021') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440021')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440022': {
    id: '550e8400-e29b-41d4-a716-446655440022',
    title: 'Max Subarray Problem',
    description: `# Maximum Subarray - Kadane's Algorithm

## Mô tả

Tìm **subarray liên tiếp** có tổng lớn nhất trong mảng số nguyên.

## Problêm Statement

Cho một mảng số nguyên (có thể có số âm), tìm **tổng lớn nhất** của một subarray liên tiếp.

### Ví dụ

\`\`\`python
Input:  [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6
Explanation: Subarray [4, -1, 2, 1] có tổng = 6
\`\`\`

\`\`\`python
Input:  [5, -3, 5]
Output: 7
Explanation: Toàn bộ mảng [5, -3, 5]
\`\`\`

\`\`\`python
Input:  [-1, -2, -3]
Output: -1
Explanation: Phần tử lớn nhất
\`\`\`

## Thuật toán Kadane - O(n)

### Ý tưởng chính

Tại mỗi vị trí, quyết định:
- **Tiếp tục** subarray hiện tại, hay
- **Bắt đầu** subarray mới từ vị trí này

### Implementation

\`\`\`python
def maxSubArray(nums):
    if not nums:
        return 0
    
    max_sum = current_sum = nums[0]
    
    for num in nums[1:]:
        # Chọn max giữa tiếp tục hoặc bắt đầu mới
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    
    return max_sum
\`\`\`

### Ví dụ chạy thuật toán

\`\`\`
Arr: [-2,  1, -3,  4, -1,  2,  1, -5,  4]
cur: -2   1  -2   4   3   5   6   1   5
max: -2   1   1   4   4   5   6   6   6
\`\`\`

## Variant: Trả về cả subarray

\`\`\`python
def maxSubArrayWithIndices(nums):
    max_sum = current_sum = nums[0]
    start = end = temp_start = 0
    
    for i in range(1, len(nums)):
        if nums[i] > current_sum + nums[i]:
            current_sum = nums[i]
            temp_start = i
        else:
            current_sum += nums[i]
        
        if current_sum > max_sum:
            max_sum = current_sum
            start = temp_start
            end = i
    
    return max_sum, nums[start:end+1]
\`\`\`

## Phương pháp khác

### Brute Force - O(n²)
\`\`\`python
def maxSubArrayBruteForce(nums):
    max_sum = float('-inf')
    for i in range(len(nums)):
        current_sum = 0
        for j in range(i, len(nums)):
            current_sum += nums[j]
            max_sum = max(max_sum, current_sum)
    return max_sum
\`\`\`

## Độ phức tạp

| Method | Time | Space |
|--------|------|-------|
| Kadane's Algorithm | **O(n)** ⭐ | O(1) |
| Brute Force | O(n²) | O(1) |
| Divide & Conquer | O(n log n) | O(log n) |

## Ứng dụng thực tế

- Stock trading (maximum profit)
- Image processing
- Data analysis

> **LeetCode #53:** Một trong những bài medium phổ biến nhất!`,
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    maxScore: 130,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'cpp'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440022') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440022')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
    }
  },

  // ===== DRAFT ASSIGNMENT (NOT YET PUBLISHED) =====
  '550e8400-e29b-41d4-a716-446655440007': {
    id: '550e8400-e29b-41d4-a716-446655440007',
    title: 'Machine Learning Basics',
    description: `# Linear Regression from Scratch 🚧 DRAFT

## ⚠️ DRAFT - Chưa công bố

Đây là bài tập **nâng cao** hiện đang trong giai đoạn phát triển.

## Mô tả

Implement mô hình **Linear Regression** cơ bản từ đầu (không dùng thư viện ML).

## Yêu cầu

### 1. Implement Model
\`\`\`python
class LinearRegression:
    def __init__(self):
        self.weights = None
        self.bias = None
    
    def fit(self, X, y):
        # Gradient Descent
        pass
    
    def predict(self, X):
        # y = wx + b
        pass
\`\`\`

### 2. Cost Function (MSE)
\`\`\`
Cost = (1/n) * Σ(y_pred - y_actual)²
\`\`\`

### 3. Gradient Descent
- Learning rate: α = 0.01
- Iterations: 1000
- Update weights: w = w - α * ∂Cost/∂w

## Dataset mẫu

\`\`\`python
# Simple linear relationship
X = [[1], [2], [3], [4], [5]]
y = [2, 4, 6, 8, 10]  # y = 2x
\`\`\`

## Đánh giá

- **R² Score** > 0.9
- **MSE** < 0.5

> **Coming Soon:** Bài tập sẽ được công bố sau khi hoàn thiện!`,
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: now,
    updatedAt: now,
    startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    maxScore: 200,
    status: 'DRAFT',
    languages: ['python'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440007') as any,
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440007')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) }
    }
  },
}

/**
 * Helper: Get all published assignments (visible to students)
 */
export const getPublishedAssignments = (): ConsolidatedAssignment[] => {
  return Object.values(consolidatedMockAssignments).filter(
    assignment => assignment.status === 'PUBLISHED'
  )
}

/**
 * Helper: Get assignments by difficulty
 */
export const getAssignmentsByDifficulty = (
  level: 'EASY' | 'MEDIUM' | 'HARD'
): ConsolidatedAssignment[] => {
  return Object.values(consolidatedMockAssignments).filter(
    assignment => assignment.difficultyLevel === level && assignment.status === 'PUBLISHED'
  )
}

/**
 * Helper: Get overdue assignments
 */
export const getOverdueAssignments = (): ConsolidatedAssignment[] => {
  const now = new Date()
  return Object.values(consolidatedMockAssignments).filter(
    assignment => assignment.status === 'PUBLISHED' && assignment.dueDate && new Date(assignment.dueDate) < now
  )
}

/**
 * Helper: Get upcoming assignments (due in next 7 days)
 */
export const getUpcomingAssignments = (): ConsolidatedAssignment[] => {
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return Object.values(consolidatedMockAssignments).filter(
    assignment =>
      assignment.status === 'PUBLISHED' &&
      assignment.dueDate &&
      new Date(assignment.dueDate) >= now &&
      new Date(assignment.dueDate) <= nextWeek
  )
}

/**
 * Helper: Get assignment with submissions
 */
export const getAssignmentWithSubmissions = (assignmentId: string) => {
  return consolidatedMockAssignments[assignmentId]
}

/**
 * Helper: Get student's submissions for an assignment
 */
export const getStudentAssignmentSubmissions = (assignmentId: string, studentId: string) => {
  const assignment = consolidatedMockAssignments[assignmentId]
  if (!assignment?.submissions) return []
  return assignment.submissions.filter(s => s.studentId === studentId)
}

/**
 * Helper: Verify data consistency
 */
export const verifyConsolidatedDataConsistency = () => {
  const errors: string[] = []
  
  Object.entries(consolidatedMockAssignments).forEach(([assignmentId, assignment]) => {
    // Check submissions have valid assignmentId
    (assignment.submissions as any)?.forEach((submission: any) => {
      if (submission.assignmentId !== assignmentId) {
        errors.push(`❌ Submission ${submission.id} has wrong assignmentId`)
      }
    })

    // Check performance metrics match submissions
    if (assignment.performanceMetrics && assignment.submissions) {
      const evaluated = assignment.submissions.filter(s => s.status === 'EVALUATED' && s.result)
      const passed = evaluated.filter(s => s.result === 'PASSED')
      
      if (assignment.performanceMetrics.totalSubmissions !== assignment.submissions.length) {
        errors.push(`❌ Assignment ${assignmentId}: totalSubmissions mismatch`)
      }
      
      if (assignment.performanceMetrics.passedSubmissions !== passed.length) {
        errors.push(`❌ Assignment ${assignmentId}: passedSubmissions mismatch`)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    summary: {
      totalAssignments: Object.keys(consolidatedMockAssignments).length,
      totalErrors: errors.length,
      timestamp: new Date().toISOString()
    }
  }
}

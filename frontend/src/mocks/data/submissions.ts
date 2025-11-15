/**
 * Mock Submission Data for MSW
 */

import type {
  SubmissionServiceSubmissionResponse,
  SubmissionServiceTestCaseResultDto,
} from '@/api/types.gen'

/**
 * Mock test case results
 */
const mockTestCases: SubmissionServiceTestCaseResultDto[] = [
  {
    order: 1,
    description: 'Test case 1: Basic input',
    hidden: false,
    weight: 10,
    input: '5',
    output: '120',
    timeout: 5000,
    memoryLimit: 256000000,
    passed: true,
    actualOutput: '120',
    executionTime: 45,
    memoryUsed: 102400,
  },
  {
    order: 2,
    description: 'Test case 2: Edge case',
    hidden: false,
    weight: 10,
    input: '0',
    output: '1',
    timeout: 5000,
    memoryLimit: 256000000,
    passed: true,
    actualOutput: '1',
    executionTime: 32,
    memoryUsed: 98304,
  },
  {
    order: 3,
    description: 'Test case 3: Large input',
    hidden: true,
    weight: 15,
    input: '10',
    output: '3628800',
    timeout: 5000,
    memoryLimit: 256000000,
    passed: false,
    actualOutput: '362880',
    errorMessage: 'Wrong answer',
    executionTime: 120,
    memoryUsed: 204800,
  },
]

/**
 * Mock submissions with different statuses
 * Using valid UUIDs for Zod validation
 */
export const mockSubmissions: SubmissionServiceSubmissionResponse[] = [
  // EVALUATED with PASSED result (ID: 000 for tests)
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    assignmentId: '550e8400-e29b-41d4-a716-446655440100',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-25T10:30:00Z'),
    status: 'EVALUATED',
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
    language: 'python',
    result: 'PASSED',
    score: 100,
    testCaseResults: [
      {
        order: 1,
        description: 'Test case 1',
        passed: true,
        actualOutput: '120',
        executionTime: 45,
      },
      {
        order: 2,
        description: 'Test case 2',
        passed: true,
        actualOutput: '1',
        executionTime: 32,
      },
    ],
    evaluatedAt: new Date('2024-10-25T10:31:00Z'),
    feedback: 'Excellent work! Your solution is correct and efficient.',
  },
  
  // EVALUATED with PASSED result
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    assignmentId: '550e8400-e29b-41d4-a716-446655440101',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-25T10:30:00Z'),
    status: 'EVALUATED',
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
    language: 'python',
    result: 'PASSED',
    score: 100,
    testCaseResults: [
      {
        order: 1,
        description: 'Test case 1',
        passed: true,
        actualOutput: '120',
        executionTime: 45,
      },
      {
        order: 2,
        description: 'Test case 2',
        passed: true,
        actualOutput: '1',
        executionTime: 32,
      },
    ],
    evaluatedAt: new Date('2024-10-25T10:31:00Z'),
    feedback: 'Excellent work! Your solution is correct and efficient.',
  },
  
  // EVALUATED with PARTIAL result
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    assignmentId: '550e8400-e29b-41d4-a716-446655440101',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-24T14:20:00Z'),
    status: 'EVALUATED',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(10));`,
    language: 'javascript',
    result: 'PARTIAL',
    score: 65,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-24T14:22:00Z'),
    feedback: 'Good attempt, but test case 3 failed. Check your logic for large inputs.',
  },
  
  // PENDING status
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    assignmentId: '550e8400-e29b-41d4-a716-446655440102',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-26T09:15:00Z'),
    status: 'PENDING',
    code: `#include <stdio.h>

int main() {
    printf("Hello World\\n");
    return 0;
}`,
    language: 'c',
  },
  
  // FAILED status
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    assignmentId: '550e8400-e29b-41d4-a716-446655440103',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-23T16:45:00Z'),
    status: 'FAILED',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Test");
    }
}`,
    language: 'java',
    result: 'FAILED',
    score: 0,
    evaluatedAt: new Date('2024-10-23T16:46:00Z'),
    feedback: 'Compilation error: Syntax error on line 3.',
  },
  
  // EVALUATED with FAILED result
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    assignmentId: '550e8400-e29b-41d4-a716-446655440101',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-25T11:00:00Z'),
    status: 'EVALUATED',
    code: `def factorial(n):
    result = 1
    for i in range(n):
        result *= i
    return result

print(factorial(5))`,
    language: 'python',
    result: 'FAILED',
    score: 20,
    testCaseResults: [
      {
        order: 1,
        description: 'Test case 1',
        passed: false,
        actualOutput: '0',
        errorMessage: 'Wrong answer',
        executionTime: 40,
      },
      {
        order: 2,
        description: 'Test case 2',
        passed: true,
        actualOutput: '1',
        executionTime: 35,
      },
    ],
    evaluatedAt: new Date('2024-10-25T11:01:00Z'),
  },
  
  // Submission without feedback
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    assignmentId: '550e8400-e29b-41d4-a716-446655440102',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-26T08:30:00Z'),
    status: 'EVALUATED',
    code: `console.log('Hello World');`,
    language: 'javascript',
    result: 'PASSED',
    score: 100,
    testCaseResults: [
      {
        order: 1,
        description: 'Test case 1',
        passed: true,
        actualOutput: 'Hello World\n',
        executionTime: 25,
      },
    ],
    evaluatedAt: new Date('2024-10-26T08:31:00Z'),
  },

  // More submissions for pagination testing (25+ total for testing page 2, 3)
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    assignmentId: '550e8400-e29b-41d4-a716-446655440104',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-20T14:15:00Z'),
    status: 'EVALUATED',
    code: `def reverse_string(s):
    return s[::-1]
print(reverse_string("hello"))`,
    language: 'python',
    result: 'PASSED',
    score: 95,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-20T14:16:00Z'),
    feedback: 'Perfect solution with optimal time complexity.',
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    assignmentId: '550e8400-e29b-41d4-a716-446655440105',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-19T09:45:00Z'),
    status: 'EVALUATED',
    code: `function isPalindrome(s) {
  return s === s.split('').reverse().join('');
}
console.log(isPalindrome('racecar'));`,
    language: 'javascript',
    result: 'PASSED',
    score: 92,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-19T09:46:00Z'),
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    assignmentId: '550e8400-e29b-41d4-a716-446655440106',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-18T16:20:00Z'),
    status: 'EVALUATED',
    code: `#include <iostream>
using namespace std;
int main() {
    int arr[] = {3, 1, 4, 1, 5};
    sort(arr, arr + 5);
    return 0;
}`,
    language: 'c++',
    result: 'PASSED',
    score: 88,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-18T16:21:00Z'),
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    assignmentId: '550e8400-e29b-41d4-a716-446655440107',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-17T11:30:00Z'),
    status: 'EVALUATED',
    code: `def merge_sorted_arrays(arr1, arr2):
    result = []
    i = j = 0
    while i < len(arr1) and j < len(arr2):
        if arr1[i] <= arr2[j]:
            result.append(arr1[i])
            i += 1
        else:
            result.append(arr2[j])
            j += 1
    return result + arr1[i:] + arr2[j:]`,
    language: 'python',
    result: 'PASSED',
    score: 90,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-17T11:31:00Z'),
    feedback: 'Great implementation! Consider edge cases.',
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    assignmentId: '550e8400-e29b-41d4-a716-446655440108',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-16T13:00:00Z'),
    status: 'EVALUATED',
    code: `class Stack:
    def __init__(self):
        self.items = []
    def push(self, item):
        self.items.append(item)
    def pop(self):
        return self.items.pop() if not self.is_empty() else None`,
    language: 'python',
    result: 'PARTIAL',
    score: 75,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-16T13:01:00Z'),
    feedback: 'Good structure but missing peek() method.',
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    assignmentId: '550e8400-e29b-41d4-a716-446655440109',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-15T10:15:00Z'),
    status: 'EVALUATED',
    code: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    language: 'javascript',
    result: 'PASSED',
    score: 100,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-15T10:16:00Z'),
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    assignmentId: '550e8400-e29b-41d4-a716-446655440110',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-14T15:45:00Z'),
    status: 'EVALUATED',
    code: `def longest_palindrome(s):
    if not s:
        return ""
    n = len(s)
    for i in range(n, 0, -1):
        for j in range(n - i + 1):
            candidate = s[j:j+i]
            if candidate == candidate[::-1]:
                return candidate
    return ""`,
    language: 'python',
    result: 'PASSED',
    score: 85,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-14T15:46:00Z'),
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    assignmentId: '550e8400-e29b-41d4-a716-446655440111',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-13T12:30:00Z'),
    status: 'EVALUATED',
    code: `int[] bubbleSort(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        for (int j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}`,
    language: 'java',
    result: 'PASSED',
    score: 80,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-13T12:31:00Z'),
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    assignmentId: '550e8400-e29b-41d4-a716-446655440112',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-12T14:00:00Z'),
    status: 'PENDING',
    code: `def count_vowels(s):
    vowels = 'aeiouAEIOU'
    return sum(1 for char in s if char in vowels)`,
    language: 'python',
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440016',
    assignmentId: '550e8400-e29b-41d4-a716-446655440113',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-11T11:15:00Z'),
    status: 'EVALUATED',
    code: `def remove_duplicates(lst):
    return list(set(lst))`,
    language: 'python',
    result: 'PARTIAL',
    score: 60,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-11T11:16:00Z'),
    feedback: 'This loses the original order. Try using dict.fromkeys() instead.',
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440017',
    assignmentId: '550e8400-e29b-41d4-a716-446655440114',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-10T09:00:00Z'),
    status: 'EVALUATED',
    code: `function findMax(arr) {
    return Math.max(...arr);
}`,
    language: 'javascript',
    result: 'PASSED',
    score: 95,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-10T09:01:00Z'),
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440018',
    assignmentId: '550e8400-e29b-41d4-a716-446655440115',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-09T16:30:00Z'),
    status: 'FAILED',
    code: `def calculate_sum(lst):
    total = 0
    for num in lst:
        total = total + num
    return total`,
    language: 'python',
    result: 'FAILED',
    score: 0,
    evaluatedAt: new Date('2024-10-09T16:31:00Z'),
    feedback: 'Submission failed to compile. Check syntax errors.',
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440019',
    assignmentId: '550e8400-e29b-41d4-a716-446655440116',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-08T13:45:00Z'),
    status: 'EVALUATED',
    code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next`,
    language: 'python',
    result: 'PASSED',
    score: 87,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-08T13:46:00Z'),
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    assignmentId: '550e8400-e29b-41d4-a716-446655440117',
    studentId: 'student-001',
    submittedAt: new Date('2024-10-07T10:30:00Z'),
    status: 'EVALUATED',
    code: `function flattenArray(arr) {
    return arr.flat(Infinity);
}`,
    language: 'javascript',
    result: 'PASSED',
    score: 93,
    testCaseResults: mockTestCases,
    evaluatedAt: new Date('2024-10-07T10:31:00Z'),
  },
]

import { describe, it, expect } from 'vitest'
import { encodeToBase64, decodeFromBase64 } from './encoding'

describe('encoding utilities', () => {
  describe('encodeToBase64', () => {
    it('should encode simple ASCII text', () => {
      const result = encodeToBase64('Hello, world')
      expect(result).toBe('SGVsbG8sIHdvcmxk')
    })

    it('should encode empty string', () => {
      const result = encodeToBase64('')
      expect(result).toBe('')
    })

    it('should encode Vietnamese text (UTF-8)', () => {
      const result = encodeToBase64('Xin chào')
      // Base64 for "Xin chào" in UTF-8
      expect(result).toBe('WGluIGNow6Bv')
    })

    it('should encode text with emojis', () => {
      const result = encodeToBase64('Hello 🎉')
      // Base64 for "Hello 🎉" in UTF-8
      expect(result).toBe('SGVsbG8g8J+OiQ==')
    })

    it('should encode code snippet', () => {
      const code = 'console.log("Hello, world");'
      const result = encodeToBase64(code)
      expect(result).toBe('Y29uc29sZS5sb2coIkhlbGxvLCB3b3JsZCIpOw==')
    })

    it('should encode multiline code', () => {
      const code = `function sum(a, b) {
  return a + b;
}`
      const result = encodeToBase64(code)
      const decoded = decodeFromBase64(result)
      expect(decoded).toBe(code)
    })

    it('should handle special characters', () => {
      const text = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const result = encodeToBase64(text)
      const decoded = decodeFromBase64(result)
      expect(decoded).toBe(text)
    })

    it('should encode Vietnamese code comment', () => {
      const code = '// Tính tổng hai số\nfunction sum(a, b) { return a + b; }'
      const result = encodeToBase64(code)
      const decoded = decodeFromBase64(result)
      expect(decoded).toBe(code)
    })
  })

  describe('decodeFromBase64', () => {
    it('should decode simple ASCII text', () => {
      const result = decodeFromBase64('SGVsbG8sIHdvcmxk')
      expect(result).toBe('Hello, world')
    })

    it('should decode empty string', () => {
      const result = decodeFromBase64('')
      expect(result).toBe('')
    })

    it('should decode Vietnamese text (UTF-8)', () => {
      const result = decodeFromBase64('WGluIGNow6Bv')
      expect(result).toBe('Xin chào')
    })

    it('should decode text with emojis', () => {
      const result = decodeFromBase64('SGVsbG8g8J+OiQ==')
      expect(result).toBe('Hello 🎉')
    })

    it('should decode code snippet', () => {
      const result = decodeFromBase64('Y29uc29sZS5sb2coIkhlbGxvLCB3b3JsZCIpOw==')
      expect(result).toBe('console.log("Hello, world");')
    })
  })

  describe('round-trip encoding/decoding', () => {
    it('should preserve ASCII text', () => {
      const original = 'The quick brown fox jumps over the lazy dog'
      const encoded = encodeToBase64(original)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(original)
    })

    it('should preserve Vietnamese text', () => {
      const original = 'Chào mừng bạn đến với APSAS - Hệ thống đánh giá kỹ năng lập trình'
      const encoded = encodeToBase64(original)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(original)
    })

    it('should preserve Unicode characters', () => {
      const original = 'Hello 世界 🌍 Привет'
      const encoded = encodeToBase64(original)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(original)
    })

    it('should preserve JavaScript code', () => {
      const original = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`
      const encoded = encodeToBase64(original)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(original)
    })

    it('should preserve Python code with Vietnamese comments', () => {
      const original = `# Tính tổng mảng
def sum_array(arr):
    total = 0
    for num in arr:
        total += num
    return total

# Test
print(sum_array([1, 2, 3, 4, 5]))  # Kết quả: 15`
      const encoded = encodeToBase64(original)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(original)
    })

    it('should preserve newlines and indentation', () => {
      const original = `{
  "name": "test",
  "value": 123
}`
      const encoded = encodeToBase64(original)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(original)
    })

    it('should preserve whitespace', () => {
      const original = '   spaces   and\ttabs\t'
      const encoded = encodeToBase64(original)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(original)
    })
  })

  describe('edge cases', () => {
    it('should handle very long text', () => {
      const longText = 'A'.repeat(10000)
      const encoded = encodeToBase64(longText)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(longText)
      expect(decoded.length).toBe(10000)
    })

    it('should handle single character', () => {
      const result = encodeToBase64('A')
      expect(result).toBe('QQ==')
      expect(decodeFromBase64(result)).toBe('A')
    })

    it('should handle null byte', () => {
      const text = 'Hello\x00World'
      const encoded = encodeToBase64(text)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(text)
    })
  })

  describe('real-world submission examples', () => {
    it('should encode Java submission', () => {
      const javaCode = `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Tìm hai số có tổng bằng target
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        throw new IllegalArgumentException("Không tìm thấy");
    }
}`
      const encoded = encodeToBase64(javaCode)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(javaCode)
    })

    it('should encode Python submission', () => {
      const pythonCode = `def binary_search(arr, target):
    """
    Tìm kiếm nhị phân - Binary Search
    Time: O(log n), Space: O(1)
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid  # Tìm thấy
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Không tìm thấy`
      const encoded = encodeToBase64(pythonCode)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(pythonCode)
    })

    it('should encode C++ submission', () => {
      const cppCode = `#include <iostream>
#include <vector>
using namespace std;

// Sắp xếp nhanh - QuickSort
void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                swap(arr[i], arr[j]);
            }
        }
        swap(arr[i + 1], arr[high]);
        
        int pi = i + 1;
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
      const encoded = encodeToBase64(cppCode)
      const decoded = decodeFromBase64(encoded)
      expect(decoded).toBe(cppCode)
    })
  })
})

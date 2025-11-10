import { describe, it, expect, vi } from 'vitest';
import {
  getHeaders,
  prepareCSVData,
  arrayToCSV,
  generateFilename,
  type ExportType,
} from './exportUtils';

describe('exportUtils - Pure CSV Functions', () => {
  describe('getHeaders', () => {
    it('should return assignment headers with Vietnamese labels', () => {
      const headers = getHeaders('assignments');
      expect(headers).toEqual([
        'ID',
        'Tiêu đề',
        'Mô tả',
        'Độ khó',
        'Trạng thái',
        'Ngày tạo',
      ]);
    });

    it('should return submission headers with Vietnamese labels', () => {
      const headers = getHeaders('submissions');
      expect(headers).toEqual([
        'ID',
        'Bài tập',
        'Ngôn ngữ',
        'Trạng thái',
        'Điểm',
        'Ngày nộp',
      ]);
    });
  });

  describe('prepareCSVData - Assignments', () => {
    it('should format single assignment correctly', () => {
      const data = [
        {
          id: 'assign-001',
          title: 'Assignment 1',
          description: 'Complete the task',
          difficulty: 'EASY',
          status: 'PUBLISHED',
          createdAt: '2025-11-08T10:00:00Z',
        },
      ];

      const result = prepareCSVData(data, 'assignments');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([
        'ID',
        'Tiêu đề',
        'Mô tả',
        'Độ khó',
        'Trạng thái',
        'Ngày tạo',
      ]);
      expect(result[1][0]).toBe('assign-001');
      expect(result[1][1]).toBe('Assignment 1');
      expect(result[1][2]).toBe('Complete the task');
      expect(result[1][3]).toBe('EASY');
      expect(result[1][4]).toBe('PUBLISHED');
    });

    it('should truncate long descriptions to 100 chars', () => {
      const longDescription = 'a'.repeat(200);
      const data = [
        {
          id: '1',
          title: 'Test',
          description: longDescription,
          difficulty: 'HARD',
          status: 'DRAFT',
          createdAt: '2025-11-08T10:00:00Z',
        },
      ];

      const result = prepareCSVData(data, 'assignments');
      expect(result[1][2].length).toBe(100);
    });

    it('should handle missing description', () => {
      const data = [
        {
          id: '1',
          title: 'Test',
          difficulty: 'MEDIUM',
          status: 'PUBLISHED',
          createdAt: '2025-11-08T10:00:00Z',
        },
      ];

      const result = prepareCSVData(data, 'assignments');
      expect(result[1][2]).toBe('');
    });

    it('should format multiple assignments', () => {
      const data = [
        {
          id: '1',
          title: 'Assignment 1',
          difficulty: 'EASY',
          status: 'PUBLISHED',
          createdAt: '2025-11-08T10:00:00Z',
        },
        {
          id: '2',
          title: 'Assignment 2',
          difficulty: 'HARD',
          status: 'DRAFT',
          createdAt: '2025-11-08T11:00:00Z',
        },
      ];

      const result = prepareCSVData(data, 'assignments');

      expect(result).toHaveLength(3);
      expect(result[1][0]).toBe('1');
      expect(result[2][0]).toBe('2');
    });
  });

  describe('prepareCSVData - Submissions', () => {
    it('should format single submission correctly', () => {
      const data = [
        {
          id: 'sub-001',
          assignmentTitle: 'Assignment 1',
          language: 'Python',
          status: 'EVALUATED',
          score: 95,
          submittedAt: '2025-11-08T10:00:00Z',
        },
      ];

      const result = prepareCSVData(data, 'submissions');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([
        'ID',
        'Bài tập',
        'Ngôn ngữ',
        'Trạng thái',
        'Điểm',
        'Ngày nộp',
      ]);
      expect(result[1][0]).toBe('sub-001');
      expect(result[1][1]).toBe('Assignment 1');
      expect(result[1][2]).toBe('Python');
      expect(result[1][4]).toBe('95');
    });

    it('should handle nested assignment object', () => {
      const data = [
        {
          id: 'sub-001',
          assignment: { title: 'Assignment 1' },
          language: 'Java',
          status: 'PENDING',
          score: 0,
          submittedAt: '2025-11-08T10:00:00Z',
        },
      ];

      const result = prepareCSVData(data, 'submissions');

      expect(result[1][1]).toBe('Assignment 1');
    });

    it('should format score as string', () => {
      const data = [
        {
          id: '1',
          assignmentTitle: 'Test',
          language: 'Python',
          status: 'EVALUATED',
          score: 87,
          submittedAt: '2025-11-08T10:00:00Z',
        },
      ];

      const result = prepareCSVData(data, 'submissions');

      expect(typeof result[1][4]).toBe('string');
      expect(result[1][4]).toBe('87');
    });

    it('should handle missing score', () => {
      const data = [
        {
          id: '1',
          assignmentTitle: 'Test',
          language: 'Python',
          status: 'PENDING',
          submittedAt: '2025-11-08T10:00:00Z',
        },
      ];

      const result = prepareCSVData(data, 'submissions');

      expect(result[1][4]).toBe('');
    });
  });

  describe('arrayToCSV - CSV Formatting', () => {
    it('should convert simple array to CSV', () => {
      const data = [
        ['Header1', 'Header2', 'Header3'],
        ['Value1', 'Value2', 'Value3'],
      ];

      const csv = arrayToCSV(data);

      expect(csv).toBe('Header1,Header2,Header3\nValue1,Value2,Value3');
    });

    it('should escape commas in field values', () => {
      const data = [['Field with, comma', 'Normal']];

      const csv = arrayToCSV(data);

      expect(csv).toBe('"Field with, comma",Normal');
    });

    it('should escape double quotes in field values', () => {
      const data = [['Field with "quotes"', 'Normal']];

      const csv = arrayToCSV(data);

      // Double quotes should be escaped as ""
      expect(csv).toBe('"Field with ""quotes""",Normal');
    });

    it('should escape newlines in field values', () => {
      const data = [['Field with\nnewline', 'Normal']];

      const csv = arrayToCSV(data);

      expect(csv).toContain('"Field with\nnewline"');
      expect(csv).toContain('Normal');
    });

    it('should handle empty fields', () => {
      const data = [['', 'Value', '']];

      const csv = arrayToCSV(data);

      expect(csv).toBe(',Value,');
    });

    it('should handle mixed special characters', () => {
      const data = [['Field "with", special\nchars', 'Normal', 'Another "value"']];

      const csv = arrayToCSV(data);

      expect(csv).toContain('"Field ""with"", special\nchars"');
      expect(csv).toContain('Normal');
      expect(csv).toContain('"Another ""value"""');
    });

    it('should format multiple rows correctly', () => {
      const data = [
        ['Header1', 'Header2'],
        ['Value1', 'Value2'],
        ['Value3', 'Value4'],
        ['Value5', 'Value6'],
      ];

      const csv = arrayToCSV(data);
      const lines = csv.split('\n');

      expect(lines).toHaveLength(4);
      expect(lines[0]).toBe('Header1,Header2');
      expect(lines[3]).toBe('Value5,Value6');
    });

    it('should not quote fields without special chars', () => {
      const data = [['SimpleValue', 'AnotherValue']];

      const csv = arrayToCSV(data);

      expect(csv).toBe('SimpleValue,AnotherValue');
      expect(csv).not.toContain('"Simple');
    });
  });

  describe('generateFilename', () => {
    it('should generate assignments filename with correct format', () => {
      const filename = generateFilename('assignments');

      expect(filename).toMatch(/^assignments-\d{2}-\d{2}-\d{4}\.csv$/);
      expect(filename).toEndWith('.csv');
    });

    it('should generate submissions filename with correct format', () => {
      const filename = generateFilename('submissions');

      expect(filename).toMatch(/^submissions-\d{2}-\d{2}-\d{4}\.csv$/);
      expect(filename).toEndWith('.csv');
    });

    it('should use DD-MM-YYYY date format', () => {
      const filename = generateFilename('assignments');
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();

      expect(filename).toBe(`assignments-${day}-${month}-${year}.csv`);
    });

    it('should generate different names for different types', () => {
      const assignmentsFile = generateFilename('assignments');
      const submissionsFile = generateFilename('submissions');

      expect(assignmentsFile).not.toBe(submissionsFile);
      expect(assignmentsFile).toContain('assignments');
      expect(submissionsFile).toContain('submissions');
    });
  });

  describe('Integration - Full CSV Export Flow', () => {
    it('should prepare and format assignment CSV correctly', () => {
      const data = [
        {
          id: '1',
          title: 'Assignment with "quotes"',
          description: 'Test description',
          difficulty: 'MEDIUM',
          status: 'PUBLISHED',
          createdAt: '2025-11-08T10:00:00Z',
        },
      ];

      const csvData = prepareCSVData(data, 'assignments');
      const csv = arrayToCSV(csvData);

      expect(csv).toContain('Tiêu đề');
      expect(csv).toContain('MEDIUM');
      expect(csv).toContain('"Assignment with ""quotes"""');
    });

    it('should prepare and format submission CSV correctly', () => {
      const data = [
        {
          id: 'sub-001',
          assignmentTitle: 'Test Assignment',
          language: 'Python',
          status: 'EVALUATED',
          score: 100,
          submittedAt: '2025-11-08T10:00:00Z',
        },
      ];

      const csvData = prepareCSVData(data, 'submissions');
      const csv = arrayToCSV(csvData);

      expect(csv).toContain('Bài tập');
      expect(csv).toContain('Python');
      expect(csv).toContain('100');
    });

    it('should handle real-world data with all fields', () => {
      const assignments = [
        {
          id: 'assign-001',
          title: 'Fibonacci Sequence',
          description: 'Write a program to generate Fibonacci sequence',
          difficulty: 'EASY',
          status: 'PUBLISHED',
          createdAt: '2025-11-01T10:00:00Z',
        },
        {
          id: 'assign-002',
          title: 'Sorting "Complex" Data, Part 1',
          description: 'Implement multiple sorting algorithms\nwith performance comparison',
          difficulty: 'HARD',
          status: 'PUBLISHED',
          createdAt: '2025-11-05T10:00:00Z',
        },
      ];

      const csvData = prepareCSVData(assignments, 'assignments');
      const csv = arrayToCSV(csvData);

      // Should have header + 2 data rows
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(3);

      // Should properly escape special characters
      expect(csv).toContain('"Sorting ""Complex"" Data, Part 1"');
      expect(csv).toContain('EASY');
      expect(csv).toContain('HARD');
    });
  });
});

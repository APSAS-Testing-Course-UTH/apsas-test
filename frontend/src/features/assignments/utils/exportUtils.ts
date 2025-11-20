/**
 * Export utilities for CSV export functionality
 * Supports both assignments and submissions data types
 */

import { formatDateShort } from '@/utils/dateUtils';

/**
 * Type definitions
 */
export type ExportType = 'assignments' | 'submissions';

/**
 * CSV Headers for assignments
 */
const ASSIGNMENT_HEADERS = ['ID', 'Tiêu đề', 'Mô tả', 'Độ khó', 'Trạng thái', 'Ngày tạo'];

/**
 * CSV Headers for submissions
 */
const SUBMISSION_HEADERS = ['ID', 'Bài tập', 'Ngôn ngữ', 'Trạng thái', 'Điểm', 'Ngày nộp'];

/**
 * Get CSV headers based on export type
 * @param type - Export type: 'assignments' or 'submissions'
 * @returns Array of header strings
 */
export function getHeaders(type: ExportType): string[] {
  return type === 'assignments' ? ASSIGNMENT_HEADERS : SUBMISSION_HEADERS;
}

/**
 * Format assignment data for CSV export
 * @param item - Assignment object
 * @returns Array of formatted strings
 */
function formatAssignmentRow(item: any): string[] {
  return [
    item.id || '',
    item.title || '',
    (item.description || '').substring(0, 100),
    item.difficulty || '',
    item.status || '',
    item.createdAt ? formatDateShort(item.createdAt) : '',
  ];
}

/**
 * Format submission data for CSV export
 * @param item - Submission object
 * @returns Array of formatted strings
 */
function formatSubmissionRow(item: any): string[] {
  return [
    item.id || '',
    item.assignmentTitle || item.assignment?.title || '',
    item.language || '',
    item.status || '',
    item.score?.toString() || '',
    item.submittedAt ? formatDateShort(item.submittedAt) : '',
  ];
}

/**
 * Prepare data for CSV export by formatting headers and rows
 * @param data - Array of items to export
 * @param type - Export type: 'assignments' or 'submissions'
 * @returns 2D array with headers and formatted rows
 */
export function prepareCSVData(data: any[], type: ExportType): string[][] {
  const headers = getHeaders(type);

  const rows = data.map((item) => {
    if (type === 'assignments') {
      return formatAssignmentRow(item);
    } else {
      return formatSubmissionRow(item);
    }
  });

  return [headers, ...rows];
}

/**
 * Convert 2D array to CSV string with proper escaping
 * Handles special characters like commas, quotes, and newlines
 * @param data - 2D array of strings
 * @returns CSV formatted string
 */
export function arrayToCSV(data: string[][]): string {
  return data
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(',')
    )
    .join('\n');
}

/**
 * Generate filename with date
 * @param type - Export type: 'assignments' or 'submissions'
 * @returns Filename with format: type-DD-MM-YYYY.csv
 */
export function generateFilename(type: ExportType): string {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${type}-${day}-${month}-${year}.csv`;
}

/**
 * Trigger browser download of file
 * Creates a Blob and uses a temporary anchor element to download
 * @param content - File content as string
 * @param filename - Filename for download
 * @throws Error if download fails
 */
export function downloadFile(content: string, filename: string): void {
  try {
    // Create Blob with UTF-8 encoding
    const blob = new Blob(['\uFEFF' + content], {
      type: 'text/csv;charset=utf-8;',
    });

    // Create temporary download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up object URL
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(
      `Lỗi tải xuống file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Main export function
 * Orchestrates the entire export process
 * @param data - Array of items to export
 * @param type - Export type: 'assignments' or 'submissions'
 * @param filename - Optional custom filename (will auto-generate if not provided)
 * @throws Error if export process fails
 * @example
 * exportToCSV(assignments, 'assignments', 'my-assignments.csv')
 * exportToCSV(submissions, 'submissions') // Auto-generates filename
 */
export function exportToCSV(
  data: any[],
  type: ExportType,
  filename?: string
): void {
  try {
    // Validate input
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Không có dữ liệu để xuất');
    }

    // Prepare CSV data
    const csvData = prepareCSVData(data, type);

    // Convert to CSV string
    const csv = arrayToCSV(csvData);

    // Generate filename if not provided
    const finalFilename = filename || generateFilename(type);

    // Trigger download
    downloadFile(csv, finalFilename);
  } catch (error) {
    throw new Error(
      `Lỗi xuất dữ liệu CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

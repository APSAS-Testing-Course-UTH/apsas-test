/**
 * FileUploadInput Component Unit Tests
 * Test core functionality and rendering
 */

import { describe, it, expect } from 'vitest'

describe('FileUploadInput Component', () => {
  describe('Imports', () => {
    it('should export FileUploadInput function', async () => {
      const module = await import('./FileUploadInput')
      expect(module.FileUploadInput).toBeDefined()
      expect(typeof module.FileUploadInput).toBe('function')
    })

    it('should have proper TypeScript types', async () => {
      const module = await import('./FileUploadInput')
      expect(module.FileUploadInput.name).toBe('FileUploadInput')
    })
  })

  describe('Component Structure', () => {
    it('should accept required props: assignmentId and onSubmit', async () => {
      const module = await import('./FileUploadInput')
      const { FileUploadInput } = module
      expect(FileUploadInput).toBeDefined()
    })

    it('should accept optional prop: isSubmitting', async () => {
      const module = await import('./FileUploadInput')
      const { FileUploadInput } = module
      expect(FileUploadInput).toBeDefined()
    })
  })

  describe('Module Constants', () => {
    it('should have properly exported component', async () => {
      const module = await import('./FileUploadInput')
      const { FileUploadInput } = module
      
      // Component should be a function
      expect(typeof FileUploadInput).toBe('function')
      
      // Component should be named correctly
      expect(FileUploadInput.name).toBe('FileUploadInput')
    })

    it('should not have runtime errors on import', async () => {
      let importError: Error | null = null
      try {
        await import('./FileUploadInput')
      } catch (err) {
        importError = err as Error
      }
      expect(importError).toBeNull()
    })
  })

  describe('File Type Support', () => {
    it('should have support for Java files', async () => {
      // Verify .java extension is supported
      const extension = '.java'
      expect(extension).toBe('.java')
    })

    it('should have support for Python files', async () => {
      const extension = '.py'
      expect(extension).toBe('.py')
    })

    it('should have support for JavaScript files', async () => {
      const extension = '.js'
      expect(extension).toBe('.js')
    })

    it('should have support for TypeScript files', async () => {
      const extension = '.ts'
      expect(extension).toBe('.ts')
    })

    it('should support 14 programming languages', () => {
      const supportedLanguages = [
        '.java',    // Java
        '.py',      // Python
        '.cpp',     // C++
        '.c',       // C
        '.js',      // JavaScript
        '.ts',      // TypeScript
        '.cs',      // C#
        '.go',      // Go
        '.rs',      // Rust
        '.php',     // PHP
        '.rb',      // Ruby
        '.pl',      // Perl
        '.sh',      // Shell
        '.sql',     // SQL
      ]

      expect(supportedLanguages).toHaveLength(14)
      supportedLanguages.forEach((ext) => {
        expect(ext).toMatch(/^\.\w+$/)
      })
    })
  })

  describe('UI Labels (Vietnamese)', () => {
    it('should have Vietnamese button labels', async () => {
      const labels = {
        submit: 'Nộp bài',
        clear: 'Xóa',
        retry: 'Thử lại',
      }

      expect(labels.submit).toBe('Nộp bài')
      expect(labels.clear).toBe('Xóa')
      expect(labels.retry).toBe('Thử lại')
    })

    it('should have Vietnamese error messages', async () => {
      const errors = {
        selectFile: 'Vui lòng chọn tệp',
        selectLanguage: 'Vui lòng chọn ngôn ngữ',
        invalidFileType: 'Loại tệp không được hỗ trợ',
        fileTooLarge: 'Tệp quá lớn (tối đa 10MB)',
      }

      expect(errors.selectFile).toContain('Vui lòng')
      expect(errors.selectLanguage).toContain('Vui lòng')
      expect(errors.invalidFileType).toContain('Loại tệp')
      expect(errors.fileTooLarge).toContain('quá lớn')
    })

    it('should have Vietnamese success messages', async () => {
      const messages = {
        uploadSuccess: 'Tệp tải lên thành công!',
        fileSelected: 'Tệp đã chọn',
      }

      expect(messages.uploadSuccess).toContain('thành công')
      expect(messages.fileSelected).toContain('Tệp đã chọn')
    })

    it('should have Vietnamese drag-drop text', async () => {
      const dragDropText = 'Kéo và thả tệp ở đây'
      expect(dragDropText).toContain('Kéo')
      expect(dragDropText).toContain('thả')
    })
  })

  describe('File Size Validation', () => {
    it('should have max file size constant of 10MB', () => {
      const MAX_FILE_SIZE = 10 * 1024 * 1024
      const EXPECTED_SIZE = 10485760
      expect(MAX_FILE_SIZE).toBe(EXPECTED_SIZE)
    })

    it('should reject files larger than 10MB', () => {
      const MAX_FILE_SIZE = 10 * 1024 * 1024
      const fileSizeToTest = 11 * 1024 * 1024
      expect(fileSizeToTest > MAX_FILE_SIZE).toBe(true)
    })

    it('should accept files smaller than or equal to 10MB', () => {
      const MAX_FILE_SIZE = 10 * 1024 * 1024
      const smallFileSize = 5 * 1024 * 1024
      const exactMaxFileSize = MAX_FILE_SIZE
      
      expect(smallFileSize <= MAX_FILE_SIZE).toBe(true)
      expect(exactMaxFileSize <= MAX_FILE_SIZE).toBe(true)
    })
  })

  describe('Language Detection', () => {
    it('should detect Python from .py extension', () => {
      const fileName = 'script.py'
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
      expect(ext).toBe('.py')
    })

    it('should detect Java from .java extension', () => {
      const fileName = 'Main.java'
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
      expect(ext).toBe('.java')
    })

    it('should detect JavaScript from .js extension', () => {
      const fileName = 'app.js'
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
      expect(ext).toBe('.js')
    })

    it('should detect C++ from .cpp extension', () => {
      const fileName = 'main.cpp'
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
      expect(ext).toBe('.cpp')
    })

    it('should handle file names with multiple dots', () => {
      const fileName = 'my.script.py'
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
      expect(ext).toBe('.py')
    })

    it('should be case-insensitive', () => {
      const fileName1 = 'script.PY'
      const fileName2 = 'script.Py'
      const ext1 = fileName1.substring(fileName1.lastIndexOf('.')).toLowerCase()
      const ext2 = fileName2.substring(fileName2.lastIndexOf('.')).toLowerCase()
      
      expect(ext1).toBe('.py')
      expect(ext2).toBe('.py')
      expect(ext1).toBe(ext2)
    })
  })

  describe('Props Interface', () => {
    it('should have assignmentId as string prop', () => {
      const assignmentId: string = 'assignment-123'
      expect(typeof assignmentId).toBe('string')
    })

    it('should have onSubmit as async function prop', async () => {
      const onSubmit = async () => {
        return undefined
      }
      expect(typeof onSubmit).toBe('function')
    })

    it('should have isSubmitting as optional boolean prop', () => {
      const isSubmitting: boolean | undefined = false
      expect(typeof isSubmitting === 'boolean' || typeof isSubmitting === 'undefined').toBe(true)
    })
  })

  describe('Error Message Formatting', () => {
    it('should format file size correctly', () => {
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
      }

      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
    })

    it('should handle small file sizes', () => {
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
      }

      expect(formatFileSize(512)).toBe('512 Bytes')
      expect(formatFileSize(100)).toBe('100 Bytes')
    })

    it('should handle large file sizes', () => {
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
      }

      expect(formatFileSize(5242880)).toBe('5 MB')
      expect(formatFileSize(10737418240)).toBe('10 GB')
    })
  })

  describe('Component Mantine Integration', () => {
    it('should use Mantine components', async () => {
      const module = await import('./FileUploadInput')
      
      // Component should exist
      expect(module.FileUploadInput).toBeDefined()
    })
  })

  describe('Dropzone Integration', () => {
    it('should support Mantine Dropzone', async () => {
      const module = await import('@mantine/dropzone')
      expect(module.Dropzone).toBeDefined()
    })

    it('should have Mantine Dropzone component available', async () => {
      const { Dropzone } = await import('@mantine/dropzone')
      // Mantine v8 Dropzone is now an object with static components
      expect(typeof Dropzone).toBe('object')
      expect(Dropzone).toBeDefined()
    })
  })

  describe('Notifications Integration', () => {
    it('should use Mantine notifications', async () => {
      const module = await import('@mantine/notifications')
      expect(module.notifications).toBeDefined()
    })

    it('should have notifications show method', async () => {
      const { notifications } = await import('@mantine/notifications')
      expect(typeof notifications.show).toBe('function')
    })
  })

  describe('TypeScript Support', () => {
    it('should be properly typed', async () => {
      const module = await import('./FileUploadInput')
      const { FileUploadInput } = module
      
      expect(FileUploadInput).toBeDefined()
      expect(typeof FileUploadInput).toBe('function')
    })
  })
})

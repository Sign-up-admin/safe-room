import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  validateFile,
  createBeforeUpload,
  formatFileSize,
  getFileExtension,
  IMAGE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  VIDEO_EXTENSIONS,
  isImageFile,
  isDocumentFile,
  isVideoFile,
  type FileUploadConfig,
} from '../../../src/utils/fileUpload'
import { ElMessage } from 'element-plus'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
  },
}))

describe('fileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateFile', () => {
    it('should validate valid image file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFile(file, {
        allowedExtensions: ['jpg', 'png'],
        allowedMimeTypes: ['image/jpeg'],
        maxSize: 10 * 1024 * 1024,
      })

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject unsupported file extension', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' })
      const result = validateFile(file, {
        allowedExtensions: ['jpg', 'png'],
        maxSize: 10 * 1024 * 1024,
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件类型不支持')
    })

    it('should reject file exceeding max size', () => {
      const largeContent = 'a'.repeat(11 * 1024 * 1024) // 11MB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
      const result = validateFile(file, {
        allowedExtensions: ['jpg'],
        maxSize: 10 * 1024 * 1024, // 10MB
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件大小超过限制')
    })

    it('should reject file below min size', () => {
      const file = new File(['small'], 'small.jpg', { type: 'image/jpeg' })
      const result = validateFile(file, {
        allowedExtensions: ['jpg'],
        minSize: 1000, // 1KB
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件大小过小')
    })

    it('should reject unsupported MIME type', () => {
      const file = new File(['content'], 'test.jpg', { type: 'text/plain' })
      const result = validateFile(file, {
        allowedMimeTypes: ['image/jpeg'],
        maxSize: 10 * 1024 * 1024,
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件类型不支持')
    })

    it('should validate with default config when no config provided', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFile(file)

      expect(result.valid).toBe(true)
    })
  })

  describe('createBeforeUpload', () => {
    it('should return function that validates file', () => {
      const config: FileUploadConfig = {
        allowedExtensions: ['jpg'],
        maxSize: 1024 * 1024,
      }
      const beforeUpload = createBeforeUpload(config)

      expect(typeof beforeUpload).toBe('function')
    })

    it('should show error message for invalid file', () => {
      const config: FileUploadConfig = {
        allowedExtensions: ['jpg'],
        maxSize: 1024, // 1KB
      }
      const beforeUpload = createBeforeUpload(config)

      const largeFile = new File(['a'.repeat(2000)], 'large.jpg', { type: 'image/jpeg' })
      const result = beforeUpload(largeFile)

      expect(result).toBe(false)
      expect(ElMessage.error).toHaveBeenCalled()
    })

    it('should return true for valid file', () => {
      const config: FileUploadConfig = {
        allowedExtensions: ['jpg'],
        maxSize: 1024 * 1024,
      }
      const beforeUpload = createBeforeUpload(config)

      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = beforeUpload(validFile)

      expect(result).toBe(true)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('should handle edge cases', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(-1)).toBe('0 B')
    })

    it('should format decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB') // 1.5 KB
      expect(formatFileSize(1048576)).toBe('1 MB') // 1 MB
    })
  })

  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      expect(getFileExtension('test.jpg')).toBe('jpg')
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('file.with.multiple.dots.txt')).toBe('txt')
    })

    it('should handle files without extension', () => {
      expect(getFileExtension('filewithoutextension')).toBe('')
    })

    it('should handle edge cases', () => {
      expect(getFileExtension('')).toBe('')
      expect(getFileExtension('.hidden')).toBe('hidden')
      expect(getFileExtension('file.')).toBe('')
    })

    it('should be case insensitive', () => {
      expect(getFileExtension('FILE.JPG')).toBe('jpg')
      expect(getFileExtension('File.Pdf')).toBe('pdf')
    })
  })

  describe('File type checking functions', () => {
    describe('isImageFile', () => {
      it('should identify image files correctly', () => {
        expect(isImageFile('photo.jpg')).toBe(true)
        expect(isImageFile('image.png')).toBe(true)
        expect(isImageFile('picture.gif')).toBe(true)
        expect(isImageFile('document.pdf')).toBe(false)
        expect(isImageFile('video.mp4')).toBe(false)
      })
    })

    describe('isDocumentFile', () => {
      it('should identify document files correctly', () => {
        expect(isDocumentFile('document.pdf')).toBe(true)
        expect(isDocumentFile('file.docx')).toBe(true)
        expect(isDocumentFile('spreadsheet.xlsx')).toBe(true)
        expect(isDocumentFile('photo.jpg')).toBe(false)
        expect(isDocumentFile('video.mp4')).toBe(false)
      })
    })

    describe('isVideoFile', () => {
      it('should identify video files correctly', () => {
        expect(isVideoFile('movie.mp4')).toBe(true)
        expect(isVideoFile('video.avi')).toBe(true)
        expect(isVideoFile('clip.mov')).toBe(true)
        expect(isVideoFile('photo.jpg')).toBe(false)
        expect(isVideoFile('document.pdf')).toBe(false)
      })
    })
  })

  describe('File extension constants', () => {
    it('should export IMAGE_EXTENSIONS', () => {
      expect(IMAGE_EXTENSIONS).toBeDefined()
      expect(Array.isArray(IMAGE_EXTENSIONS)).toBe(true)
      expect(IMAGE_EXTENSIONS).toContain('jpg')
      expect(IMAGE_EXTENSIONS).toContain('png')
      expect(IMAGE_EXTENSIONS).toContain('gif')
    })

    it('should export DOCUMENT_EXTENSIONS', () => {
      expect(DOCUMENT_EXTENSIONS).toBeDefined()
      expect(Array.isArray(DOCUMENT_EXTENSIONS)).toBe(true)
      expect(DOCUMENT_EXTENSIONS).toContain('pdf')
      expect(DOCUMENT_EXTENSIONS).toContain('doc')
      expect(DOCUMENT_EXTENSIONS).toContain('docx')
    })

    it('should export VIDEO_EXTENSIONS', () => {
      expect(VIDEO_EXTENSIONS).toBeDefined()
      expect(Array.isArray(VIDEO_EXTENSIONS)).toBe(true)
      expect(VIDEO_EXTENSIONS).toContain('mp4')
      expect(VIDEO_EXTENSIONS).toContain('avi')
      expect(VIDEO_EXTENSIONS).toContain('mov')
    })
  })

  describe('Integration tests', () => {
    it('should work with real file objects', () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

      // Test extension checking
      expect(getFileExtension(file.name)).toBe('jpg')
      expect(isImageFile(file.name)).toBe(true)

      // Test validation
      const result = validateFile(file, {
        allowedExtensions: ['jpg', 'png'],
        maxSize: 1024 * 1024,
      })

      expect(result.valid).toBe(true)
    })

    it('should format file size of real files', () => {
      const smallFile = new File(['x'], 'small.txt', { type: 'text/plain' })
      const size = smallFile.size

      const formatted = formatFileSize(size)
      expect(typeof formatted).toBe('string')
      expect(formatted).toMatch(/\d+ B/)
    })
  })

  describe('Error handling', () => {
    it('should handle invalid file input gracefully', () => {
      // @ts-ignore - Testing invalid input
      const result = validateFile(null)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle files without proper structure', () => {
      const invalidFile = { name: 'test.jpg' } as any
      const result = validateFile(invalidFile)

      // Should handle gracefully
      expect(result).toBeDefined()
      expect(typeof result.valid).toBe('boolean')
    })
  })
})

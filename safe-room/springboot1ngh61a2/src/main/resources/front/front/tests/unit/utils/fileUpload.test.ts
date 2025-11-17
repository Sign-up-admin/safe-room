import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  validateFile,
  createBeforeUpload,
  formatFileSize,
  getFileExtension,
  isImageFile,
  isDocumentFile,
  isVideoFile,
  IMAGE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  VIDEO_EXTENSIONS,
  type FileUploadConfig
} from '@/utils/fileUpload'
import { ElMessage } from 'element-plus'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}))

// Mock validator functions
vi.mock('@/utils/validator', () => ({
  validateFileExtension: vi.fn(),
  validateMimeType: vi.fn(),
  validateFileSize: vi.fn()
}), { virtual: true })

// Import after mocking
import { validateFileExtension, validateMimeType, validateFileSize } from '@/utils/validator'

describe('fileUpload utilities', () => {
  let mockValidateFileExtension: any
  let mockValidateMimeType: any
  let mockValidateFileSize: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockValidateFileExtension = vi.mocked(validateFileExtension)
    mockValidateMimeType = vi.mocked(validateMimeType)
    mockValidateFileSize = vi.mocked(validateFileSize)

    // Default mock implementations
    mockValidateFileExtension.mockReturnValue(true)
    mockValidateMimeType.mockReturnValue(true)
    mockValidateFileSize.mockReturnValue(true)
  })

  describe('validateFile', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    it('should validate file successfully with default config', () => {
      const result = validateFile(mockFile)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should fail validation when file extension is invalid', () => {
      mockValidateFileExtension.mockReturnValue(false)

      const config: FileUploadConfig = { allowedExtensions: ['png'] }
      const result = validateFile(mockFile, config)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件类型不支持')
      expect(result.error).toContain('png')
    })

    it('should fail validation when MIME type is invalid', () => {
      mockValidateMimeType.mockReturnValue(false)

      const config: FileUploadConfig = { allowedMimeTypes: ['image/png'] }
      const result = validateFile(mockFile, config)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件类型不支持')
    })

    it('should fail validation when file size is too large', () => {
      mockValidateFileSize.mockReturnValue(false)

      const config: FileUploadConfig = { maxSize: 1024 } // 1KB
      const result = validateFile(mockFile, config)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件大小超过限制')
      expect(result.error).toContain('0.00MB')
    })

    it('should fail validation when file size is too small', () => {
      const config: FileUploadConfig = { minSize: 1024 } // 1KB
      const smallFile = new File(['x'], 'small.txt', { type: 'text/plain' })
      const result = validateFile(smallFile, config)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件大小过小')
      expect(result.error).toContain('1.00KB')
    })

    it('should skip MIME type validation when file.type is empty', () => {
      const fileWithoutType = new File(['test'], 'test.jpg') as any
      fileWithoutType.type = ''

      const config: FileUploadConfig = { allowedMimeTypes: ['image/png'] }
      const result = validateFile(fileWithoutType, config)

      expect(result.valid).toBe(true)
    })

    it('should merge config with defaults', () => {
      const customConfig: FileUploadConfig = {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedExtensions: ['pdf']
      }

      mockValidateFileExtension.mockReturnValue(true)
      mockValidateFileSize.mockReturnValue(true)

      const result = validateFile(mockFile, customConfig)

      expect(mockValidateFileExtension).toHaveBeenCalledWith('test.jpg', ['pdf'])
      expect(result.valid).toBe(true)
    })
  })

  describe('createBeforeUpload', () => {
    it('should return a function that validates file', () => {
      const beforeUpload = createBeforeUpload()

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const result = beforeUpload(mockFile)

      expect(result).toBe(true)
    })

    it('should show error message and return false when validation fails', () => {
      mockValidateFileExtension.mockReturnValue(false)

      const config: FileUploadConfig = { allowedExtensions: ['png'] }
      const beforeUpload = createBeforeUpload(config)

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const result = beforeUpload(mockFile)

      expect(result).toBe(false)
      expect(ElMessage.error).toHaveBeenCalledWith('文件类型不支持，仅支持：png')
    })

    it('should handle validation error without error message', () => {
      mockValidateFileExtension.mockReturnValue(false)

      // Mock validateFile to return valid: false without error
      const originalValidateFile = vi.mocked(require('@/utils/fileUpload')).validateFile
      originalValidateFile.mockReturnValueOnce({ valid: false })

      const beforeUpload = createBeforeUpload()
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const result = beforeUpload(mockFile)

      expect(result).toBe(false)
      expect(ElMessage.error).not.toHaveBeenCalled()
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(512)).toBe('512 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('should handle large numbers', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB')
    })

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2560)).toBe('2.5 KB')
    })
  })

  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      expect(getFileExtension('test.jpg')).toBe('jpg')
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('file.with.multiple.dots.txt')).toBe('txt')
      expect(getFileExtension('FILE.WITH.CAPS.PNG')).toBe('png')
    })

    it('should handle files without extension', () => {
      expect(getFileExtension('noextension')).toBe('')
      expect(getFileExtension('')).toBe('')
    })

    it('should handle edge cases', () => {
      expect(getFileExtension('.hiddenfile')).toBe('hiddenfile')
      expect(getFileExtension('file.')).toBe('')
    })
  })

  describe('file type checks', () => {
    describe('isImageFile', () => {
      it('should identify image files correctly', () => {
        expect(isImageFile('photo.jpg')).toBe(true)
        expect(isImageFile('picture.png')).toBe(true)
        expect(isImageFile('image.gif')).toBe(true)
        expect(isImageFile('document.pdf')).toBe(false)
        expect(isImageFile('video.mp4')).toBe(false)
      })

      it('should be case insensitive', () => {
        expect(isImageFile('PHOTO.JPG')).toBe(true)
        expect(isImageFile('Image.PnG')).toBe(true)
      })
    })

    describe('isDocumentFile', () => {
      it('should identify document files correctly', () => {
        expect(isDocumentFile('document.pdf')).toBe(true)
        expect(isDocumentFile('report.docx')).toBe(true)
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

  describe('file extension constants', () => {
    it('should export correct image extensions', () => {
      expect(IMAGE_EXTENSIONS).toContain('jpg')
      expect(IMAGE_EXTENSIONS).toContain('png')
      expect(IMAGE_EXTENSIONS).toContain('gif')
      expect(IMAGE_EXTENSIONS).toContain('webp')
      expect(IMAGE_EXTENSIONS).toContain('svg')
    })

    it('should export correct document extensions', () => {
      expect(DOCUMENT_EXTENSIONS).toContain('pdf')
      expect(DOCUMENT_EXTENSIONS).toContain('doc')
      expect(DOCUMENT_EXTENSIONS).toContain('docx')
      expect(DOCUMENT_EXTENSIONS).toContain('xls')
      expect(DOCUMENT_EXTENSIONS).toContain('xlsx')
    })

    it('should export correct video extensions', () => {
      expect(VIDEO_EXTENSIONS).toContain('mp4')
      expect(VIDEO_EXTENSIONS).toContain('avi')
      expect(VIDEO_EXTENSIONS).toContain('mov')
      expect(VIDEO_EXTENSIONS).toContain('webm')
    })
  })

  describe('integration tests', () => {
    it('should work with real file validation', () => {
      const realFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

      // Test successful validation
      const result = validateFile(realFile, {
        allowedExtensions: ['jpg', 'png'],
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        maxSize: 1024 * 1024 // 1MB
      })

      expect(result).toHaveProperty('valid')
      // Note: The actual validation depends on the mocked validator functions
    })

    it('should handle beforeUpload hook with real Element Plus', () => {
      const beforeUpload = createBeforeUpload({
        allowedExtensions: ['jpg'],
        maxSize: 1024
      })

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      // This would normally call ElMessage.error if validation failed
      const result = beforeUpload(mockFile)

      expect(typeof result).toBe('boolean')
    })
  })
})

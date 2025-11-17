/**
 * 文件上传校验工具
 * 提供文件类型、大小、MIME类型等前端校验功能
 */
import { ElMessage } from 'element-plus'
import { validateFileExtension, validateMimeType, validateFileSize } from './validator'

/**
 * 文件上传配置
 */
export interface FileUploadConfig {
  allowedExtensions?: string[] // 允许的文件扩展名，如 ['jpg', 'png', 'pdf']
  allowedMimeTypes?: string[] // 允许的MIME类型，如 ['image/jpeg', 'image/png']
  maxSize?: number // 最大文件大小（字节），默认10MB
  minSize?: number // 最小文件大小（字节），默认0
}

/**
 * 默认文件上传配置
 */
const DEFAULT_CONFIG: Required<FileUploadConfig> = {
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  maxSize: 10 * 1024 * 1024, // 10MB
  minSize: 0,
}

/**
 * 文件校验结果
 */
export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * 校验文件
 * @param file - 文件对象
 * @param config - 校验配置
 * @returns 校验结果
 */
export function validateFile(file: File, config: FileUploadConfig = {}): FileValidationResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // 校验文件扩展名
  if (finalConfig.allowedExtensions.length > 0) {
    if (!validateFileExtension(file.name, finalConfig.allowedExtensions)) {
      return {
        valid: false,
        error: `文件类型不支持，仅支持：${finalConfig.allowedExtensions.join(', ')}`,
      }
    }
  }

  // 校验MIME类型
  if (finalConfig.allowedMimeTypes.length > 0 && file.type) {
    if (!validateMimeType(file.type, finalConfig.allowedMimeTypes)) {
      return {
        valid: false,
        error: `文件类型不支持，仅支持：${finalConfig.allowedMimeTypes.join(', ')}`,
      }
    }
  }

  // 校验文件大小
  if (finalConfig.maxSize > 0) {
    if (!validateFileSize(file.size, finalConfig.maxSize)) {
      const maxSizeMB = (finalConfig.maxSize / 1024 / 1024).toFixed(2)
      return {
        valid: false,
        error: `文件大小超过限制，最大允许：${maxSizeMB}MB`,
      }
    }
  }

  if (finalConfig.minSize > 0) {
    if (file.size < finalConfig.minSize) {
      const minSizeKB = (finalConfig.minSize / 1024).toFixed(2)
      return {
        valid: false,
        error: `文件大小过小，最小要求：${minSizeKB}KB`,
      }
    }
  }

  return { valid: true }
}

/**
 * 文件上传前的校验钩子（用于Element Plus的el-upload组件）
 * @param config - 校验配置
 * @returns 校验函数
 */
export function createBeforeUpload(config: FileUploadConfig = {}) {
  return (file: File): boolean => {
    const result = validateFile(file, config)

    if (!result.valid && result.error) {
      ElMessage.error(result.error)
      return false
    }

    return true
  }
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 获取文件扩展名
 * @param filename - 文件名
 * @returns 扩展名（不包含点号）
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * 图片文件扩展名列表
 */
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']

/**
 * 文档文件扩展名列表
 */
export const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']

/**
 * 视频文件扩展名列表
 */
export const VIDEO_EXTENSIONS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']

/**
 * 判断是否为图片文件
 * @param filename - 文件名
 * @returns 如果是图片返回true
 */
export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return IMAGE_EXTENSIONS.includes(ext)
}

/**
 * 判断是否为文档文件
 * @param filename - 文件名
 * @returns 如果是文档返回true
 */
export function isDocumentFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return DOCUMENT_EXTENSIONS.includes(ext)
}

/**
 * 判断是否为视频文件
 * @param filename - 文件名
 * @returns 如果是视频返回true
 */
export function isVideoFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return VIDEO_EXTENSIONS.includes(ext)
}

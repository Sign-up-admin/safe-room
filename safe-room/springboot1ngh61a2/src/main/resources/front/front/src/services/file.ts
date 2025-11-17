import config from '@/config/config'

export function getDownloadUrl(fileName: string): string {
  const normalizedBase = config.baseUrl.endsWith('/') ? config.baseUrl : `${config.baseUrl}/`
  return `${normalizedBase}file/download?fileName=${encodeURIComponent(fileName)}`
}

export function downloadFile(fileName: string): void {
  const url = getDownloadUrl(fileName)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


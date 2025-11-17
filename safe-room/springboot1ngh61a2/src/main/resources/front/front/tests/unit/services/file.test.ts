import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadFile, getDownloadUrl } from '@/services/file'
import config from '@/config/config'

vi.mock('@/config/config', () => {
  const baseConfig = {
    baseUrl: 'https://files.example.com/api/',
    name: '',
    indexNav: [],
  }
  return { default: baseConfig }
})

describe('services/file', () => {
  afterEach(() => {
    config.baseUrl = 'https://files.example.com/api/'
  })

  it('builds download urls with normalized base paths', () => {
    config.baseUrl = 'https://files.example.com/api'
    expect(getDownloadUrl('report 1.pdf')).toBe(
      'https://files.example.com/api/file/download?fileName=report%201.pdf',
    )

    config.baseUrl = 'https://files.example.com/api/'
    expect(getDownloadUrl('avatar.png')).toBe(
      'https://files.example.com/api/file/download?fileName=avatar.png',
    )
  })

  it('triggers anchor download flow', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const appendSpy = vi.spyOn(document.body, 'appendChild')
    const removeSpy = vi.spyOn(document.body, 'removeChild')

    downloadFile('export.csv')

    expect(appendSpy).toHaveBeenCalled()
    expect(removeSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()

    clickSpy.mockRestore()
    appendSpy.mockRestore()
    removeSpy.mockRestore()
  })
})



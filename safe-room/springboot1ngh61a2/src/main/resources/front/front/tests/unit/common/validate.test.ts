import validate from '@/common/validate'

const runRule = (ruleFn: (rule: any, value: any, cb: (err?: Error) => void) => void, value: any) =>
  new Promise<string | null>((resolve) => {
    ruleFn({}, value, (err?: Error) => resolve(err ? err.message ?? null : null))
  })

describe('validate utilities', () => {
  it('validates email formats', async () => {
    expect(validate.isEmail2('demo@example.com')).toBe(true)
    expect(validate.isEmail2('invalid-email')).toBe(false)
    await expect(runRule(validate.isEmail, 'demo@example.com')).resolves.toBeNull()
    await expect(runRule(validate.isEmail, 'bad')).resolves.toBe('请输入正确的邮箱')
    await expect(runRule(validate.isEmailNotNull, '')).resolves.toBe('请输入邮箱')
  })

  it('validates mobile numbers', async () => {
    expect(validate.isMobile2('13812345678')).toBe(true)
    expect(validate.isMobile2('123')).toBe(false)
    await expect(runRule(validate.isMobile, '13812345678')).resolves.toBeNull()
    await expect(runRule(validate.isMobile, 'not-phone')).resolves.toBe('请输入正确的手机号码')
    await expect(runRule(validate.isMobileNotNull, '')).resolves.toBe('请输入手机号码')
  })

  it('validates landline numbers', async () => {
    expect(validate.isPhone2('021-88887777')).toBe(true)
    expect(validate.isPhone2('foo')).toBe(false)
    await expect(runRule(validate.isPhone, '021-88887777')).resolves.toBeNull()
    await expect(runRule(validate.isPhone, 'xxx')).resolves.toBe('请输入正确的电话号码')
    await expect(runRule(validate.isPhoneNotNull, '')).resolves.toBe('请输入电话号码')
  })

  it('validates URLs', async () => {
    expect(validate.isURL2('https://example.com')).toBe(true)
    expect(validate.isURL2('ftp://example.com')).toBe(false)
    await expect(runRule(validate.isURL, 'https://example.com')).resolves.toBeNull()
    await expect(runRule(validate.isURL, 'example.com')).resolves.toBe('请输入正确的URL地址')
    await expect(runRule(validate.isURLNotNull, '')).resolves.toBe('请输入地址')
  })

  it('validates numeric values', async () => {
    expect(validate.isNumber2('123.45')).toBe(true)
    expect(validate.isNumber2('text')).toBe(false)
    await expect(runRule(validate.isNumber, '123.45')).resolves.toBeNull()
    await expect(runRule(validate.isNumber, 'text')).resolves.toBe('请输入正确的数字')
    await expect(runRule(validate.isNumberNotNull, '')).resolves.toBe('请输入数字')
  })

  it('validates integer values', async () => {
    expect(validate.isIntNumer2('100')).toBe(true)
    expect(validate.isIntNumer2('10.5')).toBe(false)
    await expect(runRule(validate.isIntNumer, '100')).resolves.toBeNull()
    await expect(runRule(validate.isIntNumer, '10.5')).resolves.toBe('请输入正确的整数')
    await expect(runRule(validate.isIntNumerNotNull, '')).resolves.toBe('请输入整数')
  })

  it('validates id cards', async () => {
    const validId = '11010519491231002X'
    const invalidId = '123456'
    expect(validate.isIdCard2(validId)).toBe(true)
    expect(validate.isIdCard2(invalidId)).toBe(false)
    await expect(runRule(validate.isIdCard, validId)).resolves.toBeNull()
    await expect(runRule(validate.isIdCard, invalidId)).resolves.toBe('请输入正确的身份证')
    await expect(runRule(validate.isIdCardNotNull, '')).resolves.toBe('请输入身份证')
  })
})



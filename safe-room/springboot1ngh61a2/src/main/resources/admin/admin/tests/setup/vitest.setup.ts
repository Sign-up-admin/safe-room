import { vi } from 'vitest'
import { config } from '@vue/test-utils'

type StorageRecord = Record<string, string>

class LocalStorageMock implements Storage {
  private store: StorageRecord = {}

  clear(): void {
    this.store = {}
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null
  }

  get length(): number {
    return Object.keys(this.store).length
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }
}

class SessionStorageMock implements Storage {
  private store: StorageRecord = {}

  clear(): void {
    this.store = {}
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null
  }

  get length(): number {
    return Object.keys(this.store).length
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }
}

// Mock browser APIs
Object.defineProperty(globalThis, 'localStorage', {
  value: new LocalStorageMock(),
  writable: false,
})

Object.defineProperty(globalThis, 'sessionStorage', {
  value: new SessionStorageMock(),
  writable: false,
})

// Mock window APIs
Object.defineProperty(globalThis, 'window', {
  value: {
    ...globalThis,
    localStorage: new LocalStorageMock(),
    sessionStorage: new SessionStorageMock(),
    location: {
      href: 'http://localhost:8081',
      origin: 'http://localhost:8081',
      pathname: '/',
      search: '',
      hash: '',
      hostname: 'localhost',
      port: '8081',
      protocol: 'http:',
    },
    navigator: {
      userAgent: 'vitest',
      platform: 'Node.js',
    },
    document: {
      createElement: vi.fn(() => ({
        style: {},
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(),
      getElementById: vi.fn(),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
      head: {
        appendChild: vi.fn(),
      },
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    setTimeout: vi.fn((cb: Function) => setTimeout(cb, 0)),
    clearTimeout: vi.fn(),
    setInterval: vi.fn(),
    clearInterval: vi.fn(),
    requestAnimationFrame: vi.fn((cb: Function) => setTimeout(cb, 16)),
    cancelAnimationFrame: vi.fn(),
    matchMedia: vi.fn(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    getComputedStyle: vi.fn(() => ({})),
    scrollTo: vi.fn(),
    scrollBy: vi.fn(),
    alert: vi.fn(),
    confirm: vi.fn(),
    prompt: vi.fn(),
  },
  writable: true,
})

// Mock globalThis for better compatibility
Object.defineProperty(globalThis, 'globalThis', {
  value: globalThis,
  writable: false,
})

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock fetch API
globalThis.fetch = vi.fn()

// Mock URL APIs - simplified version for tests
const OriginalURL = globalThis.URL;

class MockURL {
  public href: string;
  public readonly origin: string;
  public readonly protocol: string;
  public readonly username: string;
  public readonly password: string;
  public readonly host: string;
  public readonly hostname: string;
  public readonly port: string;
  public readonly pathname: string;
  public readonly search: string;
  public readonly hash: string;
  public readonly searchParams: URLSearchParams;

  constructor(url: string | MockURL, base?: string | MockURL) {
    try {
      // Use native URL for parsing when available
      const parsed = typeof OriginalURL !== 'undefined' ?
        new OriginalURL(url as string, base as string) :
        this.parseUrl(url as string, base as string);

      this.href = parsed.href;
      this.origin = parsed.origin;
      this.protocol = parsed.protocol;
      this.username = parsed.username;
      this.password = parsed.password;
      this.host = parsed.host;
      this.hostname = parsed.hostname;
      this.port = parsed.port;
      this.pathname = parsed.pathname;
      this.search = parsed.search;
      this.hash = parsed.hash;
      this.searchParams = new globalThis.URLSearchParams(parsed.search);
    } catch (e) {
      // Fallback for environments without native URL
      const parsed = this.parseUrl(url as string, base as string);
      this.href = parsed.href;
      this.origin = parsed.origin;
      this.protocol = parsed.protocol;
      this.username = parsed.username;
      this.password = parsed.password;
      this.host = parsed.host;
      this.hostname = parsed.hostname;
      this.port = parsed.port;
      this.pathname = parsed.pathname;
      this.search = parsed.search;
      this.hash = parsed.hash;
      this.searchParams = new globalThis.URLSearchParams(parsed.search);
    }
  }

  private parseUrl(url: string, base?: string): any {
    // Very basic URL parsing for test environments
    const baseUrl = base ? (typeof base === 'string' ? base : (base as MockURL).href) : '';
    const fullUrl = baseUrl && !url.startsWith('http') ? baseUrl + url : url;

    // Extract basic components
    const urlPattern = /^([^:]+):\/\/([^\/]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/;
    const match = fullUrl.match(urlPattern);

    if (!match) {
      throw new Error(`Invalid URL: ${fullUrl}`);
    }

    const [, protocol, host, pathname = '/', search = '', hash = ''] = match;
    const [hostname, port] = host.split(':');

    return {
      href: fullUrl,
      origin: `${protocol}://${host}`,
      protocol: `${protocol}:`,
      username: '',
      password: '',
      host,
      hostname,
      port: port || '',
      pathname,
      search,
      hash
    };
  }

  toString(): string {
    return this.href;
  }

  toJSON(): string {
    return this.href;
  }

  static canParse(url: string | MockURL, base?: string | MockURL): boolean {
    try {
      new MockURL(url as string, base as string);
      return true;
    } catch {
      return false;
    }
  }

  static createObjectURL(obj: Blob | MediaSource): string {
    return `blob:${Math.random().toString(36).substr(2, 9)}`;
  }

  static revokeObjectURL(url: string): void {
    // Mock implementation - do nothing
  }
}

// Assign to globalThis with type assertion to bypass TypeScript checking
(globalThis as any).URL = MockURL;

globalThis.URLSearchParams = class URLSearchParams {
  private params: Map<string, string> = new Map();

  constructor(init?: string | Record<string, string> | URLSearchParams | string[][]) {
    if (typeof init === 'string') {
      // Simple parsing for test purposes
      const pairs = init.replace('?', '').split('&');
      pairs.forEach(pair => {
        if (pair) {
          const [key, value] = pair.split('=');
          if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
        }
      });
    } else if (init instanceof URLSearchParams) {
      init.forEach((value, key) => {
        this.params.set(key, value);
      });
    } else if (Array.isArray(init)) {
      init.forEach(([key, value]) => {
        this.params.set(key, String(value));
      });
    } else if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.params.set(key, String(value));
      });
    }
  }

  get size(): number {
    return this.params.size;
  }

  get(key: string): string | null {
    return this.params.get(key) || null;
  }

  getAll(key: string): string[] {
    const values: string[] = [];
    for (const [k, v] of this.params) {
      if (k === key) values.push(v);
    }
    return values;
  }

  has(key: string): boolean {
    return this.params.has(key);
  }

  set(key: string, value: string): void {
    this.params.set(key, String(value));
  }

  append(key: string, value: string): void {
    // URLSearchParams allows multiple values for the same key
    const existing = this.params.get(key);
    if (existing !== undefined) {
      this.params.set(key, existing + ',' + value);
    } else {
      this.params.set(key, String(value));
    }
  }

  delete(key: string, value?: string): void {
    if (value !== undefined) {
      const current = this.params.get(key);
      if (current) {
        const values = current.split(',');
        const filtered = values.filter(v => v !== value);
        if (filtered.length > 0) {
          this.params.set(key, filtered.join(','));
        } else {
          this.params.delete(key);
        }
      }
    } else {
      this.params.delete(key);
    }
  }

  forEach(callback: (value: string, key: string, searchParams: URLSearchParams) => void): void {
    for (const [key, value] of this.params) {
      callback(value, key, this);
    }
  }

  keys(): IterableIterator<string> {
    return this.params.keys();
  }

  values(): IterableIterator<string> {
    return this.params.values();
  }

  entries(): IterableIterator<[string, string]> {
    return this.params.entries();
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.params.entries();
  }

  toString(): string {
    return Array.from(this.params.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  sort(): void {
    // Simple sort implementation
    const sorted = new Map([...this.params.entries()].sort());
    this.params = sorted;
  }
}

// Mock performance API
globalThis.performance = {
  now: () => Date.now(),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
} as any

// Configure Vue Test Utils
config.global.stubs = {
  transition: false,
  'transition-group': false,
  teleport: true,
}

// Configure global plugins if needed
config.global.plugins = []


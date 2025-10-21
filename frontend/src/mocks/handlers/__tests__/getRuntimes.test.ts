import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'

describe('GET /api/v1/runtimes', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should return all supported runtimes', async () => {
    const response = await fetch(`${baseURL}/api/v1/runtimes`)

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)

    // Check structure of first runtime
    const firstRuntime = data[0]
    expect(firstRuntime).toHaveProperty('language')
    expect(firstRuntime).toHaveProperty('version')
    expect(firstRuntime).toHaveProperty('aliases')
    expect(Array.isArray(firstRuntime.aliases)).toBe(true)
    expect(firstRuntime).toHaveProperty('runtime')
  })

  it('should include JavaScript runtime', async () => {
    const response = await fetch(`${baseURL}/api/v1/runtimes`)
    const data = await response.json()

    const jsRuntime = data.find((runtime: any) => runtime.language === 'javascript')
    expect(jsRuntime).toBeDefined()
    expect(jsRuntime.version).toBe('18.0.0')
    expect(jsRuntime.aliases).toEqual(['js', 'node'])
    expect(jsRuntime.runtime).toBe('Node.js')
  })

  it('should include Python runtime', async () => {
    const response = await fetch(`${baseURL}/api/v1/runtimes`)
    const data = await response.json()

    const pythonRuntime = data.find((runtime: any) => runtime.language === 'python')
    expect(pythonRuntime).toBeDefined()
    expect(pythonRuntime.version).toBe('3.11.0')
    expect(pythonRuntime.aliases).toEqual(['py', 'python3'])
    expect(pythonRuntime.runtime).toBe('CPython')
  })

  it('should include Java runtime', async () => {
    const response = await fetch(`${baseURL}/api/v1/runtimes`)
    const data = await response.json()

    const javaRuntime = data.find((runtime: any) => runtime.language === 'java')
    expect(javaRuntime).toBeDefined()
    expect(javaRuntime.version).toBe('21.0.0')
    expect(javaRuntime.aliases).toEqual(['java', 'jdk'])
    expect(javaRuntime.runtime).toBe('OpenJDK')
  })

  it('should include C++ runtime', async () => {
    const response = await fetch(`${baseURL}/api/v1/runtimes`)
    const data = await response.json()

    const cppRuntime = data.find((runtime: any) => runtime.language === 'cpp')
    expect(cppRuntime).toBeDefined()
    expect(cppRuntime.version).toBe('17.0.0')
    expect(cppRuntime.aliases).toEqual(['c++', 'cpp'])
    expect(cppRuntime.runtime).toBe('GCC')
  })

  it('should include TypeScript runtime', async () => {
    const response = await fetch(`${baseURL}/api/v1/runtimes`)
    const data = await response.json()

    const tsRuntime = data.find((runtime: any) => runtime.language === 'typescript')
    expect(tsRuntime).toBeDefined()
    expect(tsRuntime.version).toBe('5.0.0')
    expect(tsRuntime.aliases).toEqual(['ts', 'typescript'])
    expect(tsRuntime.runtime).toBe('Node.js')
  })

  it('should return consistent data on multiple calls', async () => {
    const response1 = await fetch(`${baseURL}/api/v1/runtimes`)
    const data1 = await response1.json()

    const response2 = await fetch(`${baseURL}/api/v1/runtimes`)
    const data2 = await response2.json()

    expect(data1).toEqual(data2)
  })

  it('should return data with correct content type', async () => {
    const response = await fetch(`${baseURL}/api/v1/runtimes`)

    expect(response.headers.get('content-type')).toContain('application/json')
  })
})

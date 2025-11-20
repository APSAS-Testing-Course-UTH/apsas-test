/*
declare module 'sockjs-client' {
  interface SockJSStatic {
    (url: string, _reserved?: null, options?: SockJSOptions): SockJSSocket
  }

  interface SockJSOptions {
    transports?: string[]
    timeout?: number
    server?: string
    sessionId?: number | (() => string)
  }

  interface SockJSSocket {
    send(message: string): void
    close(): void
    onopen?: () => void
    onclose?: () => void
    onerror?: (error: Error | Event) => void
    onmessage?: (event: MessageEvent) => void
    readyState?: number
    protocol?: string
    url?: string
  }

  const SockJS: SockJSStatic
  export default SockJS
}

*/

declare module 'sockjs-client' {
  interface SockJSStatic {
    (url: string, _reserved?: any, options?: SockJSOptions): SockJSSocket
  }

  interface SockJSOptions {
    transports?: string[]
    timeout?: number
    [key: string]: any
  }

  interface SockJSSocket {
    send(message: string): void
    close(): void
    onopen?: () => void
    onclose?: () => void
    onerror?: (error: any) => void
    onmessage?: (event: MessageEvent) => void
    readyState?: number
    protocol?: string
    url?: string
  }

  const SockJS: SockJSStatic
  export default SockJS
}

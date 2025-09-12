declare module 'qrcode' {
  interface QRCodeRenderersOptions {
    margin?: number
    width?: number
    scale?: number
    color?: {
      dark?: string
      light?: string
    }
  }
  interface QRCodeToDataURLOptions extends QRCodeRenderersOptions {
    type?: 'image/png' | 'image/webp' | 'image/jpeg'
    errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H'
  }
  function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>
  export { toDataURL }
  const _default: { toDataURL: typeof toDataURL }
  export default _default
}
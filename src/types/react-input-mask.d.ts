declare module 'react-input-mask' {
  import * as React from 'react'

  export interface InputMaskProps extends React.InputHTMLAttributes<HTMLInputElement> {
    mask: string
    maskChar?: string | null
    alwaysShowMask?: boolean
    beforeMaskedValueChange?: (newState: any, oldState: any, userInput: string, maskOptions: any) => any
    children?: (inputProps: any) => React.ReactNode
  }

  const InputMask: React.ComponentType<InputMaskProps>
  export default InputMask
}



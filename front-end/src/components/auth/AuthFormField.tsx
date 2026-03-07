import { Input, type InputProps } from '@/components/ui'

export interface AuthFormFieldProps extends InputProps {
  /** Wraps Input with consistent auth form styling - pass through to Input */
}

export const AuthFormField = (props: AuthFormFieldProps) => (
  <Input {...props} />
)

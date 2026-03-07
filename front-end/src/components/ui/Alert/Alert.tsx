import { cn } from '@/lib/cn'
import styles from './Alert.module.css'

export type AlertVariant = 'success' | 'error' | 'info'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  className?: string
  children?: React.ReactNode
}

export const Alert = ({ variant = 'info', className, children, ...rest }: AlertProps) => (
  <div
    role="alert"
    className={cn(styles.alert, styles[variant], className)}
    {...rest}
  >
    {children}
  </div>
)

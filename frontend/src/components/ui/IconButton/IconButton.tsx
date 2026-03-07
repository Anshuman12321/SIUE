import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import styles from './IconButton.module.css'

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  variant?: IconButtonVariant
  size?: IconButtonSize
  'aria-label': string
  className?: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = 'secondary',
      size = 'md',
      className,
      ...rest
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      className={cn(styles.button, styles[variant], styles[size], className)}
      {...rest}
    >
      {icon}
    </button>
  )
)

IconButton.displayName = 'IconButton'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Spinner } from '../Spinner'
import { cn } from '@/lib/cn'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          styles.button,
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          className
        )}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <>
            <Spinner size="sm" className={styles.spinner} />
            {children}
          </>
        ) : (
          <>{children}</>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

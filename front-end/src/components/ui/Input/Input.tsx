import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import styles from './Input.module.css'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id?: string
  label?: string
  error?: string | { message?: string }
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, id, ...rest }, ref) => {
    const inputId =
      (id != null && String(id) !== '') ? String(id) : `input-${Math.random().toString(36).slice(2)}`
    const errorMessage = typeof error === 'string' ? error : error?.message

    return (
      <div className={cn(styles.wrapper, className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={cn(styles.inputWrapper, errorMessage ? styles.hasError : undefined)}>
          {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(styles.input, leftIcon ? styles.hasLeftIcon : undefined, rightIcon ? styles.hasRightIcon : undefined)}
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? `${inputId}-error` : undefined}
            {...rest}
          />
          {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
        </div>
        {errorMessage && (
          <p id={`${inputId}-error`} className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

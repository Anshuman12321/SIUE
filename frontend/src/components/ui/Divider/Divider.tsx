import { cn } from '@/lib/cn'
import styles from './Divider.module.css'

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  label?: string
  className?: string
}

export const Divider = ({
  orientation = 'horizontal',
  label,
  className,
  ...rest
}: DividerProps) => (
  <div
    role="separator"
    aria-orientation={orientation}
    className={cn(
      styles.divider,
      styles[orientation],
      label && styles.withLabel,
      className
    )}
    {...rest}
  >
    {label ? <span className={styles.label}>{label}</span> : null}
  </div>
)

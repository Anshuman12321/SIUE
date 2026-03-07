import { cn } from '@/lib/cn'
import styles from './Stack.module.css'

export type StackGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch'
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around'

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: StackGap
  align?: StackAlign
  justify?: StackJustify
  direction?: 'column' | 'column-reverse'
  className?: string
  children?: React.ReactNode
}

export const Stack = ({
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  direction = 'column',
  className,
  children,
  ...rest
}: StackProps) => (
  <div
    className={cn(
      styles.stack,
      styles[`gap-${gap}`],
      styles[`align-${align}`],
      styles[`justify-${justify}`],
      styles[direction],
      className
    )}
    {...rest}
  >
    {children}
  </div>
)

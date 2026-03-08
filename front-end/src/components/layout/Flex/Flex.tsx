import { cn } from '@/lib/cn'
import styles from './Flex.module.css'

export type FlexGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: FlexGap
  align?: FlexAlign
  justify?: FlexJustify
  wrap?: boolean
  className?: string
  children?: React.ReactNode
}

export const Flex = ({
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  children,
  ...rest
}: FlexProps) => (
  <div
    className={cn(
      styles.flex,
      styles[`gap-${gap}`],
      styles[`align-${align}`],
      styles[`justify-${justify}`],
      wrap && styles.wrap,
      className
    )}
    {...rest}
  >
    {children}
  </div>
)

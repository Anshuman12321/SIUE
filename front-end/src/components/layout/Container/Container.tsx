import { cn } from '@/lib/cn'
import styles from './Container.module.css'

export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: ContainerMaxWidth
  className?: string
  children?: React.ReactNode
}

export const Container = ({
  maxWidth = 'lg',
  className,
  children,
  ...rest
}: ContainerProps) => (
  <div className={cn(styles.container, styles[maxWidth], className)} {...rest}>
    {children}
  </div>
)

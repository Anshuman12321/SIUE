import { cn } from '@/lib/cn'
import styles from './PageLayout.module.css'

export type PageLayoutMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: PageLayoutMaxWidth
  header?: React.ReactNode
  footer?: React.ReactNode
  centered?: boolean
  className?: string
  children?: React.ReactNode
}

export const PageLayout = ({
  maxWidth = 'lg',
  header,
  footer,
  centered = true,
  className,
  children,
  ...rest
}: PageLayoutProps) => (
  <div className={cn(styles.page, className)} {...rest}>
    {header && <header className={styles.header}>{header}</header>}
    <main className={cn(styles.main, styles[maxWidth], centered && styles.centered)}>
      {children}
    </main>
    {footer && <footer className={styles.footer}>{footer}</footer>}
  </div>
)

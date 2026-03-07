import { cn } from '@/lib/cn'
import styles from './Card.module.css'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat'
  className?: string
}

export const Card = ({ variant = 'elevated', className, children, ...rest }: CardProps) => (
  <div className={cn(styles.card, styles[variant], className)} {...rest}>
    {children}
  </div>
)

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export const CardHeader = ({ className, children, ...rest }: CardHeaderProps) => (
  <div className={cn(styles.header, className)} {...rest}>
    {children}
  </div>
)

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export const CardBody = ({ className, children, ...rest }: CardBodyProps) => (
  <div className={cn(styles.body, className)} {...rest}>
    {children}
  </div>
)

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export const CardFooter = ({ className, children, ...rest }: CardFooterProps) => (
  <div className={cn(styles.footer, className)} {...rest}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

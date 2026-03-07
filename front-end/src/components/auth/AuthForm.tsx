import { cn } from '@/lib/cn'
import { Text } from '@/components/ui'
import { Link } from '@/components/ui'
import styles from './AuthForm.module.css'

export interface AuthFormFooterLink {
  prompt: string
  linkText: string
  to: string
}

export interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  footerLink?: AuthFormFooterLink
  className?: string
  children?: React.ReactNode
}

export const AuthForm = ({
  title,
  subtitle,
  footerLink,
  className,
  children,
  ...rest
}: AuthFormProps) => (
  <div className={cn(styles.authForm, className)} {...rest}>
    <div className={styles.header}>
      <Text as="h1" size="2xl" weight="bold" className={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text as="p" size="md" color="muted" className={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </div>
    <div className={styles.body}>{children}</div>
    {footerLink && (
      <div className={styles.footer}>
        <Text as="span" size="sm" color="muted">
          {footerLink.prompt}{' '}
        </Text>
        <Link to={footerLink.to} variant="underline">
          {footerLink.linkText}
        </Link>
      </div>
    )}
  </div>
)

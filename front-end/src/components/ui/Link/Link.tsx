import { Link as RouterLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import styles from './Link.module.css'

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to?: string
  href?: string
  variant?: 'default' | 'underline'
  className?: string
  children?: React.ReactNode
}

export const Link = ({
  to,
  href,
  variant = 'default',
  className,
  children,
  ...rest
}: LinkProps) => {
  const classes = cn(styles.link, styles[variant], className)

  if (to) {
    return (
      <RouterLink to={to} className={classes}>
        {children}
      </RouterLink>
    )
  }

  return (
    <a href={href ?? '#'} className={classes} {...rest}>
      {children}
    </a>
  )
}

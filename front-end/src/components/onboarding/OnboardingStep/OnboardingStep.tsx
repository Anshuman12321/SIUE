import { cn } from '@/lib/cn'
import { Text } from '@/components/ui'
import styles from './OnboardingStep.module.css'

export interface OnboardingStepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export const OnboardingStep = ({
  title,
  description,
  className,
  children,
  ...rest
}: OnboardingStepProps) => (
  <div className={cn(styles.step, className)} {...rest}>
    <div className={styles.header}>
      <Text as="h2" size="xl" weight="bold" className={styles.title}>
        {title}
      </Text>
      {description && (
        <Text as="p" size="md" color="muted" className={styles.description}>
          {description}
        </Text>
      )}
    </div>
    {children && <div className={styles.content}>{children}</div>}
  </div>
)

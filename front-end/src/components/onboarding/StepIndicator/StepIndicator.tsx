import { cn } from '@/lib/cn'
import styles from './StepIndicator.module.css'

export type StepIndicatorVariant = 'dots' | 'stepper'

export interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  variant?: StepIndicatorVariant
  className?: string
}

export const StepIndicator = ({
  currentStep,
  totalSteps,
  variant = 'dots',
  className,
}: StepIndicatorProps) => {
  if (variant === 'stepper') {
    return (
      <div className={cn(styles.stepper, className)} role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className={styles.stepperItem}>
            <div
              className={cn(
                styles.stepCircle,
                step <= currentStep && styles.active,
                step < currentStep && styles.completed
              )}
            >
              {step < currentStep ? (
                <span className={styles.check}>✓</span>
              ) : (
                step
              )}
            </div>
            {step < totalSteps && <div className={styles.connector} />}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn(styles.dots, className)} role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            styles.dot,
            i + 1 === currentStep && styles.active,
            i + 1 < currentStep && styles.completed
          )}
        />
      ))}
    </div>
  )
}

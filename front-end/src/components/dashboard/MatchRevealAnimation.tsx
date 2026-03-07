import { useEffect, useState } from 'react'
import { Text } from '@/components/ui'
import styles from './MatchRevealAnimation.module.css'

export interface MatchRevealAnimationProps {
  onComplete: () => void
}

export function MatchRevealAnimation({ onComplete }: MatchRevealAnimationProps) {
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'outro'>('intro')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 800)
    const t2 = setTimeout(() => setPhase('outro'), 2200)
    const t3 = setTimeout(onComplete, 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.confetti} aria-hidden />
        <div className={styles.card}>
          <Text as="h1" size="3xl" weight="bold" className={styles.title}>
            {phase === 'intro' && 'Finding your group...'}
            {phase === 'reveal' && "You're matched!"}
            {phase === 'outro' && "Let's go!"}
          </Text>
          <Text as="p" size="lg" color="muted" className={styles.subtitle}>
            {phase === 'reveal' && 'Your group is ready. Check out who you matched with.'}
          </Text>
        </div>
      </div>
    </div>
  )
}

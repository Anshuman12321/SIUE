import { useState, useEffect } from 'react'
import { Text } from '@/components/ui'
import styles from './VotingTimer.module.css'

export interface VotingTimerProps {
  endsAt: string
}

export function VotingTimer({ endsAt }: VotingTimerProps) {
  const [remaining, setRemaining] = useState<string>('')

  useEffect(() => {
    const update = () => {
      const end = new Date(endsAt).getTime()
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setRemaining('Voting ended')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      const parts: string[] = []
      if (days > 0) parts.push(`${days}d`)
      parts.push(`${hours}h`)
      parts.push(`${mins}m`)
      setRemaining(parts.join(' '))
    }

    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [endsAt])

  return (
    <div className={styles.timer}>
      <Text as="span" size="sm" color="muted">
        Voting ends in:{' '}
      </Text>
      <Text as="span" size="sm" weight="semibold">
        {remaining}
      </Text>
    </div>
  )
}

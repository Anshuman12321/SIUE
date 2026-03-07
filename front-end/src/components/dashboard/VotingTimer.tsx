import { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'

export interface VotingTimerProps {
  endsAt: string
}

export function VotingTimer({ endsAt }: VotingTimerProps) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) { setRemaining('Voting ended'); return }

      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)

      const parts: string[] = []
      if (days > 0) parts.push(`${days}d`)
      parts.push(`${hours}h`)
      parts.push(`${mins}m`)
      setRemaining(parts.join(' '))
    }

    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [endsAt])

  return (
    <div className={styles.timerBadge}>
      <span className={styles.timerDot} />
      <span className={styles.timerLabel}>Voting ends in</span>
      <span className={styles.timerValue}>{remaining}</span>
    </div>
  )
}

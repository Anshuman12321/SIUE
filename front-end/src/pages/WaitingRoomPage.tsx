import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from './WaitingRoom.module.css'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

type Stage = 'vibe' | 'matchmaker' | 'done' | 'error'

const STAGES: Stage[] = ['vibe', 'matchmaker', 'done']

const STAGE_INFO: Record<Stage, { title: string; body: string }> = {
  vibe: {
    title: 'Processing your vibe...',
    body: 'Analyzing your interests and preferences.',
  },
  matchmaker: {
    title: 'Finding your matches...',
    body: 'Matching you with compatible people and creating events.',
  },
  done: {
    title: "You're all set!",
    body: 'Redirecting you to your dashboard...',
  },
  error: {
    title: 'Something went wrong',
    body: '',
  },
}

function stepStatus(step: Stage, current: Stage): 'done' | 'active' | 'pending' {
  const order = STAGES.indexOf(step)
  const cur = current === 'error' ? -1 : STAGES.indexOf(current)
  if (order < cur) return 'done'
  if (order === cur) return 'active'
  return 'pending'
}

function StepDot({ label, status }: { label: string; status: 'done' | 'active' | 'pending' }) {
  const cls =
    status === 'done'
      ? styles.stepDotDone
      : status === 'active'
        ? styles.stepDotActive
        : styles.stepDot
  return (
    <div className={styles.step}>
      <div className={cls} />
      <span className={styles.stepLabel}>{label}</span>
    </div>
  )
}

export function WaitingRoomPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('vibe')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const running = useRef(false)

  const runPipeline = useCallback(async () => {
    if (!user?.id || running.current) return
    running.current = true

    try {
      setStage('vibe')
      setErrorMessage(null)

      const vibeRes = await fetch(`${API_BASE}/users/${user.id}/process-vibe`, { method: 'POST' })
      if (!vibeRes.ok) {
        const data = await vibeRes.json().catch(() => ({}))
        throw new Error(data.detail || 'Failed to process vibe')
      }

      setStage('matchmaker')

      const matchRes = await fetch(`${API_BASE}/jobs/matchmaker`, { method: 'POST' })
      if (!matchRes.ok) {
        const data = await matchRes.json().catch(() => ({}))
        throw new Error(data.detail || 'Matchmaking failed')
      }

      setStage('done')
      setTimeout(() => navigate('/home', { replace: true }), 1000)
    } catch (err) {
      running.current = false
      setStage('error')
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }, [user?.id, navigate])

  useEffect(() => {
    runPipeline()
  }, [runPipeline])

  const info = STAGE_INFO[stage]

  return (
    <div className={styles.page}>
      <div className={styles.radar}>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
      </div>

      <div className={styles.content}>
        <div className={styles.beacon}>
          <span className={styles.beaconIcon}>
            {stage === 'done' ? '✅' : stage === 'error' ? '⚠️' : '📡'}
          </span>
        </div>

        <h1 className={styles.title}>{info.title}</h1>
        <p className={styles.body}>{stage === 'error' ? errorMessage : info.body}</p>

        <div className={styles.steps}>
          <StepDot label="Vibe" status={stepStatus('vibe', stage)} />
          <div className={styles.stepLine} />
          <StepDot label="Match" status={stepStatus('matchmaker', stage)} />
          <div className={styles.stepLine} />
          <StepDot label="Ready" status={stepStatus('done', stage)} />
        </div>

        {stage === 'error' && (
          <button type="button" className={styles.retryBtn} onClick={runPipeline}>
            Try again
          </button>
        )}

        <div>
          <button type="button" className={styles.logoutBtn} onClick={() => signOut()}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  OnboardingProvider,
  useOnboarding,
  PROMPT_OPTIONS,
} from '@/contexts/OnboardingContext'
import { useCalendarStatus } from '@/hooks/useCalendarStatus'
import { Button, Input } from '@/components/ui'
import styles from './Onboarding.module.css'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const TOTAL_STEPS = 8

const BUDGET_OPTIONS = [
  { value: 'low' as const, label: '$' },
  { value: 'medium' as const, label: '$$' },
  { value: 'high' as const, label: '$$$' },
]

/* ================================================================== */
/*  Individual Steps                                                   */
/* ================================================================== */

function StepName() {
  const { state, setField } = useOnboarding()
  return (
    <>
      <div className={styles.header}>
        <p className={styles.stepLabel}>Step 1 of {TOTAL_STEPS}</p>
        <h1 className={styles.title}>What's your name?</h1>
        <p className={styles.subtitle}>This is how your group will know you.</p>
      </div>
      <Input
        label="Your name"
        placeholder="Enter your name"
        value={state.name}
        onChange={(e) => setField('name', e.target.value)}
        autoFocus
      />
    </>
  )
}

function StepAvatar() {
  const { state, setField } = useOnboarding()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setField('avatarFile', file)
    setField('avatarPreview', URL.createObjectURL(file))
  }

  return (
    <>
      <div className={styles.header}>
        <p className={styles.stepLabel}>Step 2 of {TOTAL_STEPS}</p>
        <h1 className={styles.title}>Add a photo</h1>
        <p className={styles.subtitle}>Pick a photo so your group knows who you are.</p>
      </div>
      <div className={styles.avatarUpload}>
        <div
          className={styles.avatarPreview}
          onClick={() => fileRef.current?.click()}
        >
          {state.avatarPreview ? (
            <img src={state.avatarPreview} alt="Avatar preview" />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <span>📷</span>
              <span>Tap to upload</span>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={styles.avatarInput}
          onChange={handleFile}
        />
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          {state.avatarPreview ? 'Change photo' : 'Choose from device'}
        </Button>
      </div>
    </>
  )
}

function StepBio() {
  const { state, setField } = useOnboarding()
  const maxChars = 200

  return (
    <>
      <div className={styles.header}>
        <p className={styles.stepLabel}>Step 3 of {TOTAL_STEPS}</p>
        <h1 className={styles.title}>Write a short bio</h1>
        <p className={styles.subtitle}>A sentence or two so people get your vibe.</p>
      </div>
      <textarea
        className={styles.textarea}
        placeholder="E.g. Coffee lover, trail runner, always looking for the best taco spot..."
        value={state.bio}
        onChange={(e) => {
          if (e.target.value.length <= maxChars) setField('bio', e.target.value)
        }}
        rows={4}
      />
      <p className={`${styles.charCount} ${state.bio.length >= maxChars ? styles.charCountOver : ''}`}>
        {state.bio.length}/{maxChars}
      </p>
    </>
  )
}

function StepPrompts() {
  const { state, setField } = useOnboarding()

  const updatePrompt = (idx: 0 | 1, field: 'prompt' | 'response', value: string) => {
    const next: [typeof state.prompts[0], typeof state.prompts[1]] = [
      { ...state.prompts[0] },
      { ...state.prompts[1] },
    ]
    next[idx] = { ...next[idx], [field]: value }
    setField('prompts', next)
  }

  const usedPrompts = state.prompts.map((p) => p.prompt)

  return (
    <>
      <div className={styles.header}>
        <p className={styles.stepLabel}>Step 4 of {TOTAL_STEPS}</p>
        <h1 className={styles.title}>Answer some prompts</h1>
        <p className={styles.subtitle}>Pick a prompt and write your response — Hinge-style.</p>
      </div>
      <div className={styles.promptsWrap}>
        {([0, 1] as const).map((idx) => (
          <div key={idx} className={styles.promptCard}>
            <p className={styles.promptNumber}>Prompt {idx + 1}</p>
            <div className={styles.promptSelector}>
              <select
                className={styles.promptSelect}
                value={state.prompts[idx].prompt}
                onChange={(e) => updatePrompt(idx, 'prompt', e.target.value)}
              >
                {PROMPT_OPTIONS.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    disabled={usedPrompts.includes(opt) && state.prompts[idx].prompt !== opt}
                  >
                    {opt}
                  </option>
                ))}
              </select>
              <span className={styles.promptSelectArrow}>▾</span>
            </div>
            <textarea
              className={styles.promptResponse}
              placeholder="Type your answer..."
              value={state.prompts[idx].response}
              onChange={(e) => updatePrompt(idx, 'response', e.target.value)}
              rows={3}
            />
          </div>
        ))}
      </div>
    </>
  )
}

function StepLocation() {
  const { state, setField } = useOnboarding()
  const [detecting, setDetecting] = useState(false)

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        let label = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`

        try {
          const res = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
          )
          const json = await res.json()
          const place = json?.features?.[0]?.properties?.full_address
          if (place) label = place
        } catch {
          // fallback to coords
        }

        setField('location', { lat: latitude, lng: longitude, label })
        setDetecting(false)
      },
      () => setDetecting(false)
    )
  }

  return (
    <>
      <div className={styles.header}>
        <p className={styles.stepLabel}>Step 5 of {TOTAL_STEPS}</p>
        <h1 className={styles.title}>Where are you?</h1>
        <p className={styles.subtitle}>We'll match you with groups nearby.</p>
      </div>
      <div className={styles.locationWrap}>
        <button
          type="button"
          className={styles.locationBtn}
          onClick={detectLocation}
          disabled={detecting}
        >
          📍 {detecting ? 'Detecting...' : 'Use my current location'}
        </button>
        <p className={styles.orDivider}>or enter a city</p>
        <Input
          placeholder="e.g. St. Louis, MO"
          value={state.location.label}
          onChange={(e) =>
            setField('location', { ...state.location, label: e.target.value })
          }
        />
        {state.location.lat !== 0 && (
          <div className={styles.locationDisplay}>
            <span className={styles.locationDot} />
            <span>{state.location.label}</span>
          </div>
        )}
      </div>
    </>
  )
}

function StepPreferences() {
  const { state, setField } = useOnboarding()

  return (
    <>
      <div className={styles.header}>
        <p className={styles.stepLabel}>Step 6 of {TOTAL_STEPS}</p>
        <h1 className={styles.title}>A few preferences</h1>
        <p className={styles.subtitle}>Help us find the right crew and events for you.</p>
      </div>

      <div className={styles.rangeGroup}>
        <div className={styles.rangeLabel}>
          <span className={styles.rangeLabelText}>Min age</span>
          <span className={styles.rangeLabelValue}>{state.ageRange.min}</span>
        </div>
        <input
          type="range"
          className={styles.rangeSlider}
          min={18}
          max={65}
          value={state.ageRange.min}
          onChange={(e) => {
            const v = Number(e.target.value)
            setField('ageRange', {
              min: Math.min(v, state.ageRange.max),
              max: state.ageRange.max,
            })
          }}
        />
      </div>

      <div className={styles.rangeGroup}>
        <div className={styles.rangeLabel}>
          <span className={styles.rangeLabelText}>Max age</span>
          <span className={styles.rangeLabelValue}>{state.ageRange.max}</span>
        </div>
        <input
          type="range"
          className={styles.rangeSlider}
          min={18}
          max={65}
          value={state.ageRange.max}
          onChange={(e) => {
            const v = Number(e.target.value)
            setField('ageRange', {
              min: state.ageRange.min,
              max: Math.max(v, state.ageRange.min),
            })
          }}
        />
      </div>

      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Alcohol-friendly events?</span>
        <button
          type="button"
          className={`${styles.toggle} ${state.alcohol ? styles.toggleOn : styles.toggleOff}`}
          onClick={() => setField('alcohol', !state.alcohol)}
        />
      </div>

      <div style={{ marginTop: 'var(--spacing-lg)' }}>
        <p className={styles.rangeLabelText} style={{ marginBottom: 'var(--spacing-sm)' }}>Budget</p>
        <div className={styles.chipGroup}>
          {BUDGET_OPTIONS.map((b) => (
            <button
              key={b.value}
              type="button"
              className={`${styles.chip} ${state.budget === b.value ? styles.chipActive : ''}`}
              onClick={() => setField('budget', b.value)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function StepCalendar() {
  const { user } = useAuth()
  const { connected, loading } = useCalendarStatus(user?.id)

  const handleConnect = () => {
    if (!user?.id) return
    window.location.href = `${API_BASE}/auth/google/calendar?user_id=${user.id}`
  }

  return (
    <>
      <div className={styles.header}>
        <p className={styles.stepLabel}>Step 7 of {TOTAL_STEPS}</p>
        <h1 className={styles.title}>Connect your calendar</h1>
        <p className={styles.subtitle}>
          We'll check when you're free so we can match you with people who share your schedule.
        </p>
      </div>
      <div className={styles.calendarWrap}>
        {loading ? (
          <p className={styles.calendarStatus}>Checking...</p>
        ) : connected ? (
          <div className={styles.calendarConnected}>
            <span className={styles.locationDot} />
            <span>Google Calendar connected</span>
          </div>
        ) : (
          <button
            type="button"
            className={styles.locationBtn}
            onClick={handleConnect}
          >
            Connect Google Calendar
          </button>
        )}
        <p className={styles.calendarNote}>
          This is required to match you with people who share your schedule.
        </p>
      </div>
    </>
  )
}

function StepVibe() {
  const { state, setField } = useOnboarding()
  const words = state.vibe.trim().split(/\s+/).filter(Boolean).length
  const maxWords = 200

  return (
    <>
      <div className={styles.header}>
        <p className={styles.stepLabel}>Step 8 of {TOTAL_STEPS}</p>
        <h1 className={styles.title}>What's your vibe?</h1>
        <p className={styles.subtitle}>
          Tell us about your hobbies, interests, what you do for fun — go wild.
        </p>
      </div>
      <textarea
        className={styles.textarea}
        placeholder="I love weekend hikes, trying every taco spot in town, board game nights, live music, and spontaneous road trips..."
        value={state.vibe}
        onChange={(e) => {
          const w = e.target.value.trim().split(/\s+/).filter(Boolean).length
          if (w <= maxWords) setField('vibe', e.target.value)
        }}
        rows={6}
      />
      <p className={`${styles.charCount} ${words >= maxWords ? styles.charCountOver : ''}`}>
        {words}/{maxWords} words
      </p>
    </>
  )
}

/* ================================================================== */
/*  Main Orchestrator                                                  */
/* ================================================================== */

function OnboardingFlow() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { state, submit, submitting } = useOnboarding()
  const { connected } = useCalendarStatus(user?.id)
  const [step, setStep] = useState(() => {
    if (searchParams.get('calendar') === 'connected') {
      setSearchParams({}, { replace: true })
      return 7
    }
    return 1
  })
  const [error, setError] = useState<string | null>(null)

  const canContinue = (): boolean => {
    switch (step) {
      case 1: return state.name.trim().length > 0
      case 2: return true // avatar is optional
      case 3: return true // bio is optional
      case 4: return state.prompts.every((p) => p.response.trim().length > 0)
      case 5: return state.location.label.trim().length > 0
      case 6: return true // all have defaults
      case 7: return connected // must connect calendar
      case 8: return state.vibe.trim().length > 0
      default: return false
    }
  }

  const handleNext = async () => {
    setError(null)
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      if (!user?.id) return
      const { error: err } = await submit(user.id)
      if (err) {
        setError(err)
        return
      }

      try {
        await fetch(`${API_BASE}/jobs/matchmaker`, { method: 'POST' })
      } catch {
        // matchmaker may be unavailable; proceed anyway
      }

      navigate('/home', { replace: true })
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className={styles.page}>
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.card} key={step}>
        {error && <div className={styles.error}>{error}</div>}

        {step === 1 && <StepName />}
        {step === 2 && <StepAvatar />}
        {step === 3 && <StepBio />}
        {step === 4 && <StepPrompts />}
        {step === 5 && <StepLocation />}
        {step === 6 && <StepPreferences />}
        {step === 7 && <StepCalendar />}
        {step === 8 && <StepVibe />}

        <div className={styles.navRow}>
          {step > 1 && (
            <Button variant="ghost" size="lg" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!canContinue()}
            loading={submitting}
          >
            {step === TOTAL_STEPS ? 'Finish' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Exported Page (wraps flow with provider)                           */
/* ================================================================== */

export function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  )
}

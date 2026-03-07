import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_USER_PREFERENCES } from '@/data/mockData'
import { Button } from '@/components/ui'
import styles from '@/components/dashboard/Dashboard.module.css'

const AGE_GROUPS = ['18-20', '21-25', '26-30', '31+']
const BUDGETS = ['$', '$$', '$$$', '$$$$']
const ACTIVITY_TYPES = [
  'Sports & Outdoors',
  'Food & Drink',
  'Arts & Culture',
  'Nightlife',
  'Gaming',
  'Music',
  'Wellness',
  'Learning',
]
const VIBES = [
  'Chill but spontaneous',
  'High energy',
  'Competitive',
  'Laid back',
  'Adventurous',
  'Social butterfly',
]

export function PreferencesPage() {
  const navigate = useNavigate()

  const [location, setLocation] = useState(MOCK_USER_PREFERENCES.location)
  const [ageGroup, setAgeGroup] = useState(MOCK_USER_PREFERENCES.ageGroup)
  const [alcohol, setAlcohol] = useState(MOCK_USER_PREFERENCES.alcohol)
  const [budget, setBudget] = useState(MOCK_USER_PREFERENCES.budget)
  const [activity, setActivity] = useState(MOCK_USER_PREFERENCES.activityType)
  const [vibe, setVibe] = useState(MOCK_USER_PREFERENCES.vibe)

  const handleSave = () => {
    navigate('/home')
  }

  return (
    <div className={styles.preferencesPage}>
      <div className={styles.topBar}>
        <span className={styles.topBarLogo}>Connect</span>
        <div className={styles.topBarRight}>
          <button
            type="button"
            className={styles.topBarBtn}
            onClick={() => navigate('/home')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className={styles.preferencesContent}>
        <div className={styles.preferencesHeader}>
          <h1>Your Preferences</h1>
          <p>Fine-tune how we match you with groups and events.</p>
        </div>

        <div className={styles.prefCard}>
          <div className={styles.prefGroup}>
            <p className={styles.prefLabel}>📍 Location</p>
            <input
              className={styles.prefValue}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ width: '100%', border: 'none', fontFamily: 'inherit', fontSize: 'inherit' }}
            />
          </div>

          <hr className={styles.divider} />

          <div className={styles.prefGroup}>
            <p className={styles.prefLabel}>🎂 Preferred Age Group</p>
            <div className={styles.prefChips}>
              {AGE_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`${styles.prefChip} ${ageGroup === g ? styles.prefChipActive : ''}`}
                  onClick={() => setAgeGroup(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.prefGroup}>
            <p className={styles.prefLabel}>🍹 Alcohol-friendly events</p>
            <div className={styles.prefToggle}>
              <span style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
                {alcohol ? 'Include alcohol-related events' : 'No alcohol events'}
              </span>
              <button
                type="button"
                className={styles.toggleSwitch}
                data-on={alcohol.toString()}
                onClick={() => setAlcohol(!alcohol)}
              />
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.prefGroup}>
            <p className={styles.prefLabel}>💰 Budget</p>
            <div className={styles.prefChips}>
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`${styles.prefChip} ${budget === b ? styles.prefChipActive : ''}`}
                  onClick={() => setBudget(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.prefGroup}>
            <p className={styles.prefLabel}>🏄 Activity Type</p>
            <div className={styles.prefChips}>
              {ACTIVITY_TYPES.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`${styles.prefChip} ${activity === a ? styles.prefChipActive : ''}`}
                  onClick={() => setActivity(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.prefGroup}>
            <p className={styles.prefLabel}>✨ Vibe</p>
            <div className={styles.prefChips}>
              {VIBES.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`${styles.prefChip} ${vibe === v ? styles.prefChipActive : ''}`}
                  onClick={() => setVibe(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.prefActions}>
            <Button variant="primary" onClick={handleSave}>
              Save Preferences
            </Button>
            <Button variant="ghost" onClick={() => navigate('/home')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

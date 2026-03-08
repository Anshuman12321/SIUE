import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { MOCK_USER_MATCHED, MOCK_GROUP } from '@/data/mockData'
import {
  SegmentedControl,
  NotMatchedView,
  GroupMembersTab,
  EventsTab,
} from '@/components/dashboard'
import type { Segment } from '@/components/dashboard'
import styles from '@/components/dashboard/Dashboard.module.css'

const TABS: Segment[] = [
  { id: 'members', label: 'Group Members', icon: '👥' },
  { id: 'events', label: 'Events', icon: '🎯' },
]

export function HomePage() {
  const { user, signOut } = useAuth()
  const { profile } = useUserProfile(user ?? null)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('members')
  const [calling, setCalling] = useState(false)
  const [callResult, setCallResult] = useState<string | null>(null)

  async function placeCall() {
    setCalling(true)
    setCallResult(null)
    try {
      const res = await fetch('http://localhost:8000/calls/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: '+16362190625' }),
      })
      const data = await res.json()
      const entries = data.structured_data ? Object.values(data.structured_data) as Array<{ name: string; result: string }> : []
      setCallResult(entries.length > 0 ? entries[0].result : 'Call completed, no summary returned.')
    } catch {
      setCallResult('Failed to place call.')
    } finally {
      setCalling(false)
    }
  }
  const [calendarMessage, setCalendarMessage] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('calendar') === 'connected') {
      setCalendarMessage('Google Calendar connected successfully!')
      searchParams.delete('calendar')
      setSearchParams(searchParams, { replace: true })
      const timer = setTimeout(() => setCalendarMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [])

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?'
  const avatarUrl = profile?.avatar_url
  const isMatched = MOCK_USER_MATCHED

  return (
    <div className={styles.dashboard}>
      <div className={styles.topBar}>
        <span className={styles.topBarLogo}>Connect</span>
        <div className={styles.topBarRight}>
          <button
            type="button"
            className={styles.topBarBtn}
            onClick={() => navigate('/preferences')}
          >
            Preferences
          </button>
          <button
            type="button"
            className={styles.topBarBtn}
            onClick={() => signOut()}
          >
            Log out
          </button>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className={styles.topBarAvatarImg} />
          ) : (
            <div className={styles.topBarAvatar}>{initial}</div>
          )}
        </div>
      </div>

      <div className={styles.dashContent}>
        {calendarMessage && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontSize: 'var(--font-size-sm)',
          }}>
            {calendarMessage}
          </div>
        )}
        <div className={styles.dashWelcome}>
          <h1>Hey, {user?.email?.split('@')[0] ?? 'there'} 👋</h1>
          {isMatched ? (
            <p>You're matched with <strong>{MOCK_GROUP.name}</strong>. Explore your group and vote on events!</p>
          ) : (
            <p>Hang tight — we're finding the perfect group for you.</p>
          )}
        </div>

        <div className={styles.tabPanel} style={{ marginBottom: 'var(--spacing-xl)' }}>
          <button
            type="button"
            onClick={placeCall}
            disabled={calling}
            style={{
              padding: '12px 24px',
              background: calling ? '#999' : 'var(--gradient-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: calling ? 'not-allowed' : 'pointer',
            }}
          >
            {calling ? 'Riley is calling...' : 'Place Call with Riley'}
          </button>
          {callResult && (
            <p style={{ marginTop: '12px', color: 'var(--color-muted)', lineHeight: 1.6 }}>
              {callResult}
            </p>
          )}
        </div>

        {!isMatched ? (
          <div className={styles.tabPanel}>
            <NotMatchedView />
          </div>
        ) : (
          <>
            <SegmentedControl
              segments={TABS}
              active={activeTab}
              onChange={setActiveTab}
            />
            <div className={styles.tabPanel}>
              {activeTab === 'members' && <GroupMembersTab />}
              {activeTab === 'events' && <EventsTab />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

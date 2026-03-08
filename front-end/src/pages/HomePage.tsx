import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
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
  const isMatched = !!profile?.group_id
  const groupId = profile?.group_id ?? null

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
            <p>You're matched with <strong>your group</strong>. Explore your group and vote on events!</p>
          ) : (
            <p>Hang tight — we're finding the perfect group for you.</p>
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
              {activeTab === 'members' && <GroupMembersTab groupId={groupId!} />}
              {activeTab === 'events' && <EventsTab groupId={groupId!} currentUserId={user!.id} />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

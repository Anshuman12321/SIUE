import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('members')

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?'
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
          <div className={styles.topBarAvatar}>{initial}</div>
        </div>
      </div>

      <div className={styles.dashContent}>
        <div className={styles.dashWelcome}>
          <h1>Hey, {user?.email?.split('@')[0] ?? 'there'} 👋</h1>
          {isMatched ? (
            <p>You're matched with <strong>{MOCK_GROUP.name}</strong>. Explore your group and vote on events!</p>
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
              {activeTab === 'members' && <GroupMembersTab />}
              {activeTab === 'events' && <EventsTab />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

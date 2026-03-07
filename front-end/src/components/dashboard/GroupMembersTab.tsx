import { useState } from 'react'
import { MOCK_GROUP_MEMBERS, type MockMember } from '@/data/mockData'
import { MemberCard } from './MemberCard'
import { MemberProfileModal } from './MemberProfileModal'
import styles from './Dashboard.module.css'

export function GroupMembersTab() {
  const [selected, setSelected] = useState<MockMember | null>(null)

  return (
    <>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Your Group</h2>
        <span className={styles.memberCount}>{MOCK_GROUP_MEMBERS.length} members</span>
      </div>
      <div className={styles.membersGrid}>
        {MOCK_GROUP_MEMBERS.map((m) => (
          <MemberCard key={m.id} member={m} onClick={setSelected} />
        ))}
      </div>
      {selected && (
        <MemberProfileModal member={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

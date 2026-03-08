import { useState, useMemo } from 'react'
import { useGroupData } from '@/hooks/useGroupData'
import { toDisplayMember } from '@/lib/types'
import type { DisplayMember } from '@/lib/types'
import { MemberCard } from './MemberCard'
import { MemberProfileModal } from './MemberProfileModal'
import styles from './Dashboard.module.css'

interface GroupMembersTabProps {
  groupId: number
}

export function GroupMembersTab({ groupId }: GroupMembersTabProps) {
  const { members, loading, error } = useGroupData(groupId)
  const [selected, setSelected] = useState<DisplayMember | null>(null)

  const displayMembers = useMemo(
    () => members.map(toDisplayMember),
    [members],
  )

  if (loading) {
    return <p style={{ color: 'var(--color-muted)' }}>Loading members...</p>
  }

  if (error) {
    return <p style={{ color: '#ef4444' }}>Failed to load group: {error}</p>
  }

  if (displayMembers.length === 0) {
    return <p style={{ color: 'var(--color-muted)' }}>No members found for group {groupId}.</p>
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Your Group</h2>
        <span className={styles.memberCount}>{displayMembers.length} members</span>
      </div>
      <div className={styles.membersGrid}>
        {displayMembers.map((m) => (
          <MemberCard key={m.id} member={m} onClick={setSelected} />
        ))}
      </div>
      {selected && (
        <MemberProfileModal member={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

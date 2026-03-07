import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Text } from '@/components/ui'
import { Card } from '@/components/ui'
import type { GroupMember } from '@/data/mockData'
import { MemberProfileModal } from './MemberProfileModal'
import styles from './MemberCard.module.css'

export interface MemberCardProps {
  member: GroupMember
}

export function MemberCard({ member }: MemberCardProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Card
        variant="elevated"
        className={cn(styles.card, styles.compact)}
        onClick={() => setShowModal(true)}
        onKeyDown={(e) => e.key === 'Enter' && setShowModal(true)}
        role="button"
        tabIndex={0}
      >
        <div className={styles.avatar}>
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt={member.name} />
          ) : (
            <span className={styles.avatarPlaceholder}>
              {member.name.charAt(0)}
            </span>
          )}
        </div>
        <Text as="p" size="md" weight="medium">
          {member.name}
        </Text>
      </Card>

      {showModal && (
        <MemberProfileModal
          member={member}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

import { useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Text } from '@/components/ui'
import { Button } from '@/components/ui'
import type { GroupMember } from '@/data/mockData'
import styles from './MemberProfileModal.module.css'

export interface MemberProfileModalProps {
  member: GroupMember
  onClose: () => void
}

export function MemberProfileModal({ member, onClose }: MemberProfileModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Profile of ${member.name}`}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.photoSection}>
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt={member.name} className={styles.photo} />
          ) : (
            <div className={styles.photoPlaceholder}>
              <span>{member.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className={styles.content}>
          <Text as="h2" size="xl" weight="bold">
            {member.name}
          </Text>
          {member.age && (
            <Text as="p" size="md" color="muted">
              {member.age} years old
            </Text>
          )}
          {member.bio && (
            <Text as="p" size="md" style={{ marginTop: 'var(--spacing-md)' }}>
              {member.bio}
            </Text>
          )}
          {member.prompts && member.prompts.length > 0 && (
            <div className={styles.prompts}>
              {member.prompts.map((p, i) => (
                <div key={i} className={styles.prompt}>
                  <Text as="p" size="md">
                    {p}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button variant="secondary" onClick={onClose} className={styles.closeBtn}>
          Close
        </Button>
      </div>
    </div>
  )
}

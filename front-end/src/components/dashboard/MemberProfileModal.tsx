import type { DisplayMember } from '@/lib/types'
import styles from './Dashboard.module.css'

interface MemberProfileModalProps {
  member: DisplayMember
  onClose: () => void
}

export function MemberProfileModal({ member, onClose }: MemberProfileModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose}>
          ✕
        </button>

        <div className={styles.profileHeader}>
          <img
            src={member.avatarUrl}
            alt={member.name}
            className={styles.profileAvatar}
          />
          <div className={styles.profileNameRow}>
            <h2 className={styles.profileName}>{member.name}</h2>
            {member.age != null && <span className={styles.profileAge}>{member.age}</span>}
          </div>
          <p className={styles.profileBio}>{member.bio}</p>
        </div>

        <div className={styles.prompts}>
          {member.prompts.map((prompt) => (
            <div key={prompt.label} className={styles.promptCard}>
              <span className={styles.promptLabel}>{prompt.label}</span>
              <span className={styles.promptAnswer}>{prompt.answer}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

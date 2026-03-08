import type { DisplayMember } from '@/lib/types'
import styles from './Dashboard.module.css'

interface MemberCardProps {
  member: DisplayMember
  onClick: (member: DisplayMember) => void
}

export function MemberCard({ member, onClick }: MemberCardProps) {
  return (
    <button
      type="button"
      className={styles.memberCard}
      onClick={() => onClick(member)}
    >
      <div className={styles.memberAvatarWrap}>
        <img
          src={member.avatarUrl}
          alt={member.name}
          className={styles.memberAvatar}
        />
      </div>
      <div className={styles.memberInfo}>
        <span className={styles.memberName}>{member.name}</span>
        {member.age != null && <span className={styles.memberAge}>{member.age}</span>}
      </div>
      <p className={styles.memberBio}>{member.bio}</p>
    </button>
  )
}

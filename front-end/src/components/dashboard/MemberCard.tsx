import type { MockMember } from '@/data/mockData'
import styles from './Dashboard.module.css'

interface MemberCardProps {
  member: MockMember
  onClick: (member: MockMember) => void
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
        <span className={styles.memberAge}>{member.age}</span>
      </div>
      <p className={styles.memberBio}>{member.bio}</p>
    </button>
  )
}

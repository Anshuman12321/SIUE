import { useAuth } from '@/contexts/AuthContext'
import styles from './WaitingRoom.module.css'

export function WaitingRoomPage() {
  const { signOut } = useAuth()

  return (
    <div className={styles.page}>
      <div className={styles.radar}>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
      </div>

      <div className={styles.content}>
        <div className={styles.beacon}>
          <span className={styles.beaconIcon}>📡</span>
        </div>

        <h1 className={styles.title}>We're finding your people</h1>
        <p className={styles.body}>
          A group is actively being curated just for you based on your interests
          and preferences. This takes a little time — please check back later!
        </p>

        <div className={styles.emailNote}>
          ✉️ You'll be notified by email when your group is ready
        </div>

        <div>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => signOut()}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

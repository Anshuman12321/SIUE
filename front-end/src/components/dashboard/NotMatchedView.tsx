import styles from './Dashboard.module.css'

export function NotMatchedView() {
  return (
    <div className={styles.notMatched}>
      <div className={styles.notMatchedGraphic}>
        <div className={styles.pulseRing} />
        <div className={styles.pulseRing} style={{ animationDelay: '0.5s' }} />
        <div className={styles.pulseRing} style={{ animationDelay: '1s' }} />
        <div className={styles.pulseCenter}>
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>
      <h2 className={styles.notMatchedTitle}>Finding your people...</h2>
      <p className={styles.notMatchedBody}>
        We're matching you with a group based on your interests and preferences.
        This usually takes a few minutes!
      </p>
      <div className={styles.statusPills}>
        <span className={styles.statusPill}>
          <span className={styles.statusDot} />
          Analyzing preferences
        </span>
        <span className={styles.statusPill}>
          <span className={styles.statusDot} style={{ animationDelay: '0.3s' }} />
          Scanning nearby groups
        </span>
        <span className={styles.statusPill}>
          <span className={styles.statusDot} style={{ animationDelay: '0.6s' }} />
          Building your match
        </span>
      </div>
    </div>
  )
}

import { cn } from '@/lib/cn'
import styles from './Dashboard.module.css'

export interface Segment {
  id: string
  label: string
  icon?: string
}

export interface SegmentedControlProps {
  segments: Segment[]
  active: string
  onChange: (id: string) => void
}

export function SegmentedControl({ segments, active, onChange }: SegmentedControlProps) {
  return (
    <div className={styles.segmentedControl}>
      {segments.map((s) => (
        <button
          key={s.id}
          type="button"
          className={cn(styles.segment, active === s.id && styles.segmentActive)}
          onClick={() => onChange(s.id)}
        >
          {s.icon && <span className={styles.segmentIcon}>{s.icon}</span>}
          {s.label}
        </button>
      ))}
    </div>
  )
}

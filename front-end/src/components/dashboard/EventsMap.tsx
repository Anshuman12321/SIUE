import { useEffect, useRef } from 'react'
import type { MockEvent } from '@/data/mockData'
import styles from './Dashboard.module.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

interface EventsMapProps {
  events: MockEvent[]
}

export function EventsMap({ events }: EventsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || mapRef.current) return

    let cancelled = false

    ;(async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default
        if (cancelled) return

        mapboxgl.accessToken = MAPBOX_TOKEN
        const center = events[0]
          ? { lng: events[0].lng, lat: events[0].lat }
          : { lng: -90.2, lat: 38.6 }

        const map = new mapboxgl.Map({
          container: containerRef.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [center.lng, center.lat],
          zoom: 11,
        })

        events.forEach((event) => {
          const el = document.createElement('div')
          el.className = styles.marker ?? ''
          el.textContent = event.name
          new mapboxgl.Marker({ element: el })
            .setLngLat([event.lng, event.lat])
            .addTo(map)
        })

        mapRef.current = map
      } catch {
        // mapbox-gl not available or token missing
      }
    })()

    return () => { cancelled = true }
  }, [events])

  if (!MAPBOX_TOKEN) {
    return (
      <div className={styles.mapPlaceholder}>
        <span className={styles.mapPlaceholderIcon}>🗺️</span>
        <p>Add <code>VITE_MAPBOX_TOKEN</code> to your <code>.env</code> to enable the map view.</p>
        <div className={styles.eventPins}>
          {events.map((e) => (
            <div key={e.id} className={styles.eventPin}>
              <span>📍</span>
              <span>{e.name} — {e.address}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className={styles.mapContainer} />
}

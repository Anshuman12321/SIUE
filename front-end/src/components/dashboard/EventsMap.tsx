import { useRef, useEffect, useState } from 'react'
import type { Event } from '@/data/mockData'
import styles from './EventsMap.module.css'

export interface EventsMapProps {
  events: Event[]
  selectedEventId?: string | null
  onSelectEvent?: (id: string) => void
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export function EventsMap({
  events,
  selectedEventId = null,
  onSelectEvent,
}: EventsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || events.length === 0) {
      if (!MAPBOX_TOKEN) {
        setMapError('Add VITE_MAPBOX_TOKEN to .env for map view')
      }
      return
    }

    const loadMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default

        mapboxgl.accessToken = MAPBOX_TOKEN

        const center = events[0]
          ? { lng: events[0].lng, lat: events[0].lat }
          : { lng: -90.2, lat: 38.6 }

        const map = new mapboxgl.Map({
          container: containerRef.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [center.lng, center.lat],
          zoom: 10,
        })

        events.forEach((event) => {
          const el = document.createElement('div')
          el.className = styles.marker
          el.innerHTML = `<span>${event.name}</span>`
          el.addEventListener('click', () => onSelectEvent?.(event.id))

          new mapboxgl.Marker(el)
            .setLngLat([event.lng, event.lat])
            .addTo(map)
        })

        return () => map.remove()
      } catch (err) {
        setMapError('Failed to load map')
      }
    }

    loadMap()
  }, [events, onSelectEvent])

  return (
    <div className={styles.mapContainer}>
      {mapError || !MAPBOX_TOKEN ? (
        <div className={styles.placeholder}>
          <p>{mapError ?? 'Add VITE_MAPBOX_TOKEN to .env for map view'}</p>
          <p className={styles.hint}>
            Events: {events.map((e) => e.name).join(', ')}
          </p>
        </div>
      ) : (
        <div ref={containerRef} className={styles.map} />
      )}
    </div>
  )
}

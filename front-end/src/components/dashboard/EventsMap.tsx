import { useEffect, useRef, useState } from 'react'
import type { MockEvent } from '@/data/mockData'
import styles from './Dashboard.module.css'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

interface EventsMapProps {
  events: MockEvent[]
  highlight?: string | null
  fullScreen?: boolean
  onSelect?: (id: string) => void
}

export function EventsMap({ events, highlight, fullScreen, onSelect }: EventsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const [mapReady, setMapReady] = useState(false)

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
          zoom: fullScreen ? 12 : 11,
        })

        map.on('load', () => {
          if (!cancelled) {
            mapRef.current = map
            setMapReady(true)
          }
        })
      } catch {
        // mapbox-gl not available or token missing
      }
    })()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current

    ;(async () => {
      const mapboxgl = (await import('mapbox-gl')).default

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }

      events.forEach((event) => {
        const el = document.createElement('div')
        const isHighlighted = highlight === event.id
        el.className = isHighlighted
          ? (styles.markerHighlight ?? '')
          : (styles.marker ?? '')
        el.textContent = event.name

        el.addEventListener('click', () => {
          onSelect?.(event.id)

          if (popupRef.current) {
            popupRef.current.remove()
            popupRef.current = null
          }

          const voteText =
            event.voters.length === 0
              ? 'No votes yet'
              : `${event.voters.length} vote${event.voters.length !== 1 ? 's' : ''}`

          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            maxWidth: '280px',
            className: 'mapPopupContainer',
          })
            .setLngLat([event.lng, event.lat])
            .setHTML(
              `<div class="mapPopup">
                <h4 class="mapPopupName">${event.name}</h4>
                <p class="mapPopupVenue">${event.venue}</p>
                <p class="mapPopupTime">${event.dateTime}</p>
                <p class="mapPopupDesc">${event.description}</p>
                <span class="mapPopupVotes">${voteText}</span>
              </div>`,
            )
            .addTo(map)

          popupRef.current = popup
        })

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([event.lng, event.lat])
          .addTo(map)
        markersRef.current.push(marker)
      })
    })()
  }, [mapReady, events, highlight, onSelect])

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

  const containerClass = fullScreen
    ? `${styles.mapContainer} ${styles.mapFullScreen}`
    : styles.mapContainer

  return <div ref={containerRef} className={containerClass} />
}

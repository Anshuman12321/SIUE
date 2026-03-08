import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function useCalendarStatus(userId: string | undefined) {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetch(`${API_BASE}/users/${userId}/calendar-status`)
      .then((res) => res.json())
      .then((data) => setConnected(data.connected))
      .catch(() => setConnected(false))
      .finally(() => setLoading(false))
  }, [userId])

  return { connected, loading }
}

import { useState } from 'react'

const API_URL = 'http://localhost:8000/calls/place'

interface RileyCallButtonProps {
  phoneNumber?: string
}

export function RileyCallButton({ phoneNumber = '+16362190625' }: RileyCallButtonProps) {
  const [calling, setCalling] = useState(false)
  const [callResult, setCallResult] = useState<string | null>(null)

  async function placeCall() {
    setCalling(true)
    setCallResult(null)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber }),
      })
      const data = await res.json()
      const entries = data.structured_data
        ? (Object.values(data.structured_data) as Array<{ name: string; result: string }>)
        : []
      setCallResult(
        entries.length > 0 ? entries[0].result : 'Call completed, no summary returned.',
      )
    } catch {
      setCallResult('Failed to place call.')
    } finally {
      setCalling(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={placeCall}
        disabled={calling}
        style={{
          padding: '12px 24px',
          background: calling ? '#999' : 'var(--gradient-primary, #4f46e5)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: calling ? 'not-allowed' : 'pointer',
        }}
      >
        {calling ? 'Riley is calling...' : 'Place Call with Riley'}
      </button>
      {callResult && (
        <p style={{ marginTop: '12px', color: 'var(--color-muted, #666)', lineHeight: 1.6 }}>
          {callResult}
        </p>
      )}
    </div>
  )
}

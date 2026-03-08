import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface EventPayload {
  id: number
  event_name: string | null
  location_name: string | null
  address: string | null
  date_time: string | null
  description: string | null
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { group_id, event } = (await req.json()) as {
      group_id: number
      event: EventPayload
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: group } = await supabase
      .from('groups')
      .select('members')
      .eq('id', group_id)
      .single()

    if (!group?.members?.length) {
      return Response.json({ error: 'No members found' }, { status: 404 })
    }

    const emails: string[] = []
    for (const userId of group.members) {
      const { data } = await supabase.auth.admin.getUserById(userId)
      if (data?.user?.email) {
        emails.push(data.user.email)
      }
    }

    if (emails.length === 0) {
      return Response.json({ error: 'No email addresses found' }, { status: 404 })
    }

    const eventName = event.event_name ?? 'your event'
    const venue = event.location_name ?? ''
    const address = event.address ?? ''
    const dateTime = event.date_time
      ? new Date(event.date_time).toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : ''

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #092c45; font-size: 24px;">🎉 Your Event is Confirmed!</h1>
        <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
          Your group has voted and the event has been finalized. A reservation has been made automatically.
        </p>
        <div style="background: #f3f0ff; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h2 style="color: #8652ff; font-size: 20px; margin: 0 0 8px;">${eventName}</h2>
          ${venue ? `<p style="color: #092c45; margin: 4px 0;"><strong>Venue:</strong> ${venue}</p>` : ''}
          ${dateTime ? `<p style="color: #092c45; margin: 4px 0;"><strong>When:</strong> ${dateTime}</p>` : ''}
          ${address ? `<p style="color: #092c45; margin: 4px 0;"><strong>Where:</strong> ${address}</p>` : ''}
        </div>
        <p style="color: #6b7280; font-size: 14px;">See you there!</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Connect <onboarding@resend.dev>',
        to: emails,
        subject: `🎉 Event Confirmed: ${eventName}`,
        html: htmlBody,
      }),
    })

    const result = await res.json()

    return Response.json({ success: true, result })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }
})

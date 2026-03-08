export interface DbUser {
  id: string
  name: string | null
  age: number | null
  bio: string | null
  prompts: { prompt: string; response: string }[] | null
  avatar_url: string | null
  interests: Record<string, unknown> | null
  group_id: number | null
}

export interface DbGroup {
  id: number
  members: string[]
  vibe_score: number | null
  voting_ends_at: string | null
  final_event_id: number | null
}

export interface DbEvent {
  id: number
  event_name: string | null
  location_name: string | null
  address: string | null
  date_time: string | null
  description: string | null
  group_id: number | null
  lat: number | null
  lng: number | null
}

export interface DbVote {
  id: number
  user_id: string
  event_id: number
  created_at: string
}

export interface DisplayMember {
  id: string
  name: string
  age: number | null
  avatarUrl: string
  bio: string
  prompts: { label: string; answer: string }[]
}

export interface DisplayEvent {
  id: string
  name: string
  venue: string
  address: string
  lat: number
  lng: number
  dateTime: string
  description: string
  voters: EventVoter[]
  dbId: number
}

export interface EventVoter {
  id: string
  avatarUrl: string
}

export function toDisplayMember(u: DbUser): DisplayMember {
  return {
    id: u.id,
    name: u.name ?? 'Unknown',
    age: u.age,
    avatarUrl: u.avatar_url ?? '',
    bio: u.bio ?? '',
    prompts: (u.prompts ?? []).map((p) => ({
      label: p.prompt,
      answer: p.response,
    })),
  }
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function toDisplayEvent(
  e: DbEvent,
  voters: EventVoter[],
): DisplayEvent {
  return {
    id: String(e.id),
    name: e.event_name ?? 'Untitled Event',
    venue: e.location_name ?? '',
    address: e.address ?? '',
    lat: e.lat ?? 0,
    lng: e.lng ?? 0,
    dateTime: formatDateTime(e.date_time),
    description: e.description ?? '',
    voters,
    dbId: e.id,
  }
}

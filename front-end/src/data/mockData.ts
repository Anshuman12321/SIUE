/**
 * Hardcoded mock data for groups, events, and members.
 * Toggle MOCK_USER_MATCHED for dev. Replace with Supabase calls later.
 */

export const MOCK_USER_MATCHED = true

export interface GroupMember {
  id: string
  name: string
  avatarUrl: string
  bio: string
  prompts: string[]
  age?: number
}

export interface Event {
  id: string
  name: string
  venue: string
  address: string
  lat: number
  lng: number
  dateTime: string
  description: string
  votes: number
}

export interface Group {
  id: string
  name: string
  eventFinalized: boolean
  finalEventId: string | null
  votingEndsAt: string
}

export const MOCK_GROUP: Group = {
  id: 'group-1',
  name: 'Weekend Crew',
  eventFinalized: false,
  finalEventId: null,
  votingEndsAt: '2025-03-15T18:00:00Z',
}

export const MOCK_GROUP_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'Alex',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'Love trying new restaurants and weekend adventures.',
    prompts: ['Looking for... good vibes only', 'Best at... finding hidden gems'],
    age: 26,
  },
  {
    id: '2',
    name: 'Jordan',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    bio: 'Sports fan and outdoor enthusiast.',
    prompts: ['Looking for... active hangouts', 'Best at... planning game days'],
    age: 28,
  },
  {
    id: '3',
    name: 'Sam',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    bio: 'Music lover, always down for live shows.',
    prompts: ['Looking for... concert buddies', 'Best at... finding local gigs'],
    age: 24,
  },
  {
    id: '4',
    name: 'Riley',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley',
    bio: 'Foodie who loves exploring new cuisines.',
    prompts: ['Looking for... dinner crew', 'Best at... picking the best spots'],
    age: 27,
  },
]

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    name: 'Top Golf',
    venue: 'Topgolf St. Louis',
    address: '16851 N Outer Rd, Chesterfield, MO',
    lat: 38.6606,
    lng: -90.5621,
    dateTime: '2025-03-16T14:00:00',
    description: 'Hit some balls and grab drinks. All skill levels welcome!',
    votes: 3,
  },
  {
    id: 'e2',
    name: 'Drinks at Molly\'s',
    venue: 'Molly\'s in Soulard',
    address: '816 Geyer Ave, St. Louis, MO',
    lat: 38.5995,
    lng: -90.2097,
    dateTime: '2025-03-15T19:00:00',
    description: 'Casual drinks and bar games.',
    votes: 2,
  },
  {
    id: 'e3',
    name: 'Forest Park Picnic',
    venue: 'Forest Park',
    address: '5595 Grand Dr, St. Louis, MO',
    lat: 38.6386,
    lng: -90.2847,
    dateTime: '2025-03-17T12:00:00',
    description: 'Outdoor picnic and frisbee. BYO snacks!',
    votes: 1,
  },
]

export const MOCK_FINAL_EVENT: Event = {
  id: 'e1',
  name: 'Top Golf',
  venue: 'Topgolf St. Louis',
  address: '16851 N Outer Rd, Chesterfield, MO',
  lat: 38.6606,
  lng: -90.5621,
  dateTime: '2025-03-16T14:00:00',
  description: 'Hit some balls and grab drinks. All skill levels welcome!',
  votes: 4,
}

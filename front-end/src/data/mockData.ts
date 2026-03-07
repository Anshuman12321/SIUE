export const MOCK_USER_MATCHED = true

export const MOCK_GROUP = {
  id: 'group-1',
  name: 'Weekend Crew',
  eventFinalized: false,
  finalEventId: null as string | null,
  votingEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
}

export interface MockMember {
  id: string
  name: string
  age: number
  avatarUrl: string
  bio: string
  prompts: { label: string; answer: string }[]
}

export const MOCK_GROUP_MEMBERS: MockMember[] = [
  {
    id: 'm1',
    name: 'Alex Rivera',
    age: 25,
    avatarUrl: 'https://i.pravatar.cc/400?img=12',
    bio: 'Outdoor enthusiast and coffee snob. Always down for a spontaneous road trip.',
    prompts: [
      { label: 'Best weekend activity', answer: 'Hiking then brunch' },
      { label: 'Go-to karaoke song', answer: 'Mr. Brightside' },
    ],
  },
  {
    id: 'm2',
    name: 'Jordan Chen',
    age: 23,
    avatarUrl: 'https://i.pravatar.cc/400?img=33',
    bio: 'Film nerd and amateur chef. I make a mean carbonara.',
    prompts: [
      { label: 'Ideal night out', answer: 'Live music + late-night tacos' },
      { label: 'Hidden talent', answer: 'I can solve a Rubik\'s cube in under 2 min' },
    ],
  },
  {
    id: 'm3',
    name: 'Sam Patel',
    age: 27,
    avatarUrl: 'https://i.pravatar.cc/400?img=48',
    bio: 'Basketball junkie and board game strategist. Competitive but friendly.',
    prompts: [
      { label: 'Looking for', answer: 'People who are down to try new things' },
      { label: 'Unpopular opinion', answer: 'Pineapple absolutely belongs on pizza' },
    ],
  },
  {
    id: 'm4',
    name: 'Taylor Kim',
    age: 24,
    avatarUrl: 'https://i.pravatar.cc/400?img=5',
    bio: 'Yoga in the morning, concerts at night. Balance is everything.',
    prompts: [
      { label: 'Vibe check', answer: 'Chill but spontaneous' },
      { label: 'Best at', answer: 'Finding the best happy hour deals in town' },
    ],
  },
]

export interface MockEvent {
  id: string
  name: string
  venue: string
  address: string
  lat: number
  lng: number
  dateTime: string
  description: string
  votes: number
  userVoted: boolean
}

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: 'e1',
    name: 'Top Golf',
    venue: 'Topgolf Chesterfield',
    address: '16851 N Outer 40 Rd, Chesterfield, MO',
    lat: 38.6631,
    lng: -90.5771,
    dateTime: 'Sat, Mar 15 at 2:00 PM',
    description: 'Driving range with a social twist. Food, drinks, and friendly competition.',
    votes: 3,
    userVoted: true,
  },
  {
    id: 'e2',
    name: 'Drinks at Molly\'s',
    venue: 'Molly\'s in Soulard',
    address: '816 Geyer Ave, St. Louis, MO',
    lat: 38.6084,
    lng: -90.2073,
    dateTime: 'Sat, Mar 15 at 8:00 PM',
    description: 'Classic neighborhood bar with great cocktails and live music on weekends.',
    votes: 2,
    userVoted: false,
  },
  {
    id: 'e3',
    name: 'Forest Park Hike',
    venue: 'Forest Park',
    address: '5595 Grand Dr, St. Louis, MO',
    lat: 38.6340,
    lng: -90.2843,
    dateTime: 'Sun, Mar 16 at 10:00 AM',
    description: 'Casual morning hike through one of the largest urban parks in the US.',
    votes: 1,
    userVoted: false,
  },
]

export const MOCK_FINAL_EVENT: MockEvent = {
  id: 'e1',
  name: 'Top Golf',
  venue: 'Topgolf Chesterfield',
  address: '16851 N Outer 40 Rd, Chesterfield, MO',
  lat: 38.6631,
  lng: -90.5771,
  dateTime: 'Sat, Mar 15 at 2:00 PM',
  description: 'Driving range with a social twist. Food, drinks, and friendly competition.',
  votes: 3,
  userVoted: true,
}

export const MOCK_USER_PREFERENCES = {
  location: 'St. Louis, MO',
  ageGroup: '21-30',
  alcohol: true,
  budget: '$$',
  activityType: 'Sports & Outdoors',
  vibe: 'Chill but spontaneous',
}

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PromptPair {
  prompt: string
  response: string
}

export interface LocationData {
  lat: number
  lng: number
  label: string
}

export interface InterestsData {
  location: LocationData
  age_range: { min: number; max: number }
  alcohol: boolean
  budget: 'low' | 'medium' | 'high'
  vibe: string
}

export interface OnboardingState {
  name: string
  avatarFile: File | null
  avatarPreview: string | null
  bio: string
  prompts: [PromptPair, PromptPair]
  location: LocationData
  ageRange: { min: number; max: number }
  alcohol: boolean
  budget: 'low' | 'medium' | 'high'
  vibe: string
}

interface OnboardingContextValue {
  state: OnboardingState
  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void
  submit: (userId: string) => Promise<{ error: string | null }>
  submitting: boolean
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_PROMPTS: [PromptPair, PromptPair] = [
  { prompt: 'A perfect weekend looks like…', response: '' },
  { prompt: 'You should know about me that…', response: '' },
]

const DEFAULT_LAT = 38.631079304478895
const DEFAULT_LNG = -90.1932472121037

const INITIAL_STATE: OnboardingState = {
  name: '',
  avatarFile: null,
  avatarPreview: null,
  bio: '',
  prompts: DEFAULT_PROMPTS,
  location: { lat: DEFAULT_LAT, lng: DEFAULT_LNG, label: '' },
  ageRange: { min: 18, max: 30 },
  alcohol: true,
  budget: 'medium',
  vibe: '',
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)

  const setField = useCallback(<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }, [])

  const submit = useCallback(async (userId: string): Promise<{ error: string | null }> => {
    setSubmitting(true)

    try {
      let avatarUrl: string | null = null

      if (state.avatarFile) {
        const ext = state.avatarFile.name.split('.').pop() ?? 'png'
        const path = `${userId}/avatar.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, state.avatarFile, { upsert: true })

        if (uploadErr) {
          setSubmitting(false)
          return { error: `Avatar upload failed: ${uploadErr.message}` }
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(path)

        avatarUrl = urlData.publicUrl
      }

      const location: LocationData =
        state.location.lat === 0 && state.location.lng === 0
          ? { lat: DEFAULT_LAT, lng: DEFAULT_LNG, label: state.location.label }
          : state.location

      const interests: InterestsData = {
        location,
        age_range: state.ageRange,
        alcohol: state.alcohol,
        budget: state.budget,
        vibe: state.vibe,
      }

      const updatePayload: Record<string, unknown> = {
        name: state.name,
        bio: state.bio,
        prompts: state.prompts,
        interests,
      }

      if (avatarUrl) {
        updatePayload.avatar_url = avatarUrl
      }

      const payload = { id: userId, ...updatePayload }
      console.log('[OnboardingContext] upsert payload:', JSON.stringify(payload, null, 2))

      const { data: upsertData, error: updateErr } = await supabase
        .from('users')
        .upsert(payload)
        .select()

      console.log('[OnboardingContext] upsert result:', { data: upsertData, error: updateErr })

      setSubmitting(false)

      if (updateErr) {
        return { error: updateErr.message }
      }

      return { error: null }
    } catch (err) {
      setSubmitting(false)
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }, [state])

  return (
    <OnboardingContext.Provider value={{ state, setField, submit, submitting }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}

export const PROMPT_OPTIONS = [
  'A perfect weekend looks like…',
  'You should know about me that…',
  'My go-to karaoke song is…',
  'I\'m weirdly competitive about…',
  'The way to my heart is…',
  'My most controversial opinion is…',
  'I geek out about…',
  'My ideal Friday night…',
  'Two truths and a lie…',
  'I\'ll pick the restaurant if you…',
]

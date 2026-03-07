import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthForm, AuthFormField } from '@/components/auth'
import { Button, Alert } from '@/components/ui'
import { PageLayout, Stack } from '@/components/layout'
import { isOnboardingComplete } from '@/hooks/useUserProfile'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setLoading(false)
      setError(signInError.message)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('interests')
        .eq('id', data.user.id)
        .single()

      const completed = isOnboardingComplete(profile?.interests)
      navigate(completed ? '/home' : '/onboarding', { replace: true })
    } else {
      navigate('/home', { replace: true })
    }

    setLoading(false)
  }

  return (
    <PageLayout maxWidth="sm" centered>
      <AuthForm
        title="Welcome back"
        subtitle="Sign in to your account"
        footerLink={{
          prompt: "Don't have an account?",
          linkText: 'Sign up',
          to: '/signup',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            {error && (
              <Alert variant="error">{error}</Alert>
            )}
            <AuthFormField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <AuthFormField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Log in
            </Button>
          </Stack>
        </form>
      </AuthForm>
    </PageLayout>
  )
}

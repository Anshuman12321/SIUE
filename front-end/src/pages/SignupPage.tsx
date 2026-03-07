import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthForm, AuthFormField } from '@/components/auth'
import { Button, Alert } from '@/components/ui'
import { PageLayout, Stack } from '@/components/layout'

export function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    navigate('/onboarding', { replace: true })
  }

  return (
    <PageLayout maxWidth="sm" centered>
      <AuthForm
        title="Create an account"
        subtitle="Get started in seconds"
        footerLink={{
          prompt: 'Already have an account?',
          linkText: 'Log in',
          to: '/login',
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
              autoComplete="new-password"
              minLength={6}
            />
            <AuthFormField
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
            />
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign up
            </Button>
          </Stack>
        </form>
      </AuthForm>
    </PageLayout>
  )
}

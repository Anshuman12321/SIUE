import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute, OnboardingGuard } from '@/components/auth'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { HomePage } from '@/pages/HomePage'
import { PreferencesPage } from '@/pages/PreferencesPage'
import { WaitingRoomPage } from '@/pages/WaitingRoomPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <HomePage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <PreferencesPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiting"
            element={
              <ProtectedRoute>
                <WaitingRoomPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

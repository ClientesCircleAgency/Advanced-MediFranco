import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Auth pages
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'

// Public pages (to be created in Phase 1D)
// import Home from '@/pages/Home'
// import Catalog from '@/pages/Catalog'
// import CourseDetail from '@/pages/CourseDetail'

// Protected pages (to be created in Phase 1D)
// import Dashboard from '@/pages/Dashboard'
// import Player from '@/pages/Player'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Temporary: redirect root to login until we build the home page */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected routes (placeholder for Phase 1D) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
                      <p className="text-muted-foreground">Coming in Phase 1D</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

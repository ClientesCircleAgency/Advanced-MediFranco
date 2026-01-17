import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute'

// Auth pages
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'

// Public pages
import Home from '@/pages/Home'
import Catalog from '@/pages/Catalog'
import CourseDetail from '@/pages/CourseDetail'

// Protected pages
import Dashboard from '@/pages/Dashboard'
import Player from '@/pages/Player'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminCourses from '@/pages/admin/AdminCourses'
import AdminCourseEdit from '@/pages/admin/AdminCourseEdit'
import AdminModules from '@/pages/admin/AdminModules'
import AdminModuleEdit from '@/pages/admin/AdminModuleEdit'
import AdminLessons from '@/pages/admin/AdminLessons'
import AdminLessonEdit from '@/pages/admin/AdminLessonEdit'
import AdminEnrollments from '@/pages/admin/AdminEnrollments'
import AdminSales from '@/pages/admin/AdminSales'

// Admin Layout
import { AdminLayout } from '@/components/layout/AdminLayout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes (Student Area) */}
            <Route
              path="/cursos"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Redirect /dashboard to /cursos for compatibility */}
            <Route path="/dashboard" element={<Navigate to="/cursos" replace />} />

            <Route
              path="/courses/:slug/player"
              element={
                <ProtectedRoute>
                  <Player />
                </ProtectedRoute>
              }
            />

            {/* Admin routes (nested under AdminLayout) */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/:id" element={<AdminCourseEdit />} />
              <Route path="courses/:courseId/modules" element={<AdminModules />} />
              <Route path="courses/:courseId/modules/:moduleId" element={<AdminModuleEdit />} />
              <Route path="modules/:moduleId/lessons" element={<AdminLessons />} />
              <Route path="modules/:moduleId/lessons/:lessonId" element={<AdminLessonEdit />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="sales" element={<AdminSales />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

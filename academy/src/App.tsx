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
import AdminCourses from '@/pages/admin/AdminCourses'
import AdminCourseEdit from '@/pages/admin/AdminCourseEdit'
import AdminModules from '@/pages/admin/AdminModules'
import AdminModuleEdit from '@/pages/admin/AdminModuleEdit'
import AdminLessons from '@/pages/admin/AdminLessons'
import AdminLessonEdit from '@/pages/admin/AdminLessonEdit'
import AdminEnrollments from '@/pages/admin/AdminEnrollments'
import AdminSales from '@/pages/admin/AdminSales'
import AdminDashboard from '@/pages/admin/AdminDashboard'

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

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:slug/player"
              element={
                <ProtectedRoute>
                  <Player />
                </ProtectedRoute>
              }
            />

            {/* Admin routes (protected) */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedAdminRoute>
                  <AdminCourses />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/courses/:id"
              element={
                <ProtectedAdminRoute>
                  <AdminCourseEdit />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/courses/:courseId/modules"
              element={
                <ProtectedAdminRoute>
                  <AdminModules />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/courses/:courseId/modules/:moduleId"
              element={
                <ProtectedAdminRoute>
                  <AdminModuleEdit />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/modules/:moduleId/lessons"
              element={
                <ProtectedAdminRoute>
                  <AdminLessons />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/modules/:moduleId/lessons/:lessonId"
              element={
                <ProtectedAdminRoute>
                  <AdminLessonEdit />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/courses/:courseId/enrollments"
              element={
                <ProtectedAdminRoute>
                  <AdminEnrollments />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/sales"
              element={
                <ProtectedAdminRoute>
                  <AdminSales />
                </ProtectedAdminRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

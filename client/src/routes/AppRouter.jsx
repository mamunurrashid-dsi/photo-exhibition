import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

// Public pages
import Home from '../pages/public/Home'
import ExhibitionsPage from '../pages/public/ExhibitionsPage'
import ExhibitionDetailPage from '../pages/public/ExhibitionDetailPage'
import PrivateExhibitionPage from '../pages/public/PrivateExhibitionPage'
import NotFound from '../pages/public/NotFound'

// Auth pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

// Lazy-loaded pages
const OrganizerDashboard = lazy(() => import('../pages/organizer/OrganizerDashboard'))
const CreateExhibitionPage = lazy(() => import('../pages/organizer/CreateExhibitionPage'))
const EditExhibitionPage = lazy(() => import('../pages/organizer/EditExhibitionPage'))
const ManageSubmissionsPage = lazy(() => import('../pages/organizer/ManageSubmissionsPage'))
const SubmissionFormPage = lazy(() => import('../pages/organizer/SubmissionFormPage'))

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'))
const AdminExhibitionsPage = lazy(() => import('../pages/admin/AdminExhibitionsPage'))
const AdminModerationPage = lazy(() => import('../pages/admin/AdminModerationPage'))

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
)

export default function AppRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/exhibitions" element={<ExhibitionsPage />} />
            <Route path="/exhibitions/:id" element={<ExhibitionDetailPage />} />
            <Route path="/e/:token" element={<PrivateExhibitionPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Submission (public — no login needed) */}
            <Route
              path="/exhibitions/:id/submit"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <SubmissionFormPage />
                </Suspense>
              }
            />

            {/* Organizer (protected) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/exhibitions/new"
              element={
                <ProtectedRoute>
                  <CreateExhibitionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/exhibitions/:id/edit"
              element={
                <ProtectedRoute>
                  <EditExhibitionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/exhibitions/:id/submissions"
              element={
                <ProtectedRoute>
                  <ManageSubmissionsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin (admin role only) */}
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminUsersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/exhibitions"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminExhibitionsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/moderation"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminModerationPage />
                </RoleRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}

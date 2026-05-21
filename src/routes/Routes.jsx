import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import App from "../App";

import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPasswordOTP from "../pages/ResetPasswordOTP";
import NewPasswordForm from "../pages/NewPasswordForm";
import VerifyEmail from "../pages/VerifyEmail";
import VerifyEmailOTP from "../pages/VerifyEmailOTP";
import EmailVerified from "../pages/EmailVerified";
// import Welcome from "../pages/Welcome";

import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Competitions from "../pages/Competitions";
import Gallery from "../pages/Gallery";
import CreationsLocker from "../pages/CreationsLocker";
import Support from "../pages/Support";
import TutorialsManagement from "../pages/TutorialsManagement";
import QuotationBuilder from "../pages/QuotationBuilder";
import QuoteThankYou from "../pages/QuoteThankYou";
import QuoteHistory from "../pages/QuoteHistory";

import AdminDashboard from "../pages/AdminDashboard";
import UserManagement from "../pages/UserManagement";
import AdminCompetitions from "../pages/AdminCompetitions";
import AdminTutorials from "../pages/AdminTutorials";
import AdminGallery from "../pages/AdminGallery";
import AdminCreationsLocker from "../pages/AdminCreationsLocker";
import AdminSupport from "../pages/AdminSupport";
import AdminQuotationManager from "../components/quotation/AdminQuotationManager";

import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFound from "../pages/NotFound";
import Error from "../pages/Error";

import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },

      { path: "auth/login", element: <LoginPage /> },
      { path: "auth/register", element: <SignupPage /> },

      { path: "login", element: <Navigate to="/auth/login" replace /> },
      { path: "signup", element: <Navigate to="/auth/register" replace /> },
      { path: "profile", element: <Navigate to="/user/profile" replace /> },

      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password-otp", element: <ResetPasswordOTP /> },
      { path: "new-password", element: <NewPasswordForm /> },
      { path: "reset-password", element: <Navigate to="/new-password" replace /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "verify-email-otp", element: <VerifyEmailOTP /> },
      { path: "email-verified", element: <EmailVerified /> },
      // {
      //   path: "upgrade",
      //   element: (
      //     <ProtectedRoute>
      //       <Welcome isAuthenticated />
      //     </ProtectedRoute>
      //   ),
      // },

      { path: "user/tutorials", element: <Navigate to="/user/tutorials-management" replace /> },
      { path: "user/creations", element: <Navigate to="/user/creations-locker" replace /> },
      { path: "user/community", element: <Navigate to="/user/support" replace /> },
      { path: "user/quote-builder", element: <Navigate to="/user/quote/builder" replace /> },
      { path: "user/quote-history", element: <Navigate to="/user/quote/history" replace /> },
      { path: "admin/quote-builder", element: <Navigate to="/admin/quote/builder" replace /> },
      { path: "admin/challenges", element: <Navigate to="/admin/competitions" replace /> },
      { path: "admin/settings", element: <Navigate to="/admin/support" replace /> },
      { path: "admin/analytics", element: <Navigate to="/admin/dashboard" replace /> },
      { path: "admin/users/:id", element: <Navigate to="/admin/users" replace /> },

      {
        path: "user/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/competitions",
        element: (
          <ProtectedRoute>
            <Competitions />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/gallery",
        element: (
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/creations-locker",
        element: (
          <ProtectedRoute>
            <CreationsLocker />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/support",
        element: (
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/tutorials-management",
        element: (
          <ProtectedRoute>
            <TutorialsManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/quote/builder",
        element: (
          <ProtectedRoute>
            <QuotationBuilder />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/quote/history",
        element: (
          <ProtectedRoute>
            <QuoteHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/quote/builder",
        element: (
          <RoleProtectedRoute roles={["Admin"]}>
            <AdminQuotationManager />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "quote/thank-you",
        element: (
          <ProtectedRoute>
            <QuoteThankYou />
          </ProtectedRoute>
        ),
      },

      {
        path: "admin/dashboard",
        element: (
          <RoleProtectedRoute roles={["Admin"]}>
            <AdminDashboard />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <RoleProtectedRoute roles={["Admin"]}>
            <UserManagement />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/competitions",
        element: (
          <RoleProtectedRoute roles={["Admin"]}>
            <AdminCompetitions />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/tutorials",
        element: (
          <RoleProtectedRoute roles={["Admin"]}>
            <AdminTutorials />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/gallery",
        element: (
          <RoleProtectedRoute roles={["Admin"]}>
            <AdminGallery />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/creations-locker",
        element: (
          <RoleProtectedRoute roles={["Admin"]}>
            <AdminCreationsLocker />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/support",
        element: (
          <RoleProtectedRoute roles={["Admin"]}>
            <AdminSupport />
          </RoleProtectedRoute>
        ),
      },

      { path: "unauthorized", element: <UnauthorizedPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;

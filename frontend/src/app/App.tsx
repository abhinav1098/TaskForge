import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../features/auth/context";

import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import TasksPage from "../features/tasks/TasksPage";

/* =============================
   PROTECTED ROUTE
============================= */

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/* =============================
   PUBLIC ROUTE
============================= */

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();

  if (accessToken) {
    return <Navigate to="/tasks" replace />;
  }

  return <>{children}</>;
}

/* =============================
   ROUTES
============================= */

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* =============================
   ROOT
============================= */

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HomePage from './pages/HomePage';
import ProfilePageWithNav from './pages/ProfilePageWithNav';
import AuthCallback from './pages/AuthCallback';

function AuthRedirect({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route
            path="/login"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />

          <Route
            path="/register"
            element={
              <AuthRedirect>
                <Register />
              </AuthRedirect>
            }
          />

          <Route
            path="/auth/callback"
            element={<AuthCallback />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <ProfilePageWithNav />
              </ProtectedRoute>
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </div>
    
  );
}
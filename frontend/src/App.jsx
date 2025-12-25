import { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';

// Layout
import MainLayout from './layout/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import StatsPage from './pages/StatsPage';
import DebtsPage from './pages/DebtsPage';

function App() {
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[color:var(--ft-bg)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[color:var(--ft-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - redirect to home if already logged in */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/" replace /> : <SignupPage />} 
      />
      
      {/* Protected routes - redirect to login if not authenticated */}
      <Route 
        path="/" 
        element={user ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<DashboardPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="debts" element={<DebtsPage />} />
      </Route>
      
      {/* Catch all - redirect based on auth state */}
      <Route 
        path="*" 
        element={<Navigate to={user ? "/" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default App;

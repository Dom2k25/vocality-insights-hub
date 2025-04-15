
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserRole } from './types/user';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import CallAnalysis from './pages/call-analysis/CallAnalysis';
import UserManagement from './pages/admin/UserManagement';
import LiveMonitoring from './pages/monitoring/LiveMonitoring';
import Analytics from './pages/Analytics';
import Index from './pages/Index';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Index Route */}
          <Route path="/" element={<Index />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/call-analysis" 
            element={
              <ProtectedRoute>
                <CallAnalysis />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/monitoring" 
            element={
              <ProtectedRoute>
                <LiveMonitoring />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

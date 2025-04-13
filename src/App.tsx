
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
// Rename component imports to avoid conflicts with page imports
import { Dashboard as DashboardComponent } from './components/Dashboard';
import { UserManagement as UserManagementComponent } from './components/UserManagement';
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

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-6">
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/call-analysis" element={<CallAnalysis />} />
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="/live-monitoring" element={<LiveMonitoring />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

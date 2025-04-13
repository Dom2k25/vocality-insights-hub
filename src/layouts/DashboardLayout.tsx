
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeProvider';
import { Button } from '../components/ui/button';
import { Moon, Sun } from 'lucide-react';

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Vocality</h1>
            <nav className="flex gap-4">
              <a href="/" className="text-sm font-medium">Dashboard</a>
              <a href="/call-analysis" className="text-sm font-medium">Call Analysis</a>
              <a href="/live-monitoring" className="text-sm font-medium">Live Monitoring</a>
              {user?.role === 'admin' && (
                <a href="/user-management" className="text-sm font-medium">User Management</a>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

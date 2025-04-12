import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { UserRole } from '../../types/user';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (!user) return [];

    const items = [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/calls', label: 'Anrufe' },
      { path: '/analytics', label: 'Analysen' }
    ];

    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      items.push({ path: '/users', label: 'Benutzer' });
    }

    if (user.role === UserRole.ADMIN) {
      items.push({ path: '/settings', label: 'Einstellungen' });
    }

    return items;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                Vocality
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {getMenuItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.full_name} ({user.role})
                </span>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                >
                  Abmelden
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline">Anmelden</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 
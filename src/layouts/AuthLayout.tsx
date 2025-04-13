
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeProvider';
import { Button } from '../components/ui/button';
import { Moon, Sun } from 'lucide-react';

const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Vocality</h1>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>
      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;

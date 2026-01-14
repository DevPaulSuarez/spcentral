import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path) ? 'bg-blue-700' : '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-xl font-bold">
                SP Central
              </Link>
              <div className="flex gap-2">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/dashboard')}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/tickets"
                  className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/tickets')}`}
                >
                  Tickets
                </Link>
                {user?.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/users"
                      className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/users')}`}
                    >
                      Usuarios
                    </Link>
                    <Link
                      to="/clients"
                      className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/clients')}`}
                    >
                      Clientes
                    </Link>
                    <Link
                      to="/webs"
                      className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/webs')}`}
                    >
                      Webs
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span>
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path) ? 'bg-blue-700' : '';
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="text-xl font-bold">
              SP Central
            </Link>

            {/* Menú Desktop */}
            <div className="hidden md:flex items-center gap-2">
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

            {/* Usuario y Logout Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-sm"
              >
                Salir
              </button>
            </div>

            {/* Botón Hamburguesa Mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded hover:bg-blue-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú Mobile */}
        {menuOpen && (
          <div className="md:hidden bg-blue-700 px-4 py-2">
            <div className="flex flex-col gap-1">
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className={`px-3 py-2 rounded hover:bg-blue-600 ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/tickets"
                onClick={closeMenu}
                className={`px-3 py-2 rounded hover:bg-blue-600 ${isActive('/tickets')}`}
              >
                Tickets
              </Link>
              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/users"
                    onClick={closeMenu}
                    className={`px-3 py-2 rounded hover:bg-blue-600 ${isActive('/users')}`}
                  >
                    Usuarios
                  </Link>
                  <Link
                    to="/clients"
                    onClick={closeMenu}
                    className={`px-3 py-2 rounded hover:bg-blue-600 ${isActive('/clients')}`}
                  >
                    Clientes
                  </Link>
                  <Link
                    to="/webs"
                    onClick={closeMenu}
                    className={`px-3 py-2 rounded hover:bg-blue-600 ${isActive('/webs')}`}
                  >
                    Webs
                  </Link>
                </>
              )}
              <div className="border-t border-blue-500 mt-2 pt-2">
                <p className="px-3 py-1 text-sm text-blue-200">
                  {user?.name} ({user?.role})
                </p>
                <button
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-red-600 bg-red-500 mt-1"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {children}
      </main>
    </div>
  );
}
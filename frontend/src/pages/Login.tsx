import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">SP Central</h1>
        <h2 className="text-lg md:text-xl text-center mb-4 md:mb-6">Iniciar Sesión</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm md:text-base">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2 text-sm md:text-base">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 text-sm md:text-base"
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm md:text-base">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
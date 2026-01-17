import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket} from '../types';

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  inReview: number;
  resolved: number;
  rejected: number;
  critical: number;
  unassigned: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentTickets();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/tickets/stats/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error('Error al cargar estadísticas', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTickets = async () => {
    try {
      const response = await api.get('/tickets?limit=5');
      setRecentTickets(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      console.error('Error al cargar tickets recientes', err);
    }
  };

  const statusColor = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    IN_REVIEW: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const priorityColor = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <Layout>
        <p>Cargando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">
          Bienvenido, {user?.name}
        </h2>
        <p className="text-gray-600 text-sm">
          {user?.role === 'ADMIN' && 'Panel de Administración'}
          {user?.role === 'CLIENT' && 'Mis Tickets'}
          {user?.role === 'DEV' && 'Mis Tickets Asignados'}
          {user?.role === 'VALIDATOR' && 'Tickets por Validar'}
        </p>
      </div>

{/* Estadísticas */}
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
  {[
    { label: 'Total', value: stats?.total, style: 'bg-white' },
    { label: 'Abiertos', value: stats?.open, style: 'bg-blue-50 text-blue-700' },
    { label: 'En Progreso', value: stats?.inProgress, style: 'bg-yellow-50 text-yellow-700' },
    { label: 'En Revisión', value: stats?.inReview, style: 'bg-purple-50 text-purple-700' },
    { label: 'Resueltos', value: stats?.resolved, style: 'bg-green-50 text-green-700' },
    { label: 'Rechazados', value: stats?.rejected, style: 'bg-red-50 text-red-700' },
    ...(user?.role === 'ADMIN'
      ? [
          { label: 'Críticos', value: stats?.critical, style: 'bg-orange-50 text-orange-700' },
          { label: 'Sin Asignar', value: stats?.unassigned, style: 'bg-gray-50 text-gray-700' },
        ]
      : []),
  ].map((item, i) => (
<div
  key={i}
  className={`aspect-square flex flex-col justify-center items-center rounded-xl shadow-sm ${item.style}`}
>
  {/* Número */}
  <p className="text-4xl sm:text-5xl font-extrabold leading-none">
    {item.value ?? 0}
  </p>

  {/* Texto */}
  <p className="mt-2 text-sm sm:text-base font-medium text-gray-600 text-center">
    {item.label}
  </p>
</div>

  ))}
</div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tickets recientes */}
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Tickets Recientes</h3>
            <Link to="/tickets" className="text-blue-500 text-sm hover:underline">
              Ver todos
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay tickets</p>
          ) : (
            <div className="space-y-3">
              {recentTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="block p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        #{ticket.id} {ticket.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {ticket.web?.name} • {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`px-2 py-0.5 rounded text-xs ${statusColor[ticket.status]}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${priorityColor[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Acciones + Info */}
        <div className="space-y-6">
          {/* Acciones */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/tickets" className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm font-medium">
                📋 Ver Tickets
              </Link>

              {(user?.role === 'ADMIN' || user?.role === 'CLIENT') && (
                <Link to="/tickets/new" className="p-3 bg-green-50 rounded-lg hover:bg-green-100 text-sm font-medium">
                  ➕ Nuevo Ticket
                </Link>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/users" className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 text-sm font-medium">
                    👥 Usuarios
                  </Link>
                  <Link to="/clients" className="p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 text-sm font-medium">
                    🏢 Clientes
                  </Link>
                  <Link to="/webs" className="p-3 bg-teal-50 rounded-lg hover:bg-teal-100 text-sm font-medium">
                    🌐 Webs
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Información */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Mi Información</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nombre</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rol</span>
                <span className="px-2 py-0.5 rounded text-xs bg-gray-100">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

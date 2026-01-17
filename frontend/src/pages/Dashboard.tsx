import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, TicketStatus, TicketPriority } from '../types';

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
      if (Array.isArray(response.data)) {
        setRecentTickets(response.data);
      } else {
        setRecentTickets(response.data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar tickets recientes', err);
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      IN_REVIEW: 'bg-purple-100 text-purple-800',
      RESOLVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: TicketPriority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };

  const getStatusLabel = (status: TicketStatus) => {
    const labels = {
      OPEN: 'Abierto',
      IN_PROGRESS: 'En Progreso',
      IN_REVIEW: 'En Revisión',
      RESOLVED: 'Resuelto',
      REJECTED: 'Rechazado',
    };
    return labels[status];
  };

  const getPriorityLabel = (priority: TicketPriority) => {
    const labels = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      CRITICAL: 'Crítica',
    };
    return labels[priority];
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Bienvenido, {user?.name}</h2>
        <p className="text-gray-600">
          {user?.role === 'ADMIN' && 'Panel de Administración'}
          {user?.role === 'CLIENT' && 'Mis Tickets'}
          {user?.role === 'DEV' && 'Mis Tickets Asignados'}
          {user?.role === 'VALIDATOR' && 'Tickets por Validar'}
        </p>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-3xl font-bold">{stats?.total || 0}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-blue-600 text-sm">Abiertos</p>
          <p className="text-3xl font-bold text-blue-700">{stats?.open || 0}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-yellow-600 text-sm">En Progreso</p>
          <p className="text-3xl font-bold text-yellow-700">{stats?.inProgress || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <p className="text-purple-600 text-sm">En Revisión</p>
          <p className="text-3xl font-bold text-purple-700">{stats?.inReview || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-green-600 text-sm">Resueltos</p>
          <p className="text-3xl font-bold text-green-700">{stats?.resolved || 0}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-red-600 text-sm">Rechazados</p>
          <p className="text-3xl font-bold text-red-700">{stats?.rejected || 0}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <>
            <div className="bg-orange-50 p-4 rounded-lg shadow">
              <p className="text-orange-600 text-sm">Críticos</p>
              <p className="text-3xl font-bold text-orange-700">{stats?.critical || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Sin Asignar</p>
              <p className="text-3xl font-bold text-gray-700">{stats?.unassigned || 0}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tickets recientes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tickets Recientes</h3>
            <Link to="/tickets" className="text-blue-500 text-sm hover:underline">
              Ver todos
            </Link>
          </div>
          {recentTickets.length === 0 ? (
            <p className="text-gray-500">No hay tickets</p>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="block p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">#{ticket.id} {ticket.title}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {ticket.web?.name} • {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Acciones rápidas y resumen */}
        <div className="space-y-6">
          {/* Acciones rápidas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/tickets"
                className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <span className="text-2xl">📋</span>
                <span className="text-sm font-medium">Ver Tickets</span>
              </Link>
              {(user?.role === 'ADMIN' || user?.role === 'CLIENT') && (
                <Link
                  to="/tickets/new"
                  className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100"
                >
                  <span className="text-2xl">➕</span>
                  <span className="text-sm font-medium">Nuevo Ticket</span>
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/users"
                    className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100"
                  >
                    <span className="text-2xl">👥</span>
                    <span className="text-sm font-medium">Usuarios</span>
                  </Link>
                  <Link
                    to="/clients"
                    className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                  >
                    <span className="text-2xl">🏢</span>
                    <span className="text-sm font-medium">Clientes</span>
                  </Link>
                  <Link
                    to="/webs"
                    className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg hover:bg-teal-100"
                  >
                    <span className="text-2xl">🌐</span>
                    <span className="text-sm font-medium">Webs</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Información del rol */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Mi Información</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Nombre:</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rol:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  user?.role === 'DEV' ? 'bg-blue-100 text-blue-800' :
                  user?.role === 'VALIDATOR' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
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
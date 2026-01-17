import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Ticket, TicketStatus, TicketPriority } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { user } = useAuth();
  const canCreateTicket = user?.role === 'ADMIN' || user?.role === 'CLIENT';

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await api.get(`/tickets?${params.toString()}`);
      
      if (Array.isArray(response.data)) {
        setTickets(response.data);
      } else {
        setTickets(response.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar tickets');
    } finally {
      setLoading(false);
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Tickets</h2>
        {canCreateTicket && (
          <Link
            to="/tickets/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm md:text-base"
          >
            Nuevo Ticket
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
        >
          <option value="">Todos los estados</option>
          <option value="OPEN">Abierto</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="IN_REVIEW">En Revisión</option>
          <option value="RESOLVED">Resuelto</option>
          <option value="REJECTED">Rechazado</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
        >
          <option value="">Todas las prioridades</option>
          <option value="LOW">Baja</option>
          <option value="MEDIUM">Media</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : tickets.length === 0 ? (
        <p className="text-gray-500">No hay tickets</p>
      ) : (
        <>
          {/* Vista móvil - Tarjetas */}
          <div className="md:hidden space-y-4">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="block bg-white rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-500 text-sm">#{ticket.id}</span>
                  <div className="flex gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                      {getPriorityLabel(ticket.priority)}
                    </span>
                  </div>
                </div>
                <h3 className="font-medium text-blue-600 mb-2">{ticket.title}</h3>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{ticket.assignee?.name || 'Sin asignar'}</span>
                  <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{ticket.id}</td>
                    <td className="px-6 py-4">
                      <Link to={`/tickets/${ticket.id}`} className="text-blue-500 hover:underline">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{ticket.assignee?.name || '-'}</td>
                    <td className="px-6 py-4">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
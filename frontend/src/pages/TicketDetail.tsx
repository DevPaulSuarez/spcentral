import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Ticket, TicketStatus, TicketPriority, User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [devs, setDevs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  const [status, setStatus] = useState<TicketStatus>(TicketStatus.OPEN);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [assignedTo, setAssignedTo] = useState<string>('');

  useEffect(() => {
    fetchTicket();
    fetchDevs();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
      setStatus(response.data.status);
      setPriority(response.data.priority);
      setAssignedTo(response.data.assigned_to?.toString() || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar ticket');
    } finally {
      setLoading(false);
    }
  };

  const fetchDevs = async () => {
    try {
      const response = await api.get('/users');
      const devUsers = response.data.filter((u: User) => u.role === UserRole.DEV);
      setDevs(devUsers);
    } catch (err) {
      console.error('Error al cargar devs', err);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/tickets/${id}`, {
        status,
        priority,
        assigned_to: assignedTo ? Number(assignedTo) : null,
      });
      setEditing(false);
      fetchTicket();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar ticket');
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

  if (loading) {
    return <Layout><p>Cargando...</p></Layout>;
  }

  if (!ticket) {
    return <Layout><p>Ticket no encontrado</p></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ticket #{ticket.id}</h2>
          <button
            onClick={() => navigate('/tickets')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Volver
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{ticket.title}</h3>
            <p className="text-gray-600">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-500 text-sm">Estado</p>
              {editing ? (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="border rounded px-3 py-1"
                >
                  <option value="OPEN">Abierto</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="IN_REVIEW">En Revisión</option>
                  <option value="RESOLVED">Resuelto</option>
                  <option value="REJECTED">Rechazado</option>
                </select>
              ) : (
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              )}
            </div>

            <div>
              <p className="text-gray-500 text-sm">Prioridad</p>
              {editing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="border rounded px-3 py-1"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
              ) : (
                <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              )}
            </div>

            <div>
              <p className="text-gray-500 text-sm">Asignado a</p>
              {editing ? (
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="border rounded px-3 py-1"
                >
                  <option value="">Sin asignar</option>
                  {devs.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="font-medium">{ticket.assignee?.name || 'Sin asignar'}</p>
              )}
            </div>

            <div>
              <p className="text-gray-500 text-sm">Web</p>
              <p className="font-medium">{ticket.web?.name} - {ticket.web?.domain}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Creado por</p>
              <p className="font-medium">{ticket.creator?.name}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Fecha creación</p>
              <p className="font-medium">{new Date(ticket.created_at).toLocaleString()}</p>
            </div>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'DEV') && (
            <div className="flex gap-4">
              {editing ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Editar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
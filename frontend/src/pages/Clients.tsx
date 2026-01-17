import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Client, User, UserRole } from '../types';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchClients();
    fetchUsers();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(
        response.data.filter((u: User) => u.role === UserRole.CLIENT)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditing(client);
      setUserId(client.user_id.toString());
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone || '');
    } else {
      setEditing(null);
      setUserId('');
      setName('');
      setEmail('');
      setPhone('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editing) {
        await api.patch(`/clients/${editing.id}`, {
          name,
          email,
          phone,
        });
      } else {
        await api.post('/clients', {
          user_id: Number(userId),
          name,
          email,
          phone,
        });
      }
      closeModal();
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar cliente');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este cliente?')) return;

    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar cliente');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Clientes</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
        >
          Nuevo Cliente
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {/* ===================== */}
          {/* VISTA MÓVIL - CARDS */}
          {/* ===================== */}
          <div className="md:hidden space-y-4">
            {clients.map((client) => (
<div
  key={client.id}
  className="bg-white rounded-lg shadow border px-4 py-3"
>
  {/* Header */}
  <div className="mb-1">
    <p className="font-semibold text-base leading-tight">
      {client.name}
    </p>
    <p className="text-sm text-gray-500">
      {client.email}
    </p>
  </div>

  {/* Meta info */}
  <div className="text-sm text-gray-600 space-y-0.5">
    <p>📞 {client.phone || '-'}</p>
    <p className="text-xs text-gray-500">
      Usuario: {client.user?.name || '-'}
    </p>
  </div>

  {/* Actions */}
  <div className="flex justify-end gap-3 mt-3">
    <button
      onClick={() => openModal(client)}
      className="text-blue-600 text-sm font-medium"
    >
      Editar
    </button>
    <button
      onClick={() => handleDelete(client.id)}
      className="text-red-600 text-sm font-medium"
    >
      Eliminar
    </button>
  </div>
</div>

            ))}
          </div>

          {/* ===================== */}
          {/* VISTA DESKTOP - TABLA */}
          {/* ===================== */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{client.id}</td>
                    <td className="px-6 py-4">{client.name}</td>
                    <td className="px-6 py-4">{client.email}</td>
                    <td className="px-6 py-4">{client.phone || '-'}</td>
                    <td className="px-6 py-4">{client.user?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openModal(client)}
                        className="text-blue-500 hover:underline mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===================== */}
      {/* MODAL */}
      {/* ===================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-bold mb-4">
              {editing ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!editing && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm">Usuario</label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  >
                    <option value="">Seleccionar usuario</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2 text-sm">Teléfono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                >
                  {editing ? 'Guardar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

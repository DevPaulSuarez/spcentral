import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Web, Client } from '../types';

export default function Webs() {
  const [webs, setWebs] = useState<Web[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Web | null>(null);

  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchWebs();
    fetchClients();
  }, []);

  const fetchWebs = async () => {
    try {
      const response = await api.get('/webs');
      setWebs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar webs');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Error al cargar clientes', err);
    }
  };

  const openModal = (web?: Web) => {
    if (web) {
      setEditing(web);
      setClientId(web.client_id.toString());
      setName(web.name);
      setDomain(web.domain);
      setActive(web.active);
    } else {
      setEditing(null);
      setClientId('');
      setName('');
      setDomain('');
      setActive(true);
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
        await api.patch(`/webs/${editing.id}`, {
          name,
          domain,
          active,
        });
      } else {
        await api.post('/webs', {
          client_id: Number(clientId),
          name,
          domain,
          active,
        });
      }
      closeModal();
      fetchWebs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar web');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta web?')) return;

    try {
      await api.delete(`/webs/${id}`);
      fetchWebs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar web');
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Webs</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nueva Web
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {/* 🌐 MODO CARDS PARA MÓVIL */}
          <div className="grid grid-cols-1 sm:hidden gap-4">
            {webs.map((web) => (
              <div
                key={web.id}
                className="bg-white rounded-lg shadow p-4 border border-gray-100"
              >
                <p className="text-lg font-semibold">{web.name}</p>
                <p className="text-gray-600">{web.domain}</p>

                <p className="mt-2 text-sm text-gray-500">
                  Cliente: <span className="font-medium">{web.client?.name || '-'}</span>
                </p>

                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                    web.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {web.active ? 'Activa' : 'Inactiva'}
                </span>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => openModal(web)}
                    className="text-blue-600 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(web.id)}
                    className="text-red-600 font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 🖥️ TABLA PARA TABLET / PC */}
          <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dominio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {webs.map((web) => (
                  <tr key={web.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{web.id}</td>
                    <td className="px-6 py-4">{web.name}</td>
                    <td className="px-6 py-4">{web.domain}</td>
                    <td className="px-6 py-4">{web.client?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          web.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {web.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openModal(web)}
                        className="text-blue-500 hover:underline mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(web.id)}
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editing ? 'Editar Web' : 'Nueva Web'}
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!editing && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Cliente</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Dominio</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="ejemplo.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Activa</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editing ? 'Guardar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
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

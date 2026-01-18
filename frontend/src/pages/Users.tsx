import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { User, UserRole, Language } from '../types';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [language, setLanguage] = useState<Language>(Language.ES);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditing(user);
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setRole(user.role);
      setLanguage(user.language);
      setPassword('');
    } else {
      setEditing(null);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole(UserRole.CLIENT);
      setLanguage(Language.ES);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setError('');
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setNewPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editing) {
        await api.patch(`/users/${editing.id}`, {
          name,
          email,
          phone,
          role,
          language,
        });
      } else {
        await api.post('/users', {
          name,
          email,
          password,
          phone,
          role,
          language,
        });
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await api.patch(`/users/${selectedUser?.id}/reset-password`, {
        password: newPassword,
      });
      closePasswordModal();
      alert('Contraseña actualizada correctamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      DEV: 'bg-blue-100 text-blue-800',
      VALIDATOR: 'bg-purple-100 text-purple-800',
      CLIENT: 'bg-green-100 text-green-800',
    };
    return colors[role];
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      ADMIN: 'Admin',
      DEV: 'Dev',
      VALIDATOR: 'Validador',
      CLIENT: 'Cliente',
    };
    return labels[role];
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Usuarios</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
        >
          Nuevo Usuario
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
          {/* Vista móvil - Cards */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal(user)}
                    className="px-3 py-1 text-sm font-medium border border-blue-500 text-blue-600 rounded hover:bg-blue-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => openPasswordModal(user)}
                    className="px-3 py-1 text-sm font-medium border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-200 transition"
                  >
                    Contraseña
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-3 py-1 text-sm font-medium border border-red-500 text-red-600 rounded hover:bg-red-200 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Idioma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{user.id}</td>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{user.language.toUpperCase()}</td>
<td className="px-6 py-4">
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => openModal(user)}
      className="px-3 py-1 text-sm font-medium border border-blue-500 text-blue-600 rounded hover:bg-blue-100"
    >
      
      Editar
    </button>

    <button
      onClick={() => openPasswordModal(user)}
      className="px-3 py-1 text-sm font-medium border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-200 transition"
    >
      Contraseña
    </button>

    <button
      onClick={() => handleDelete(user.id)}
      className="px-3 py-1 text-sm font-medium border border-red-500 text-red-600 rounded hover:bg-red-200 transition"
    >
      Eliminar
    </button>
  </div>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-bold mb-4">
              {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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

              {!editing && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Teléfono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="CLIENT">Cliente</option>
                  <option value="DEV">Desarrollador</option>
                  <option value="VALIDATOR">Validador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2 text-sm">Idioma</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
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

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg md:text-xl font-bold mb-4">
              Cambiar Contraseña
            </h3>
            <p className="text-gray-600 text-sm mb-4">{selectedUser?.name}</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordReset}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 text-sm">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={closePasswordModal}
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
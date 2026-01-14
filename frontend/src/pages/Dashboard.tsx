import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Tickets</h3>
          <p className="text-gray-600">Gestionar tickets de soporte</p>
        </div>

        {user?.role === 'ADMIN' && (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Usuarios</h3>
              <p className="text-gray-600">Gestionar usuarios del sistema</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Clientes</h3>
              <p className="text-gray-600">Gestionar clientes</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Webs</h3>
              <p className="text-gray-600">Gestionar sitios web</p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
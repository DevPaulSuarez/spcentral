import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketNew from './pages/TicketNew';
import TicketDetail from './pages/TicketDetail';
import Users from './pages/Users';
import Clients from './pages/Clients';
import Webs from './pages/Webs';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function TicketCreatorRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'CLIENT') {
    return <Navigate to="/tickets" />;
  }

  return children;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/tickets" element={<PrivateRoute><Layout><Tickets /></Layout></PrivateRoute>} />
      <Route path="/tickets/new" element={<TicketCreatorRoute><TicketNew /></TicketCreatorRoute>} />
      <Route path="/tickets/:id" element={<PrivateRoute><TicketDetail /></PrivateRoute>} />
      <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/clients" element={<AdminRoute><Clients /></AdminRoute>} />
      <Route path="/webs" element={<AdminRoute><Webs /></AdminRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/global.css';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import HomePage         from './pages/HomePage';
import SearchPage       from './pages/SearchPage';
import PropertyDetail   from './pages/PropertyDetail';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';

// Tenant pages
import FavoritesPage    from './pages/tenant/FavoritesPage';
import NotificationsPage from './pages/tenant/NotificationsPage';
import ProfilePage      from './pages/tenant/ProfilePage';

// Owner pages
import AddPropertyPage  from './pages/owner/AddPropertyPage';
import MyListingsPage   from './pages/owner/MyListingsPage';
import EditPropertyPage from './pages/owner/EditPropertyPage';

// Admin pages
import AdminLayout      from './pages/admin/AdminLayout';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminListings    from './pages/admin/AdminListings';
import AdminUsers       from './pages/admin/AdminUsers';
import AdminReports     from './pages/admin/AdminReports';

// ── Route Guards ────────────────────────────────────────────────────────────
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// ── Main Layout wrapper ─────────────────────────────────────────────────────
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 80px)' }}>{children}</main>
    <Footer />
  </>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
      <Route path="/property/:id" element={<MainLayout><PropertyDetail /></MainLayout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Tenant */}
      <Route path="/favorites" element={<PrivateRoute><MainLayout><FavoritesPage /></MainLayout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><MainLayout><NotificationsPage /></MainLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><MainLayout><ProfilePage /></MainLayout></PrivateRoute>} />

      {/* Owner */}
      <Route path="/owner/add-property" element={<PrivateRoute roles={['owner','admin']}><MainLayout><AddPropertyPage /></MainLayout></PrivateRoute>} />
      <Route path="/owner/listings" element={<PrivateRoute roles={['owner','admin']}><MainLayout><MyListingsPage /></MainLayout></PrivateRoute>} />
      <Route path="/owner/edit/:id" element={<PrivateRoute roles={['owner','admin']}><MainLayout><EditPropertyPage /></MainLayout></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminLayout /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="listings" element={<AdminListings />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
            success: { iconTheme: { primary: '#1a6b3a', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import PaymentManagement from './pages/admin/PaymentManagement';
import MonthlyPayments from './pages/admin/MonthlyPayments';
import Reports from './pages/admin/Reports';
import ChangePassword from './pages/common/ChangePassword';
import MemberLayout from './layouts/MemberLayout';
import MemberDashboard from './pages/member/MemberDashboard';
import PaymentPage from './pages/member/PaymentPage';
import PaymentHistory from './pages/member/PaymentHistory';
import AllMembersStatus from './pages/member/AllMembersStatus';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/member'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="monthly" element={<MonthlyPayments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<ChangePassword />} />
        </Route>

        <Route
          path="/member"
          element={
            <ProtectedRoute role="member">
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MemberDashboard />} />
          <Route path="pay" element={<PaymentPage />} />
          <Route path="history" element={<PaymentHistory />} />
          <Route path="all-members" element={<AllMembersStatus />} />
          <Route path="settings" element={<ChangePassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

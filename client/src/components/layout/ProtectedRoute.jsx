import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Usage:
 *   <ProtectedRoute><AdminLayout /></ProtectedRoute>
 *   <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Logged in, but wrong role for this section — send them to their own home.
    return <Navigate to={user.role === 'admin' ? '/admin' : '/member'} replace />;
  }

  return children;
}

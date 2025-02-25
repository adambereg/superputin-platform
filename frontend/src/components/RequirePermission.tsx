import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface RequirePermissionProps {
  children: React.ReactNode;
  permission: string;
}

export function RequirePermission({ children, permission }: RequirePermissionProps) {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Админ имеет все права
  if (user.role === 'admin') {
    return <>{children}</>;
  }

  // Проверяем наличие конкретного права
  if (!user.permissions.includes(permission)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
} 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cargar token y usuario del localStorage
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = () => !!token && !!user;

  const hasRole = (allowedRoles: string[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.rol);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;

    const permissions: Record<string, string[]> = {
      admin: [
        'crear_usuario',
        'editar_usuario',
        'eliminar_usuario',
        'crear_transaccion',
        'editar_transaccion',
        'eliminar_transaccion',
        'ver_reportes',
        'ver_auditoria',
        'crear_socio',
        'editar_socio',
        'eliminar_socio',
      ],
      contador: [
        'crear_transaccion',
        'editar_transaccion',
        'ver_reportes',
        'crear_socio',
        'editar_socio',
      ],
      visor: ['ver_reportes'],
    };

    const userPermissions = permissions[user.rol] || [];
    return userPermissions.includes(permission);
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    hasRole,
    hasPermission,
  };
}

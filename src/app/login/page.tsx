'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerNombre, setRegisterNombre] = useState('');
  const [registerRol, setRegisterRol] = useState('visor');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  useEffect(() => {
    // Verificar si ya hay sesión
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/socios');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      // Guardar token y usuario en localStorage
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.usuario));

      // Redirigir a dashboard
      router.push('/socios');
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          nombre: registerNombre,
          rol: registerRol,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegisterError(data.error || 'Error al registrar');
        return;
      }

      setRegisterSuccess('✅ Usuario registrado. Puedes iniciar sesión.');
      setTimeout(() => {
        setShowRegister(false);
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterNombre('');
        setRegisterRol('visor');
        setRegisterSuccess('');
      }, 2000);
    } catch (err) {
      setRegisterError('Error de conexión');
      console.error(err);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!showRegister ? (
          // FORMULARIO DE LOGIN
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">💰 Contable App</h1>
              <p className="text-gray-600 text-sm mt-2">Sistema de Contabilidad para Asociación</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                ✗ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
              >
                {loading ? '⏳ Iniciando sesión...' : '🔓 Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Crear una
                </button>
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-700 mb-2 font-medium">Demo (no requiere registro):</p>
              <p className="text-xs text-gray-600">Email: admin@example.com</p>
              <p className="text-xs text-gray-600">Pass: admin123</p>
            </div>
          </div>
        ) : (
          // FORMULARIO DE REGISTRO
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">👤 Crear Cuenta</h1>
              <p className="text-gray-600 text-sm mt-2">Registra un nuevo usuario</p>
            </div>

            {registerError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                ✗ {registerError}
              </div>
            )}

            {registerSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {registerSuccess}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={registerNombre}
                  onChange={(e) => setRegisterNombre(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Contraseña</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Rol</label>
                <select
                  value={registerRol}
                  onChange={(e) => setRegisterRol(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Administrador</option>
                  <option value="contador">Contador</option>
                  <option value="visor">Visualizador</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
              >
                {registerLoading ? '⏳ Registrando...' : '✅ Registrar'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowRegister(false);
                  setRegisterError('');
                  setRegisterSuccess('');
                }}
                className="text-blue-500 hover:text-blue-600 font-medium text-sm"
              >
                ← Volver al Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

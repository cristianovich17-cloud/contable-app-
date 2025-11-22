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

      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.usuario));
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Contable Pro</h1>
          <p className="text-secondary-400">Sistema de contabilidad moderno</p>
        </div>

        {!showRegister ? (
          // LOGIN FORM
          <div className="card">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="tu-email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 font-medium disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              <div className="text-center pt-4 border-t border-secondary-700">
                <p className="text-secondary-400 text-sm mb-2">¿No tienes cuenta?</p>
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="text-primary-400 hover:text-primary-300 font-medium text-sm"
                >
                  Crear una nueva cuenta
                </button>
              </div>
            </form>
          </div>
        ) : (
          // REGISTER FORM
          <div className="card">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={registerNombre}
                  onChange={(e) => setRegisterNombre(e.target.value)}
                  className="input"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="input"
                  placeholder="tu-email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contraseña</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rol</label>
                <select
                  value={registerRol}
                  onChange={(e) => setRegisterRol(e.target.value)}
                  className="input"
                >
                  <option value="visor">Visor (Lectura)</option>
                  <option value="editor">Editor (Lectura/Escritura)</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {registerError && (
                <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                  {registerError}
                </div>
              )}

              {registerSuccess && (
                <div className="p-3 bg-emerald-500 bg-opacity-20 border border-emerald-500 rounded-lg text-emerald-300 text-sm">
                  {registerSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full btn-primary py-3 font-medium disabled:opacity-50"
              >
                {registerLoading ? 'Registrando...' : 'Crear Cuenta'}
              </button>

              <div className="text-center pt-4 border-t border-secondary-700">
                <p className="text-secondary-400 text-sm mb-2">¿Ya tienes cuenta?</p>
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="text-primary-400 hover:text-primary-300 font-medium text-sm"
                >
                  Volver a iniciar sesión
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 text-center text-sm text-secondary-400">
          <p>
            ¿Necesitas ayuda? <Link href="/" className="text-primary-400 hover:text-primary-300">Volver al inicio</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

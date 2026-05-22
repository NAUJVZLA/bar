'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'admin' | 'super'>('admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simular retraso de red
    setTimeout(() => {
      if (email === 'superadmin@alicobar.com' && password === 'admin123') {
        const session = {
          email,
          role: 'super_admin',
          nombre: 'Super Dueño (Alico Bar)',
          timestamp: Date.now()
        };
        localStorage.setItem('alico_session', JSON.stringify(session));
        router.push('/super-admin');
      } else if (email === 'admin@alicobar.com' && password === 'admin123') {
        const session = {
          email,
          role: 'admin',
          nombre: 'Diana Administradora',
          timestamp: Date.now()
        };
        localStorage.setItem('alico_session', JSON.stringify(session));
        // Asignar sede por defecto
        localStorage.setItem('alico_active_sede', 'sede-norte');
        router.push('/dashboard');
      } else {
        setError('Credenciales incorrectas. Intenta con las pestañas de demo de abajo.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleDemoAccess = (type: 'admin' | 'super') => {
    setActiveTab(type);
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (type === 'super') {
        const session = {
          email: 'superadmin@alicobar.com',
          role: 'super_admin',
          nombre: 'Super Dueño (Alico Bar)',
          timestamp: Date.now()
        };
        localStorage.setItem('alico_session', JSON.stringify(session));
        router.push('/super-admin');
      } else {
        const session = {
          email: 'admin@alicobar.com',
          role: 'admin',
          nombre: 'Diana Administradora',
          timestamp: Date.now()
        };
        localStorage.setItem('alico_session', JSON.stringify(session));
        // Asignar sede por defecto
        localStorage.setItem('alico_active_sede', 'sede-norte');
        router.push('/dashboard');
      }
    }, 400);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-[#020205]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-xl shadow-amber-500/20 mb-4 ring-1 ring-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8 text-black">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
            ALICO BAR
          </h1>
          <p className="text-sm text-zinc-400 mt-2 font-medium">
            Software de Control de Barra, Mesas & Inventario
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card rounded-2xl p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>

          <h2 className="text-xl font-semibold text-white mb-6">Iniciar Sesión</h2>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400 flex-shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@alicobar.com"
                className="w-full h-11 px-4 rounded-xl glass-input text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-xl glass-input text-sm text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl btn-gold text-sm font-semibold flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Ingresar al Sistema</span>
              )}
            </button>
          </form>

          {/* Quick Demo Preloads */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-4">
              Demo Rápida - Selecciona un Rol
            </p>
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => handleDemoAccess('admin')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${activeTab === 'admin'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                Admin Sede (Cliente)
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccess('super')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${activeTab === 'super'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                Super Admin (Creador)
              </button>
            </div>

            <div className="mt-4 p-3 bg-white/2 rounded-lg border border-white/5 text-center">
              <p className="text-[11px] text-zinc-400">
                <span className="font-semibold text-zinc-300">Email:</span> {activeTab === 'super' ? 'superadmin@alicobar.com' : 'admin@alicobar.com'}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                <span className="font-semibold text-zinc-300">Contraseña:</span> admin123
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-8">
          Alico Bar POS v1.0.0 • Hecho para Licoreras & Mini Bares
        </p>
      </div>
    </div>
  );
}

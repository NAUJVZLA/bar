'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'super' | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simular retraso de red
    setTimeout(() => {
      const cleanEmail = email.toLowerCase().trim();
      if ((cleanEmail === 'superadmin@alicobar.com' || cleanEmail === 'superadmin@alcobar.com') && password === 'admin123') {
        const session = {
          email: cleanEmail,
          role: 'super_admin',
          nombre: 'Juan Carlos Caridad',
          timestamp: Date.now()
        };
        localStorage.setItem('alico_session', JSON.stringify(session));
        router.push('/super-admin');
      } else if ((cleanEmail === 'admin@alicobar.com' || cleanEmail === 'admin@alcobar.com') && password === 'admin123') {
        const session = {
          email: cleanEmail,
          role: 'admin',
          nombre: 'Diana Administradora',
          timestamp: Date.now()
        };
        localStorage.setItem('alico_session', JSON.stringify(session));
        localStorage.setItem('alico_active_sede', 'sede-norte');
        router.push('/dashboard');
      } else {
        setError('Credenciales incorrectas. Intenta con el ingreso directo de perfiles.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleProfileLogin = (type: 'admin' | 'super') => {
    setLoginType(type);
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (type === 'super') {
        const session = {
          email: 'superadmin@alcobar.com',
          role: 'super_admin',
          nombre: 'Juan Carlos Caridad',
          timestamp: Date.now()
        };
        localStorage.setItem('alico_session', JSON.stringify(session));
        router.push('/super-admin');
      } else {
        const session = {
          email: 'admin@alcobar.com',
          role: 'admin',
          nombre: 'Diana Administradora',
          timestamp: Date.now()
        };
        localStorage.setItem('alico_session', JSON.stringify(session));
        // Sede por defecto
        localStorage.setItem('alico_active_sede', 'sede-norte');
        router.push('/dashboard');
      }
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-[#020205]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-2xl z-10">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-xl shadow-amber-500/20 mb-4 ring-1 ring-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8 text-black">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
            ALCO
          </h1>
          <p className="text-sm text-zinc-400 mt-2 font-bold tracking-widest uppercase">
            Servicio Gastro Bar
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Software de Control de Barra, Mesas & Inventario Multisede
          </p>
        </div>

        {/* Profile Selector (Main View) */}
        {!showAdvanced ? (
          <div className="space-y-6">
            <h2 className="text-center text-sm font-semibold tracking-wider text-zinc-400 uppercase mb-4">
              Selecciona tu Perfil para Ingresar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Admin Sede */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleProfileLogin('admin')}
                className="group relative text-left glass-card rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 bg-[#06060c]/50 hover:bg-[#07130e]/30 transition-all duration-300 shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between min-h-[190px] overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                
                <div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Diana Administradora</h3>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Gerente de Sede (POS & Mesas)</p>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                    Acceso directo a la terminal de ventas en barra, mapa interactivo de comandas, inventario Kárdex y cartera.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>Ingresar al POS</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>

              {/* Card Super Admin */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleProfileLogin('super')}
                className="group relative text-left glass-card rounded-2xl p-6 border border-white/5 hover:border-amber-500/30 bg-[#06060c]/50 hover:bg-[#140f06]/30 transition-all duration-300 shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between min-h-[190px] overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>

                <div>
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Juan Carlos Caridad</h3>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Dueño (Super Administrador)</p>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                    Consola global consolidada para dueños. Gestión de sucursales, creación de administradores y auditoría contable multisede.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Consola de Dueño</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Spinner Overlay */}
            {isLoading && (
              <div className="flex justify-center items-center py-4 gap-2.5 text-xs text-zinc-400 font-semibold">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500"></div>
                <span>Autenticando perfil en el sistema...</span>
              </div>
            )}
          </div>
        ) : (
          /* Advanced Login View (Traditional Form) */
          <div className="glass-card rounded-2xl p-8 border border-white/5 relative overflow-hidden max-w-md mx-auto">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>

            <h2 className="text-xl font-semibold text-white mb-2">Ingreso Avanzado</h2>
            <p className="text-xs text-zinc-400 mb-6">Formulario de soporte técnico y credenciales personalizadas.</p>

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
                  placeholder="ejemplo@alcobar.com"
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
          </div>
        )}

        {/* Footer Support Links */}
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => {
              setShowAdvanced(!showAdvanced);
              setError('');
              setIsLoading(false);
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
          >
            {showAdvanced ? "← Volver al Ingreso por Perfiles" : "Ingreso Avanzado (Soporte)"}
          </button>

          <p className="text-center text-[10px] text-zinc-600 mt-6 tracking-wide">
            ALCO Servicio Gastro Bar v1.1.0 • Control y Gestión Multisede
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockDb, Sede, Venta, Producto } from '@/lib/supabaseClient';

export default function SuperAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // Formulario nueva Sede
  const [nombreSede, setNombreSede] = useState('');
  const [direccionSede, setDireccionSede] = useState('');

  // Formulario nuevo Admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Guard de Sesión para Super Admin
    const sessionStr = localStorage.getItem('alico_session');
    if (!sessionStr) {
      router.replace('/login');
      return;
    }

    try {
      const session = JSON.parse(sessionStr);
      if (session.role !== 'super_admin') {
        router.replace('/login');
        return;
      }
      setUserName(session.nombre);
    } catch (e) {
      localStorage.removeItem('alico_session');
      router.replace('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = () => {
    setSedes(mockDb.getSedes());
    setVentas(mockDb.getVentas());
    setProductos(mockDb.getProductos());
  };

  const handleLogout = () => {
    localStorage.removeItem('alico_session');
    router.replace('/login');
  };

  // 1. CREAR NUEVA SEDE
  const handleCreateSede = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nombreSede.trim() || !direccionSede.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    try {
      const newSede = mockDb.addSede({
        nombre: nombreSede,
        direccion: direccionSede
      });

      // Crear mesas por defecto para la nueva sede en el localStorage
      const allMesas = mockDb.getMesas();
      const defaultMesas = [
        { id: 'm-' + Date.now() + '-1', sede_id: newSede.id, numero_mesa: 'Mesa 1', estado: 'DISPONIBLE' as const, cliente_nombre: '', consumos: [] },
        { id: 'm-' + Date.now() + '-2', sede_id: newSede.id, numero_mesa: 'Mesa 2', estado: 'DISPONIBLE' as const, cliente_nombre: '', consumos: [] },
        { id: 'm-' + Date.now() + '-3', sede_id: newSede.id, numero_mesa: 'Mesa 3', estado: 'DISPONIBLE' as const, cliente_nombre: '', consumos: [] },
        { id: 'm-' + Date.now() + '-4', sede_id: newSede.id, numero_mesa: 'Barra Asientos', estado: 'DISPONIBLE' as const, cliente_nombre: '', consumos: [] }
      ];
      localStorage.setItem('alico_mesas', JSON.stringify([...allMesas, ...defaultMesas]));

      setSuccessMsg(`¡Sede "${nombreSede}" creada con éxito junto con 4 mesas predeterminadas!`);
      setNombreSede('');
      setDireccionSede('');
      loadData();
      
      // Emitir cambio de sede global por seguridad
      window.dispatchEvent(new Event('sedeChanged'));
    } catch (err) {
      setErrorMsg('Error al agregar sede.');
    }
  };

  // 2. CREAR CUENTA ADMIN (Simulado)
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!adminEmail.trim() || !adminNombre.trim()) {
      setErrorMsg('Por favor rellena el formulario.');
      return;
    }

    setSuccessMsg(`¡Admin "${adminNombre}" creado en el sistema! Se le ha asignado acceso a las sedes.`);
    setAdminEmail('');
    setAdminNombre('');
    setAdminPassword('admin123');
  };

  // 3. INYECTOR SIMULADO DE VENTAS PARA AUDITORÍA
  const handleInjectMockVentas = () => {
    if (sedes.length === 0) return;
    setErrorMsg('');
    setSuccessMsg('');

    const randomSede = sedes[Math.floor(Math.random() * sedes.length)];
    const montosSimulados = [45000, 89000, 120000, 35000, 240000];
    const monto = montosSimulados[Math.floor(Math.random() * montosSimulados.length)];
    const cajeros = ['Cajero Automático', 'Diana Barra', 'Juan Sede Centro'];
    const cajero = cajeros[Math.floor(Math.random() * cajeros.length)];
    const metodos = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'] as const;
    const metodo = metodos[Math.floor(Math.random() * metodos.length)];

    mockDb.registrarVenta({
      sede_id: randomSede.id,
      cliente_nombre: 'Cliente Simulación',
      total: monto,
      metodo_pago: metodo,
      atendido_por: cajero,
      es_directa: false, // Evitar descontar stock real para la simulación
      items: [
        { producto_id: 'p-sim', nombre: 'Pack Licores Importados (Simulación)', cantidad: 1, precio_unitario: monto }
      ]
    });

    setSuccessMsg(`¡Inyectada Venta simulada de $${monto.toLocaleString('es-CO')} en "${randomSede.nombre}"!`);
    loadData();
    
    // Disparar sincronización
    window.dispatchEvent(new Event('sedeChanged'));
  };

  // Totales consolidados de todas las sedes
  const totalRecaudadoConsolidado = ventas.reduce((s, v) => s + v.total, 0);
  const totalProductosConsolidado = productos.length;

  return (
    <div className="min-h-screen bg-[#020205] text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Panel */}
        <header className="glass-panel border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500/20 via-amber-500/40 to-transparent"></div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black tracking-widest bg-amber-500 text-black px-2.5 py-0.5 rounded-lg uppercase">
                Owner Console
              </span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Control Multisede Global
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1.5 font-sans">
              ALCO Gastro Bar • Super Administrador
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Bienvenido creador: <span className="text-amber-500 font-semibold">{userName}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleInjectMockVentas}
              className="px-4 h-9 bg-zinc-950/80 border border-white/10 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7C4.647 9.547 4.6 10.768 4.6 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z" />
              </svg>
              Simular Venta Rápida
            </button>
            <button
              onClick={handleLogout}
              className="px-4 h-9 bg-red-950/20 border border-red-500/25 text-red-400 hover:bg-red-950/40 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
            >
              Cerrar Consola
            </button>
          </div>
        </header>

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs font-semibold animate-fade-in">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-xs font-semibold animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* KPIs Consolidados Globales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sedes Registradas</p>
            <p className="text-2xl font-black text-white mt-2">{sedes.length} Locales</p>
            <span className="text-[9px] text-zinc-400 block mt-2">Puntos de venta físicos del bar</span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Recaudo Global Consolidado</p>
            <p className="text-2xl font-black text-emerald-400 mt-2">${totalRecaudadoConsolidado.toLocaleString('es-CO')}</p>
            <span className="text-[9px] text-emerald-500 block mt-2">Suma de caja de todas las sedes</span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Productos Totales Auditados</p>
            <p className="text-2xl font-black text-amber-500 mt-2">{totalProductosConsolidado} Unidades</p>
            <span className="text-[9px] text-zinc-400 block mt-2">Referencias en catálogos</span>
          </div>
        </div>

        {/* Formularios y Listado de Sedes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Lado Izquierdo (2 spans): Sedes e Historial Consolidadas */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Listado de Sedes */}
            <div className="glass-card rounded-2xl p-5 border border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest pb-3 border-b border-white/5 mb-4">
                Sedes y Sucursales en Operación
              </h3>
              
              <div className="space-y-3">
                {sedes.map((s) => {
                  const ventasSede = ventas.filter(v => v.sede_id === s.id);
                  const totalSede = ventasSede.reduce((sum, v) => sum + v.total, 0);

                  return (
                    <div key={s.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white">{s.nombre}</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">{s.direccion}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-black text-emerald-400">
                            ${totalSede.toLocaleString('es-CO')}
                          </p>
                          <p className="text-[9px] text-zinc-500 mt-0.5 font-semibold">
                            {ventasSede.length} ventas procesadas
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            // Cambiar a la sede en el localStorage y entrar como Admin
                            localStorage.setItem('alico_active_sede', s.id);
                            const mockAdminSession = {
                              email: 'admin@alicobar.com',
                              role: 'admin',
                              nombre: 'Diana Administradora',
                              timestamp: Date.now()
                            };
                            localStorage.setItem('alico_session', JSON.stringify(mockAdminSession));
                            router.push('/dashboard');
                            // Disparar sincronización
                            window.dispatchEvent(new Event('sedeChanged'));
                          }}
                          className="h-8 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black rounded-lg transition-all"
                        >
                          Entrar POS
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Historial Consolidado de Ventas Globales */}
            <div className="glass-card rounded-2xl p-5 border border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest pb-3 border-b border-white/5 mb-4">
                Historial de Transacciones Globales
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-black/20">
                      <th className="py-2.5 px-2">Sede</th>
                      <th className="py-2.5 px-2">Fecha & Hora</th>
                      <th className="py-2.5 px-2">Atendido Por</th>
                      <th className="py-2.5 px-2 text-center">Método</th>
                      <th className="py-2.5 px-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ventas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-zinc-600 font-semibold">
                          Ninguna venta facturada en el sistema.
                        </td>
                      </tr>
                    ) : (
                      ventas.slice(0, 10).map((v) => {
                        const sede = sedes.find(s => s.id === v.sede_id);
                        const fecha = new Date(v.fecha_hora);
                        const fechaStr = fecha.toLocaleDateString('es-CO') + ' ' + fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

                        return (
                          <tr key={v.id} className="text-[11px] text-zinc-300">
                            <td className="py-2.5 px-2 font-bold text-white max-w-[120px] truncate">{sede?.nombre || 'Sede Eliminada'}</td>
                            <td className="py-2.5 px-2 font-mono text-[10px] text-zinc-500">{fechaStr}</td>
                            <td className="py-2.5 px-2 text-zinc-400 font-medium">{v.atendido_por}</td>
                            <td className="py-2.5 px-2 text-center text-[10px]">
                              <span className="bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded text-zinc-400">
                                {v.metodo_pago}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-black text-emerald-400">${v.total.toLocaleString('es-CO')}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Lado Derecho (1 span): Formularios de Creación */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Formulario Crear Sede */}
            <div className="glass-card rounded-2xl p-5 border border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest pb-3 border-b border-white/5 mb-4">
                Provisionar Sede (Local)
              </h3>
              
              <form onSubmit={handleCreateSede} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Nombre del Local
                  </label>
                  <input
                    type="text"
                    required
                    value={nombreSede}
                    onChange={(e) => setNombreSede(e.target.value)}
                    placeholder="Ej. Alico VIP Club"
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Dirección Física
                  </label>
                  <input
                    type="text"
                    required
                    value={direccionSede}
                    onChange={(e) => setDireccionSede(e.target.value)}
                    placeholder="Ej. Calle 85 # 11-20"
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-9 rounded-lg btn-gold text-xs font-bold transition-all"
                >
                  Registrar Nueva Sede
                </button>
              </form>
            </div>

            {/* Formulario Asignar Admin Sede */}
            <div className="glass-card rounded-2xl p-5 border border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest pb-3 border-b border-white/5 mb-4">
                Crear Cliente / Administrador
              </h3>
              
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={adminNombre}
                    onChange={(e) => setAdminNombre(e.target.value)}
                    placeholder="Ej. Andrés Gómez"
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Email de Ingreso
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@alicobar.com"
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Contraseña por defecto
                  </label>
                  <input
                    type="password"
                    required
                    disabled
                    value={adminPassword}
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-zinc-500 opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-9 rounded-lg btn-gold text-xs font-bold transition-all"
                >
                  Provisionar Acceso Admin
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

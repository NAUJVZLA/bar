'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockDb, Sede, Venta, Producto, getMockData } from '@/lib/supabaseClient';

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
  const [adminPassword, setAdminPassword] = useState('jccg2105');

  // Formulario cambio contraseñas
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newSuperPassword, setNewSuperPassword] = useState('');

  // Estados del Modal de Confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'clear' | null>(null);
  const [confirmText, setConfirmText] = useState('');

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
    setAdminPassword('jccg2105');
  };

  // ==============================================================
  // ACCIÓN: CAMBIAR LA CONTRASEÑA DEL ADMINISTRADOR DE SEDE (POS)
  // Guarda el nuevo valor en localStorage para que el Login lo lea de inmediato.
  // ==============================================================
  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!newAdminPassword.trim()) {
      setErrorMsg('La contraseña no puede estar vacía.');
      return;
    }
    // Guarda la contraseña de forma dinámica en localStorage
    localStorage.setItem('alico_admin_password', newAdminPassword.trim());
    setSuccessMsg('Contraseña del Administrador actualizada con éxito.');
    setNewAdminPassword('');
  };

  // ==============================================================
  // ACCIÓN: CAMBIAR LA CONTRASEÑA DEL PROPIETARIO (SUPER ADMINISTRADOR)
  // Guarda el nuevo valor en localStorage para restringir el acceso a esta consola.
  // ==============================================================
  const handleChangeSuperPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!newSuperPassword.trim()) {
      setErrorMsg('La contraseña no puede estar vacía.');
      return;
    }
    // Guarda la clave en el almacenamiento del cliente
    localStorage.setItem('alico_super_password', newSuperPassword.trim());
    setSuccessMsg('Contraseña del Super Administrador actualizada con éxito.');
    setNewSuperPassword('');
  };

  // ==============================================================
  // ACCIÓN: EJECUTAR ACCIÓN EN LA BASE DE DATOS (ZONA DE PELIGRO)
  // Se gatilla tras la validación exitosa del texto de confirmación "BORRAR".
  // ==============================================================
  const handleExecuteDbAction = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    // Validación estricta del texto de control de seguridad
    if (confirmText !== 'BORRAR') {
      setErrorMsg('Texto de confirmación incorrecto. Escribe BORRAR en mayúsculas.');
      setShowConfirmModal(false);
      setConfirmText('');
      return;
    }

    try {
      // 1. Caso: Cargar Demo de Fábrica (Tablas de prueba sembradas)
      if (confirmAction === 'reset') {
        await (mockDb as any).resetDbToDemo();
        setSuccessMsg('Base de datos restablecida a la Demo de Fábrica con éxito.');
      } 
      // 2. Caso: Vaciar Base de Datos (Limpieza completa)
      else if (confirmAction === 'clear') {
        await (mockDb as any).clearAllData();
        setSuccessMsg('Base de datos vaciada por completo con éxito.');
      }
      
      // Recargar datos en la UI de inmediato
      loadData();
      
      // Disparar evento global para re-renderizar todas las sedes y dashboards abiertos
      window.dispatchEvent(new Event('sedeChanged'));
    } catch (err) {
      setErrorMsg('Ocurrió un error al procesar la acción en la base de datos.');
    } finally {
      // Resetear estados de modales de confirmación
      setShowConfirmModal(false);
      setConfirmAction(null);
      setConfirmText('');
    }
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

  // ==============================================================
  // ACCIÓN: EXPORTAR Y DESCARGAR RESPALDO CONTABLE GENERAL (JSON)
  // Compila todo el estado sincronizado y descarga un archivo físico
  // ==============================================================
  const handleDownloadBackup = () => {
    try {
      const data = getMockData();
      const filename = `ALCO-JCCG_POS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setSuccessMsg('¡Copia de seguridad externa descargada con éxito!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Error al generar la copia de seguridad.');
    }
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
              ALCO-JCCG Gastro Bar • Super Administrador
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
              onClick={handleDownloadBackup}
              className="px-4 h-9 bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer animate-fade-in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Descargar Respaldo JSON
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
                              nombre: 'Administrador',
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

        {/* Sección: Base de Datos & Seguridad */}
        <section className="glass-panel border border-white/5 rounded-2xl p-6 relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500/20 via-red-500/40 to-transparent"></div>
          
          <div>
            <span className="text-[10px] font-black tracking-widest bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-lg uppercase border border-red-500/20">
              Seguridad & Mantenimiento
            </span>
            <h2 className="text-lg font-black text-white mt-2 font-sans flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Base de Datos & Control de Accesos
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Administración de contraseñas globales del sistema y purga/restablecimiento de registros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cambiar Clave Admin */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Clave Administrador (POS)</h3>
              </div>
              <form onSubmit={handleChangeAdminPassword} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Ej. admin2026*"
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black transition-all"
                >
                  Actualizar Clave Admin
                </button>
              </form>
            </div>

            {/* Cambiar Clave Super Admin */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Clave Propietario (Super Admin)</h3>
              </div>
              <form onSubmit={handleChangeSuperPassword} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    value={newSuperPassword}
                    onChange={(e) => setNewSuperPassword(e.target.value)}
                    placeholder="Ej. super2026*"
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black transition-all"
                >
                  Actualizar Clave Super
                </button>
              </form>
            </div>

            {/* Danger Zone: Database Controls */}
            <div className="glass-card rounded-2xl p-5 border border-red-500/20 bg-red-950/5 space-y-4">
              <div className="flex items-center gap-2 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xs font-black uppercase tracking-wider">Zona de Peligro (Base de Datos)</h3>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Estas acciones modifican permanentemente los datos del sistema. Úsalas con extrema precaución.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setConfirmAction('reset');
                    setShowConfirmModal(true);
                  }}
                  className="w-full h-8 rounded-lg border border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/5 text-amber-400 text-[10px] font-black transition-all cursor-pointer"
                >
                  Restablecer Demo de Fábrica
                </button>
                <button
                  onClick={() => {
                    setConfirmAction('clear');
                    setShowConfirmModal(true);
                  }}
                  className="w-full h-8 rounded-lg bg-red-950/40 hover:bg-red-900/30 border border-red-500/35 text-red-400 text-[10px] font-black transition-all cursor-pointer"
                >
                  Vaciar Base de Datos
                </button>
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Modal de Confirmación de Seguridad */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card border border-red-500/25 shadow-2xl shadow-red-500/5 rounded-3xl p-6 md:p-8 w-full max-w-sm relative overflow-hidden bg-[#06060c]/95 text-center">
            
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none bg-red-500"></div>

            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center border bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">¿Estás absolutamente seguro?</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              {confirmAction === 'reset' 
                ? 'Esto restablecerá la base de datos a sus valores iniciales de prueba (perderás todas las ventas y cambios recientes).' 
                : 'Esta acción borrará todos los productos, ventas, movimientos y transacciones. La base de datos quedará en blanco.'}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-left mb-1.5 pl-1">
                  Escribe <span className="text-red-400 font-black">BORRAR</span> en mayúsculas para confirmar:
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="BORRAR"
                  className="w-full h-10 px-3 rounded-xl glass-input text-xs text-white text-center font-bold tracking-widest focus:ring-red-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleExecuteDbAction}
                  disabled={confirmText !== 'BORRAR'}
                  className="w-full h-10 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-red-500 text-black text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/10 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Confirmar y Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                    setConfirmText('');
                  }}
                  className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

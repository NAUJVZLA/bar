'use client';

import { useState, useEffect } from 'react';
import { mockDb, Producto, Refrigerio } from '@/lib/supabaseClient';

export default function RefrigeriosPage() {
  const [activeSedeId, setActiveSedeId] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [refrigerios, setRefrigerios] = useState<Refrigerio[]>([]);
  const [cargando, setCargando] = useState(true);

  // Formulario
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [empleadoNombre, setEmpleadoNombre] = useState('');
  const [notas, setNotas] = useState('');
  const [stockInfo, setStockInfo] = useState<{ actual: number; minimo: number; esCritico: boolean } | null>(null);

  // Filtros e Historial
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('todos'); // todos, hoy, semana
  const [errorForm, setErrorForm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Inicialización y Carga de Datos
  const loadData = () => {
    const activeSede = localStorage.getItem('alico_active_sede') || 'sede-norte';
    setActiveSedeId(activeSede);

    // Cargar Catálogo de Productos y Comidas de la Sede
    const prods = mockDb.getProductos(activeSede);
    setProductos(prods);

    // Cargar Historial de Refrigerios
    const refs = mockDb.getRefrigerios(activeSede);
    setRefrigerios(refs);

    setCargando(false);
  };

  useEffect(() => {
    loadData();

    const handleSedeChange = () => {
      loadData();
    };

    const handleCloudSync = () => {
      loadData();
    };

    window.addEventListener('sedeChanged', handleSedeChange);
    window.addEventListener('cloudSync', handleCloudSync);

    return () => {
      window.removeEventListener('sedeChanged', handleSedeChange);
      window.removeEventListener('cloudSync', handleCloudSync);
    };
  }, []);

  // 2. Monitorear el stock del producto seleccionado en el formulario
  useEffect(() => {
    if (!productoId) {
      setStockInfo(null);
      return;
    }
    const prod = productos.find(p => p.id === productoId);
    if (prod) {
      setStockInfo({
        actual: prod.stock_actual,
        minimo: prod.stock_minimo,
        esCritico: prod.stock_actual <= prod.stock_minimo
      });
    } else {
      setStockInfo(null);
    }
  }, [productoId, productos]);

  // 3. Manejo del Envío del Formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');
    setSuccessMsg('');

    if (!productoId) {
      setErrorForm('Por favor selecciona un producto o comida.');
      return;
    }
    if (cantidad <= 0) {
      setErrorForm('La cantidad debe ser mayor a 0.');
      return;
    }
    if (!empleadoNombre.trim()) {
      setErrorForm('Por favor escribe el nombre del empleado.');
      return;
    }

    const prod = productos.find(p => p.id === productoId);
    if (!prod) {
      setErrorForm('El producto seleccionado no es válido.');
      return;
    }

    if (prod.stock_actual < cantidad) {
      setErrorForm(`Stock insuficiente. Solo quedan ${prod.stock_actual} unidades de ${prod.nombre}.`);
      return;
    }

    try {
      // Registrar en DB
      mockDb.registrarRefrigerio({
        sede_id: activeSedeId,
        producto_id: productoId,
        producto_nombre: prod.nombre,
        cantidad: cantidad,
        empleado_nombre: empleadoNombre.trim(),
        notas: notas.trim() || undefined
      });

      // Recargar localmente
      loadData();

      // Limpiar Formulario
      setProductoId('');
      setCantidad(1);
      setEmpleadoNombre('');
      setNotas('');
      setStockInfo(null);

      setSuccessMsg('Refrigerio registrado con éxito y stock actualizado.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorForm(err.message || 'Error registrando el refrigerio.');
    }
  };

  // 4. Métricas KPIs
  const getKpis = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const refsHoy = refrigerios.filter(r => r.fecha_hora.startsWith(hoy));
    const totalHoy = refsHoy.reduce((acc, curr) => acc + curr.cantidad, 0);

    // Calcular Producto Más Solicitado
    const conteoProds: { [key: string]: { nombre: string; cant: number } } = {};
    refrigerios.forEach(r => {
      if (!conteoProds[r.producto_id]) {
        conteoProds[r.producto_id] = { nombre: r.producto_nombre, cant: 0 };
      }
      conteoProds[r.producto_id].cant += r.cantidad;
    });

    let topProducto = 'Ninguno';
    let maxCant = 0;
    Object.values(conteoProds).forEach(item => {
      if (item.cant > maxCant) {
        maxCant = item.cant;
        topProducto = item.nombre;
      }
    });

    // Productos Críticos en Stock debido a consumo
    const criticosCount = productos.filter(p => p.stock_actual <= p.stock_minimo).length;

    return {
      totalHoy,
      topProducto: maxCant > 0 ? `${topProducto} (${maxCant} uds)` : 'Ninguno',
      criticosCount
    };
  };

  const kpis = getKpis();

  // 5. Historial Filtrado
  const getHistorialFiltrado = () => {
    let list = [...refrigerios];

    // Búsqueda por Empleado o Producto
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(r =>
        r.empleado_nombre.toLowerCase().includes(q) ||
        r.producto_nombre.toLowerCase().includes(q)
      );
    }

    // Filtro por Fecha
    const ahora = new Date();
    if (filtroFecha === 'hoy') {
      const hoyStr = ahora.toISOString().split('T')[0];
      list = list.filter(r => r.fecha_hora.startsWith(hoyStr));
    } else if (filtroFecha === 'semana') {
      const haceSieteDias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      list = list.filter(r => new Date(r.fecha_hora) >= haceSieteDias);
    }

    return list;
  };

  const historialFiltrado = getHistorialFiltrado();

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
        <p className="mt-4 text-xs font-semibold text-zinc-400">Cargando módulo de refrigerios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513c0 .9.517 1.726 1.307 2.15 1.493.8 3.16 1.229 4.693 1.229s3.2-.43 4.693-1.229c.79-.424 1.307-1.25 1.307-2.15v-2.513c0-1.135-.845-2.098-1.976-2.192A48.624 48.624 0 0012 8.25zM12 2.25V5.25" />
              </svg>
            </span>
            Historial de Refrigerios & Consumo Interno
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Módulo de auditoría para registrar y monitorear el consumo de alimentos y bebidas del personal de servicio.
          </p>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-black/40 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Consumo Total de Hoy</span>
            <span className="text-xl font-extrabold text-white">{kpis.totalHoy} unidades</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-black/40 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
            </svg>
          </div>
          <div className="truncate flex-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Producto Más Solicitado</span>
            <span className="text-sm font-extrabold text-white block truncate">{kpis.topProducto}</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-black/40 flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpis.criticosCount > 0 ? 'bg-red-500/10 text-red-400 animate-pulse' : 'bg-zinc-500/10 text-zinc-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Alertas de Stock Crítico</span>
            <span className="text-xl font-extrabold text-white">{kpis.criticosCount} productos</span>
          </div>
        </div>
      </div>

      {/* REGISTRATION FORM & HISTORY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* FORM PANEL */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-black/40 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              Registrar Consumo
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Resta el stock físico y lo audita automáticamente en el kárdex.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Producto / Comida Select */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Producto o Comida *
              </label>
              <select
                value={productoId}
                onChange={e => setProductoId(e.target.value)}
                className="w-full bg-[#07070a] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="">-- Selecciona el ítem consumido --</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.categoria}) - Stock: {p.stock_actual} uds
                  </option>
                ))}
              </select>
            </div>

            {/* Cantidad & Stock status info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={e => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#07070a] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {stockInfo && (
                <div className="p-2 bg-[#07070a] border border-white/5 rounded-xl flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">Stock Actual</span>
                  <span className={`text-sm font-extrabold ${stockInfo.esCritico ? 'text-red-400' : 'text-emerald-400'}`}>
                    {stockInfo.actual} unidades
                  </span>
                  <span className="text-[8px] text-zinc-600 block">Min: {stockInfo.minimo}</span>
                </div>
              )}
            </div>

            {/* Empleado Name Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Empleado / Colaborador *
              </label>
              <input
                type="text"
                value={empleadoNombre}
                onChange={e => setEmpleadoNombre(e.target.value)}
                placeholder="Ej. Juan Barman, Diana Cocinera"
                className="w-full bg-[#07070a] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              
              {/* Notas Input */}
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-2">
                Notas (Opcional)
              </label>
              <input
                type="text"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Ej. Consumo durante turno noche"
                className="w-full bg-[#07070a] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />

              {errorForm && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-semibold text-red-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0 animate-ping"></span>
                  {errorForm}
                </div>
              )}
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-semibold text-emerald-400 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                {successMsg}
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs transition-all shadow-md shadow-amber-500/10 hover:shadow-lg cursor-pointer"
            >
              Registrar Descuento de Stock
            </button>
          </form>
        </div>

        {/* HISTORY LIST PANEL */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-black/40 lg:col-span-2 space-y-4 min-h-[50vh]">
          {/* BARRA DE FILTROS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                Historial de Consumos
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Auditoría en vivo de snacks consumidos en la sede activa.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Búsqueda */}
              <input
                type="text"
                placeholder="Buscar empleado o item..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="bg-[#07070a] border border-white/10 rounded-xl py-1.5 px-3 text-[11px] text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 w-full sm:w-44"
              />

              {/* Filtro Fecha */}
              <select
                value={filtroFecha}
                onChange={e => setFiltroFecha(e.target.value)}
                className="bg-[#07070a] border border-white/10 rounded-xl py-1.5 px-3 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="todos">Cualquier Fecha</option>
                <option value="hoy">Sólo Hoy</option>
                <option value="semana">Últimos 7 días</option>
              </select>
            </div>
          </div>

          {/* TABLA DE AUDITORÍA */}
          {historialFiltrado.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 border border-dashed border-white/5 rounded-2xl bg-black/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-zinc-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <div>
                <p className="text-xs font-bold text-zinc-400">No se encontraron refrigerios</p>
                <p className="text-[10px] text-zinc-600">Registra un nuevo consumo o cambia los criterios de búsqueda.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#07070a]/50 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <th className="py-3.5 px-4">Fecha & Hora</th>
                    <th className="py-3.5 px-4">Colaborador</th>
                    <th className="py-3.5 px-4">Producto / Comida</th>
                    <th className="py-3.5 px-4 text-center">Cantidad</th>
                    <th className="py-3.5 px-4">Detalle / Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] text-zinc-300">
                  {historialFiltrado.map((item) => {
                    const dateObj = new Date(item.fecha_hora);
                    const formattedDate = dateObj.toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                    });
                    const formattedTime = dateObj.toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 text-zinc-400">
                          <span className="font-bold text-white block">{formattedDate}</span>
                          <span className="text-[9px] text-zinc-500">{formattedTime}</span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-white">
                          {item.empleado_nombre}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-500">
                          {item.producto_nombre}
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-white">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {item.cantidad} uds
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-[10px] text-zinc-400 italic" title={item.notas}>
                          {item.notas || <span className="text-zinc-600">Sin observaciones</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

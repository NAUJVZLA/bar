'use client';

import { useState, useEffect } from 'react';
import { mockDb, Producto, Movimiento } from '@/lib/supabaseClient';

export default function InventarioPage() {
  const [activeSedeId, setActiveSedeId] = useState('');
  const [activeTab, setActiveTab] = useState<'stock' | 'movimientos' | 'categorias'>('stock');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS');
  const [tipoMovFiltro, setTipoMovFiltro] = useState('TODOS');

  // Modal para agregar/editar producto
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProd, setSelectedProd] = useState<Producto | null>(null);
  
  // Formulario Producto
  const [nombre, setNombre] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [categoria, setCategoria] = useState('Cervezas');
  const [precioCompra, setPrecioCompra] = useState(0);
  const [precioVenta, setPrecioVenta] = useState(0);
  const [stockActual, setStockActual] = useState(0);
  const [stockMinimo, setStockMinimo] = useState(5);
  const [registradoPor, setRegistradoPor] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Formulario Nueva Categoría
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [catErrorMsg, setCatErrorMsg] = useState('');
  const [catSuccessMsg, setCatSuccessMsg] = useState('');

  // Creación rápida inline
  const [isCreatingCategoryInline, setIsCreatingCategoryInline] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState('');

  const loadSedeData = () => {
    const currentSedeId = localStorage.getItem('alico_active_sede') || 'sede-norte';
    setActiveSedeId(currentSedeId);
    setProductos(mockDb.getProductos(currentSedeId));
    setMovimientos(mockDb.getMovimientos(currentSedeId));
    setCategorias(mockDb.getCategorias());
  };

  useEffect(() => {
    loadSedeData();

    // Sincronizar reactivamente al cambiar de sede
    const handleSedeChange = () => {
      loadSedeData();
      closeModal();
    };
    window.addEventListener('sedeChanged', handleSedeChange);
    return () => window.removeEventListener('sedeChanged', handleSedeChange);
  }, []);

  const closeModal = () => {
    setShowProductModal(false);
    setSelectedProd(null);
    setNombre('');
    setCodigoBarras('');
    setCategoria(categorias[0] || 'Varios');
    setPrecioCompra(0);
    setPrecioVenta(0);
    setStockActual(0);
    setStockMinimo(5);
    setRegistradoPor('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsCreatingCategoryInline(false);
    setInlineCategoryName('');
  };

  const handleAddProductClick = () => {
    setSelectedProd(null);
    setCategoria(categorias[0] || 'Varios');
    setShowProductModal(true);
  };

  const handleEditProductClick = (prod: Producto) => {
    setSelectedProd(prod);
    setNombre(prod.nombre);
    setCodigoBarras(prod.codigo_barras);
    setCategoria(prod.categoria);
    setPrecioCompra(prod.precio_compra);
    setPrecioVenta(prod.precio_venta);
    setStockActual(prod.stock_actual);
    setStockMinimo(prod.stock_minimo);
    setShowProductModal(true);
    setIsCreatingCategoryInline(false);
    setInlineCategoryName('');
  };

  const handleDeleteProductClick = (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) return;
    
    mockDb.deleteProducto(id);
    setSuccessMsg('Producto eliminado con éxito.');
    loadSedeData();
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatErrorMsg('');
    setCatSuccessMsg('');

    const clean = nuevaCatNombre.trim();
    if (!clean) {
      setCatErrorMsg('Por favor escribe un nombre de categoría válido.');
      return;
    }

    if (categorias.some(c => c.toLowerCase() === clean.toLowerCase())) {
      setCatErrorMsg('Esta categoría ya se encuentra registrada.');
      return;
    }

    try {
      mockDb.addCategoria(clean);
      setCatSuccessMsg(`¡Categoría "${clean}" creada con éxito!`);
      setNuevaCatNombre('');
      loadSedeData();
      
      window.dispatchEvent(new Event('sedeChanged'));
      
      setTimeout(() => setCatSuccessMsg(''), 3000);
    } catch (err) {
      setCatErrorMsg('Error al agregar la categoría.');
    }
  };

  const handleDeleteCategory = (catName: string) => {
    const count = productos.filter(p => p.categoria.toLowerCase() === catName.toLowerCase()).length;
    if (count > 0) {
      alert('No puedes eliminar esta categoría porque contiene productos activos.');
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${catName}"?`)) return;

    try {
      mockDb.deleteCategoria(catName);
      setCatSuccessMsg('Categoría eliminada con éxito.');
      loadSedeData();
      
      window.dispatchEvent(new Event('sedeChanged'));
      
      setTimeout(() => setCatSuccessMsg(''), 2000);
    } catch (err) {
      setCatErrorMsg('Error al eliminar la categoría.');
    }
  };

  const handleSaveCategoryInline = () => {
    const clean = inlineCategoryName.trim();
    if (!clean) return;

    if (categorias.some(c => c.toLowerCase() === clean.toLowerCase())) {
      setCategoria(categorias.find(c => c.toLowerCase() === clean.toLowerCase()) || clean);
      setIsCreatingCategoryInline(false);
      setInlineCategoryName('');
      return;
    }

    try {
      mockDb.addCategoria(clean);
      const updatedCats = mockDb.getCategorias();
      setCategorias(updatedCats);
      setCategoria(clean);
      setIsCreatingCategoryInline(false);
      setInlineCategoryName('');
      
      window.dispatchEvent(new Event('sedeChanged'));
    } catch (err) {
      console.error('Error al agregar categoría inline', err);
    }
  };

  const submitProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nombre.trim() || !registradoPor.trim()) {
      setErrorMsg('Por favor rellena todos los campos obligatorios para auditoría.');
      return;
    }

    try {
      mockDb.saveProducto({
        id: selectedProd?.id,
        sede_id: activeSedeId,
        nombre: nombre,
        codigo_barras: codigoBarras || 'SIN-CODIGO',
        categoria: categoria,
        precio_compra: precioCompra,
        precio_venta: precioVenta,
        stock_actual: stockActual,
        stock_minimo: stockMinimo,
        registrado_por: registradoPor
      });

      setSuccessMsg(selectedProd ? '¡Producto actualizado con éxito!' : '¡Producto creado y auditado con éxito!');
      
      // Actualizar datos
      loadSedeData();
      
      // Emitir cambio de sede global para actualizar dashboard
      window.dispatchEvent(new Event('sedeChanged'));
      
      setTimeout(() => closeModal(), 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el formulario.');
    }
  };

  // Categorías de productos únicas
  const categoriasUnicas = ['TODOS', ...categorias];

  // Filtrado de Productos (Tab 1)
  const productosFiltrados = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                          p.codigo_barras.includes(busqueda);
    const matchesCategory = categoriaFiltro === 'TODOS' || p.categoria === categoriaFiltro;
    return matchesSearch && matchesCategory;
  });

  // Filtrado de Movimientos (Tab 2)
  const movimientosFiltrados = movimientos.filter(m => {
    const matchesSearch = m.producto_nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                          m.registrado_por.toLowerCase().includes(busqueda.toLowerCase());
    const matchesType = tipoMovFiltro === 'TODOS' || m.tipo === tipoMovFiltro;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Inventario de Sede</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-1">
            Administra existencias, costos y auditoría de auditorías de bodega.
          </p>
        </div>
        <div>
          <button
            onClick={handleAddProductClick}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-1.5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Añadir Producto
          </button>
        </div>
      </div>

      {/* Tabs de Selección */}
      <div className="flex border-b border-white/5 gap-2">
        <button
          onClick={() => { setActiveTab('stock'); setBusqueda(''); }}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'stock'
              ? 'border-amber-500 text-amber-500 font-extrabold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Control de Existencias
        </button>
        <button
          onClick={() => { setActiveTab('movimientos'); setBusqueda(''); }}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'movimientos'
              ? 'border-amber-500 text-amber-500 font-extrabold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Historial de Movimientos (Auditoría)
        </button>
        <button
          onClick={() => { setActiveTab('categorias'); setBusqueda(''); }}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'categorias'
              ? 'border-amber-500 text-amber-500 font-extrabold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Gestionar Categorías
        </button>
      </div>

      {/* Filtros rápidos y Barra de Búsqueda */}
      {activeTab !== 'categorias' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Buscador Común */}
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={activeTab === 'stock' ? "Buscar por nombre o código de barras..." : "Buscar por producto o responsable..."}
              className="w-full h-10 pl-9 pr-4 rounded-xl glass-input text-xs text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
              </svg>
            </div>
          </div>

          {/* Dropdown Filtro Dinámico */}
          <div>
            {activeTab === 'stock' ? (
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0a0a0c] border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="TODOS">Categoría: Todas</option>
                {categoriasUnicas.filter(c => c !== 'TODOS').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <select
                value={tipoMovFiltro}
                onChange={(e) => setTipoMovFiltro(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0a0a0c] border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="TODOS">Tipo Movimiento: Todos</option>
                <option value="INGRESO">Ingresos (Abastecimientos)</option>
                <option value="EGRESO">Egresos (Ventas / Bajas)</option>
              </select>
            )}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Contenido según la Tab */}
      {activeTab === 'categorias' ? (
        /* ================= TAB 3: GESTIÓN DE CATEGORÍAS ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lado izquierdo: Lista de categorías */}
          <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest pb-3 border-b border-white/5">
              Categorías de Catálogo Registradas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categorias.map(cat => {
                const count = productos.filter(p => p.categoria.toLowerCase() === cat.toLowerCase()).length;
                const canDelete = count === 0;

                return (
                  <div key={cat} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v13.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V10.5m-10.5-6L14.25 9h-4.682" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate max-w-[120px]" title={cat}>{cat}</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-semibold">
                          {count} {count === 1 ? 'producto' : 'productos'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      disabled={!canDelete}
                      className={`p-2 rounded-xl transition-all ${
                        canDelete
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 cursor-pointer'
                          : 'bg-zinc-950/40 text-zinc-600 border border-white/5 cursor-not-allowed'
                      }`}
                      title={canDelete ? "Eliminar categoría" : "Contiene productos activos"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75V4H3a.75.75 0 000 1.5h1v10A2.25 2.25 0 006.25 17.75h7.5A2.25 2.25 0 0016 15.5v-10h1a.75.75 0 000-1.5h-3v-.25A2.75 2.75 0 0011.25 1h-2.5zM8 4h4v-.25a1.25 1.25 0 00-1.25-1.25h-2.5A1.25 1.25 0 008 3.75V4zM5.5 5.5h9v10a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-10z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lado derecho: Formulario de añadir categoría */}
          <div className="lg:col-span-1 glass-card rounded-2xl border border-white/5 p-6 space-y-4 h-fit">
            <h3 className="text-xs font-black text-white uppercase tracking-widest pb-3 border-b border-white/5">
              Crear Nueva Categoría
            </h3>
            
            {catErrorMsg && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400 flex-shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {catErrorMsg}
              </div>
            )}
            
            {catSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-400 flex-shrink-0">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                {catSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  required
                  value={nuevaCatNombre}
                  onChange={(e) => setNuevaCatNombre(e.target.value)}
                  placeholder="Ej. Cócteles, Snacks, Tequilas"
                  className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full h-9 rounded-lg btn-gold text-xs font-bold transition-all cursor-pointer"
              >
                Registrar Categoría
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'stock' ? (
              /* ================= TAB 1: CONTROL DE STOCK ================= */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/40 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <th className="py-3.5 px-4">Código</th>
                    <th className="py-3.5 px-4">Categoría</th>
                    <th className="py-3.5 px-4">Producto</th>
                    <th className="py-3.5 px-4 text-right">P. Compra</th>
                    <th className="py-3.5 px-4 text-right">P. Venta</th>
                    <th className="py-3.5 px-4 text-center">Stock Actual</th>
                    <th className="py-3.5 px-4 text-center">Mínimo</th>
                    <th className="py-3.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-500 font-semibold">
                        No hay productos registrados en el inventario.
                      </td>
                    </tr>
                  ) : (
                    productosFiltrados.map((p) => {
                      const isLowStock = p.stock_actual <= p.stock_minimo;
                      const isOutOfStock = p.stock_actual <= 0;

                      return (
                        <tr key={p.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10px] text-zinc-500">{p.codigo_barras}</td>
                          <td className="py-3 px-4">
                            <span className="bg-zinc-900 border border-white/5 text-zinc-400 text-[9px] font-bold py-0.5 px-2 rounded-md">
                              {p.categoria}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white font-semibold">{p.nombre}</td>
                          <td className="py-3 px-4 text-right font-medium">${p.precio_compra.toLocaleString('es-CO')}</td>
                          <td className="py-3 px-4 text-right font-bold text-amber-500">${p.precio_venta.toLocaleString('es-CO')}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-black text-xs py-0.5 px-2.5 rounded-md ${
                              isOutOfStock
                                ? 'bg-red-500 text-black font-extrabold'
                                : isLowStock
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/25 glow-amber animate-pulse'
                                  : 'text-emerald-400'
                            }`}>
                              {p.stock_actual} U.
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-zinc-500">{p.stock_minimo} U.</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditProductClick(p)}
                                className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                                title="Editar / Ajustar Stock"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.155 1.262a.5.5 0 01-.65-.65z" />
                                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10a.75.75 0 000-1.5H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteProductClick(p.id, p.nombre)}
                                className="p-1.5 rounded-lg bg-red-950/20 border border-red-500/10 hover:bg-red-900/30 text-red-400 hover:text-red-300 cursor-pointer"
                                title="Eliminar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75V4H3a.75.75 0 000 1.5h1v10A2.25 2.25 0 006.25 17.75h7.5A2.25 2.25 0 0016 15.5v-10h1a.75.75 0 000-1.5h-3v-.25A2.75 2.75 0 0011.25 1h-2.5zM8 4h4v-.25a1.25 1.25 0 00-1.25-1.25h-2.5A1.25 1.25 0 008 3.75V4zM5.5 5.5h9v10a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-10z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              /* ================= TAB 2: AUDITORÍA DE BODEGA ================= */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/40 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <th className="py-3.5 px-4">Fecha & Hora</th>
                    <th className="py-3.5 px-4">Producto</th>
                    <th className="py-3.5 px-4 text-center">Tipo</th>
                    <th className="py-3.5 px-4 text-center">Cantidad</th>
                    <th className="py-3.5 px-4">Motivo / Auditoría</th>
                    <th className="py-3.5 px-4">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                  {movimientosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 font-semibold">
                        No se registran movimientos auditados con los criterios de búsqueda.
                      </td>
                    </tr>
                  ) : (
                    movimientosFiltrados.map((m) => {
                      const isIngreso = m.tipo === 'INGRESO';
                      const fecha = new Date(m.fecha_hora);
                      const fechaFormateada = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
                                              ' ' + fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                      return (
                        <tr key={m.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10.5px] text-zinc-500">{fechaFormateada}</td>
                          <td className="py-3 px-4 text-white font-bold">{m.producto_nombre}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[9px] font-black uppercase py-0.5 px-2 rounded-md ${
                              isIngreso
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                : 'bg-red-500/10 text-red-400 border border-red-500/25'
                            }`}>
                              {m.tipo}
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-center font-extrabold ${isIngreso ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isIngreso ? '+' : '-'}{m.cantidad} U.
                          </td>
                          <td className="py-3 px-4 text-zinc-400 max-w-[200px] truncate" title={m.motivo}>
                            {m.motivo}
                          </td>
                          <td className="py-3 px-4 text-zinc-400 font-semibold">{m.registrado_por}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REGISTRAR / EDITAR PRODUCTO (CON HISTORIAL ENCADENADO) */}
      {/* ============================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-40">
          <div className="glass-card rounded-2xl p-6 border border-white/10 max-w-md w-full relative">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              {selectedProd ? `Editar: ${selectedProd.nombre}` : 'Registrar Nuevo Producto'}
            </h3>

            {errorMsg && (
              <div className="p-2.5 rounded bg-red-950/20 border border-red-500/20 text-red-300 text-xs font-semibold mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={submitProductForm} className="space-y-4">
              
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                  Nombre del Producto (Requerido)
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Cerveza Corona Extra 355ml"
                  className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    value={codigoBarras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    placeholder="Ej. 77012345..."
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      Categoría
                    </label>
                    {!isCreatingCategoryInline && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingCategoryInline(true);
                          setInlineCategoryName('');
                        }}
                        className="text-[10px] text-amber-500 hover:text-amber-400 font-extrabold flex items-center gap-0.5 transition-colors cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        + Nueva
                      </button>
                    )}
                  </div>
                  {isCreatingCategoryInline ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Categoría..."
                        value={inlineCategoryName}
                        onChange={(e) => setInlineCategoryName(e.target.value)}
                        className="flex-1 h-9 px-2 rounded-lg glass-input text-xs text-white min-w-0"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveCategoryInline();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSaveCategoryInline}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 cursor-pointer flex-shrink-0 transition-all"
                        title="Guardar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingCategoryInline(false);
                          setInlineCategoryName('');
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 cursor-pointer flex-shrink-0 transition-all"
                        title="Cancelar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full h-9 px-2 rounded-lg bg-[#0a0a0c] border border-white/10 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      {categorias.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    Precio Compra (Costo)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={precioCompra || ''}
                    onChange={(e) => setPrecioCompra(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    Precio Venta (Público)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={precioVenta || ''}
                    onChange={(e) => setPrecioVenta(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockActual || ''}
                    onChange={(e) => setStockActual(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    Stock Mínimo Alerta
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockMinimo || ''}
                    onChange={(e) => setStockMinimo(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="5"
                    className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                  Operador Responsable (Requerido)
                </label>
                <input
                  type="text"
                  required
                  value={registradoPor}
                  onChange={(e) => setRegistradoPor(e.target.value)}
                  placeholder="Tu nombre para auditoría"
                  className="w-full h-9 px-3 rounded-lg glass-input text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-9 rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-lg btn-gold text-xs font-bold transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

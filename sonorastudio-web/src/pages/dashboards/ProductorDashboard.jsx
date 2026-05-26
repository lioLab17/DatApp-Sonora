import { useState, useEffect } from "react";
import { LayoutDashboard, TrendingUp, Receipt, Users, LogOut, Plus, Search, Filter, AlertTriangle, CheckCircle, Clock, MoreVertical, BarChart2, Activity, Star, Cpu, ChevronDown, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function ProductorDashboard({ navigate }) {
  const [tab, setTab] = useState("cola");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  
  const [ingenieroExpandido, setIngenieroExpandido] = useState(null); 
  const [viendoHistorial, setViendoHistorial] = useState(null);
  const [historialIngeniero, setHistorialIngeniero] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  
  const [episodios, setEpisodios] = useState([]);
  const [statsCola, setStatsCola] = useState({ pendientes: 0, enProceso: 0, completados: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [finanzas, setFinanzas] = useState({ ingresos_mes: 0, cuentas_por_cobrar: 0, facturas_pendientes: 0 });

  // --- ESTADOS DINÁMICOS PARA BUSINESS INTELLIGENCE Y EQUIPO ---
  const [biTendenciaAnual, setBiTendenciaAnual] = useState([]);
  const [biTopClientes, setBiTopClientes] = useState([]);
  const [biDistribucionServicios, setBiDistribucionServicios] = useState([]);
  const [equipoTecnico, setEquipoTecnico] = useState([]);
  
  const COLORES_PIE = ["#D94667", "#8E0B2B", "#4A0011", "#1A0006"]; // Añadí un color oscuro extra por si hay más de 3 servicios

  // Efecto: Cargar Datos BI y Finanzas al inicio de forma concurrente
  useEffect(() => {
    // 1. Cargar Finanzas
    fetch('http://127.0.0.1:8000/api/dashboard/finanzas')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setFinanzas(data))
      .catch(err => console.error("Error cargando finanzas:", err));

    // 2. Cargar Gráficos y Equipo Técnico en paralelo (Súper rápido)
    Promise.all([
      fetch('http://127.0.0.1:8000/api/dashboard/bi/tendencia').then(res => res.ok ? res.json() : []),
      fetch('http://127.0.0.1:8000/api/dashboard/bi/top-clientes').then(res => res.ok ? res.json() : []),
      fetch('http://127.0.0.1:8000/api/dashboard/bi/distribucion').then(res => res.ok ? res.json() : []),
      fetch('http://127.0.0.1:8000/api/dashboard/bi/equipo').then(res => res.ok ? res.json() : [])
    ])
    .then(([tendencia, topClientes, distribucion, equipo]) => {
      setBiTendenciaAnual(tendencia);
      setBiTopClientes(topClientes);
      setBiDistribucionServicios(distribucion);
      setEquipoTecnico(equipo);
    })
    .catch(err => console.error("Error cargando BI:", err));
  }, []);

  // Efecto: Carga la tabla de Producción y responde a búsquedas
  useEffect(() => {
    setCargando(true);

    const delayDebounceFn = setTimeout(() => {
      const parametros = new URLSearchParams({
        filtro_estado: filtroEstado,
        busqueda: busqueda
      });

      fetch(`http://127.0.0.1:8000/api/dashboard/productor?${parametros.toString()}`)
        .then((response) => {
          if (!response.ok) throw new Error('Error de conexión con el servidor (FastAPI)');
          return response.json();
        })
        .then((data) => {
          const datosFormateados = data.map(item => ({
            id: `PRY-${item.id_proyecto}`,
            proyecto: item.nombre_proyecto,
            cliente_ruc: item.ruc_cliente,
            cliente_nombre: item.nombre_cliente,
            episodios_totales: item.total_episodios,
            estado: item.total_episodios > 0 ? "Mezclando" : "En Bruto", 
            ingeniero: item.nombre_cliente || "Sin Asignar",
            qcAlerta: item.total_episodios > 5 ? "Revisar Volumen" : null
          }));
          
          setEpisodios(datosFormateados);
          
          if (filtroEstado === "Todos" && busqueda === "") {
              setStatsCola({
                  pendientes: datosFormateados.filter(ep => ep.estado === "En Bruto").length,
                  enProceso: datosFormateados.filter(ep => ep.estado === "Mezclando" || ep.estado === "Revisión").length,
                  completados: datosFormateados.filter(ep => ep.estado === "Aprobado").length,
              });
          }
          
          setCargando(false);
        })
        .catch((err) => {
          setError(err.message);
          setCargando(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, filtroEstado]);

  const cargarHistorial = (id_ingeniero) => {
    if (viendoHistorial === id_ingeniero) {
      setViendoHistorial(null);
      return;
    }
    
    setViendoHistorial(id_ingeniero);
    setCargandoHistorial(true);
    
    fetch(`http://127.0.0.1:8000/api/dashboard/ingeniero/${id_ingeniero}`)
      .then((res) => {
        if (!res.ok) throw new Error("Sin proyectos");
        return res.json();
      })
      .then((data) => {
        setHistorialIngeniero(data);
        setCargandoHistorial(false);
      })
      .catch(() => {
        setHistorialIngeniero([]);
        setCargandoHistorial(false);
      });
  };

  const exportarReporteCSV = () => {
    const cabeceras = ["ID Proyecto", "Nombre del Proyecto", "Cliente", "Estado", "Total Episodios Registrados"];

    const filas = episodios.map(ep => [
      ep.id,
      `"${ep.proyecto}"`, 
      `"${ep.cliente_nombre}"`,
      ep.estado,
      ep.episodios_totales
    ]);

    const contenidoCSV = [cabeceras.join(","), ...filas.map(fila => fila.join(","))].join("\n");

    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    
    const fecha = new Date().toISOString().split('T')[0];
    enlace.setAttribute("download", `Reporte_Produccion_${fecha}.csv`);
    
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  };

  const renderEstado = (estado) => {
    const estilos = {
      "En Bruto": "bg-gray-500/10 text-gray-400 border-gray-500/20",
      "Mezclando": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Revisión": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      "Aprobado": "bg-green-500/10 text-green-400 border-green-500/20"
    };
    const Icono = estado === "Aprobado" ? CheckCircle : estado === "En Bruto" ? Clock : LayoutDashboard;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${estilos[estado] || estilos["En Bruto"]}`}>
        <Icono size={12} /> {estado || "En Bruto"}
      </span>
    );
  };

  const elegantTransition = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] };
  const premiumSlide = { duration: 0.7, ease: [0.22, 1, 0.36, 1] }; 
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: elegantTransition }
  };

  return (
    <div className="min-h-screen bg-black flex text-white font-sans antialiased">

      <aside className="w-64 bg-white/[0.01] backdrop-blur-3xl border-r border-white/[0.05] p-6 flex flex-col">
        <div className="mb-10">
          <h2 className="text-xl font-bold tracking-tighter">
            <span className="bg-gradient-to-b from-[#6D001A] via-[#8E0B2B] to-[#6D001A] bg-clip-text text-transparent">Sonora</span>
            <span className="font-light ml-0.5">Studio</span>
          </h2>
          <span className="text-[10px] uppercase text-gray-500 tracking-widest font-semibold mt-1 block">Rol: Administrador</span>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setTab("cola")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-300 ${tab === "cola" ? "bg-[#6D001A]/10 text-white border border-[#6D001A]/20" : "text-gray-400 hover:bg-white/[0.02] border border-transparent"}`}><LayoutDashboard size={18} /> Cola de Trabajo</button>
          <button onClick={() => setTab("finanzas")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-300 ${tab === "finanzas" ? "bg-[#6D001A]/10 text-white border border-[#6D001A]/20" : "text-gray-400 hover:bg-white/[0.02] border border-transparent"}`}><Receipt size={18} /> Facturación</button>
          <button onClick={() => setTab("equipo")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-300 ${tab === "equipo" ? "bg-[#6D001A]/10 text-white border border-[#6D001A]/20" : "text-gray-400 hover:bg-white/[0.02] border border-transparent"}`}><Users size={18} /> Equipo Técnico</button>
        </nav>
        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-gray-400 hover:text-red-400 mt-auto px-4 py-2 transition-colors duration-300"><LogOut size={18} /> Cerrar Sesión</button>
      </aside>

      <main className="flex-1 p-10 bg-gradient-to-tr from-black via-black to-[#6D001A]/5 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          
          {tab === "cola" && (
            <motion.div 
              key="cola" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              transition={elegantTransition}
            >
              <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Control de Producción</h1>
                  <p className="text-gray-500 text-sm uppercase mt-1">Supervisión de Proyectos (Supabase)</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={exportarReporteCSV}
                    className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-300"
                  >
                    <Download size={16} /> Exportar Reporte
                  </button>
                  <button className="flex items-center gap-2 bg-gradient-to-br from-[#6D001A] via-[#8E0B2B] to-[#6D001A] hover:from-[#8E0B2B] hover:to-[#8E0B2B] px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-500 shadow-[0_0_20px_rgba(109,0,26,0.15)]">
                    <Plus size={16} /> Nuevo Proyecto
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/[0.02] border border-gray-500/20 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">En Bruto</p>
                    <p className="text-2xl font-bold text-gray-300">{statsCola.pendientes}</p>
                  </div>
                  <Clock className="text-gray-500" size={24} />
                </div>
                <div className="bg-[#6D001A]/10 border border-[#6D001A]/30 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[#D94667] text-xs uppercase tracking-wider mb-1">En Proceso</p>
                    <p className="text-2xl font-bold text-white">{statsCola.enProceso}</p>
                  </div>
                  <BarChart2 className="text-[#D94667]" size={24} />
                </div>
                <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-green-500/70 text-xs uppercase tracking-wider mb-1">Completados</p>
                    <p className="text-2xl font-bold text-green-400">{statsCola.completados}</p>
                  </div>
                  <CheckCircle className="text-green-500/70" size={24} />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex bg-white/[0.02] border border-white/[0.05] rounded-xl p-1 relative">
                  {["Todos", "Pendientes", "En Proceso", "Completados"].map(filtro => (
                    <button 
                      key={filtro}
                      onClick={() => setFiltroEstado(filtro)}
                      className="relative px-4 py-1.5 rounded-lg text-sm font-medium z-10 outline-none"
                    >
                      {filtroEstado === filtro && (
                        <motion.div 
                          layoutId="filtroActivo" 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={elegantTransition}
                          className="absolute inset-0 bg-white/10 rounded-lg -z-10" 
                        />
                      )}
                      
                      <motion.span
                        initial={false}
                        animate={{ color: filtroEstado === filtro ? "#ffffff" : "#6b7280" }}
                        transition={elegantTransition}
                        className="relative z-10"
                      >
                        {filtro}
                      </motion.span>
                    </button>
                  ))}
                </div>
                
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Buscar proyecto, cliente o ID..." 
                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#8E0B2B]/50 transition-colors duration-300"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              </div>

              <div className="min-h-[400px]"> 
                {cargando ? (
                  <div className="py-20 flex flex-col justify-center items-center h-full">
                      <div className="w-8 h-8 border-4 border-[#6D001A] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400">Procesando consulta en el servidor...</p>
                  </div>
                ) : error ? (
                  <div className="py-20 flex flex-col justify-center items-center bg-red-900/10 border border-red-500/20 rounded-2xl h-full">
                      <AlertTriangle className="text-red-500 mb-2" size={32} />
                      <p className="text-red-400 font-medium">{error}</p>
                      <p className="text-gray-500 text-sm mt-1">Asegúrate de que el servidor FastAPI esté encendido y sin errores.</p>
                  </div>
                ) : (
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                      <thead className="bg-white/[0.02] border-b border-white/[0.05]">
                        <tr className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                          <th className="py-4 px-6">ID</th>
                          <th className="py-4 px-6">Proyecto / Cliente</th>
                          <th className="py-4 px-6">Estado App</th>
                          <th className="py-4 px-6">Episodios</th>
                          <th className="py-4 px-6 text-right">Acción</th>
                        </tr>
                      </thead>
                      
                      <AnimatePresence mode="wait">
                        {episodios.length > 0 ? (
                          <motion.tbody 
                            key={filtroEstado}
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: -20 }} 
                            transition={elegantTransition}
                            className="divide-y divide-white/[0.03]"
                          >
                            {episodios.map((ep) => (
                              <tr key={ep.id} className="hover:bg-white/[0.02] transition-colors duration-300">
                                <td className="py-4 px-6 font-mono text-xs text-gray-500">{ep.id}</td>
                                <td className="py-4 px-6">
                                  <p className="font-medium text-white/90">{ep.proyecto}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{ep.cliente_nombre}</p>
                                </td>
                                <td className="py-4 px-6">{renderEstado(ep.estado)}</td>
                                <td className="py-4 px-6">
                                  <span className={`text-sm ${ep.episodios_totales === 0 ? "text-red-400/80 font-medium" : "text-gray-300"}`}>
                                    {ep.episodios_totales} registrados
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <MoreVertical size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </motion.tbody>
                        ) : (

                          <motion.tbody 
                            key="empty" 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: -20 }} 
                            transition={elegantTransition}
                          >
                            <tr>
                              <td colSpan="6" className="py-16 text-center">
                                <div className="flex flex-col items-center">
                                  <Filter className="text-gray-600 mb-3" size={32} />
                                  <p className="text-gray-400 font-medium">No se encontraron proyectos en la base de datos.</p>
                                </div>
                              </td>
                            </tr>
                          </motion.tbody>
                        )}
                      </AnimatePresence>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {tab === "finanzas" && (
            <motion.div 
              key="finanzas" 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: -20, transition: elegantTransition }}
            >
              <motion.header variants={cardVariant} className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">Facturación y Finanzas</h1>
                <p className="text-gray-500 text-sm uppercase mt-1">Indicadores Comerciales & Business Intelligence</p>
              </motion.header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div variants={cardVariant} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl">
                  <h3 className="text-gray-400 text-sm mb-1">Ingresos del Mes</h3>
                  <p className="text-3xl font-bold text-white">${finanzas.ingresos_mes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-[#8E0B2B] text-xs mt-2 flex items-center gap-1"><TrendingUp size={12}/> Obtenido en tiempo real de Supabase</p>
                </motion.div>
                <motion.div variants={cardVariant} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl">
                  <h3 className="text-gray-400 text-sm mb-1">Cuentas por Cobrar</h3>
                  <p className="text-3xl font-bold text-white">${finanzas.cuentas_por_cobrar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-yellow-500 text-xs mt-2">{finanzas.facturas_pendientes} facturas pendientes de cobro</p>
                </motion.div>
              </div>

              <motion.div variants={cardVariant} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D94667] to-transparent opacity-20"></div>
                <h3 className="text-gray-400 text-sm mb-6">Flujo de Ingresos Anual</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={biTendenciaAnual} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D94667" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#D94667" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="mes" stroke="#3f3f46" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#3f3f46" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <RechartsTooltip 
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#D94667" 
                        strokeWidth={3} 
                        fill="url(#colorGlow)" 
                        animationDuration={2500} 
                        animationEasing="ease-out" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <motion.div variants={cardVariant} className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl">
                  <h3 className="text-gray-400 text-sm mb-6">Top Clientes por Facturación</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={biTopClientes} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="nombre" type="category" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip 
                          cursor={{fill: 'rgba(255,255,255,0.03)'}} 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} 
                          formatter={(value) => [`$${value}`, 'Facturado']}
                        />
                        <Bar 
                          dataKey="facturado" 
                          fill="#8E0B2B" 
                          radius={[0, 4, 4, 0]} 
                          barSize={24}
                          animationDuration={2000} 
                          animationEasing="ease-in-out" 
                        >
                          {biTopClientes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#D94667" : "#8E0B2B"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div variants={cardVariant} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex flex-col">
                  <h3 className="text-gray-400 text-sm mb-2">Distribución (Servicios)</h3>
                  <div className="h-44 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={biDistribucionServicios}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="#000000"
                          strokeWidth={2}
                          animationDuration={2000}
                          animationEasing="ease-out"
                        >
                          {biDistribucionServicios.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORES_PIE[index % COLORES_PIE.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 px-2">
                    {biDistribucionServicios.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(217,70,103,0.4)]" style={{ backgroundColor: COLORES_PIE[index % COLORES_PIE.length] }}></div>
                          {entry.name}
                        </div>
                        <span className="font-medium text-gray-300">${entry.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}

          {/* ==========================================
              NUEVA PESTAÑA: EQUIPO TÉCNICO
          ========================================== */}
          {tab === "equipo" && (
            <motion.div 
              key="equipo" 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: -20, transition: elegantTransition }}
            >
              <motion.header variants={cardVariant} className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Equipo Técnico</h1>
                  <p className="text-gray-500 text-sm uppercase mt-1">Análisis de Rendimiento & Carga Operativa</p>
                </div>
                <button className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-300">
                  <Plus size={16} /> Añadir Ingeniero
                </button>
              </motion.header>

              <div className="grid grid-cols-1 gap-4">
                {equipoTecnico.map((miembro) => {
                  const expandido = ingenieroExpandido === miembro.id;
                  const porcentajeCarga = (miembro.carga / miembro.limite) * 100;
                  
                  let colorEstado = "text-green-400 bg-green-400/10 border-green-400/20";
                  let barraColor = "bg-green-500";
                  if (porcentajeCarga >= 100) {
                    colorEstado = "text-red-400 bg-red-400/10 border-red-400/20";
                    barraColor = "bg-red-500";
                  } else if (porcentajeCarga >= 60) {
                    colorEstado = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
                    barraColor = "bg-yellow-500";
                  }

                  return (
                    <motion.div 
                      key={miembro.id} 
                      layout 
                      variants={cardVariant}
                      className={`bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden transition-colors duration-500 ${expandido ? 'ring-1 ring-[#8E0B2B]/40 bg-white/[0.04]' : 'hover:bg-white/[0.03]'}`}
                    >
                      {/* Cabecera Clickable de la Tarjeta */}
                      <div className="p-6 flex items-center justify-between cursor-pointer group" onClick={() => {
                        setIngenieroExpandido(expandido ? null : miembro.id);
                        if (viendoHistorial === miembro.id) setViendoHistorial(null);
                      }}>
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8E0B2B] to-[#4A0011] flex items-center justify-center font-bold text-xl shadow-lg">
                            {miembro.iniciales}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white/90 text-lg flex items-center gap-2">
                              {miembro.nombre} 
                              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400 font-normal">{miembro.seniority}</span>
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              {miembro.especialidad}
                              <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                              <span className={colorEstado.split(' ')[0]}>{miembro.estado}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 md:gap-12">
                          {/* Mini Barra de Carga Rápida */}
                          <div className="hidden md:block w-32">
                            <div className="flex justify-between text-[10px] mb-1.5 uppercase tracking-tighter text-gray-500">
                              <span>Carga</span>
                              <span>{miembro.carga}/{miembro.limite}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(porcentajeCarga, 100)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={`h-full ${barraColor}`}
                              />
                            </div>
                          </div>
                          
                          {/* Ícono de Chevron Animado */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${expandido ? 'bg-[#8E0B2B]/20 text-[#D94667] rotate-180' : 'bg-white/[0.05] text-gray-500 group-hover:bg-white/[0.1] group-hover:text-white'}`}>
                            <ChevronDown size={18} />
                          </div>
                        </div>
                      </div>

                      {/* Desplegable Cinematográfico */}
                      <AnimatePresence>
                        {expandido && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={premiumSlide}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-4 border-t border-white/[0.05] bg-black/40">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {/* Metrica 1 */}
                                <div className="space-y-2">
                                  <p className="text-[10px] uppercase text-gray-500 flex items-center gap-2"><Cpu size={12}/> Software Principal</p>
                                  <p className="text-white font-medium">{miembro.software}</p>
                                </div>
                                {/* Metrica 2 */}
                                <div className="space-y-2">
                                  <p className="text-[10px] uppercase text-gray-500 flex items-center gap-2"><Star size={12} className="text-yellow-500"/> Calidad QC</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-white">{miembro.qc}</span>
                                    <div className="flex gap-0.5 text-yellow-500/40">
                                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Math.floor(miembro.qc) ? "currentColor" : "none"} />)}
                                    </div>
                                  </div>
                                </div>
                                {/* Metrica 3 */}
                                <div className="space-y-2">
                                  <p className="text-[10px] uppercase text-gray-500 flex items-center gap-2"><Activity size={12} className="text-green-500"/> Índice Velocidad</p>
                                  <p className="text-2xl font-bold text-white">{miembro.velocidad}<span className="text-sm font-light text-gray-500 ml-1">%</span></p>
                                </div>
                                {/* Botones Acción */}
                                <div className="flex items-center justify-end gap-3 mt-4 md:mt-0">
                                  <button 
                                    onClick={() => cargarHistorial(miembro.id)}
                                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8E0B2B] to-[#6D001A] hover:from-[#A30D32] hover:to-[#8E0B2B] text-white font-semibold text-sm transition-all shadow-lg"
                                  >
                                    {viendoHistorial === miembro.id ? 'Ocultar Proyectos' : 'Ver Proyectos'}
                                  </button>
                                </div>
                              </div>

                              {/* SECCIÓN INTERNA: HISTORIAL DE PROYECTOS */}
                              <AnimatePresence>
                                {viendoHistorial === miembro.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    transition={elegantTransition}
                                    className="overflow-hidden"
                                  >
                                    <div className="bg-black/40 rounded-xl p-5 border border-white/[0.05]">
                                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Proyectos Asignados</h4>
                                      
                                      {cargandoHistorial ? (
                                        <div className="flex justify-center py-6">
                                          <div className="w-6 h-6 border-2 border-[#D94667] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                      ) : historialIngeniero.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {historialIngeniero.map(hist => (
                                            <div key={hist.id_episodio} className="flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/[0.02] hover:bg-white/[0.05] transition-colors">
                                              <div>
                                                <p className="text-sm font-medium text-white/90">{hist.nombre_proyecto}</p>
                                                <p className="text-xs text-gray-500 mt-1">{hist.titulo_episodio}</p>
                                              </div>
                                              <div>
                                                {renderEstado(hist.estado_episodio)}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-gray-500 text-center py-6 bg-white/[0.01] rounded-lg">No hay proyectos activos asignados a este ingeniero en la base de datos.</p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
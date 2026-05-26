import { useState, useEffect } from "react";
import { LogOut, Sliders, FileText, AlertTriangle, Filter, Activity, Disc, UserCircle, ChevronDown, Save, Settings2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IngenieroDashboard({ navigate }) {
  const [tab, setTab] = useState("consola");
  const [idIngenieroActual, setIdIngenieroActual] = useState(1);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [trackParaFicha, setTrackParaFicha] = useState(null);
  const [fichaGuardada, setFichaGuardada] = useState(false);
  
  const listaIngenieros = [
    { id: 1, nombre: "Ana Torres", iniciales: "AT" },
    { id: 2, nombre: "Carlos Mendoza", iniciales: "CM" },
    { id: 3, nombre: "Luis Gómez", iniciales: "LG" },
    { id: 4, nombre: "Elena Ruiz", iniciales: "ER" }
  ];

  const ingenieroSeleccionado = listaIngenieros.find(ing => ing.id === idIngenieroActual);

  const [tracks, setTracks] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);

    fetch(`http://127.0.0.1:8000/api/dashboard/ingeniero/${idIngenieroActual}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se encontraron proyectos asignados a este ingeniero.');
        return res.json();
      })
      .then((data) => {
        setTracks(data);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, [idIngenieroActual, refreshTrigger]);

  const renderEstado = (estado) => {
    const estilos = {
      "En Bruto": "bg-gray-500/10 text-gray-400 border-gray-500/20",
      "Mezclando": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Revisión": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      "Aprobado": "bg-green-500/10 text-green-400 border-green-500/20"
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${estilos[estado] || estilos["En Bruto"]}`}>
        {estado || "En Bruto"}
      </span>
    );
  };

  const manejarAbrirFicha = (track) => {
    setTrackParaFicha(track);
    setFichaGuardada(false);
    setTab("fichas"); 
  };

  const manejarGuardadoFicha = (e) => {
    e.preventDefault();
    
    const formData = {
      cadena_plugins: e.target.elements[0].value,
      nivel_lufs: parseFloat(e.target.elements[1].value),
      observaciones: e.target.elements[2].value,
      estado_episodio: "Revisión" 
    };

    fetch(`http://127.0.0.1:8000/api/episodio/${trackParaFicha.id_episodio}/ficha`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo procesar la ficha técnica en el servidor.");
        return res.json();
      })
      .then(() => {
        setFichaGuardada(true);
        
        setTimeout(() => {
          setTrackParaFicha(null);
          setTab("consola");
          setRefreshTrigger(prev => !prev);
        }, 2500);
      })
      .catch((err) => alert(`Error de conexión: ${err.message}`));
  };

  const elegantTransition = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] };

  return (
    <div className="min-h-screen bg-black flex text-white font-sans antialiased">
      
      <aside className="w-64 bg-white/[0.01] backdrop-blur-3xl border-r border-white/[0.05] p-6 flex flex-col z-20">
        <div className="mb-10">
          <h2 className="text-xl font-bold tracking-tighter">
            <span className="bg-gradient-to-b from-[#6D001A] via-[#8E0B2B] to-[#6D001A] bg-clip-text text-transparent">Sonora</span>
            <span className="font-light ml-0.5">Studio</span>
          </h2>
          <span className="text-[10px] uppercase text-gray-500 tracking-widest mt-1 block font-semibold">Rol: Ingeniero de Audio</span>
        </div>

        <div className="mb-8 relative">
          <label className="flex items-center gap-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            <UserCircle size={14} className="text-[#D94667]" /> Simular Sesión
          </label>
          <button 
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className={`w-full flex items-center justify-between bg-white/[0.02] border transition-all duration-300 rounded-xl p-3 text-sm text-white shadow-inner ${isSelectorOpen ? 'border-[#D94667]/50 shadow-[0_0_15px_rgba(217,70,103,0.1)]' : 'border-white/[0.05] hover:border-white/20'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8E0B2B] to-[#4A0011] flex items-center justify-center text-[10px] font-bold">
                {ingenieroSeleccionado?.iniciales}
              </div>
              <span className="font-medium">{ingenieroSeleccionado?.nombre}</span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-500 ${isSelectorOpen ? "rotate-180 text-[#D94667]" : ""}`} />
          </button>

          <AnimatePresence>
            {isSelectorOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/[0.08] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50"
              >
                {listaIngenieros.map(ing => (
                  <button
                    key={ing.id}
                    onClick={() => {
                      setIdIngenieroActual(ing.id);
                      setIsSelectorOpen(false);
                      setTrackParaFicha(null); 
                      setTab("consola");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                      idIngenieroActual === ing.id
                        ? "bg-[#8E0B2B]/20 text-white font-semibold border-l-2 border-[#D94667]"
                        : "text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idIngenieroActual === ing.id ? 'bg-[#D94667] text-white' : 'bg-white/10'}`}>
                      {ing.iniciales}
                    </div>
                    {ing.nombre}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setTab("consola")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-300 ${tab === "consola" ? "bg-[#6D001A]/10 text-white border border-[#6D001A]/20" : "text-gray-400 hover:bg-white/[0.02] border border-transparent"}`}>
            <Sliders size={18} /> Consola Técnica
          </button>
          <button onClick={() => setTab("fichas")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-300 ${tab === "fichas" ? "bg-[#6D001A]/10 text-white border border-[#6D001A]/20" : "text-gray-400 hover:bg-white/[0.02] border border-transparent"}`}>
            <FileText size={18} /> Fichas de Procesamiento
          </button>
        </nav>
        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-gray-400 hover:text-red-400 mt-auto px-4 py-2 transition-colors">
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-10 bg-gradient-to-tr from-black via-black to-[#6D001A]/5 overflow-y-auto z-10 relative">
        {isSelectorOpen && <div className="fixed inset-0 z-0" onClick={() => setIsSelectorOpen(false)}></div>}

        <AnimatePresence mode="wait">
          
          {tab === "consola" && (
            <motion.div key="consola" className="relative z-10" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={elegantTransition}>
              <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">Estación Técnica de Audio</h1>
                <p className="text-gray-500 text-sm uppercase mt-1">Gestión de Sesiones & Cadena de Señal</p>
              </header>

              <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 bg-white/[0.02] border-b border-white/[0.05] flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Disc size={18} className="text-[#D94667]" /> Cola de Tracks Asignados
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D94667] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8E0B2B]"></span>
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Sincronizado</span>
                  </div>
                </div>

                <div className="min-h-[300px]">
                  {cargando ? (
                    <div className="flex flex-col justify-center items-center h-[300px]">
                      <div className="w-8 h-8 border-4 border-[#6D001A] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400 text-sm">Cargando sesiones desde la consola principal...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col justify-center items-center h-[300px] bg-red-900/10 border-y border-red-500/20">
                      <AlertTriangle className="text-red-500 mb-2" size={32} />
                      <p className="text-red-400 font-medium">{error}</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-white/[0.01] text-xs text-gray-500 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="py-4 px-6">ID Episodio</th>
                          <th className="py-4 px-6">Proyecto / Pista</th>
                          <th className="py-4 px-6">Fecha de Grabación</th>
                          <th className="py-4 px-6">Estado de Mezcla</th>
                          <th className="py-4 px-6 text-right">Cadena (FX)</th>
                        </tr>
                      </thead>
                      
                      <AnimatePresence mode="wait">
                        {tracks.length > 0 ? (
                          <motion.tbody key={idIngenieroActual} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-white/[0.03]">
                            {tracks.map(track => (
                              <tr key={track.id_episodio} className="hover:bg-white/[0.02] transition-colors duration-300">
                                <td className="py-4 px-6 font-mono text-xs text-gray-500">EP-{track.id_episodio}</td>
                                <td className="py-4 px-6">
                                  <p className="font-medium text-white/90">{track.nombre_proyecto}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{track.titulo_episodio}</p>
                                </td>
                                <td className="py-4 px-6 text-gray-400 text-sm">
                                  {track.fecha_grabacion || "Sin fecha"}
                                </td>
                                <td className="py-4 px-6">
                                  {renderEstado(track.estado_episodio)}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button 
                                    onClick={() => manejarAbrirFicha(track)}
                                    className="text-xs bg-gradient-to-br from-[#6D001A] to-[#8E0B2B] hover:from-[#A30D32] hover:to-[#8E0B2B] px-4 py-2 rounded-lg font-semibold shadow-[0_0_15px_rgba(109,0,26,0.3)] transition-all flex items-center gap-2 ml-auto"
                                  >
                                    <Activity size={14} /> Registrar Ficha
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </motion.tbody>
                        ) : (
                          <motion.tbody key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <tr>
                              <td colSpan="5" className="py-20 text-center">
                                <div className="flex flex-col items-center">
                                  <Filter className="text-gray-600 mb-3" size={32} />
                                  <p className="text-gray-400 font-medium">Bandeja limpia.</p>
                                  <p className="text-gray-500 text-sm mt-1">No tienes episodios pendientes de procesar en este momento.</p>
                                </div>
                              </td>
                            </tr>
                          </motion.tbody>
                        )}
                      </AnimatePresence>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "fichas" && (
            <motion.div key="fichas" className="relative z-10 max-w-4xl" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={elegantTransition}>
              <header className="mb-8 flex items-center gap-4">
                <button onClick={() => setTab("consola")} className="p-2 bg-white/[0.05] hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white">
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Fichas de Procesamiento</h1>
                  <p className="text-gray-500 text-sm uppercase mt-1">Documentación Técnica de la Cadena de Audio</p>
                </div>
              </header>

              {trackParaFicha ? (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  
                  <AnimatePresence>
                    {fichaGuardada && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center"
                      >
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", damping: 15 }} className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                          <CheckCircle2 size={40} />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white mb-2">Ficha Guardada Exitosamente</h2>
                        <p className="text-gray-400 text-sm">Sincronizando datos con la consola principal...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/[0.05]">
                    <div className="w-16 h-16 rounded-2xl bg-[#8E0B2B]/20 border border-[#D94667]/30 flex items-center justify-center text-[#D94667]">
                      <Settings2 size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{trackParaFicha.nombre_proyecto}</h2>
                      <p className="text-gray-400 flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded">EP-{trackParaFicha.id_episodio}</span>
                        {trackParaFicha.titulo_episodio}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={manejarGuardadoFicha} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Cadena Principal (Plugins)</label>
                        <input type="text" placeholder="Ej: FabFilter Pro-Q 3, CLA-2A, Soothe2" className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#D94667] transition-colors" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Nivel de Salida (LUFS)</label>
                        <input type="number" step="0.1" placeholder="-14.0" className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#D94667] transition-colors" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Observaciones / EQ Notes</label>
                      <textarea rows="4" placeholder="Detalles sobre cortes de frecuencia, reducción de ruido ambiental, etc..." className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#D94667] transition-colors resize-none" required></textarea>
                    </div>

                    <div className="pt-6 flex justify-end">
                      <button type="submit" className="flex items-center gap-2 bg-gradient-to-br from-[#6D001A] to-[#8E0B2B] hover:from-[#A30D32] hover:to-[#8E0B2B] px-8 py-3.5 rounded-xl font-semibold shadow-[0_0_20px_rgba(109,0,26,0.2)] transition-all">
                        <Save size={18} /> Guardar Ficha Técnica
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white/[0.01] border border-white/[0.05] rounded-3xl border-dashed">
                  <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-6">
                    <FileText size={32} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ningún Track Seleccionado</h3>
                  <p className="text-gray-500 text-sm max-w-sm text-center mb-8">Debes seleccionar un proyecto desde la Consola Técnica para poder registrar sus métricas de procesamiento y plugins.</p>
                  <button onClick={() => setTab("consola")} className="bg-white/10 hover:bg-white/15 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
                    Ir a la Consola Técnica
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
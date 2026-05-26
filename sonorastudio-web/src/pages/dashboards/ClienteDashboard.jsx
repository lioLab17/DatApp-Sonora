import { useState, useEffect } from "react";
import { LogOut, Mic2, Download, CheckCircle, Clock, Filter, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClienteDashboard({ navigate }) {
  const rucSesion = localStorage.getItem("sonora_ruc");
  const nombreSesion = localStorage.getItem("sonora_nombre");

  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const generarIniciales = (nombre) => {
    if (!nombre) return "CL";
    const palabras = nombre.trim().split(" ");
    if (palabras.length >= 2) return (palabras[0][0] + palabras[1][0]).toUpperCase();
    return nombre.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    if (!rucSesion) {
      navigate("/login");
      return;
    }

    setCargando(true);
    setError(null);

    fetch(`http://127.0.0.1:8000/api/dashboard/cliente/${rucSesion}`)
      .then((res) => {
        if (!res.ok) throw new Error('No hay proyectos registrados para tu cuenta en este momento.');
        return res.json();
      })
      .then((data) => {
        setEntregas(data);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, [rucSesion, navigate]);

  const cerrarSesion = () => {
    localStorage.clear();
    navigate("/login");
  };

  const elegantTransition = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: elegantTransition }
  };

  if (!rucSesion) return null;

  return (
    <div className="min-h-screen bg-black flex text-white font-sans antialiased">
      
      <aside className="w-64 bg-white/[0.01] backdrop-blur-3xl border-r border-white/[0.05] p-6 flex flex-col z-20">
        <div className="mb-10">
          <h2 className="text-xl font-bold tracking-tighter">
            <span className="bg-gradient-to-b from-[#6D001A] via-[#8E0B2B] to-[#6D001A] bg-clip-text text-transparent">Sonora</span>
            <span className="font-light ml-0.5">Studio</span>
          </h2>
          <span className="text-[10px] uppercase text-gray-500 tracking-widest mt-1 block font-semibold">Portal de Clientes</span>
        </div>

        <div className="mb-8">
          <div className="w-full flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8E0B2B] to-[#4A0011] flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
              {generarIniciales(nombreSesion)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-sm truncate text-white/90">{nombreSesion}</span>
              <span className="text-[10px] text-gray-500 font-mono tracking-wider">RUC: {rucSesion}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-[#6D001A]/10 text-white border border-[#6D001A]/20">
            <Mic2 size={18} /> Mis Masters Finales
          </button>
        </nav>
        
        <button onClick={cerrarSesion} className="flex items-center gap-3 text-gray-400 hover:text-red-400 mt-auto px-4 py-2 transition-colors">
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-10 bg-gradient-to-tr from-black via-black to-[#6D001A]/5 overflow-y-auto relative z-10">
        <motion.div className="max-w-5xl mx-auto relative z-10" initial="hidden" animate="show" variants={staggerContainer}>
          <motion.header variants={cardVariant} className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight">Panel de Descarga</h1>
            <p className="text-gray-500 text-sm uppercase mt-1">Tus episodios masterizados y estado de proyectos</p>
          </motion.header>

          <div className="space-y-4">
            {cargando ? (
              <div className="flex flex-col justify-center items-center py-32 bg-white/[0.01] border border-white/[0.05] rounded-3xl">
                <div className="w-8 h-8 border-4 border-[#6D001A] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm">Sincronizando con el estudio de Sonora...</p>
              </div>
            ) : error ? (
              <motion.div variants={cardVariant} className="flex flex-col items-center justify-center py-32 bg-white/[0.01] border border-white/[0.05] rounded-3xl border-dashed">
                <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-6">
                  <Filter size={32} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Aún no hay entregas</h3>
                <p className="text-gray-500 text-sm max-w-sm text-center mb-8">{error}</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {entregas.map((item) => {
                  const estaAprobado = item.estado_episodio === "Aprobado";
                  
                  return (
                    <motion.div 
                      key={item.id_episodio || Math.random()} 
                      variants={cardVariant}
                      className={`bg-white/[0.01] border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden transition-all duration-300 hover:bg-white/[0.02] ${estaAprobado ? 'border-[#8E0B2B]/30 shadow-[0_0_20px_rgba(109,0,26,0.05)]' : 'border-white/[0.05]'}`}
                    >
                      {estaAprobado && <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D94667]/40 to-transparent"></div>}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {estaAprobado ? (
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <Headphones size={18} className="text-yellow-500 flex-shrink-0" />
                          )}
                          <h3 className="font-bold text-lg text-white/90 truncate">{item.nombre_proyecto}</h3>
                          <span className="text-gray-500 font-normal hidden sm:inline">|</span>
                          <span className="text-gray-400 truncate">{item.titulo_episodio || "Episodio sin título"}</span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs font-mono text-gray-400 items-center">
                          <span className={`px-2 py-0.5 rounded font-sans font-semibold uppercase tracking-wider ${estaAprobado ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                            {item.estado_episodio || "En Proceso"}
                          </span>
                          
                          {estaAprobado && item.nivel_lufs && (
                            <>
                              <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[#D94667]">
                                {item.nivel_lufs} LUFS
                              </span>
                              <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-gray-300">
                                WAV 24-bit
                              </span>
                            </>
                          )}
                          
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-sans">
                            Registrado: {item.fecha_grabacion || "Reciente"}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        disabled={!estaAprobado}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all flex-shrink-0 w-full md:w-auto ${
                          estaAprobado 
                            ? 'bg-gradient-to-br from-[#6D001A] to-[#8E0B2B] hover:from-[#A30D32] hover:to-[#8E0B2B] shadow-[0_0_15px_rgba(109,0,26,0.3)] text-white border-none' 
                            : 'bg-white/[0.02] border border-white/10 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {estaAprobado ? (
                          <>
                            <Download size={16} /> Descargar Master
                          </>
                        ) : (
                          <>
                            <Clock size={16} /> En Post-Producción
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
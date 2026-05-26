import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Info, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, filter: "blur(5px)", y: 15 },
    show: { 
      opacity: 1, 
      filter: "blur(0px)",
      y: 0, 
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    
    const userLower = usuario.toLowerCase();

    try {
      if (userLower.includes("admin") || userLower.includes("productor")) {
        setTimeout(() => navigate("/dashboard", { state: { rol: "productor" } }), 800);
        return;
      } 
      if (userLower.includes("ingeniero")) {
        setTimeout(() => navigate("/dashboard", { state: { rol: "ingeniero" } }), 800);
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: usuario, contrasena: contrasena })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error al validar credenciales");
      }

      localStorage.setItem("sonora_ruc", data.ruc);
      localStorage.setItem("sonora_nombre", data.nombre);
      localStorage.setItem("sonora_rol", data.rol);

      navigate("/dashboard", { state: { rol: data.rol } });

    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden font-sans antialiased">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="/fondo2.jpg" 
          alt="Estudio SonoraStudio Gilded"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div className="absolute inset-0 bg-black/85 z-10"></div>

        <div 
          className="absolute inset-0 opacity-[0.10] z-20"
          style={{
            backgroundImage: "radial-gradient(circle at center, rgb(13, 252, 0) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        ></div>

        <motion.div
          animate={{ x: [0, 100, 0, -100, 0], y: [0, -50, 100, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[10%] w-[50vw] h-[50vw] bg-[#6D001A]/30 rounded-full blur-[140px] z-30 opacity-20 mix-blend-screen"
        />
        <motion.div
          animate={{ x: [0, -80, 0, 80, 0], y: [0, 100, -50, 100, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[10%] w-[45vw] h-[45vw] bg-[#8E0B2B]/25 rounded-full blur-[140px] z-30 opacity-60 mix-blend-screen"
        />
      </div>

      <motion.div 
        className="relative z-40 w-full max-w-md p-10 bg-[#050505]/50 backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] shadow-[0_0_90px_-10px_rgba(109,0,26,0.15)]"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            <span className="bg-gradient-to-b from-[#6D001A] via-[#8E0B2B] to-[#6D001A] bg-clip-text text-transparent">Datapp</span>
            <span className="font-light text-white ml-0.5">Sonora</span>
          </h1>
          <p className="text-gray-400/80 mt-3.5 text-xs font-medium tracking-[0.25em] uppercase">
            Portal de Producción
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6 p-3 rounded-lg bg-[#6D001A]/10 border border-[#6D001A]/20 flex items-start gap-3">
          <Info size={16} className="text-[#8E0B2B] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Modo Demo:</strong> Usa <span className="text-white">admin@</span> o <span className="text-white">ingeniero@</span>. Para clientes, ingresa su <span className="text-white">RUC</span> real y contraseña.
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }} 
              exit={{ opacity: 0, height: 0, marginBottom: 0 }} 
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-3 text-sm"
            >
              <AlertCircle size={16} className="flex-shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="space-y-6" onSubmit={handleLogin}>
          <motion.div variants={itemVariants}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#6D001A] transition-colors duration-700" />
              </div>
              <input 
                type="text" 
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                className="block w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/[0.04] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#8E0B2B]/50 focus:border-[#8E0B2B]/50 transition-all duration-700 hover:bg-white/[0.02]"
                placeholder="usuario@correo.com o RUC"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#6D001A] transition-colors duration-700" />
              </div>
              <input 
                type="password" 
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                className="block w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/[0.04] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#8E0B2B]/50 focus:border-[#8E0B2B]/50 transition-all duration-700 hover:bg-white/[0.02]"
                placeholder="••••••••"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <button 
              type="submit" 
              disabled={cargando}
              className="group relative w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#6D001A] via-[#8E0B2B] to-[#6D001A] hover:from-[#8E0B2B] hover:to-[#8E0B2B] transition-all duration-700 overflow-hidden shadow-[0_0_20px_rgba(109,0,26,0.15)] hover:shadow-[0_0_35px_rgba(109,0,26,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-700"></div>
              <span className="relative z-10 flex items-center gap-2">
                {cargando ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Acceder al Estudio
                    <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform duration-500" />
                  </>
                )}
              </span>
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
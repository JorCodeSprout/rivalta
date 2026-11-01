import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient";
import AuthModal from "./components/AuthModal";
import {
  calcularClasificacion,
  generarPartidosRoundRobin,
} from "./utils/algoritmoTorneo";
import TablaPosiciones from "./components/TablaPosiciones";
import ListaPartidos from "./components/ListaPartidos";
import PodioFinal from "./components/PodioFinal";
import FormularioTorneo from "./components/FormularioTorneo";
import "./App.css";

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const [currentTournamentId, setCurrentTournamentId] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [tabActiva, setTabActiva] = useState("partidos");
  const [loadingCloud, setLoadingCloud] = useState(false);

  const cargarRolUsuario = async (currentUser) => {
    try {
      const emailUser = currentUser?.email;
      if (!emailUser) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .ilike("email", emailUser)
        .maybeSingle();

      if (!error && data?.role) {
        setUserRole(data.role.toLowerCase());
      } else {
        setUserRole("user");
      }
    } catch (err) {
      console.error("Error al obtener rol:", err.message);
      setUserRole("user");
    }
  };

  const cargarTorneoCloud = async (userId) => {
    setLoadingCloud(true);
    try {
      const { data: tournaments, error: tError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (tError) throw tError;

      if (tournaments && tournaments.length > 0) {
        const torneo = tournaments[0];
        setCurrentTournamentId(torneo.id);

        const { data: matches, error: mError } = await supabase
          .from("matches")
          .select("*")
          .eq("tournament_id", torneo.id);

        if (mError) throw mError;

        if (matches && matches.length > 0) {
          setPartidos(matches);
          const setJ = new Set();
          matches.forEach(m => {
            setJ.add(m.jugador1);
            setJ.add(m.jugador2);
          });
          setJugadores(Array.from(setJ));
        }
      }
    } catch (err) {
      console.error("Error al sincronizar con la nube:", err.message);
    } finally {
      setLoadingCloud(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        cargarTorneoCloud(currentUser.id);
        cargarRolUsuario(currentUser);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        cargarTorneoCloud(currentUser.id);
        cargarRolUsuario(currentUser);
      } else {
        setCurrentTournamentId(null);
        setJugadores([]);
        setPartidos([]);
        setUserRole("user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const iniciarTorneo = async (lista) => {
    if (!user) {
      alert("Debes iniciar sesión para guardar torneos en la nube.");
      setIsRegisterMode(false);
      setIsAuthModalOpen(true);
      return;
    }

    const nuevosPartidosGenerados = generarPartidosRoundRobin(lista);

    try {
      const { data: tData, error: tError } = await supabase
        .from("tournaments")
        .insert([{ user_id: user.id, nombre: "Torneo Rivalta" }])
        .select()
        .single();

      if (tError) throw tError;

      const torneoId = tData.id;
      setCurrentTournamentId(torneoId);

      const matchesToInsert = nuevosPartidosGenerados.map(p => ({
        tournament_id: torneoId,
        jugador1: p.jugador1,
        jugador2: p.jugador2,
        puntos1: 0,
        puntos2: 0,
        jugado: false
      }));

      const { data: mData, error: mError } = await supabase
        .from("matches")
        .insert(matchesToInsert)
        .select();

      if (mError) throw mError;

      setJugadores(lista);
      setPartidos(mData);
      setTabActiva("partidos");
    } catch (err) {
      alert("Error al guardar el torneo en la nube: " + err.message);
    }
  };

  const actualizarResultado = async (id, puntos1, puntos2, jugado) => {
    setPartidos(
      partidos.map((p) =>
        p.id === id ? { ...p, puntos1, puntos2, jugado } : p,
      ),
    );

    const { error } = await supabase
      .from("matches")
      .update({ puntos1, puntos2, jugado })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar el resultado en la nube:", error.message);
    }
  };

  const resetearTorneo = async () => {
    if (confirm("¿Seguro que quieres eliminar este torneo de la nube?")) {
      if (currentTournamentId) {
        const { error } = await supabase
          .from("tournaments")
          .delete()
          .eq("id", currentTournamentId);

        if (error) {
          alert("Error al eliminar: " + error.message);
          return;
        }
      }
      setJugadores([]);
      setPartidos([]);
      setCurrentTournamentId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole("user");
    setJugadores([]);
    setPartidos([]);
    setCurrentTournamentId(null);
    setIsMenuOpen(false);
  };

  const clasificacion = calcularClasificacion(jugadores, partidos);
  const torneoFinalizado =
    partidos.length > 0 && partidos.every((p) => p.jugado);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <h1>RIVALTA</h1>
          <div className="auth-header-actions">
            {user ? (
              <div className="user-nav-dropdown" ref={menuRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="user-icon-btn"
                  aria-label="Menú de usuario"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-color)',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {userRole === 'admin' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  ) : userRole === 'pro' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </button>

                {isMenuOpen && (
                  <div className="dropdown-menu" style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    width: '220px',
                    padding: '8px 0',
                    zIndex: 1000,
                    textAlign: 'left'
                  }}>
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '6px' }}>
                      <p style={{ fontSize: '11px', opacity: 0.6, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {userRole === 'admin' ? 'Administrador 👑' : userRole === 'pro' ? 'Cuenta PRO ⭐' : 'Usuario Estándar'}
                      </p>
                      <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </p>
                    </div>

                    <button 
                      onClick={() => { setIsMenuOpen(false); alert("Sección de Perfil en desarrollo"); }}
                      style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: 'var(--text-color)' }}
                    >
                      Mi Perfil ({userRole})
                    </button>

                    <button 
                      onClick={() => { setIsMenuOpen(false); alert("Configuración en desarrollo"); }}
                      style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: 'var(--text-color)' }}
                    >
                      Configuración
                    </button>

                    {userRole === 'admin' && (
                      <button 
                        onClick={() => { setIsMenuOpen(false); alert("Panel de Admin exclusivo"); }}
                        style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-color)' }}
                      >
                        Panel de Control
                      </button>
                    )}

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '6px 0' }}></div>

                    <button 
                      onClick={handleLogout}
                      style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#ff4d4d' }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-group" style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setIsRegisterMode(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="btn-secondary-sm"
                >
                  Acceder
                </button>

                <button
                  onClick={() => {
                    setIsRegisterMode(true);
                    setIsAuthModalOpen(true);
                  }}
                  className="btn-primary-sm"
                >
                  Registro
                </button>
              </div>
            )}
          </div>
        </div>
        <p>ESTO NO ES UN JUEGO</p>
      </header>

      <AuthModal
        key={isRegisterMode ? "register" : "login"}
        isOpen={isAuthModalOpen}
        initialIsRegister={isRegisterMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />

      {loadingCloud ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Cargando datos seguros desde la nube...</div>
      ) : jugadores.length === 0 ? (
        <FormularioTorneo onIniciarTorneo={iniciarTorneo} />
      ) : (
        <>
          <div className="nav-tabs">
            <button
              className={`tab-btn ${tabActiva === "partidos" ? "active" : ""}`}
              onClick={() => setTabActiva("partidos")}
            >
              Partidos ({partidos.filter((p) => p.jugado).length} /{" "}
              {partidos.length})
            </button>
            <button
              className={`tab-btn ${tabActiva === "tabla" ? "active" : ""}`}
              onClick={() => setTabActiva("tabla")}
            >
              Clasificación
            </button>
          </div>

          {torneoFinalizado && <PodioFinal clasificacion={clasificacion} />}

          {tabActiva === "partidos" ? (
            <ListaPartidos
              partidos={partidos}
              onActualizarResultado={actualizarResultado}
            />
          ) : (
            <TablaPosiciones clasificacion={clasificacion} />
          )}

          <button className="btn-reset" onClick={resetearTorneo}>
            Reiniciar / Nuevo torneo
          </button>
        </>
      )}

      <button
        className="btn-theme-toggle"
        onClick={toggleTheme}
        aria-label="Cambiar tema"
      >
        {theme === "dark" ? (
          <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <footer className="footer-autor">
        <p>
          &copy; {new Date().getFullYear()} Rivalta — Hecho por{" "}
          <a
            href="https://github.com/JorCodeSprout"
            target="_blank"
            rel="noreferrer"
          >
            JorCodeSprout
          </a>
        </p>
      </footer>
    </div>
  );
}
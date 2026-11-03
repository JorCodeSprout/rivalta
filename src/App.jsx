import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import AuthModal from "./components/AuthModal";
import Header from "./components/Header";
import PricingModal from "./components/PricingModal";
import {
  calcularClasificacion,
  generarPartidosRoundRobin,
} from "./utils/algoritmoTorneo";
import TablaPosiciones from "./components/TablaPosiciones";
import ListaPartidos from "./components/ListaPartidos";
import PodioFinal from "./components/PodioFinal";
import FormularioTorneo from "./components/FormularioTorneo";
import "./App.css";
import PremiosModal from "./components/PremiosModal";
import Footer from "./components/Footer";
import LegalModel from "./components/LegalModel";

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPremiosOpen, setIsPremiosOpen] = useState(false);

  const [currentTournamentId, setCurrentTournamentId] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [tabActiva, setTabActiva] = useState("partidos");
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [legalModalConfig, setLegalModalConfig] = useState({ isOpen: false, type: 'tyc' });

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
          // Reconstruimos los jugadores en formato objeto para que la app funcione fina
          setJugadores(Array.from(setJ).map((nombre, idx) => ({ id: idx + 1, nombre })));
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
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const iniciarTorneo = async (lista, nombreTorneoParam) => {
    if (!user) {
      alert("Debes iniciar sesión para guardar torneos en la nube.");
      setIsRegisterMode(false);
      setIsAuthModalOpen(true);
      return;
    }

    if (userRole === 'user') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count, error: countError } = await supabase
        .from("tournaments")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (!countError && count >= 3) {
        alert("Has alcanzado el límite de 3 torneos al mes para cuentas estándar. Actualiza a PRO para creaciones ilimitadas.");
        setIsPricingOpen(true);
        return;
      }
    }

    // 1. Convertimos la lista de strings en objetos { id, nombre } que exige el algoritmo
    const jugadoresFormateados = lista.map((nombreJugador, index) => ({
      id: index + 1,
      nombre: typeof nombreJugador === 'string' ? nombreJugador : nombreJugador.nombre
    }));

    const nuevosPartidosGenerados = generarPartidosRoundRobin(jugadoresFormateados);

    try {
      const nombreTorneoFinal = nombreTorneoParam || "Torneo Rivalta";
      const { data: tData, error: tError } = await supabase
        .from("tournaments")
        .insert([{ user_id: user.id, nombre: nombreTorneoFinal }])
        .select()
        .single();

      if (tError) throw tError;

      const torneoId = tData.id;
      setCurrentTournamentId(torneoId);

      // 2. Extracción de partidos desde las jornadas devueltas por el algoritmo
      let partidosPlanos = [];
      nuevosPartidosGenerados.forEach(item => {
        if (Array.isArray(item)) {
          partidosPlanos.push(...item);
        } else if (item && typeof item === 'object') {
          const subArray = Object.values(item).find(val => Array.isArray(val));
          if (subArray) {
            partidosPlanos.push(...subArray);
          } else {
            partidosPlanos.push(item);
          }
        }
      });

      // 3. Mapeo ultra-robusto hacia Supabase
      const matchesToInsert = partidosPlanos
        .map(p => {
          if (!p) return null;

          let j1 = p?.jugador1 || p?.local || p?.team1 || p?.home || p?.player1 || p?.homeTeam || p?.teamA || p?.equipo1 || (Array.isArray(p) ? p[0] : null);
          let j2 = p?.jugador2 || p?.visitante || p?.team2 || p?.away || p?.player2 || p?.awayTeam || p?.teamB || p?.equipo2 || (Array.isArray(p) ? p[1] : null);

          if (!j1 || !j2) {
            const valoresTexto = Object.values(p).filter(val => typeof val === 'string' && val.trim() !== '');
            if (valoresTexto.length >= 2) {
              j1 = valoresTexto[0];
              j2 = valoresTexto[1];
            }
          }

          if (!j1 || !j2) return null;

          return {
            tournament_id: torneoId,
            jugador1: j1,
            jugador2: j2,
            puntos1: 0,
            puntos2: 0,
            jugado: false
          };
        })
        .filter(Boolean);

      if (matchesToInsert.length === 0) {
        throw new Error("El algoritmo no devolvió ningún enfrentamiento válido.");
      }

      const { data: mData, error: mError } = await supabase
        .from("matches")
        .insert(matchesToInsert)
        .select();

      if (mError) throw mError;

      setJugadores(jugadoresFormateados);
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
  };

  const clasificacion = calcularClasificacion(jugadores, partidos);
  const torneoFinalizado = partidos.length > 0 && partidos.every((p) => p.jugado);

  return (
    <div className="app-container">
      <Header
        user={user}
        userRole={userRole}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenPremios={() => setIsPremiosOpen(true)}
        onLoginClick={() => { setIsRegisterMode(false); setIsAuthModalOpen(true); }}
        onRegisterClick={() => { setIsRegisterMode(true); setIsAuthModalOpen(true); }}
        onLogout={handleLogout}
      />

      <AuthModal
        key={isRegisterMode ? "register" : "login"}
        isOpen={isAuthModalOpen}
        initialIsRegister={isRegisterMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        userRole={userRole}
      />

      <PremiosModal
        isOpen={isPremiosOpen}
        onClose={() => setIsPremiosOpen(false)}
        user={user}
        userRole={userRole}
      />

      {loadingCloud ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Cargando datos seguros desde la nube...</div>
      ) : !user ? (
        <div className="welcome-banner-modern">
          <h2 className="welcome-title">Bienvenido a Rivalta</h2>
          <p className="welcome-description">
            Organizar una liguilla o un torneo entre colegas siempre acaba en discusiones sobre quién jugaba contra quién y los puntos de cada uno. Rivalta existe única y exclusivamente para evitar eso. Partidos redondos, clasificación al día y cero excusas.
          </p>

          <div className="welcome-features-grid">
            <div className="welcome-feature-card">
              <div className="feature-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                </svg>
              </div>
              <h4>Sistema TCT</h4>
              <p>Genera los cruces de todos contra todos sin romperte la cabeza.</p>
            </div>

            <div className="welcome-feature-card">
              <div className="feature-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h4>Clasificación al milímetro</h4>
              <p>Puntos y diferencias calculados solos en tiempo real.</p>
            </div>

            <div className="welcome-feature-card">
              <div className="feature-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h4>Todo en la nube</h4>
              <p>Tus datos guardados para que nadie pueda manipular los resultados.</p>
            </div>
          </div>

          <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '24px', fontSize: '0.95rem' }}>
            Inicia sesión o crea una cuenta para montar tu primera competición.
          </p>

          <div className="welcome-actions">
            <button 
              className="btn-welcome-primary" 
              onClick={() => { setIsRegisterMode(false); setIsAuthModalOpen(true); }}
            >
              Iniciar sesión
            </button>
            <button 
              className="btn-welcome-secondary" 
              onClick={() => { setIsRegisterMode(true); setIsAuthModalOpen(true); }}
            >
              Registrarse
            </button>
          </div>
        </div>
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

      <Footer onOpenLegal={(type) => setLegalModalConfig({ isOpen: true, type })} />

      <LegalModel
          isOpen={legalModalConfig.isOpen}
          type={legalModalConfig.type}
          onClose={() => setLegalModalConfig({ ...legalModalConfig, isOpen: false })}
      />
    </div>
  );
}
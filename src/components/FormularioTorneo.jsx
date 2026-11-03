import { useState } from "react";

export default function FormularioTorneo({ onIniciarTorneo }) {
    const [nombreTorneo, setNombreTorneo] = useState("");
    const [inputJugador, setInputJugador] = useState("");
    const [jugadores, setJugadores] = useState([]);

    const agregarJugador = (e) => {
        e.preventDefault();
        if (!inputJugador.trim()) return;
        if (jugadores.includes(inputJugador.trim())) {
            alert("Este participante ya está en la lista.");
            return;
        }
        setJugadores([...jugadores, inputJugador.trim()]);
        setInputJugador("");
    };

    const eliminarJugador = (indexToRemove) => {
        setJugadores(jugadores.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (jugadores.length < 2) {
            alert("Necesitas al menos 2 participantes para iniciar un torneo TCT.");
            return;
        }
        const tituloFinal = nombreTorneo.trim() || "Torneo Rivalta";
        onIniciarTorneo(jugadores, tituloFinal);
    };

    return (
        <div className="welcome-banner-modern" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
            <h2 className="welcome-title" style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Configurar Torneo</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Campo para el nombre del torneo */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                        Nombre de la competición
                    </label>
                    <input
                        type="text"
                        value={nombreTorneo}
                        onChange={(e) => setNombreTorneo(e.target.value)}
                        placeholder="Ej: Liga de Verano / Torneo Rivalta"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'var(--bg-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            fontSize: '0.95rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Campo para añadir jugadores */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                        Añadir participantes
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={inputJugador}
                            onChange={(e) => setInputJugador(e.target.value)}
                            placeholder="Nombre del jugador o equipo"
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                        <button type="submit" onClick={agregarJugador} className="btn-secondary-sm">
                            Añadir
                        </button>
                    </div>
                </div>

                {/* Lista de participantes actuales */}
                <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>
                        Participantes inscritos ({jugadores.length}):
                    </p>
                    <div style={{
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '12px',
                        minHeight: '100px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {jugadores.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto' }}>Aún no hay participantes agregados.</p>
                        ) : (
                            jugadores.map((jugador, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>{jugador}</span>
                                    <button
                                        type="button"
                                        onClick={() => eliminarJugador(index)}
                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary-sm"
                    style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '700', textAlign: 'center' }}
                >
                    Iniciar Competición TCT
                </button>
            </form>
        </div>
    );
}
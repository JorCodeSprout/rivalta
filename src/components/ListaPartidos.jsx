import "./ListaPartidos.css";

export default function ListaPartidos({ partidos, onActualizarResultado }) {
    const handleChange = (id, campo, valor) => {
        const p = partidos.find((item) => item.id === id);
        const p1 = campo === "puntos1" ? valor : p.puntos1;
        const p2 = campo === "puntos2" ? valor : p.puntos2;

        const jugado = p1 !== "" && p2 !== "";
        onActualizarResultado(id, p1, p2, jugado);
    };

    return (
        <div className="partidos-container">
            {partidos.map((p) => (
                <div key={p.id} className={`partido-card ${p.jugado ? "jugado" : ""}`}>
                    <div className="jugador-info">
                        <span className="jugador-name">{p.jugador1}</span>
                    </div>

                    <div className="score-box">
                        <input
                            type="number"
                            min="0"
                            className="input-score"
                            value={p.puntos1}
                            onChange={(e) => handleChange(p.id, "puntos1", e.target.value)}
                            placeholder="-"
                        />
                        <span className="vs-badge">VS</span>
                        <input
                            type="number"
                            min="0"
                            className="input-score"
                            value={p.puntos2}
                            onChange={(e) => handleChange(p.id, "puntos2", e.target.value)}
                            placeholder="-"
                        />
                    </div>
                    
                    <div className="jugador-info derecha">
                        <span className="jugador-name">{p.jugador2}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
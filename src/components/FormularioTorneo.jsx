import { useState } from "react";
import "./FormularioTorneo.css";

export default function FormularioTorneo({ onIniciarTorneo }) {
    const [nombre, setNombre] = useState("");
    const [jugadores, setJugadores] = useState([]);

    const agregarJugador = (e) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        setJugadores([...jugadores, { id: Date.now(), nombre: nombre.trim() }]);
        setNombre("");
    };

    const eliminarJugador = (id) => {
        setJugadores(jugadores.filter((j) => j.id !== id));
    };

    return (
        <div className="card-form">
            <h2>Crear torneo exprés</h2>

            <form onSubmit={agregarJugador} className="input-group">
                <input
                    type="text"
                    className="input-text"
                    placeholder="Nombre del jugador"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
                <button type="submit" className="btn-add">
                    Añadir
                </button>
            </form>

            <div className="lista-jugadores">
                {jugadores.map((j) => (
                    <span className="chip-jugador" key={j.id}>
                        {j.nombre}
                        <button
                            type="button"
                            onClick={() => eliminarJugador(j.id)}
                            className="btn-del"
                            aria-label={`Eliminar a ${j.nombre}`}
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>

            <button
                className="btn-start"
                disabled={jugadores.length < 3}
                onClick={() => onIniciarTorneo(jugadores)}
            >
                {jugadores.length < 3
                    ? "Mínimo 3 jugadores para empezar"
                    : `Generar torneo (${jugadores.length} jugadores)`}
            </button>
        </div>
    );
}

import './TablaPosiciones.css';

export default function TablaPosiciones({ clasificacion }) {
    return (
        <div className="table-wrapper">
            <table className="tabla">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Jugador</th>
                        <th>PJ</th>
                        <th>PG</th>
                        <th>PE</th>
                        <th>PP</th>
                        <th>DP</th>
                        <th>PTS</th>
                    </tr>
                </thead>
                <tbody>
                    {clasificacion.map((j, index) => (
                        <tr key={j.nombre}>
                            <td className='pos'>{index + 1}</td>
                            <td className='nombre-col'>{j.nombre}</td>
                            <td>{j.pj}</td>
                            <td>{j.pg}</td>
                            <td>{j.pe}</td>
                            <td>{j.pp}</td>
                            <td>{j.dp > 0 ? `+${j.dp}` : j.dp}</td>
                            <td style={{ fontWeight: 'bold', color:'var(--acccent-green)' }}>{j.puntos}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
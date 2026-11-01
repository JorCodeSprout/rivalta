export function generarPartidosRoundRobin(jugadores) {
    const partidos = [];
    const lista = [...jugadores];

    if (lista.length % 2 !== 0) {
        lista.push({ id: 'bye', nombre: 'DESCANSO' });
    }

    const n = lista.length;
    const rondas = n - 1;
    const partidosPorRonda = n / 2;
    let idPartido = 1;

    for (let r = 0; r < rondas; r++) {
        for (let i = 0; i < partidosPorRonda; i++) {
            const local = lista[i];
            const visitante = lista[n - 1 - i];

            if(local.id !== 'bye' && visitante.id !== 'bye') {
                partidos.push({
                    id: idPartido++,
                    ronda: r + 1,
                    jugador1: local.nombre,
                    jugador2: visitante.nombre,
                    puntos1: '',
                    puntos2: '',
                    jugado: false,
                });
            }
        }

        lista.splice(1, 0, lista.pop());
    }

    return partidos;
}

export function calcularClasificacion(jugadores, partidos) {
    const tabla = jugadores.map((j) => ({
        nombre: j.nombre,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        pf: 0,
        pc: 0,
        dp: 0,
        puntos: 0,
    }));

    partidos.forEach((p) => {
        if(!p.jugado) return;

        const p1 = parseInt(p.puntos1, 10);
        const p2 = parseInt(p.puntos2, 10);

        const j1 = tabla.find((t) => t.nombre === p.jugador1);
        const j2 = tabla.find((t) => t.nombre === p.jugador2);

        if (j1 && j2) {
            j1.pj += 1;
            j2.pj += 1;
            j1.pf += p1;
            j1.pc += p2;
            j2.pf += p2;
            j2.pc += p1;
            j1.dp = j1.pf - j1.pc;
            j2.dp = j2.pf - j2.pc;

            if(p1 > p2) {
                j1.pg += 1;
                j1.puntos += 3;
                j2.pp += 1;
            } else if(p2 > p1) {
                j2.pg += 1;
                j2.puntos += 3;
                j1.pp += 1;
            } else {
                j1.pe += 1;
                j2.pe += 1;
                j1.puntos += 1;
                j2.puntos += 1;
            }
        }
    });

    return tabla.sort((a, b) => b.puntos - a.puntos || b.dp - a.dp || b.pf - a.pf);
}
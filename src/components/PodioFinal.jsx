import { useEffect } from 'react';
import './PodioFinal.css';
import confetti from 'canvas-confetti';

export default function PodioFinal({ clasificacion }) {
    const p1 = clasificacion[0];
    const p2 = clasificacion[1];
    const p3 = clasificacion[2];

    useEffect(() => {
        confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#ffffff', '#a1a1aa', '#52525b']
        });
    }, []);

    return (
        <div className="podio-container">
            <h2 className="podio-title">Podio final</h2>

            <div className="podio-flex">
                {p2 && (
                    <div className="podio-box">
                        <span className="p-nom">{p2.nombre}</span>
                        <div className="p-bar p2">2</div>
                    </div>
                )}
                {p1 && (
                    <div className="podio-box">
                        <span className="p-nom p1-nombre">{p1.nombre}</span>
                        <div className="p-bar p1">1</div>
                    </div>
                )}
                {p3 && (
                    <div className="podio-box">
                        <span className="p-nom">{p3.nombre}</span>
                        <div className="p-bar p3">3</div>
                    </div>
                )}
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function PremiosModal({ isOpen, onClose, user, userRole }) {
    const [premios, setPremios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const cargarPremios = async () => {
            setLoading(true);
            const { data, error } = await supabase.from("rewards").select("*");
            if (isMounted) {
                if (!error && data) {
                    setPremios(data);
                }
                setLoading(false);
            }
        };

        if (isOpen) {
            cargarPremios();
        }

        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    const canjearPremio = async (premio) => {
        if (userRole !== 'pro' && userRole !== 'admin') {
            alert("El canje de premios por puntos es una función exclusiva para cuentas PRO.");
            return;
        }

        if (confirm(`¿Seguro que quieres canjear "${premio.titulo}" por ${premio.costo_puntos} puntos?`)) {
            const { error } = await supabase.from("redemptions").insert([
                { user_id: user.id, reward_id: premio.id }
            ]);

            if (error) {
                alert("Error al procesar el canje: " + error.message);
            } else {
                alert("¡Canje realizado con éxito! El equipo de Rivalta se pondrá en contacto contigo.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '16px', padding: '30px', maxWidth: '600px', width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)', textAlign: 'left', position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <h2 style={{ color: 'var(--text-main)', fontSize: '1.4rem', marginBottom: '8px' }}>Zona de Canje PRO</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Intercambia tus puntos de competición por premios exclusivos.</p>

                {userRole !== 'pro' && userRole !== 'admin' && (
                    <div style={{ background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', color: '#ff4d4d' }}>
                        Necesitas ser usuario PRO para desbloquear el canje de premios.
                    </div>
                )}

                {loading ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Cargando premios...</p>
                ) : premios.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No hay premios disponibles en este momento. ¡Vuelve pronto!</p>
                ) : (
                    <div style={{ display: 'grid', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
                        {premios.map((premio) => (
                            <div key={premio.id} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>{premio.titulo}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{premio.descripcion}</p>
                                    <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>{premio.costo_puntos} Puntos</span>
                                </div>
                                <button
                                    onClick={() => canjearPremio(premio)}
                                    className="btn-primary-sm"
                                    disabled={userRole !== 'pro' && userRole !== 'admin'}
                                    style={{ opacity: userRole !== 'pro' && userRole !== 'admin' ? 0.5 : 1 }}
                                >
                                    Canjear
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
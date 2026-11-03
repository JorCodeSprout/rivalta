export default function PricingModal({ isOpen, onClose, userRole }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '650px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                textAlign: 'left',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-main)',
                        cursor: 'pointer'
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', marginBottom: '8px' }}>Planes de Rivalta</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Elige el nivel de competición que necesitas.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    {/* Plan Estándar */}
                    <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '4px' }}>Estándar</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>Gratis</p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>• Hasta 3 torneos al mes</li>
                            <li>• Ligas TCT (Todos contra todos)</li>
                            <li>• Clasificación en tiempo real</li>
                        </ul>
                        <button
                            onClick={onClose}
                            className="btn-secondary-sm"
                            style={{ width: '100%', textAlign: 'center' }}
                        >
                            {userRole === 'user' ? 'Plan Actual' : 'Incluido'}
                        </button>
                    </div>

                    {/* Plan PRO */}
                    <div style={{ background: 'var(--bg-main)', border: '2px solid var(--primary)', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '4px' }}>PRO</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>9.99€ <span style={{ fontSize: '0.8rem', fontWeight: '400', color: 'var(--text-muted)' }}>/ mes</span></p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>• Torneos ilimitados</li>
                            <li>• Sin restricciones temporales</li>
                            <li>• Soporte prioritario</li>
                        </ul>
                        <button
                            onClick={() => alert("Pasarela de pago simulada. Contacta con soporte para activar PRO.")}
                            className="btn-primary-sm"
                            style={{ width: '100%', textAlign: 'center' }}
                        >
                            {userRole === 'pro' ? 'Tu Plan Actual' : 'Mejorar a PRO'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
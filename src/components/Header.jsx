import { useState, useRef, useEffect } from "react";

export default function Header({ user, userRole, theme, toggleTheme, onOpenPricing, onOpenPremios, onLoginClick, onRegisterClick, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const renderRoleIcon = () => {
        if (userRole === 'admin') {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            );
        } else if (userRole === 'pro') {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        } else {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        }
    };

    return (
        <header className="header">
            <div className="header-top">
                <h1>RIVALTA</h1>
                <div className="auth-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                    {user && userRole !== 'admin' && (
                        <button
                            onClick={onOpenPricing}
                            className="btn-secondary-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            Planes
                        </button>
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

                    {user ? (
                        <div className="user-nav-dropdown" ref={menuRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="user-icon-btn"
                                aria-label="Menú de usuario"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: userRole === 'admin' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: userRole === 'admin' ? 'var(--primary)' : 'var(--text-color)',
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                {renderRoleIcon()}
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
                                            {userRole === 'admin' ? 'Administrador' : userRole === 'pro' ? 'Cuenta PRO' : 'Usuario Estándar'}
                                        </p>
                                        <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.email}
                                        </p>
                                    </div>

                                    {userRole !== 'admin' && (
                                        <button
                                            onClick={() => { setIsMenuOpen(false); onOpenPricing(); }}
                                            style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: 'var(--text-color)', fontWeight: '600' }}
                                        >
                                            Ver Planes / Suscripción
                                        </button>
                                    )}

                                    {/* Opción de canjear premios exclusiva para PRO */}
                                    {userRole === 'pro' && (
                                        <button
                                            onClick={() => { setIsMenuOpen(false); onOpenPremios(); }}
                                            style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}
                                        >
                                            Canjear Premios PRO
                                        </button>
                                    )}

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
                                        onClick={() => { setIsMenuOpen(false); onLogout(); }}
                                        style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#ff4d4d' }}
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons-group" style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={onLoginClick} className="btn-secondary-sm">
                                Acceder
                            </button>
                            <button onClick={onRegisterClick} className="btn-primary-sm">
                                Registro
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <p>- ESTO NO ES UN JUEGO -</p>
        </header>
    );
}
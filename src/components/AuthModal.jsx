import { useState } from 'react';
import { supabase } from '../supabaseClient';
import LegalModal from './LegalModel';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialIsRegister = false }) {
    const [isRegister, setIsRegister] = useState(initialIsRegister);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [aceptarTyC, setAceptarTyC] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [legalModalType, setLegalModalType] = useState(null);

    if (!isOpen) return null;

    const handleForgotPassword = async () => {
        if (!email) {
            setErrorMsg('Por favor, introduce tu correo electrónico arriba primero.');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });

            if (error) throw error;
            setSuccessMsg('¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.');
        } catch (err) {
            setErrorMsg(err.message || 'No se pudo enviar el correo de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (isRegister && !aceptarTyC) {
            setErrorMsg('Debes aceptar los Términos y la Política de Privacidad para registrarte.');
            return;
        }

        setLoading(true);

        try {
            if (isRegister) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { tyc_aceptado: true } }
                });
                if (error) throw error;
                alert('¡Registro completado! Revisa tu bandeja de entrada si se requiere confirmación.');
                if (data?.user && onAuthSuccess) onAuthSuccess(data.user);
                onClose();
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data?.user && onAuthSuccess) onAuthSuccess(data.user);
                onClose();
            }
        } catch (err) {
            setErrorMsg(err.message || 'Ha ocurrido un error en la autenticación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-container">
                    <div className="modal-header">
                        <h2>{isRegister ? 'Crear cuenta en Rivalta' : 'Iniciar Sesión'}</h2>
                        <button className="btn-close" onClick={onClose}>&times;</button>
                    </div>

                    {errorMsg && <div className="auth-error-box">{errorMsg}</div>}
                    {successMsg && <div className="auth-success-box" style={{ padding: '10px', background: '#e6f4ea', color: '#137333', marginBottom: '15px', borderRadius: '4px', fontSize: '13px' }}>{successMsg}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="auth-email">Correo electrónico</label>
                            <input
                                id="auth-email"
                                type="email"
                                required
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="auth-password">Contraseña</label>
                            <input
                                id="auth-password"
                                type="password"
                                required={!isRegister}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {!isRegister && (
                            <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '15px' }}>
                                <button
                                    type="button"
                                    className="link-btn"
                                    onClick={handleForgotPassword}
                                    style={{ fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.8 }}
                                >
                                    ¿Has olvidado tu contraseña?
                                </button>
                            </div>
                        )}

                        {isRegister && (
                            <div className="form-checkbox">
                                <input
                                    type="checkbox"
                                    id="tyc-check"
                                    checked={aceptarTyC}
                                    onChange={(e) => setAceptarTyC(e.target.checked)}
                                />
                                <label htmlFor="tyc-check">
                                    He leído y acepto los{' '}
                                    <button type="button" className="link-btn" onClick={() => setLegalModalType('tyc')}>
                                        Términos y Condiciones
                                    </button>{' '}
                                    y la{' '}
                                    <button type="button" className="link-btn" onClick={() => setLegalModalType('privacy')}>
                                        Política de Privacidad (RGPD)
                                    </button>.
                                </label>
                            </div>
                        )}

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Entrar'}
                        </button>
                    </form>

                    <div className="modal-switch-mode">
                        <button
                            type="button"
                            className="link-switch"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setErrorMsg('');
                                setSuccessMsg('');
                            }}
                        >
                            {isRegister ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
                        </button>
                    </div>
                </div>
            </div>

            <LegalModal
                isOpen={!!legalModalType}
                type={legalModalType}
                onClose={() => setLegalModalType(null)}
            />
        </>
    );
}
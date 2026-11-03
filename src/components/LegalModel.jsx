import { useState } from 'react';
import emailjs from '@emailjs/browser';
import './AuthModal.css';
import './LegalModel.css';

export default function LegalModel({ isOpen, onClose, type }) {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [asunto, setAsunto] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!mensaje.trim()) {
            alert("Por favor, escribe tu mensaje.");
            return;
        }

        setEnviando(true);

        const templateParams = {
            from_name: nombre || 'Usuario Anónimo',
            from_email: email || 'No especificado',
            subject: asunto || 'Sin asunto',
            message: mensaje,
            to_email: 'soporterivalta@gmail.com'
        };

        emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
        .then(() => {
            setEnviando(false);
            setEnviado(true);
            setTimeout(() => {
                onClose();
                setEnviado(false);
                setNombre('');
                setEmail('');
                setAsunto('');
                setMensaje('');
            }, 2500);
        })
        .catch((error) => {
            setEnviando(false);
            console.error('Error al enviar el correo:', error);
            alert('Hubo un error al enviar el mensaje. Inténtalo de nuevo.');
        });
    };

    const inputStyle = {
        width: '100%', 
        padding: '10px 12px', 
        borderRadius: '8px', 
        border: '1px solid var(--border-color, #cbd5e1)', 
        backgroundColor: 'var(--bg-input, var(--bg-main, #ffffff))', 
        color: 'var(--text-main, #0f172a)', 
        fontSize: '0.9rem', 
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="modal-container legal-container">
                
                {/* Cabecera */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                        {type === 'tyc' && 'Términos y Condiciones de uso'}
                        {type === 'privacidad' && 'Política de Privacidad (RGPD UE)'}
                        {type === 'contacto' && 'Contacto Oficial'}
                        {type === 'soporte' && 'Soporte Técnico Directo'}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem', cursor: 'pointer', padding: '0' }}>&times;</button>
                </div>

                {/* Contenido */}
                <div>
                    {type === 'tyc' && (
                        <div className="legal-content">
                            <h4 style={{ color: 'var(--text-main)' }}>1. Aceptación de los Términos</h4>
                            <p>Al registrarse en Rivalta, el usuario acepta de manera expresa y formal las presentes condiciones de servicio.</p>
                            <h4 style={{ color: 'var(--text-main)' }}>2. Cuentas y Suscripciones PRO</h4>
                            <p>Las funciones avanzadas y la participación en el ranking mensual PRO están sujetas al pago de suscripción.</p>
                        </div>
                    )}

                    {type === 'privacidad' && (
                        <div className="legal-content">
                            <h4 style={{ color: 'var(--text-main)' }}>1. Responsable del Tratamiento</h4>
                            <p>De conformidad con el RGPD UE 2016/679, le informamos que sus datos son tratados por Rivalta de forma segura.</p>
                        </div>
                    )}

                    {(type === 'contacto' || type === 'soporte') && (
                        enviado ? (
                            <div className="legal-success-message">
                                <h4>¡Mensaje enviado a soporterivalta@gmail.com!</h4>
                                <p>Te responderemos a la mayor brevedad posible.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="legal-form">
                                <p className="legal-form-intro">
                                    {type === 'contacto' 
                                        ? 'Envíanos tus dudas directamente a nuestro buzón:' 
                                        : 'Describe tu incidencia técnica para asistencia prioritaria:'}
                                </p>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>Nombre</label>
                                        <input 
                                            type="text" 
                                            placeholder="Tu nombre" 
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>Tu Correo</label>
                                        <input 
                                            type="email" 
                                            placeholder="correo@ejemplo.com" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>Asunto</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Problema con marcador" 
                                        value={asunto}
                                        onChange={(e) => setAsunto(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>Mensaje</label>
                                    <textarea 
                                        rows="3" 
                                        placeholder="Detalles..." 
                                        value={mensaje}
                                        onChange={(e) => setMensaje(e.target.value)}
                                        required
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                    />
                                </div>

                                <button type="submit" disabled={enviando} className="legal-btn-primary" style={{ opacity: enviando ? 0.7 : 1, marginTop: '4px' }}>
                                    {enviando ? 'Enviando...' : `Enviar ${type === 'soporte' ? 'Ticket' : 'Mensaje'}`}
                                </button>
                            </form>
                        )
                    )}
                </div>

                {type !== 'contacto' && type !== 'soporte' && (
                    <div className="legal-modal-footer" style={{ marginTop: '20px' }}>
                        <button onClick={onClose} className="legal-btn-primary">
                            Entendido
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
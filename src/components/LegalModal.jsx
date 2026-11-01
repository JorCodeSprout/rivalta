import './AuthModal.css';

export default function LegalModel({ isOpen, onClose, type }) {
    if (!isOpen) return null;

    const isTyC = type === 'tyc';

    return (
        <div className="modal-overlay style={{ zIndex: 1100 }}">
            <div className="modal-container legal-container">
                <div className="modal-header">
                    <h3>{isTyC 
                        ? 'Términos y Condiciones de uso'
                        : 'Política de Privacidad (RGPD UE)'
                    }</h3>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <div className="legal-content">
                    {isTyC ? (
                        <>
                            <h4>1. Aceptación de los Términos</h4>
                            <p>Al registrarse en Rivalta, el usuario acepta de manera expresa y formal las presentes condiciones de servicio. La plataforma ofrece servicios de gestión de torneos y rankings competitivos.</p>

                            <h4>2. Cuentas y Suscripciones PRO</h4>
                            <p>Las funciones avanzadas y la participación en el ranking mensual PRO están sujetas al pago de una suscripcion recurrente gestionada de forma segura a través de Stripe. El saldo de puntos acumulado vence conforme a las reglas del ranking mensual.</p>

                            <h4>3. Uso Aceptable</h4>
                            <p>Queda estrictamente prohíbida la manipulación de resultados, la creación de cuentas múltiples fraudulentas o cualquier conducta indebida en la plataforma. Rivalta se reserva el derecho de suspender o cancelar cuentas infractoras.</p>
                        </>
                    ) : (
                        <>
                            <h4>1. Responsable del Tratamiento</h4>
                            <p>De conformidad con el Reglamento General de Protección de Datos (RGPD UE 2016/679), le informamos que sus datos personales son tratados por Rivalta en servidores ubicados dentro  del Espacio Económico Europeo (Frankfrut, Alemania).</p>

                            <h4>2. Finalidad y Base Jurídica</h4>
                            <p>La recogida y tratamiento de su dirección de correo electrónico tiene como única finalidad la gestión de la cuenta de usuario, autenticación de acceso y presentación de los servicios contratados.</p>

                            <h4>3. Derechos de Usuario (ARCO+)</h4>
                            <p>Puede ejercitar en cualquier momento sus derechos de acceso, rectificación, supresión, limitación y portabilidad enviando un correo electrónico a soporte o solicitando la baja definitiva desde su panel.</p>
                        </>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    )
}
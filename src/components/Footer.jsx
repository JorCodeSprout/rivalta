export default function Footer({ onOpenLegal }) {
    return (
        <footer style={{
            padding: '40px 20px',
            borderTop: '1px solid var(--border-color)',
            marginTop: '40px',
            background: 'var(--bg-card)'
        }}>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                textAlign: 'center'
            }}>
                {/* Enlaces con el evento onClick correctamente configurado */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    flexWrap: 'wrap',
                    fontSize: '0.85rem'
                }}>
                    <a
                        href="#contacto"
                        onClick={(e) => {
                            e.preventDefault();
                            console.log("Clic en Contacto"); // Para depurar en la consola
                            onOpenLegal('contacto');
                        }}
                        style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}
                    >
                        Contacto
                    </a>
                    <a
                        href="#soporte"
                        onClick={(e) => {
                            e.preventDefault();
                            console.log("Clic en Soporte");
                            onOpenLegal('soporte');
                        }}
                        style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}
                    >
                        Soporte
                    </a>
                    <a
                        href="#privacidad"
                        onClick={(e) => {
                            e.preventDefault();
                            console.log("Clic en Privacidad");
                            onOpenLegal('privacidad');
                        }}
                        style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}
                    >
                        Privacidad
                    </a>
                    <a
                        href="#tyc"
                        onClick={(e) => {
                            e.preventDefault();
                            console.log("Clic en TyC");
                            onOpenLegal('tyc');
                        }}
                        style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}
                    >
                        Términos y Condiciones
                    </a>
                </div>

                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    &copy; {new Date().getFullYear()} Rivalta — Hecho por{" "}
                    <a
                        href="https://github.com/JorCodeSprout"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
                    >
                        JorCodeSprout
                    </a>
                </p>

                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.5, letterSpacing: '1px' }}>
                    - ESTO NO ES UN JUEGO -
                </p>
            </div>
        </footer>
    );
}
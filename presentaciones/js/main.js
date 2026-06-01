// Punto de entrada principal
async function iniciarPresentacion() {
    try {
        const deck = document.getElementById('deck');
        if (deck) {
            deck.innerHTML = `
                <div class="slide active">
                    <div class="sidebar">
                        <div class="section-marker">CARGANDO</div>
                    </div>
                    <div class="content">
                        <h1>Cargando presentación...</h1>
                        <p>Por favor espere un momento</p>
                    </div>
                </div>
            `;
        }
        
        const response = await fetch('data/presentacion.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: No se pudo cargar el archivo`);
        }
        
        const datos = await response.json();
        
        if (window.PresentacionNav && window.PresentacionNav.construirPresentacion) {
            window.PresentacionNav.construirPresentacion(datos);
        } else {
            throw new Error('Módulo de navegación no disponible');
        }
        
        console.log('✅ Presentación cargada exitosamente');
        
    } catch (error) {
        console.error('Error:', error);
        const deck = document.getElementById('deck');
        if (deck) {
            deck.innerHTML = `
                <div class="slide active">
                    <div class="sidebar">
                        <div class="section-marker">ERROR</div>
                    </div>
                    <div class="content">
                        <h1>Error al cargar la presentación</h1>
                        <p>No se pudo cargar <strong>data/presentacion.json</strong></p>
                        <p style="margin-top: 1rem; color: #e53e3e;">Detalle: ${error.message}</p>
                        <p style="margin-top: 2rem; font-size: 0.9rem;">Verifica que el archivo exista en la carpeta <strong>data/</strong></p>
                    </div>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', iniciarPresentacion);
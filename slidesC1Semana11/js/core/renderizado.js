/**
 * =====================================================
 * MÓDULO DE RENDERIZADO - FUNCIONES DE PINTADO
 * =====================================================
 */

// Variable privada del módulo
let CATALOGO_IMAGENES = {};

// Función para inicializar el catálogo
function inicializarCatalogo(catalogo) {
    CATALOGO_IMAGENES = catalogo;
}

// Obtener ruta de imagen
function getImageSrc(imageId) {
    if (CATALOGO_IMAGENES[imageId]) {
        return CATALOGO_IMAGENES[imageId];
    } else if (imageId) {
        console.warn(`⚠️ Imagen no encontrada: ${imageId}`);
        return null;
    }
    return null;
}

// Renderizar imagen
function renderizarImagen(imageId, className = "img-placeholder") {
    if (!imageId) return '';
    const src = getImageSrc(imageId);
    if (src) {
        return `<div class="${className}"><img src="${src}" alt="Imagen referencia" style="width:100%; height:auto;"></div>`;
    }
    return `<div class="${className}">📷 [IMAGEN: ${imageId}] - Verificar catálogo en JSON</div>`;
}

// Renderizar enlaces
function renderizarEnlaces(enlaces) {
    if (!enlaces || enlaces.length === 0) return '';
    return `<p style="margin-top: 2rem; font-size: 1.1rem; color: var(--color-text-mut); max-width: 800px;">
                *Se asume la revisión de ${enlaces.map(e => `<a href="${e.url}" target="_blank">${e.texto}</a>`).join(", ")}.
            </p>`;
}

// Tipos de diapositivas
const Renderizadores = {
portada: (slide) => `
    <div class="sidebar">
        <div class="section-marker">${slide.marker}</div>
        <div class="nav-hints">→ Flecha Der / Espacio<br>← Flecha Izq<br>[F] Pantalla Completa</div>
    </div>
    <div class="content">
        <div class="subtitle">${slide.subtitulo || "Actividad Presencial"}</div>
        <h1>${slide.titulo}</h1>
        <ul class="points" style="border:none; padding:0; margin-top:2rem;">
            <li style="border:none; padding:0; font-weight:800;">${slide.texto_extra || ""}</li>
            <li style="border:none; padding:0; font-size:1.2rem; color:var(--color-text-mut);">${slide.texto_extra2 || ""}</li>
        </ul>
    </div>
`,

    lista: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content">
            <div class="subtitle">${slide.subtitulo}</div>
            <h1>${slide.titulo}</h1>
            <ul class="points">${slide.puntos.map(p => `<li>${p}</li>`).join('')}</ul>
            ${slide.imagen_id ? renderizarImagen(slide.imagen_id) : ''}
            ${slide.enlaces ? renderizarEnlaces(slide.enlaces) : ''}
        </div>
    `,

    lista_con_imagen: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content">
            <div class="subtitle">${slide.subtitulo}</div>
            <h1>${slide.titulo}</h1>
            <ul class="points">${slide.puntos.map(p => `<li>${p}</li>`).join('')}</ul>
            ${slide.imagen_id ? renderizarImagen(slide.imagen_id) : ''}
            ${slide.enlaces ? renderizarEnlaces(slide.enlaces) : ''}
        </div>
    `,

    interactiva: (slide) => {
        const uniqueId = `ans_${slide.id}_${Date.now()}`;
        return `
            <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
            <div class="content">
                <div class="subtitle">${slide.subtitulo}</div>
                <h1>${slide.titulo}</h1>
                <div style="font-size: 2.2rem; font-weight: 300; margin-bottom: 2rem; max-width: 900px;">
                    ${slide.pregunta}
                </div>
                <button class="btn" onclick="window.toggleAnswer('${uniqueId}')">Evaluar Impacto</button>
                <div id="${uniqueId}" class="hidden-content">${slide.respuesta_oculta}</div>
                ${slide.imagen_id ? renderizarImagen(slide.imagen_id) : ''}
            </div>
        `;
    },

    practica: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content">
            <div class="icon-large">${slide.icono || "📊"}</div>
            <div class="subtitle">${slide.subtitulo}</div>
            <h1>${slide.titulo}</h1>
            <div style="font-size: 1.5rem; font-weight: 500; margin-top: 1rem;">
                Herramientas permitidas:<br>
                ${slide.herramientas.map(h => `<span style="color:var(--color-accent); font-weight: 800;">${h}</span>`).join(", ")}
            </div>
            <div style="margin-top: 1.5rem; font-size: 1.15rem; color: var(--color-text-mut);">
                ${slide.descripcion}
            </div>
            ${slide.imagen_id ? renderizarImagen(slide.imagen_id) : ''}
        </div>
    `,

    tabla: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content">
            <div class="subtitle">${slide.subtitulo}</div>
            <h1>${slide.titulo}</h1>
            <table>
                <thead><tr>${slide.columnas_tabla.map(col => `<th>${col}</th>`).join('')}</tr></thead>
                <tbody>${slide.datos_tabla.map(fila => `<tr>${fila.map(celda => `<td>${celda}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
            ${slide.nota_calendario ? `
            <div style="margin-top: 1.5rem; font-size: 1.05rem; border: 1px solid #cbd5e1; border-left: 6px solid var(--color-accent-dark); padding: 1rem; background: var(--color-surface);">
                <strong style="color: var(--color-accent-dark); text-transform: uppercase; font-size: 0.95rem;">Parámetros de Calendario</strong><br><br>
                • <strong>Fecha de Inicio:</strong> ${slide.nota_calendario.inicio}<br>
                • <strong>Jornada Operativa:</strong> ${slide.nota_calendario.jornada}<br>
                • <strong>Feriados Obligatorios:</strong> ${slide.nota_calendario.feriados}
            </div>
            ` : ''}
            ${slide.imagen_id ? renderizarImagen(slide.imagen_id) : ''}
        </div>
    `,

    grid_cajas: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content">
            <div class="subtitle">${slide.subtitulo}</div>
            <h1>${slide.titulo}</h1>
            <div class="grid-2" style="grid-template-columns: 1fr;">
                ${slide.cajas.map(caja => `
                    <div class="rubric-box" style="border-left: 8px solid ${caja.color_borde || '#0f766e'};">
                        <h3>${caja.titulo}</h3>
                        <p>${caja.descripcion}</p>
                    </div>
                `).join('')}
            </div>
            ${slide.imagen_id ? renderizarImagen(slide.imagen_id) : ''}
        </div>
    `,

    rubrica: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content">
            <div class="subtitle">${slide.subtitulo}</div>
            <h1>${slide.titulo}</h1>
            <div class="grid-2">
                ${slide.rubricas.map(r => `
                    <div class="rubric-box">
                        <span class="pts">${r.puntos}</span>
                        <h3>${r.titulo}</h3>
                        <p>${r.descripcion}</p>
                    </div>
                `).join('')}
            </div>
            ${slide.imagen_id ? renderizarImagen(slide.imagen_id) : ''}
        </div>
    `,

    cita: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content">
            <div class="subtitle">${slide.subtitulo}</div>
            <h1>${slide.titulo}</h1>
            ${slide.imagen_id ? renderizarImagen(slide.imagen_id) : ''}
            <div style="font-size: 2.2rem; font-weight: 300; margin-top: 2rem; line-height: 1.3; border-left: 4px solid var(--color-accent); padding-left: 2rem;">
                ${slide.cita}
            </div>
        </div>
    `
};

// Función principal de renderizado
function renderizarDiapositiva(slide) {
    const renderizador = Renderizadores[slide.tipo];
    if (renderizador) {
        return renderizador(slide);
    }
    return `<div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
            <div class="content"><h1>${slide.titulo || "Tipo no soportado"}</h1></div>`;
}

// Exportar funciones globales
window.PresentacionRender = {
    inicializarCatalogo,
    renderizarDiapositiva
};

// Nueva función para renderizar SIN sidebar (para usar con menú global)
function renderizarDiapositivaSinSidebar(slide) {
    const renderizador = Renderizadores[slide.tipo];
    if (renderizador) {
        // Extraer solo el content de cada renderizador (sin el sidebar)
        const htmlCompleto = renderizador(slide);
        // Extraer solo la parte del content
        const contentMatch = htmlCompleto.match(/<div class="content">([\s\S]*?)<\/div>\s*$/);
        if (contentMatch) {
            return `<div class="content">${contentMatch[1]}</div>`;
        }
        return htmlCompleto;
    }
    return `<div class="content"><h1>${slide.titulo || "Tipo no soportado"}</h1></div>`;
}

// Actualizar el objeto de exportación
window.PresentacionRender = {
    inicializarCatalogo,
    renderizarDiapositiva,
    renderizarDiapositivaSinSidebar  // ← NUEVA
};
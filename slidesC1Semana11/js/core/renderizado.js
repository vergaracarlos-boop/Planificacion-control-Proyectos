/**
 * =====================================================
 * MÓDULO DE RENDERIZADO - FUNCIONES DE PINTADO
 * VERSIÓN CON PROCESAMIENTO DE ECUACIONES «...»
 * =====================================================
 */

let CATALOGO_IMAGENES = {};

function inicializarCatalogo(catalogo) {
    CATALOGO_IMAGENES = catalogo;
}

function getImageSrc(imageId) {
    if (CATALOGO_IMAGENES[imageId]) {
        return CATALOGO_IMAGENES[imageId];
    } else if (imageId) {
        console.warn(`Imagen no encontrada: ${imageId}`);
        return null;
    }
    return null;
}

function renderizarImagen(imageId, className = "img-placeholder") {
    if (!imageId) return '';
    const src = getImageSrc(imageId);
    if (src) {
        return `<div class="${className} img-clickable" onclick="window.abrirLightbox('${src}')">
                    <img src="${src}" alt="Imagen referencia" style="width:100%; height:auto;">
                </div>`;
    }
    return `<div class="${className}">[IMAGEN: ${imageId}] - Verificar carpeta imagenes/</div>`;
}

function renderizarEnlaces(enlaces) {
    if (!enlaces || enlaces.length === 0) return '';
    return `<p style="margin-top: 2rem; font-size: 1.1rem; color: var(--color-text-mut); max-width: 800px;">
                *Se asume la revisión de ${enlaces.map(e => `<a href="${e.url}" target="_blank">${e.texto}</a>`).join(", ")}.
            </p>`;
}

function getImagenId(slide) {
    return slide.imagen || slide.imagen_id || null;
}

// =====================================================
// CONVERSOR DE ECUACIONES
// «sigma» → $$sigma$$        (símbolo simple)
// «/sigma» → $$\sigma$$      (/ = prefijo LaTeX → \)
// «/dfrac{a}{b}» → $$\dfrac{a}{b}$$
// =====================================================
function procesarEcuaciones(html) {
    // Display math: ««...»» → $$...$$ (ecuación centrada, en bloque propio)
    html = html.replace(/««([^»]+)»»/g, (match, contenido) => {
        const latex = contenido.replace(/\/([a-zA-Z])/g, '\\$1');
        return `\\[${latex}\\]`;
    });
    // Inline math: «...» → $$...$$
    html = html.replace(/«([^»]+)»/g, (match, contenido) => {
        const latex = contenido.replace(/\/([a-zA-Z])/g, '\\$1');
        return `\\(${latex}\\)`;
    });
    return html;
}


// =====================================================
// RENDERIZADORES POR TIPO
// =====================================================

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
            <ul class="points">${slide.puntos ? slide.puntos.map(p => `<li>${p}</li>`).join('') : '<li>No hay puntos definidos</li>'}</ul>
            ${renderizarImagen(getImagenId(slide))}
            ${renderizarEnlaces(slide.enlaces)}
        </div>
    `,

    lista_con_imagen: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content">
            <div class="subtitle">${slide.subtitulo}</div>
            <h1>${slide.titulo}</h1>
            <ul class="points">${slide.puntos ? slide.puntos.map(p => `<li>${p}</li>`).join('') : '<li>No hay puntos definidos</li>'}</ul>
            ${renderizarImagen(getImagenId(slide))}
            ${renderizarEnlaces(slide.enlaces)}
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
                    ${slide.pregunta || 'No se definió una pregunta'}
                </div>
                <button class="btn" onclick="window.toggleAnswer('${uniqueId}')">Evaluar Impacto</button>
                <div id="${uniqueId}" class="hidden-content">${slide.respuesta_oculta || 'No se definió una respuesta'}</div>
                ${renderizarImagen(getImagenId(slide))}
            </div>
        `;
    },

    practica: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content">
            <div class="icon-large" style="font-size: 4rem;">${slide.icono || "📊"}</div>
            <div class="subtitle">${slide.subtitulo}</div>
            <h1>${slide.titulo}</h1>
            <div style="font-size: 1.5rem; font-weight: 500; margin-top: 1rem;">
                Herramientas permitidas:<br>
                ${slide.herramientas ? slide.herramientas.map(h => `<span style="color:var(--color-accent); font-weight: 800;">${h}</span>`).join(", ") : 'No se definieron herramientas'}
            </div>
            <div style="margin-top: 1.5rem; font-size: 1.15rem; color: var(--color-text-mut);">
                ${slide.descripcion || ''}
            </div>
            ${renderizarImagen(getImagenId(slide))}
        </div>
    `,

    tabla: (slide) => {
        if (!slide.columnas_tabla || !slide.datos_tabla) {
            return `
                <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
                <div class="content">
                    <div class="subtitle">${slide.subtitulo}</div>
                    <h1>${slide.titulo}</h1>
                    <div style="color: #e53e3e; padding: 1rem; border: 1px solid #e53e3e;">
                        Error: Faltan datos de tabla (columnas_tabla o datos_tabla)
                    </div>
                </div>
            `;
        }

        return `
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
                ${renderizarImagen(getImagenId(slide))}
            </div>
        `;
    },

    grid_cajas: (slide) => {
        const items = slide.tarjetas || slide.cajas;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return `
                <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
                <div class="content">
                    <div class="subtitle">${slide.subtitulo}</div>
                    <h1>${slide.titulo}</h1>
                    <p style="color:#e53e3e;">Falta la propiedad "tarjetas" en esta diapositiva.</p>
                </div>
            `;
        }

        return `
            <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
            <div class="content">
                <div class="subtitle">${slide.subtitulo}</div>
                <h1>${slide.titulo}</h1>
                <div style="display:flex; flex-direction:column; gap:1.25rem; width:100%; max-width:800px;">
                    ${items.map((caja, i) => `
                        <div class="rubric-box" style="border-left:6px solid ${caja.color_borde || '#0f766e'}; padding:1.2rem 1.5rem; background:#fff;">
                            <h3 style="font-size:0.95rem; margin-bottom:0.5rem; letter-spacing:0.02em;">${caja.titulo}</h3>
                            <p style="font-size:0.88rem; line-height:1.75; color:var(--color-text-mut); margin:0;">${caja.contenido || caja.descripcion || ''}</p>
                        </div>
                    `).join('')}
                </div>
                ${renderizarImagen(getImagenId(slide))}
            </div>
        `;
    },



    rubrica: (slide) => {
        const items = slide.criterios || slide.rubricas;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return `
                <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
                <div class="content">
                    <div class="subtitle">${slide.subtitulo}</div>
                    <h1>${slide.titulo}</h1>
                    <div style="color: #e53e3e; padding: 1rem; border: 1px solid #e53e3e;">
                        Error: Faltan datos de rúbrica
                    </div>
                </div>
            `;
        }

        return `
            <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
            <div class="content">
                <div class="subtitle">${slide.subtitulo}</div>
                <h1>${slide.titulo}</h1>
                <div class="grid-2">
                    ${items.map(r => `
                        <div class="rubric-box">
                            <span class="pts">${r.puntaje || r.puntos || ''}</span>
                            <h3>${r.criterio || r.titulo || ''}</h3>
                            <p>${r.descripcion || ''}</p>
                        </div>
                    `).join('')}
                </div>
                ${renderizarImagen(getImagenId(slide))}
            </div>
        `;
    },

    cita: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content">
            <div class="subtitle">${slide.subtitulo}</div>
            <h1>${slide.titulo}</h1>
            ${renderizarImagen(getImagenId(slide))}
            <div style="font-size: 2.2rem; font-weight: 300; margin-top: 2rem; line-height: 1.3; border-left: 4px solid var(--color-accent); padding-left: 2rem;">
                ${slide.cita || 'No se definió una cita'}
            </div>
        </div>
    `,
        // ✅ NUEVO: Slide de solo imagen con título
    imagen_full: (slide) => `
        <div class="sidebar"><div class="section-marker">${slide.marker}</div></div>
        <div class="content" style="justify-content: flex-start; padding-top: 2rem;">
            <div class="subtitle">${slide.subtitulo || ''}</div>
            <h1 style="margin-bottom: 1rem;">${slide.titulo}</h1>
            ${renderizarImagen(getImagenId(slide), "img-placeholder img-full")}
        </div>
    `
};

// =====================================================
// FUNCIONES DE RENDERIZADO PRINCIPAL
// =====================================================

function renderizarDiapositiva(slide) {
    const renderizador = Renderizadores[slide.tipo];
    if (renderizador) {
        return procesarEcuaciones(renderizador(slide));
    }
    return procesarEcuaciones(`<div class="sidebar"><div class="section-marker">${slide.marker || 'ERROR'}</div></div>
            <div class="content"><h1>Tipo no soportado: ${slide.tipo || 'desconocido'}</h1></div>`);
}

function renderizarDiapositivaSinSidebar(slide) {
    const renderizador = Renderizadores[slide.tipo];
    if (renderizador) {
        const htmlCompleto = procesarEcuaciones(renderizador(slide));
        const contentStart = htmlCompleto.indexOf('<div class="content">');
        if (contentStart !== -1) {
            return htmlCompleto.substring(contentStart);
        }
        return htmlCompleto;
    }
    return `<div class="content"><h1>${slide.titulo || "Tipo no soportado"}</h1></div>`;
}

window.PresentacionRender = {
    inicializarCatalogo,
    renderizarDiapositiva,
    renderizarDiapositivaSinSidebar
};

/**
 * =====================================================
 * MÓDULO DE NAVEGACIÓN - CONTROL Y EVENTOS
 * VERSIÓN CON KATEX
 * =====================================================
 */

let currentSlide = 0;
let slidesElements = [];
let totalSlides = 0;
let menuItems = [];

// Configuración KaTeX (reutilizable)
const KATEX_CONFIG = {
    delimiters: [
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '$$', right: '$$', display: true }
    ],
    throwOnError: false,
    trust: true
};

// Helper: renderizar KaTeX en un contenedor
function renderizarMath(contenedor) {
    if (window.renderMathInElement) {
        renderMathInElement(contenedor, KATEX_CONFIG);
    }
}

// Helper: esperar a que KaTeX esté listo
function esperarKaTeX(callback, intentos = 0) {
    if (window.renderMathInElement) {
        callback();
    } else if (intentos < 50) {
        setTimeout(() => esperarKaTeX(callback, intentos + 1), 100);
    } else {
        console.warn('⚠️ KaTeX auto-render no se cargó después de 5 segundos');
    }
}

function actualizarContador() {
    let counterElement = document.getElementById('slide-counter');
    if (!counterElement) {
        counterElement = document.createElement('div');
        counterElement.id = 'slide-counter';
        document.body.appendChild(counterElement);
    }
    counterElement.textContent = `${currentSlide + 1} de ${totalSlides}`;
}

function actualizarMenuActivo() {
    menuItems.forEach((item, index) => {
        if (index === currentSlide) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function actualizarBarraProgreso() {
    const progressBar = document.getElementById('progress');
    if (!progressBar || slidesElements.length === 0) return;
    const percent = ((currentSlide + 1) / slidesElements.length) * 100;
    progressBar.style.width = percent + '%';
}

function updateSlide() {
    slidesElements.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    actualizarBarraProgreso();
    actualizarContador();
    actualizarMenuActivo();

    // Renderizar math en el slide activo por si quedó algo sin procesar
    const slideActivo = slidesElements[currentSlide];
    if (slideActivo) {
        renderizarMath(slideActivo);
    }
}

function nextSlide() {
    if (currentSlide < slidesElements.length - 1) {
        currentSlide++;
        updateSlide();
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlide();
    }
}

function goToSlide(num) {
    if (num >= 0 && num < slidesElements.length) {
        currentSlide = num;
        updateSlide();
    }
}

function generarMenuLateral(diapositivas) {
    const menuContainer = document.getElementById('global-menu-container');
    if (!menuContainer) return;

    menuContainer.innerHTML = '';
    menuItems = [];

    diapositivas.forEach((slide, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        if (index === currentSlide) menuItem.classList.add('active');

        let titulo = '';
        if (slide.tipo === 'portada') {
            titulo = slide.subtitulo || slide.marker || `Slide ${index + 1}`;
        } else if (slide.titulo) {
            titulo = slide.titulo.length > 35 ? slide.titulo.substring(0, 32) + '...' : slide.titulo;
        } else {
            titulo = slide.marker || `Slide ${index + 1}`;
        }

        menuItem.innerHTML = `
            <span class="menu-badge"></span>
            <span class="menu-marker">${slide.marker || ''}</span>
            <span class="menu-title">${titulo}</span>
        `;

        menuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(index);
        });

        menuContainer.appendChild(menuItem);
        menuItems.push(menuItem);
    });
}

function construirPresentacion(datos) {
    const deck = document.getElementById('deck');
    if (!deck) return;

    deck.innerHTML = '';

    if (datos.catalogo_imagenes && window.PresentacionRender) {
        window.PresentacionRender.inicializarCatalogo(datos.catalogo_imagenes);
    }

    datos.diapositivas.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        if (index === 0) slideDiv.classList.add('active');
        slideDiv.innerHTML = window.PresentacionRender.renderizarDiapositivaSinSidebar(slide);
        deck.appendChild(slideDiv);
    });

    slidesElements = document.querySelectorAll('.slide');
    totalSlides = slidesElements.length;
    currentSlide = 0;

    generarMenuLateral(datos.diapositivas);

    actualizarBarraProgreso();
    actualizarContador();

    // ✅ Renderizar KaTeX en todo el deck cuando esté listo
    esperarKaTeX(() => {
        renderizarMath(deck);
        console.log('✅ KaTeX procesó todas las diapositivas');
    });
}

// Toggle para respuestas ocultas — renderiza math al revelar
window.toggleAnswer = function(id) {
    const el = document.getElementById(id);
    if (el) {
        const isVisible = el.style.display === 'block';
        el.style.display = isVisible ? 'none' : 'block';

        // Al mostrar, renderizar ecuaciones dentro de la respuesta
        if (!isVisible) {
            renderizarMath(el);
        }
    }
};

// Eventos de teclado
document.addEventListener('keydown', (e) => {
    // Si el lightbox está abierto, solo ESC lo cierra
    if (lightboxAbierto) {
        if (e.key === 'Escape') {
            e.preventDefault();
            window.cerrarLightbox();
        }
        return; // Bloquear navegación mientras el lightbox está abierto
    }

    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
    } else if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
});

// ========== LIGHTBOX DE IMÁGENES ==========
let lightboxAbierto = false;
let lightboxOverlay = null;

function crearLightbox() {
    if (lightboxOverlay) return;

    lightboxOverlay = document.createElement('div');
    lightboxOverlay.className = 'img-lightbox-overlay';
    lightboxOverlay.innerHTML = `
        <button class="img-lightbox-cerrar" onclick="window.cerrarLightbox(event)">&times;</button>
        <img src="" alt="Imagen ampliada">
        <span class="img-lightbox-hint">Clic en cualquier lugar o ESC para cerrar</span>
    `;

    lightboxOverlay.addEventListener('click', (e) => {
        // No cerrar si hacen clic en la imagen misma
        if (e.target.tagName === 'IMG') return;
        window.cerrarLightbox(e);
    });

    document.body.appendChild(lightboxOverlay);
}

window.abrirLightbox = function(src, event) {
    if (event) event.stopPropagation();

    crearLightbox();

    const img = lightboxOverlay.querySelector('img');
    img.src = src;

    lightboxOverlay.style.display = 'flex';
    // Trigger reflow para que la transición funcione
    lightboxOverlay.offsetHeight;
    lightboxOverlay.classList.add('visible');
    lightboxAbierto = true;
};

window.cerrarLightbox = function(event) {
    if (event) event.stopPropagation();
    if (!lightboxOverlay) return;

    lightboxOverlay.classList.remove('visible');

    setTimeout(() => {
        lightboxOverlay.style.display = 'none';
        lightboxAbierto = false;
    }, 250);
};


window.PresentacionNav = {
    nextSlide,
    prevSlide,
    goToSlide,
    construirPresentacion
};

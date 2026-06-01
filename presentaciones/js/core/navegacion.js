/**
 * =====================================================
 * MÓDULO DE NAVEGACIÓN - CONTROL Y EVENTOS
 * =====================================================
 */

let currentSlide = 0;
let slidesElements = [];
let totalSlides = 0;
let menuItems = [];

// Función para actualizar el contador de slides
function actualizarContador() {
    let counterElement = document.getElementById('slide-counter');
    if (!counterElement) {
        counterElement = document.createElement('div');
        counterElement.id = 'slide-counter';
        document.body.appendChild(counterElement);
    }
    counterElement.textContent = `${currentSlide + 1} de ${totalSlides}`;
}

// Función para actualizar el menú lateral
function actualizarMenuActivo() {
    menuItems.forEach((item, index) => {
        if (index === currentSlide) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Actualizar barra de progreso
function actualizarBarraProgreso() {
    const progressBar = document.getElementById('progress');
    if (!progressBar || slidesElements.length === 0) return;
    const percent = ((currentSlide + 1) / slidesElements.length) * 100;
    progressBar.style.width = percent + '%';
}

// Actualizar slide activo
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
}

// Navegación
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

// Función para generar el menú lateral GLOBAL
function generarMenuLateral(diapositivas) {
    const menuContainer = document.getElementById('global-menu-container');
    if (!menuContainer) {
        console.warn('No se encontró #global-menu-container');
        return;
    }
    
    menuContainer.innerHTML = '';
    menuItems = [];
    
    diapositivas.forEach((slide, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        if (index === currentSlide) menuItem.classList.add('active');
        
        // Obtener título para mostrar en el menú
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

// Construir presentación desde datos
function construirPresentacion(datos) {
    const deck = document.getElementById('deck');
    if (!deck) return;
    
    deck.innerHTML = '';
    
    if (datos.catalogo_imagenes && window.PresentacionRender) {
        window.PresentacionRender.inicializarCatalogo(datos.catalogo_imagenes);
    }
    
    // Renderizar diapositivas (sin sidebar porque ahora es global)
    datos.diapositivas.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        if (index === 0) slideDiv.classList.add('active');
        // Usar renderizado SIN sidebar
        slideDiv.innerHTML = window.PresentacionRender.renderizarDiapositivaSinSidebar(slide);
        deck.appendChild(slideDiv);
    });
    
    slidesElements = document.querySelectorAll('.slide');
    totalSlides = slidesElements.length;
    currentSlide = 0;
    
    // Generar menú lateral global
    generarMenuLateral(datos.diapositivas);
    
    actualizarBarraProgreso();
    actualizarContador();
}

// Toggle para respuestas
window.toggleAnswer = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = el.style.display === 'block' ? 'none' : 'block';
    }
};

// Eventos de teclado
document.addEventListener('keydown', (e) => {
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

window.PresentacionNav = {
    nextSlide,
    prevSlide,
    goToSlide,
    construirPresentacion
};
/**
 * world-cup-theme.js
 * Lógica modular para la temática del Mundial 2026 - Selección Argentina
 */

document.addEventListener('DOMContentLoaded', () => {
    const isWcTheme = document.body.classList.contains('wc-theme');
    if (!isWcTheme) return;

    console.log("World Cup 2026 Theme Active 🇦🇷⚽");

    // 1. Agregar decoraciones flotantes
    initWcDecorations();

    // 2. Manejar iconos temáticos en el header (si existen contenedores)
    addHeaderDecorations();

    // 3. Inyectar banner del mundial
    injectWcBanner();
});

function initWcDecorations() {
    const emojis = ['⚽', '⭐', '🇦🇷', '🏆'];
    const decorationCount = 8;

    for (let i = 0; i < decorationCount; i++) {
        const deco = document.createElement('div');
        deco.className = 'wc-decoration';
        deco.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        // Posición aleatoria
        deco.style.left = Math.random() * 90 + 'vw';
        deco.style.top = Math.random() * 90 + 'vh';

        // Retraso de animación aleatorio
        deco.style.animationDelay = Math.random() * 5 + 's';

        document.body.appendChild(deco);
    }
}

function addHeaderDecorations() {
    const header = document.querySelector('.header');
    if (!header) return;

    // 1. Estrellas arriba del logo
    const logoImg = header.querySelector('.logo-img');
    if (logoImg && !header.querySelector('.wc-stars-container')) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'wc-stars-container';
        starsContainer.innerHTML = '⭐ ⭐ ⭐';
        starsContainer.style.textAlign = 'center';
        starsContainer.style.fontSize = '24px';
        starsContainer.style.marginBottom = '5px';
        logoImg.parentNode.insertBefore(starsContainer, logoImg);
    }

    // 2. Pelota al lado de Resto Bar
    const tagline = header.querySelector('.tagline');
    if (tagline && !tagline.querySelector('.wc-ball-icon')) {
        const ball = document.createElement('span');
        ball.className = 'wc-ball-icon';
        ball.innerHTML = ' ⚽';
        tagline.append(ball);
    }
}

function injectWcBanner() {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;

    // Solo insertar si no existe ya
    if (document.querySelector('.wc-promo-banner')) return;

    const banner = document.createElement('div');
    banner.className = 'wc-promo-banner';
    banner.innerHTML = `
        <div class="wc-trophy-bg">🏆</div>
        <h2>VIVÍ EL MUNDIAL CON EL MEJOR SABOR</h2>
        <p>Especial Mundial 2026 🇦🇷</p>
    `;

    // Insertar antes del contenedor de secciones o al principio de éste
    menuContainer.parentNode.insertBefore(banner, menuContainer);
}

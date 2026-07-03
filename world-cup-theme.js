/**
 * world-cup-theme.js
 * Lógica modular para la temática del Mundial 2026 - Selección Argentina
 */

document.addEventListener('DOMContentLoaded', () => {
    const isWcTheme = document.body.classList.contains('wc-theme');
    if (!isWcTheme) return;

    console.log("World Cup 2026 Theme Active 🇦🇷⚽");

    // 1. Manejar iconos temáticos en el header (si existen contenedores)
    addHeaderDecorations();

    // 3. Inyectar banner del mundial
    injectWcBanner();
});

function addHeaderDecorations() {
    const header = document.querySelector('.header');
    if (!header) return;

    // 1. Estrellas arriba del logo + bandera discreta
    const logoImg = header.querySelector('.logo-img');
    if (logoImg && !header.querySelector('.wc-stars-container')) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'wc-stars-container';
        starsContainer.innerHTML = '⭐ ⭐ ⭐ <span style="font-size: 16px; vertical-align: middle; margin-left: 8px;">🇦🇷</span>';
        starsContainer.style.textAlign = 'center';
        starsContainer.style.fontSize = '24px';
        starsContainer.style.marginBottom = '5px';
        logoImg.parentNode.insertBefore(starsContainer, logoImg);
    }

    // 2. Una sola pelota en la parte superior, discreta
    if (!header.querySelector('.wc-header-ball')) {
        const ball = document.createElement('div');
        ball.className = 'wc-header-ball';
        ball.innerHTML = '⚽';
        ball.style.position = 'absolute';
        ball.style.top = '40px';
        ball.style.right = '20px';
        ball.style.fontSize = '20px';
        ball.style.opacity = '0.5';
        header.appendChild(ball);
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
        <div class="wc-banner-decor">
            <div class="wc-banner-stars">⭐ ⭐ ⭐</div>
            <div class="wc-banner-flag">🇦🇷</div>
        </div>
        <h2>VIVÍ EL MUNDIAL CON EL MEJOR SABOR</h2>
        <p>Especial Mundial 2026</p>
    `;

    // Insertar antes del contenedor de secciones o al principio de éste
    menuContainer.parentNode.insertBefore(banner, menuContainer);
}

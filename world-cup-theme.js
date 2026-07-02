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

    // Insertar estrellas y pelota cerca del logo o tagline
    const tagline = header.querySelector('.tagline');
    if (tagline) {
        const stars = document.createElement('span');
        stars.className = 'wc-header-icon';
        stars.innerHTML = '⭐ ⭐ ⭐';
        tagline.prepend(stars);

        const ball = document.createElement('span');
        ball.className = 'wc-header-icon';
        ball.innerHTML = '⚽';
        tagline.append(ball);
    }
}

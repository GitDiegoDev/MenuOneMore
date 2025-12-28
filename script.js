// =========================
// script.js - Unificado y adaptado para API Laravel
// =========================
function formatPrice(num) {
    return Number(num).toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// ========= CONFIG ==========
const API_BASE = "https://backend-menu-production.up.railway.app/api";
const API = API_BASE;
// Función para saber si es jueves
function esJueves() {
    const hoy = new Date().getDay();
    return hoy === 4; // jueves = 4
}
// Función para saber si coincide el día configurado
function coincideDia(day) {
    const hoy = new Date().getDay(); // 0-6
    return hoy === day;
}

// Escapar HTML para evitar inyecciones
function escapeHTML(str) {
    return str?.replace(/[&<>'"]/g, function (tag) {
        const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
        return chars[tag] || tag;
    }) ?? '';
}

// =====================================================================
// ============= FETCH + RENDER DE PROMOS SIN DUPLICAR =================
// =====================================================================
async function fetchAndRenderPromos() {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;

    try {
        const res = await fetch(`${API_BASE}/promos`);
        if (!res.ok) throw new Error("No se pudieron cargar las promos");
        const promos = await res.json();

        // Limpiar promos previas
        document.querySelectorAll(".promo-item").forEach(el => el.remove());
        document.querySelectorAll(".promo-banner").forEach(el => el.remove());
        document.querySelectorAll(".solo-hoy-badge").forEach(el => el.remove());

        const hoy = new Date().getDay(); // 0-6

        // Filtrar promos activas del día
        const promosHoy = promos.filter(promo => {
            if (promo.active != 1) return false;

            if (promo.day_of_week !== null && promo.day_of_week !== undefined) {
                return Number(promo.day_of_week) === hoy;
            }

            return false;
        });

        if (promosHoy.length === 0) return;

        // Banner una sola vez dentro de la primera sección del menú
        const firstSection = menuContainer.querySelector('.menu-section') || document.querySelector('.menu-section');
        if (!firstSection) return;
        if (!firstSection.querySelector('.promo-banner')) {
            firstSection.insertAdjacentHTML("afterbegin", `
                <div class="promo-banner">
                    <h2>🎉 PROMO DEL DÍA 🎉</h2>
                    <p>¡Aprovechá nuestras promos especiales de hoy!</p>
                </div>
                <div class="solo-hoy-badge">¡SOLO HOY!</div>
            `);
        }

        // Render de cada promo
        promosHoy.forEach(promo => {
            const price = promo.price ?? 0;

            const promoHTML = `
                <div class="menu-item promo-item destacado"
                    data-item="${escapeHTML(promo.title)}"
                    data-price="${price}">

                    <div class="new-badge">NUEVO ⭐</div>
                    <div class="savings-badge">${promo.savings_badge ?? "Promo especial"}</div>

                    <div class="item-header">
                        <div class="item-name">${escapeHTML(promo.title).toUpperCase()}</div>
                        <div class="item-price">$ ${formatPrice(price)}</div>
                    </div>

                    <div class="item-description">${escapeHTML(promo.description)}</div>

                    <div class="item-details">
                        <button class="add-to-order promo-button">
                            🎉 Agregar PROMO al pedido
                        </button>
                    </div>
                </div>
            `;

            // Insertar cada promo como primer elemento dentro de la sección (mantiene estructura)
            firstSection.insertAdjacentHTML("afterbegin", promoHTML);
        });

        reassignEventListeners();

    } catch (err) {
        console.warn("fetchAndRenderPromos error:", err);
        reassignEventListeners();
    }
}

// Fetch and render site config (horario y dias cerrados) for public menu
async function fetchAndRenderSiteConfig() {
    let config = null;
    try {
        const res = await fetch(`${API_BASE}/site-config`);
        if (res.ok) config = await res.json();
    } catch (e) {
        console.warn('No se pudo cargar site-config desde API, usando localStorage');
    }

    if (!config) {
        try {
            const raw = localStorage.getItem('site_config');
            config = raw ? JSON.parse(raw) : null;
        } catch (e) { config = null; }
    }

    const target = document.getElementById('site-hours');
    if (!target) return;

    if (!config) {
        target.textContent = '';
        return;
    }

    const daysMap = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const openDays = (config.open_days || [1,2,3,4,5,6]);
    const daysText = openDays.map(d => daysMap[d]).join(', ');
    const hoursText = (config.open_time && config.close_time) ? `${config.open_time} - ${config.close_time}` : '';
    const closed = (config.closed_dates || []).join(', ');
    // Build a structured, styled HTML block and compute open/closed status
    const parts = [];
    if (hoursText) parts.push(`<span class="site-hours-hours"><strong>${escapeHTML(hoursText)}</strong></span>`);
    if (daysText) parts.push(`<span class="site-hours-days">${escapeHTML(daysText)}</span>`);
    // closed will be rendered as a separate small badge so it doesn't push layout

    // Helper: determine if open now
    function isOpenNow(cfg) {
        if (!cfg) return false;
        const now = new Date();
        const todayIdx = now.getDay();
        const pad = n => String(n).padStart(2, '0');
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;

        if (Array.isArray(cfg.closed_dates) && cfg.closed_dates.includes(todayStr)) return false;
        if (Array.isArray(cfg.open_days) && !cfg.open_days.includes(todayIdx)) return false;

        if (!cfg.open_time || !cfg.close_time) return false;
        const [oh, om] = cfg.open_time.split(':').map(Number);
        const [ch, cm] = cfg.close_time.split(':').map(Number);
        if (Number.isNaN(oh) || Number.isNaN(om) || Number.isNaN(ch) || Number.isNaN(cm)) return false;

        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const openMinutes = oh * 60 + om;
        const closeMinutes = ch * 60 + cm;

        if (openMinutes <= closeMinutes) {
            return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
        }
        // Overnight range (e.g., 20:00 - 02:00)
        return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
    }

    const openNow = isOpenNow(config);
    const statusText = openNow ? 'Abierto ahora' : 'Cerrado';
    const pillClass = openNow ? 'site-hours-pill site-hours-open' : 'site-hours-pill site-hours-closed';
    const icon = openNow ? '🟢' : '⛔';

    const closedHtml = closed ? `<div class="site-hours-closed-badge">Cerrado: ${escapeHTML(closed)}</div>` : '';

    const html = `
        <div class="${pillClass}" role="status" aria-live="polite">
            <span class="site-hours-icon">${icon}</span>
            <div class="site-hours-main">
                <div class="site-hours-content">
                    <div class="site-hours-status">${escapeHTML(statusText)}</div>
                    ${parts.length ? '<span class="site-hours-sep">•</span>' + parts.join('<span class="site-hours-sep">•</span>') : ''}
                </div>
                ${closedHtml}
            </div>
        </div>
    `;

    target.innerHTML = html;
}



// ========= SISTEMA PRINCIPAL & RENDER DINÁMICO =========

// Sistema de pestañas
const tabs = document.querySelectorAll('.tab');
const sections = document.querySelectorAll('.menu-section');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const sectionId = tab.dataset.section;

        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(sectionId).classList.add('active')
    });
});

// Util helper para escapar HTML cuando inyectamos texto (previene XSS)
function escapeHTML(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ---------- Fetch y render de productos (POR CATEGORÍA DINÁMICA) ----------
async function fetchAndRenderProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error('No se pudieron cargar los productos');

        const products = await res.json();

        // Limpiar todas las secciones de categorías
        document.querySelectorAll('.menu-section').forEach(section => {
            section.innerHTML = '';
        });

        products.forEach(p => {
            const container = document.getElementById(`cat-${p.category_id}`);
            if (!container) return;

            const isNew = p.is_new || p.isNew || false;
            const price = p.price ?? 0;
            const hasVariants = p.variants && p.variants.length > 0;
            const imageHtml =
                p.images && p.images.length
                    ? `<img src="${escapeHTML(p.images[0])}" alt="${escapeHTML(p.name)}" class="product-img">`
                    : '';

            const div = document.createElement('div');
            div.className = 'menu-item';
            div.dataset.id = p.id;
            div.dataset.item = p.name;
            div.dataset.price = price;

            div.innerHTML = `
                <div class="click-indicator"></div>
                ${isNew ? '<div class="new-badge">NUEVO</div>' : ''}
                ${imageHtml}

                <div class="item-header">
                    <div class="item-name">${escapeHTML(p.name).toUpperCase()}</div>
                    <div class="item-price">$ ${formatPrice(price)}</div>
                </div>

                ${ hasVariants ? `<div class="item-description variant-only">Elegí una versión</div>` : `<div class="item-description">${escapeHTML(p.description || '')}</div>` }

                <div class="item-details">
                    ${hasVariants ? renderVariantSelect(p.variants, p.description) : ''}
                    <button class="add-to-order">+ Agregar al pedido</button>
                </div>
            `;

            container.appendChild(div);
        });
        
// ====== BUSCAR SECCIÓN PIZZAS ======
const pizzasSection = document.querySelector('[data-category="pizzas"]');


console.log('pizzasSection:', pizzasSection);

// ====== INSERTAR "PIZZA MITAD & MITAD" SOLO UNA VEZ ======
if (pizzasSection && !pizzasSection.querySelector('[data-item="Pizza Mitad & Mitad"]')) {
    pizzasSection.insertAdjacentHTML(
        'afterbegin',
        `
        <div class="menu-item halfhalf-item"
            data-item="Pizza Mitad & Mitad"
            data-price="0"
            onclick="openHalfHalfModal()">

            <div class="new-badge">NUEVO</div>
            <div class="click-indicator"></div>

            <div class="item-header">
                <div class="item-name">🍕 Pizza Mitad & Mitad</div>
                <div class="item-price">Elegí sabores</div>
            </div>

            <div class="item-description">
                ¡Combiná dos sabores en una sola pizza!<br>
                Elegí tus mitades y disfrutá de lo mejor de ambos mundos.
            </div>
        </div>
        `
    );
}


        // Reasignar eventos
        reassignEventListeners();

    } catch (err) {
        console.error('fetchAndRenderProducts error:', err);
    }
}

// Helper: crear select HTML para variantes (si tu API provee variantes)
function renderVariantSelect(variants, productDescription) {
    if (!variants || variants.length === 0) return '';

    let html = `<select class="variant">`;

    // Primera opción: descripción del producto (ingredientes)
    if (productDescription && productDescription.trim() !== '') {
        html += `
            <option value="${escapeHTML(productDescription)}">${escapeHTML(productDescription)}</option>
        `;
    }

    // Luego las variantes
    variants.forEach(v => {
        html += `
            <option value="${escapeHTML(v.name)}">${escapeHTML(v.name)}</option>
        `;
    });

    html += `</select>`;
    return html;
}


// Simple slugify para categorías si tu API no provee slug
function slugify(text) {
    return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
}

async function loadMenuCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        if (!res.ok) throw new Error('No se pudieron cargar categorías');

        const categories = await res.json();

        const tabsContainer = document.getElementById('category-tabs');
        const menuContainer = document.getElementById('menu-container');

        tabsContainer.innerHTML = '';
        menuContainer.innerHTML = '';

        categories.forEach((cat, index) => {
            // ---- TAB ----
            const btn = document.createElement('button');
            btn.className = 'tab' + (index === 0 ? ' active' : '');
            btn.dataset.section = `cat-${cat.id}`;
            btn.textContent = cat.name;

            tabsContainer.appendChild(btn);

            // ---- SECTION ----
             const section = document.createElement('div');
            section.id = `cat-${cat.id}`;
            section.className = 'menu-section' + (index === 0 ? ' active' : '');

            // 👇 MARCAR PIZZAS
            if (cat.name.toLowerCase().includes('pizza')) {
                section.dataset.category = 'pizzas';
            }

            menuContainer.appendChild(section);
        });
        document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const sectionId = tab.dataset.section;

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(sectionId)?.classList.add('active');
    });
});

        // Reasignar listeners de tabs
        reassignEventListeners();

    } catch (error) {
        console.error('Error cargando categorías del menú', error);
    }
}


// ========= SISTEMA DE CARRITO =========

let cart = [];

function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    cartCount.textContent = cart.length;

    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
        cartTotal.textContent = "";
        return;
    }

    cart.forEach((item) => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <div>${escapeHTML(item.name)} ${item.variant ? `(${escapeHTML(item.variant)})` : ''}</div>
            <div>$${item.price}</div>
        `;
        cartItems.appendChild(div);
        total += Number(item.price);
    });

    cartTotal.textContent = "Total: $" + total;
}

// ========== SISTEMA MITAD & MITAD ==========

let halfHalfModal = null;

function openHalfHalfModal() {
    halfHalfModal = document.getElementById('halfHalfModal');

    // Obtener todas las pizzas disponibles (renderizadas por fetchAndRenderProducts)
    const pizzasSection = document.querySelector('[data-category="pizzas"]');
    const pizzaItems = pizzasSection
    ? pizzasSection.querySelectorAll('.menu-item:not(.halfhalf-item)')
    : [];

    const firstHalfSelect = document.getElementById('firstHalf');
    const secondHalfSelect = document.getElementById('secondHalf');

    firstHalfSelect.innerHTML = '<option value="" disabled selected>Elegí un sabor</option>';
    secondHalfSelect.innerHTML = '<option value="" disabled selected>Elegí un sabor</option>';

    pizzaItems.forEach(item => {
        const name = item.dataset.item;
        const price = parseInt(item.dataset.price);
        // Excluir el ítem de "Pizza Mitad & Mitad" si existe
        if (name !== "Pizza Mitad & Mitad" && price > 0) {
            const option1 = document.createElement('option');
            option1.value = name;
            option1.textContent = `${name} - $${price}`;
            option1.dataset.price = price;

            const option2 = option1.cloneNode(true);

            firstHalfSelect.appendChild(option1);
            secondHalfSelect.appendChild(option2);
        }
    });

    document.getElementById('halfHalfTotal').textContent = 'Total: $0';
    document.getElementById('halfHalfDescription').textContent = 'Elegí dos sabores diferentes';

    halfHalfModal.style.display = 'flex';

    firstHalfSelect.addEventListener('change', updateHalfHalfPrice);
    secondHalfSelect.addEventListener('change', updateHalfHalfPrice);
}

function closeHalfHalfModal() {
    if (halfHalfModal) {
        halfHalfModal.style.display = 'none';
    }
}

function updateHalfHalfPrice() {
    const firstHalfSelect = document.getElementById('firstHalf');
    const secondHalfSelect = document.getElementById('secondHalf');
    const totalElem = document.getElementById('halfHalfTotal');
    const descriptionElem = document.getElementById('halfHalfDescription');

    const p1 = firstHalfSelect.selectedOptions[0]?.dataset.price ? parseInt(firstHalfSelect.selectedOptions[0].dataset.price) : 0;
    const p2 = secondHalfSelect.selectedOptions[0]?.dataset.price ? parseInt(secondHalfSelect.selectedOptions[0].dataset.price) : 0;

    if (p1 > 0 && p2 > 0) {
        const total = Math.max(p1, p2);
        totalElem.textContent = `Total: $${total}`;
        descriptionElem.textContent = `Mitad ${firstHalfSelect.value} + Mitad ${secondHalfSelect.value}`;
    } else {
        totalElem.textContent = 'Total: $0';
        descriptionElem.textContent = 'Elegí dos sabores diferentes';
    }
}

function addHalfHalfToCart() {
    const firstHalf = document.getElementById('firstHalf');
    const secondHalf = document.getElementById('secondHalf');

    const name1 = firstHalf.value;
    const name2 = secondHalf.value;

    const p1 = parseInt(firstHalf.selectedOptions[0]?.dataset.price);
    const p2 = parseInt(secondHalf.selectedOptions[0]?.dataset.price);

    if (!name1 || !name2) {
        alert("Por favor seleccioná ambos sabores para la pizza mitad y mitad");
        return;
    }

    if (name1 === name2) {
        alert("Elegí dos sabores diferentes");
        return;
    }

    const finalPrice = Math.max(p1, p2);
    const itemName = `Pizza Mitad y Mitad: ${name1} / ${name2}`;

    cart.push({
    product_id: null,
    name: itemName,
    price: finalPrice,
    quantity: 1,
    variant: null,
    is_custom: true
});

    updateCart();
    closeHalfHalfModal();

    const halfItem = document.querySelector('[data-item="Pizza Mitad & Mitad"]');
    if (halfItem) {
        halfItem.classList.add('pulse');
        setTimeout(() => halfItem.classList.remove('pulse'), 500);
    }

    const addButton = document.querySelector('#halfHalfModal .add-to-order');
    const original = addButton.textContent;
    addButton.textContent = "✓ Agregado!";
    setTimeout(() => addButton.textContent = original, 1500);
}

// ========= RE-ASIGNAR EVENTOS =========

function reassignEventListeners() {
    // Clonar nodos para eliminar listeners anteriores y evitar duplicados
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.replaceWith(item.cloneNode(true)));

    // Re-seleccionar después del clone
    const newItems = document.querySelectorAll('.menu-item');
    newItems.forEach(item => {
        item.addEventListener('click', e => {
            if (!e.target.classList.contains('add-to-order') &&
                !e.target.classList.contains('variant') &&
                !e.target.classList.contains('promo-button')) {
                item.classList.toggle('expanded');
            }
        });
    });

    // Botones agregar al carrito (incluyendo promos especiales)
    const addButtons = document.querySelectorAll('.add-to-order');
    addButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const parent = this.closest('.menu-item');
            const productId = parent.dataset.id;
            const name = parent.dataset.item;
            const price = parseInt(parent.dataset.price) || 0;
            const variantSelect = parent.querySelector('.variant');
                let variant = null;

                if (variantSelect) {
                    if (!variantSelect.value) {
                        alert("Por favor elegí una opción");
                        return;
                    }
                    variant = variantSelect.value;
                }


            // Si es promo-button y nombre contiene "Mitad" o promo específica, delegar
            if (this.classList.contains('promo-button')) {
                // Si es el botón de promo mitad y mitad (abre modal)
                if (parent.dataset.item && parent.dataset.item.toLowerCase().includes('mitad')) {
                    openHalfHalfModal();
                    return;
                }
                // Si es otra promo - agregar como item normal
            }

            // Agregar al carrito
            cart.push({
            product_id: parent.dataset.id ? Number(parent.dataset.id) : null,
            name,
            price,        // mismo precio del producto
            quantity: 1,
            variant       // solo texto
            });
            updateCart();
            parent.classList.add('pulse');
            setTimeout(() => parent.classList.remove('pulse'), 500);

            // Efecto visual de confirmación
            const originalText = this.textContent;
            this.textContent = "✓ Agregado!";
            setTimeout(() => {
                this.textContent = originalText;
            }, 1500);
        });
    });
}

// ========= CONFIG DEL CARRITO Y WHATSAPP =========

const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');

cartBtn.addEventListener('click', () => {
    cartModal.classList.add('active');
    updateCart();
});

closeCart.addEventListener('click', () => {
    cartModal.classList.remove('active');
});

const envioDomicilio = document.getElementById('envioDomicilio');
const retiroLocal = document.getElementById('retiroLocal');
const direccionContainer = document.getElementById('direccionContainer');

if (envioDomicilio && retiroLocal && direccionContainer) {
    envioDomicilio.addEventListener('change', () => {
        direccionContainer.style.display = 'block';
    });

    retiroLocal.addEventListener('change', () => {
        direccionContainer.style.display = 'none';
    });
}

const sendWhatsApp = document.getElementById('sendWhatsApp');
if (sendWhatsApp) {
    sendWhatsApp.addEventListener('click', async () => {
    if (cart.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    const deliveryType = document.querySelector('input[name="deliveryType"]:checked');
    if (!deliveryType) {
        alert("Por favor seleccioná si querés envío o retiro");
        return;
    }

    let address = null;
    if (deliveryType.value === "domicilio") {
        address = document.getElementById('direccionInput').value.trim();
        if (!address) {
            alert("Por favor ingresá tu dirección para el envío");
            return;
        }
    }

    const total = cart.reduce((acc, i) => acc + i.price, 0);

    /* ================= GUARDAR PEDIDO ================= */
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart,
                total,
                delivery_type: deliveryType.value,
                address
            })
        });

        if (!response.ok) {
            throw new Error('No se pudo guardar el pedido');
        }

    } catch (error) {
        console.error(error);
        alert("Error al guardar el pedido. Intentalo nuevamente.");
        return;
    }

    /* ================= WHATSAPP ================= */
    let message = "Hola! quiero hacer este pedido:%0A%0A";

    cart.forEach(item => {
        let cleanName = item.name
            .replace(/&/g, 'y')
            .replace(/%/g, 'por ciento')
            .replace(/#/g, 'num');

        if (cleanName.startsWith("Pizza Mitad y Mitad:")) {
            const [_, halves] = cleanName.split(":");
            const [half1, half2] = halves.split("/").map(s => s.trim());
            message += `• Pizza Mitad y Mitad (mitad ${half1} / mitad ${half2}) - $${item.price}%0A`;
        } else {
            message += `• ${cleanName}${item.variant ? ` (${item.variant})` : ''} - $${item.price}%0A`;
        }
    });

    message += `%0ATotal: $${total}%0A`;
    message += deliveryType.value === "domicilio"
        ? `%0AEnvío a domicilio • Dirección: ${address}`
        : `%0ARetiro en el local`;

    const phone = "5493755415870";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

    /* ================= LIMPIAR ================= */
    cart = [];
    updateCart();
    cartModal.classList.remove('active');
});
;
}
const REFRESH_INTERVAL_MS = 60000; // 1 minuto

// ========= INICIALIZACIÓN AL CARGAR LA PÁGINA =========

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar listeners básicos
    reassignEventListeners();
    loadMenuCategories();
    // Cargar datos iniciales
    fetchAndRenderProducts();
    fetchAndRenderPromos();
    fetchAndRenderSiteConfig();
    
    

    // Refresco automático
    setInterval(() => {
        fetchAndRenderProducts();
        fetchAndRenderPromos();
        fetchAndRenderSiteConfig();
    }, REFRESH_INTERVAL_MS);
});


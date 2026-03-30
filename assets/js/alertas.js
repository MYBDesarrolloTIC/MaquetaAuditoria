/* =======================================================================
 * ARCHIVO: alertas.js 
 * SISTEMA: Interceptor Global de Notificaciones (Toasts)
 * ======================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // 1. ELIMINAR CUALQUIER RASTRO DE CONTENEDORES VIEJOS (Izquierda o anteriores)
    const viejo1 = document.getElementById('toast-container-yb');
    const viejo2 = document.getElementById('contenedor-alertas-izq');
    const viejo3 = document.getElementById('contenedor-extremo-izq');
    if (viejo1) viejo1.remove();
    if (viejo2) viejo2.remove();
    if (viejo3) viejo3.remove();

    // 2. INYECTAR CSS DINÁMICO (Ahora anclado a la DERECHA)
    if (!document.getElementById('toast-styles-der')) {
        const style = document.createElement('style');
        style.id = 'toast-styles-der';
        style.innerHTML = `
            #contenedor-alertas-der {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important; /* <--- AHORA A LA DERECHA */
                left: auto !important;  /* <--- LIBERAMOS LA IZQUIERDA */
                z-index: 99999 !important;
                pointer-events: none;
            }
            .toast-personalizado {
                pointer-events: auto;
                border-radius: 12px;
                border: none;
                margin-top: 10px;
                min-width: 320px;
                animation: entrarDesdeDer 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes entrarDesdeDer {
                0% { transform: translateX(100%) scale(0.9); opacity: 0; }
                100% { transform: translateX(0) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // 3. CREAR EL NUEVO CONTENEDOR EN LA DERECHA
    if (!document.getElementById('contenedor-alertas-der')) {
        const container = document.createElement('div');
        container.id = 'contenedor-alertas-der';
        document.body.appendChild(container);
    }
});

function mostrarNotificacion(mensaje, tipo = 'success') {
    const container = document.getElementById('contenedor-alertas-der');
    if (!container) return;

    let bgClass = '';
    let textClass = 'text-white';
    let icon = '';
    let title = '';

    switch (tipo.toLowerCase()) {
        case 'success':
        case 'completado':
            bgClass = 'bg-success';
            icon = '<i class="fas fa-check-circle fs-3"></i>';
            title = '¡Completado!';
            break;
        case 'error':
        case 'fallo':
            bgClass = 'bg-danger';
            icon = '<i class="fas fa-times-circle fs-3"></i>';
            title = 'Fallo en la operación';
            break;
        case 'warning':
        case 'alerta':
            bgClass = 'bg-warning';
            textClass = 'text-dark';
            icon = '<i class="fas fa-exclamation-triangle fs-3"></i>';
            title = 'Alerta del Sistema';
            break;
        default:
            bgClass = 'bg-primary';
            icon = '<i class="fas fa-info-circle fs-3"></i>';
            title = 'Información';
            break;
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-personalizado align-items-center border-0 mb-3 shadow-lg ${bgClass} ${textClass}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex p-3">
            <div class="toast-body d-flex align-items-center gap-3 w-100 p-0">
                <div>${icon}</div>
                <div>
                    <strong class="d-block mb-1 fs-6">${title}</strong>
                    <span style="font-size: 0.95rem;">${mensaje}</span>
                </div>
            </div>
            <button type="button" class="btn-close ${textClass === 'text-white' ? 'btn-close-white' : ''} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    container.appendChild(toastEl);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

// =========================================================================
// INTERCEPTORES GLOBALES
// =========================================================================
window.alert = function(mensaje) {
    const tipo = String(mensaje).toLowerCase().includes('error') ? 'error' : 'warning';
    mostrarNotificacion(mensaje, tipo);
};

const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    try {
        const clone = response.clone();
        clone.json().then(data => {
            if (data && data.status === 1 && data.message && data.message !== "Acceso concedido") {
                mostrarNotificacion(data.message, 'success');
            }
        }).catch(() => {});
    } catch (e) {
        console.error("Error en interceptor de notificaciones:", e);
    }
    return response;
};
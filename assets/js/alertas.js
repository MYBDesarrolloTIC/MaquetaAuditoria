document.addEventListener("DOMContentLoaded", () => {
    // 1. Crear el contenedor de alertas dinámicamente si no existe
    if (!document.getElementById('toast-container-yb')) {
        const container = document.createElement('div');
        container.id = 'toast-container-yb';
        
        // Lo posicionamos fijo abajo a la izquierda
        container.style.position = 'fixed';
        container.style.bottom = '2rem';
        container.style.left = '2rem';
        container.style.right = 'auto'; // Anula el 'right' por si estaba en el CSS antiguo
        container.style.zIndex = '9999';
        container.style.pointerEvents = 'none'; // Para no bloquear clics invisibles
        
        document.body.appendChild(container);
    }
});

/**
 * Muestra una alerta en pantalla (Toast)
 * @param {string} mensaje - El texto que quieres mostrar
 * @param {string} tipo - 'success' (verde), 'error' (rojo), 'warning' (amarillo)
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
    const container = document.getElementById('toast-container-yb');
    if (!container) return;

    // Variables de estilo por defecto
    let bgClass = '';
    let textClass = 'text-white';
    let icon = '';
    let title = '';

    // Lógica para elegir el color según el tipo
    switch (tipo.toLowerCase()) {
        case 'success':
        case 'completado':
            bgClass = 'bg-success'; // Verde
            icon = '<i class="fas fa-check-circle fs-3"></i>';
            title = '¡Completado!';
            break;
        case 'error':
        case 'fallo':
            bgClass = 'bg-danger'; // Rojo
            icon = '<i class="fas fa-times-circle fs-3"></i>';
            title = 'Fallo en la operación';
            break;
        case 'warning':
        case 'alerta':
            bgClass = 'bg-warning'; // Amarillo
            textClass = 'text-dark'; // Texto oscuro para contrastar con el amarillo
            icon = '<i class="fas fa-exclamation-triangle fs-3"></i>';
            title = 'Alerta / Error';
            break;
        default:
            bgClass = 'bg-primary';
            icon = '<i class="fas fa-info-circle fs-3"></i>';
            title = 'Información';
            break;
    }

    // 2. Crear el elemento HTML del Toast
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 mb-3 shadow-lg ${bgClass} ${textClass}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.style.minWidth = '320px';
    toastEl.style.borderRadius = '12px';
    toastEl.style.pointerEvents = 'auto'; // Permitir clics para cerrarlo manual
    
    // Animación de entrada personalizada desde la izquierda
    toastEl.style.animation = 'slideInLeftToast 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

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

    // 3. Iniciar el Toast con Bootstrap y hacerlo durar 4 segundos (4000ms)
    const bsToast = new bootstrap.Toast(toastEl, {
        delay: 4000
    });
    bsToast.show();

    // 4. Limpiar la basura: Borrar el HTML del DOM cuando termine la animación de cierre
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}
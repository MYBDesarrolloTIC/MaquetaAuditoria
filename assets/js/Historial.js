document.addEventListener("DOMContentLoaded", () => {
    cargarHistorialGeneral();
});

// Variable global para guardar los datos temporalmente
let datosHistorial = [];

// ==========================================
// 1. CARGAR HISTORIAL GENERAL
// ==========================================
async function cargarHistorialGeneral() {
    const tbody = document.querySelector('#tabla-historial-general tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><br>Cargando historial...</td></tr>`;

    try {
        const res = await apiHistorial.getHistorialGeneral();
        tbody.innerHTML = '';

        if (res && res.status === 1 && res.data && res.data.length > 0) {
            datosHistorial = res.data; 

            res.data.forEach((item, index) => {
                const badgeClass = item.estado === 'Completada' ? 'bg-success' : 'bg-danger';

                tbody.innerHTML += `
                    <tr>
                        <td class="ps-4">${item.rut_solicitante}</td>
                        <td class="fw-bold text-black">${item.nombre_solicitante}</td>
                        <td>${item.fecha} a las ${item.hora.substring(0, 5)}</td>
                        <td><span class="badge ${badgeClass} shadow-sm px-3 py-2">${item.estado}</span></td>
                        <td class="text-center">
                            <button class="btn btn-info btn-sm text-white fw-bold shadow-sm" onclick="verDetalles(${index})">
                                <i class="fas fa-eye me-1"></i> Ver Datos
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay registros en el historial general.</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error al conectar con la base de datos.</td></tr>`;
    }
}

// ==========================================
// 2. VER DETALLES EN MODAL (INCLUYE RESOLUCIÓN)
// ==========================================
function verDetalles(index) {
    const item = datosHistorial[index];
    if (!item) return;

    const modalBody = document.getElementById('contenido-detalle-modal');
    if (!modalBody) return;

    // Capturamos el comentario del alcalde. Si por error viene vacío, mostramos un mensaje por defecto.
    const resolucionTexto = item.resolucion ? item.resolucion : '<em class="text-muted">Sin comentarios registrados.</em>';
    
    // Determinamos colores e íconos según el estado final
    const colorEstado = item.estado === 'Completada' ? 'success' : 'danger';
    const iconoEstado = item.estado === 'Completada' ? 'fa-check-circle' : 'fa-times-circle';

    modalBody.innerHTML = `
        <div class="p-2">
            <p class="mb-2"><strong class="text-muted">RUT:</strong> <span class="fs-6">${item.rut_solicitante}</span></p>
            <p class="mb-2"><strong class="text-muted">Nombre Completo:</strong> <span class="fs-6 fw-bold">${item.nombre_solicitante}</span></p>
            <p class="mb-2"><strong class="text-muted">Fecha y Hora:</strong> <span class="fs-6">${item.fecha} a las ${item.hora.substring(0, 5)} hrs.</span></p>
            <hr class="text-muted opacity-25 border-dashed">
            
            <p class="mb-2"><strong class="text-muted d-block mb-1"><i class="fas fa-comment-dots me-1"></i> Motivo Original (Secretaría):</strong> 
                <span class="bg-light p-3 rounded-3 d-block border shadow-sm">${item.motivo}</span>
            </p>

            <p class="mb-3 mt-3"><strong class="text-primary d-block mb-1"><i class="fas fa-clipboard-check me-1"></i> Comentario / Resolución (Alcalde):</strong> 
                <span class="bg-primary bg-opacity-10 p-3 rounded-3 d-block border border-primary border-opacity-25 text-dark shadow-sm">
                    ${resolucionTexto}
                </span>
            </p>

            <div class="mt-4 text-center bg-${colorEstado} bg-opacity-10 border border-${colorEstado} rounded-3 p-3">
                <span class="d-block text-muted small fw-bold text-uppercase mb-2">Estado Final</span>
                <span class="fw-bold fs-4 text-${colorEstado}">
                    <i class="fas ${iconoEstado} me-1"></i> ${item.estado}
                </span>
            </div>
        </div>
    `;

    const modalDetalle = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle'));
    modalDetalle.show();
}
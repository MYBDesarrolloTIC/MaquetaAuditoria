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

    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Cargando historial...</td></tr>`;

    const res = await apiHistorial.getHistorialGeneral();

    tbody.innerHTML = '';

    if (res.status === 1 && res.data && res.data.length > 0) {
        datosHistorial = res.data; // Guardamos para usar en el modal

        res.data.forEach((item, index) => {
            const badgeClass = item.estado === 'Completada' ? 'bg-success' : 'bg-danger';

            tbody.innerHTML += `
                <tr>
                    <td class="ps-4">${item.rut_solicitante}</td>
                    <td class="fw-bold text-black">${item.nombre_solicitante}</td>
                    <td>${item.fecha} a las ${item.hora.substring(0, 5)}</td>
                    <td><span class="badge ${badgeClass}">${item.estado}</span></td>
                    <td class="text-center">
                        <button class="btn btn-info btn-sm text-white" onclick="verDetalles(${index})">
                            <i class="fas fa-eye"></i> Ver Datos
                        </button>
                    </td>
                </tr>
            `;
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay registros en el historial general.</td></tr>`;
    }
}

// ==========================================
// 2. VER DETALLES EN MODAL
// ==========================================
function verDetalles(index) {
    const item = datosHistorial[index];
    if (!item) return;

    const modalBody = document.getElementById('contenido-detalle-modal');
    if (!modalBody) return;

    // Llenamos el modal dinámicamente con los datos seleccionados
    modalBody.innerHTML = `
        <div class="p-2">
            <p class="mb-2"><strong class="text-muted">RUT:</strong> <span class="fs-6">${item.rut_solicitante}</span></p>
            <p class="mb-2"><strong class="text-muted">Nombre Completo:</strong> <span class="fs-6 fw-bold">${item.nombre_solicitante}</span></p>
            <p class="mb-2"><strong class="text-muted">Fecha y Hora:</strong> <span class="fs-6">${item.fecha} a las ${item.hora.substring(0, 5)} hrs.</span></p>
            <hr class="text-muted">
            <p class="mb-2"><strong class="text-muted d-block mb-1">Motivo Extenso:</strong> 
                <span class="bg-light p-2 rounded d-block border border-light">${item.motivo}</span>
            </p>
            <p class="mb-0 mt-3"><strong class="text-muted">Estado Actual:</strong> 
                <span class="badge ${item.estado === 'Completada' ? 'bg-success' : 'bg-danger'} p-2">${item.estado}</span>
            </p>
        </div>
    `;

    // Abrimos el Modal usando Bootstrap
    const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalle'));
    modalDetalle.show();
}
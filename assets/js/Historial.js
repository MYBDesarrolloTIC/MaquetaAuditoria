let datosHistorial = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarHistorialGeneral();

    // Si le agregaste el buscador en vivo a la vista, esto lo activará automáticamente
    const buscador = document.getElementById('buscador-historial');
    if (buscador) {
        buscador.addEventListener('input', function () {
            const termino = this.value.toLowerCase().trim();
            filtrarTablaHistorial(termino);
        });
    }
});

// ==========================================
// 1. CARGAR DATOS DESDE LA API
// ==========================================
async function cargarHistorialGeneral() {
    const tbody = document.querySelector('#tabla-historial-general tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-muted fw-bold">Cargando historial...</p></td></tr>`;

    try {
        const res = await apiHistorial.getHistorialGeneral();
        tbody.innerHTML = '';

        if (res && res.status === 1 && res.data && res.data.length > 0) {
            datosHistorial = res.data;

            res.data.forEach((item, index) => {
                const rutFormateado = formatearRut(item.rut_solicitante.toString());
                const nombreMostrar = item.nombres ? `${item.nombres} ${item.apellido_p} ${item.apellido_m || ''}` : item.nombre_solicitante;
                
                // Color dinámico para el estado
                let badgeClass = 'bg-secondary';
                if (item.estado === 'Completada') badgeClass = 'bg-success';
                else if (item.estado === 'No Completada' || item.estado === 'Denegada') badgeClass = 'bg-danger';
                else if (item.estado === 'Derivada' || item.estado === 'Derivado') badgeClass = 'bg-warning text-dark';
                else if (item.estado === 'Pendiente') badgeClass = 'bg-primary';

                tbody.innerHTML += `
                    <tr class="align-middle fila-busqueda">
                        <td class="ps-4 fw-medium text-secondary rut-col">${rutFormateado}</td>
                        <td class="fw-bold text-dark nombre-col">${nombreMostrar}</td>
                        <td>
                            <div class="small text-muted"><i class="fas fa-calendar-alt text-primary"></i> ${item.fecha}</div>
                            <div class="small text-muted"><i class="fas fa-clock text-warning"></i> ${item.hora.substring(0, 5)}</div>
                        </td>
                        <td><span class="badge ${badgeClass} shadow-sm px-3 py-2">${item.estado}</span></td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-info text-white shadow-sm fw-bold px-3 py-2" onclick="verDetalles(${index})">
                                <i class="fas fa-eye me-1"></i> Ver
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-5"><i class="fas fa-folder-open fs-1 mb-3 text-black-50 d-block"></i> No hay registros en el historial.</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error al cargar el historial de conexión.</td></tr>`;
    }
}

// ==========================================
// 2. VER DETALLES EN EL MODAL (AQUÍ ESTÁ LA MAGIA)
// ==========================================
function verDetalles(index) {
    const item = datosHistorial[index];
    const modalBody = document.getElementById('contenido-detalle-modal');
    
    const rutFormateado = formatearRut(item.rut_solicitante.toString());
    const nombreMostrar = item.nombres ? `${item.nombres} ${item.apellido_p} ${item.apellido_m || ''}` : item.nombre_solicitante;

    // A) CONSTRUIR SECCIÓN DE DERIVACIÓN CONDICIONALMENTE
    let htmlDerivacion = '';
    // Si la propiedad existe en tu BD y tiene texto, creamos el bloque amarillo
    if (item.comentario_derivacion && item.comentario_derivacion.trim() !== '') {
        htmlDerivacion = `
            <div class="mt-4 p-3 rounded-3" style="background-color: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107;">
                <h6 class="text-warning-dark fw-bold mb-2"><i class="fas fa-share me-2"></i>Instrucciones de Derivación</h6>
                <p class="text-dark mb-0 small">${item.comentario_derivacion}</p>
            </div>
        `;
    }

    // B) CONSTRUIR SECCIÓN DE RESOLUCIÓN FINAL / MOTIVO DE DENEGACIÓN
    let tituloResolucion = "Comentario / Resolución";
    let colorResolucion = "text-success";
    let borderResolucion = "#198754";
    let bgResolucion = "rgba(25, 135, 84, 0.1)";

    if (item.estado === 'No Completada' || item.estado === 'Denegada') {
        tituloResolucion = "Motivo de Denegación";
        colorResolucion = "text-danger";
        borderResolucion = "#dc3545";
        bgResolucion = "rgba(220, 53, 69, 0.1)";
    }

    let htmlResolucion = '';
    // Tu backend podría llamarlo 'comentario' o 'comentario_resolucion' dependiendo de cómo lo guardaste
    const comentarioFinal = item.comentario_resolucion || item.comentario || '';
    
    if (comentarioFinal.trim() !== '') {
         htmlResolucion = `
            <div class="mt-3 p-3 rounded-3" style="background-color: ${bgResolucion}; border-left: 4px solid ${borderResolucion};">
                <h6 class="${colorResolucion} fw-bold mb-2"><i class="fas fa-comment-dots me-2"></i>${tituloResolucion}</h6>
                <p class="text-dark mb-0 small">${comentarioFinal}</p>
            </div>
        `;
    } else if (item.estado === 'Pendiente') {
        htmlResolucion = `
            <div class="mt-3 p-3 rounded-3 bg-light border-start border-4 border-secondary">
                <p class="text-muted mb-0 small fst-italic"><i class="fas fa-hourglass-half me-1"></i> Aún no hay resolución, la petición está pendiente o en proceso.</p>
            </div>
        `;
    }

    // C) ENSAMBLAR TODO EL HTML DENTRO DEL MODAL
    modalBody.innerHTML = `
        <div class="text-center mb-4 mt-2">
            <h5 class="fw-bold text-dark mb-0">${nombreMostrar}</h5>
            <p class="text-muted small mb-0"><i class="fas fa-id-card me-1"></i> RUT: ${rutFormateado}</p>
        </div>
        
        <div class="row g-3 mb-3">
            <div class="col-6">
                <div class="p-2 bg-light rounded text-center shadow-sm">
                    <span class="d-block text-muted small fw-bold">FECHA</span>
                    <span class="text-dark fw-medium">${item.fecha}</span>
                </div>
            </div>
            <div class="col-6">
                <div class="p-2 bg-light rounded text-center shadow-sm">
                    <span class="d-block text-muted small fw-bold">HORA</span>
                    <span class="text-dark fw-medium">${item.hora.substring(0, 5)}</span>
                </div>
            </div>
        </div>

        <div class="mb-3">
            <h6 class="text-primary fw-bold mb-2"><i class="fas fa-clipboard-list me-2"></i>Motivo Original</h6>
            <div class="p-3 bg-light rounded-3 border">
                <p class="text-dark mb-0 small">${item.motivo}</p>
            </div>
        </div>

        ${htmlDerivacion}
        ${htmlResolucion}
    `;

    // Abrir el modal
    const modalInstancia = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle'));
    modalInstancia.show();
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================
function formatearRut(rut) {
    if (!rut) return '';
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (valor.length === 0) return '';
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return valor.length > 1 ? `${cuerpo}-${dv}` : valor;
}

function filtrarTablaHistorial(termino) {
    const tbody = document.querySelector('#tabla-historial-general tbody');
    if (!tbody) return;
    const terminoLimpio = termino.replace(/[^0-9kK]/g, '');
    const filas = tbody.querySelectorAll('tr.fila-busqueda');
    filas.forEach(fila => {
        const rut = fila.querySelector('.rut-col').textContent.toLowerCase().replace(/[^0-9kK]/g, '');
        const nombre = fila.querySelector('.nombre-col').textContent.toLowerCase();
        fila.style.display = (rut.includes(terminoLimpio) || nombre.includes(termino)) ? '' : 'none';
    });
}
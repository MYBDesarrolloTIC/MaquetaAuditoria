let idDerivacionSeleccionada = null;
let modalResolucion = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarMisDerivaciones();

    const modalEl = document.getElementById('modalResolverDerivacion');
    if(modalEl) {
        modalResolucion = new bootstrap.Modal(modalEl);
    }
});

// ==========================================
// 1. CARGAR DERIVACIONES DEL USUARIO
// ==========================================
async function cargarMisDerivaciones() {
    const contenedor = document.getElementById('contenedor-derivaciones');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-info" role="status"></div>
            <p class="mt-2 text-muted fw-bold">Buscando peticiones asignadas...</p>
        </div>`;

    try {
        // Llamamos a la API para traer solo las derivaciones de este usuario
        const res = await apiAuditoria.getMisDerivaciones();
        contenedor.innerHTML = '';

        if (res && res.status === 1 && res.data && res.data.length > 0) {
            res.data.forEach(item => {
                contenedor.innerHTML += `
                <div class="col-md-6 col-lg-4 mb-4" id="tarjeta-derivacion-${item.id}">
                    <div class="card shadow-sm border-0 h-100 py-3" style="border-left: 5px solid #17a2b8 !important;">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="card-title fw-bold text-black mb-0">${item.nombre_solicitante}</h5>
                                <span class="badge bg-info text-dark shadow-sm"><i class="fas fa-thumbtack"></i> Asignada a ti</span>
                            </div>
                            
                            <h6 class="card-subtitle mb-3 text-muted">
                                <i class="fas fa-id-card me-1"></i> RUT: ${item.rut_solicitante} <br> 
                                <i class="fas fa-calendar-alt me-1 text-primary"></i> ${item.fecha} a las ${item.hora.substring(0, 5)}
                            </h6>
                            
                            <div class="bg-light p-3 rounded mb-3 text-start small border border-light">
                                <strong class="text-dark"><i class="fas fa-comment-dots me-1"></i> Motivo original del ciudadano:</strong><br>
                                <span class="text-muted">${item.motivo}</span>
                            </div>

                            <div class="bg-warning bg-opacity-10 p-3 rounded mb-3 text-start small border border-warning border-opacity-25">
                                <strong class="text-warning-dark"><i class="fas fa-share me-1"></i> Instrucciones de Derivación:</strong><br>
                                <span class="text-dark fw-medium">${item.comentario_derivacion || 'Sin instrucciones adicionales.'}</span>
                            </div>
                            
                            <div class="d-grid mt-auto">
                                <button class="btn btn-success fw-bold shadow-sm py-2" onclick="prepararResolucion(${item.id})">
                                    <i class="fas fa-check-circle me-1"></i> Resolver Petición
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        } else {
            contenedor.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center fw-bold p-4 shadow-sm border-0">
                        <i class="fas fa-inbox fs-2 text-info d-block mb-3"></i>
                        No tienes ninguna petición derivada pendiente en este momento.
                    </div>
                </div>`;
        }
    } catch (error) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center">Error al conectar con el servidor para obtener las derivaciones.</div></div>`;
    }
}

// ==========================================
// 2. PREPARAR MODAL
// ==========================================
function prepararResolucion(id) {
    idDerivacionSeleccionada = id;

    // Limpiar campos y errores
    const comentarioInput = document.getElementById('modal-comentario-resolucion');
    const errorDiv = document.getElementById('error-comentario-resolucion');
    comentarioInput.value = "";
    comentarioInput.classList.remove('is-invalid', 'border-danger');
    errorDiv.style.display = 'none';

    modalResolucion.show();
}

// ==========================================
// 3. VALIDAR Y ENVIAR AL SERVIDOR
// ==========================================
function validarYResolver() {
    const comentarioInput = document.getElementById('modal-comentario-resolucion');
    const errorDiv = document.getElementById('error-comentario-resolucion');
    const comentarioVal = comentarioInput.value.trim();

    if (comentarioVal === "") {
        comentarioInput.classList.add('is-invalid', 'border-danger');
        errorDiv.style.display = 'block';
        comentarioInput.focus();
        return;
    }

    comentarioInput.classList.remove('is-invalid', 'border-danger');
    errorDiv.style.display = 'none';
    
    // Bloquear botón
    const btnAccion = document.getElementById('btnResolverDerivacion');
    btnAccion.disabled = true;
    btnAccion.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Procesando...';

    ejecutarResolucion(comentarioVal);
}

// ==========================================
// 4. API CALL: RESOLVER DERIVACIÓN
// ==========================================
async function ejecutarResolucion(comentarioFinal) {
    if (!idDerivacionSeleccionada) return;

    try {
        const res = await apiAuditoria.resolverDerivacion(idDerivacionSeleccionada, comentarioFinal);
        
        if (res.status === 1) {
            modalResolucion.hide();

            // Animación de salida de la tarjeta
            const tarjeta = document.getElementById(`tarjeta-derivacion-${idDerivacionSeleccionada}`);
            if (tarjeta) {
                tarjeta.style.transition = "all 0.4s ease";
                tarjeta.style.opacity = "0";
                tarjeta.style.transform = "scale(0.8)";
                setTimeout(() => cargarMisDerivaciones(), 400);
            } else {
                cargarMisDerivaciones();
            }
        } else {
            alert("Error del servidor: " + res.message);
        }
    } catch (error) {
        alert("Ocurrió un error de conexión al resolver la petición.");
    } finally {
        const btnAccion = document.getElementById('btnResolverDerivacion');
        if(btnAccion) {
            btnAccion.disabled = false;
            btnAccion.innerHTML = '<i class="fas fa-check me-2"></i> Marcar como Completada';
        }
        idDerivacionSeleccionada = null;
    }
}
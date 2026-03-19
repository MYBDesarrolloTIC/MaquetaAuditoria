// Variables de control global
let idVisitaSeleccionada = null;
let estadoObjetivo = null;
let instanciaModal = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarVisitasPendientes();

    // Inicializar el modal de Bootstrap
    instanciaModal = new bootstrap.Modal(document.getElementById('modalConfirmarAccion'));

    // Configurar el evento del botón de confirmación dentro del modal
    const btnEjecutar = document.getElementById('btnEjecutarAccion');
    if (btnEjecutar) {
        btnEjecutar.addEventListener('click', validarYEnviar);
    }
});

/**
 * Carga las visitas en estado 'Pendiente' desde la base de datos
 */
async function cargarVisitasPendientes() {
    const contenedor = document.getElementById('contenedor-visitas');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="mt-2 text-muted fw-bold">Cargando visitas pendientes...</p>
        </div>`;

    try {
        const res = await apiAuditoria.getPendientes();
        contenedor.innerHTML = '';

        if (res && res.status === 1 && res.data && res.data.length > 0) {
            res.data.forEach(item => {
                contenedor.innerHTML += `
                <div class="col-md-6 mb-4" id="tarjeta-visita-${item.id}">
                    <div class="card shadow-sm border-0 h-100" style="border-left: 5px solid var(--yb-blue) !important;">
                        <div class="card-body p-4">
                            <h5 class="card-title fw-bold text-black">${item.nombre_solicitante}</h5>
                            <h6 class="card-subtitle mb-3 text-muted">
                                <i class="fas fa-id-card me-1"></i> RUT: ${item.rut_solicitante} | 
                                <i class="fas fa-clock me-1 text-warning"></i> Hora: ${item.hora.substring(0, 5)}
                            </h6>
                            <p class="card-text bg-light p-3 rounded">
                                <strong class="text-primary"><i class="fas fa-comment-dots me-1"></i> Motivo original:</strong><br>
                                ${item.motivo}
                            </p>
                            <div class="d-flex justify-content-between mt-4">
                                <button type="button" class="btn btn-success fw-bold px-4 shadow-sm" onclick="prepararAccion(${item.id}, 'Completada')">
                                    <i class="fas fa-check me-1"></i> Completada
                                </button>
                                <button type="button" class="btn btn-danger fw-bold px-4 shadow-sm" onclick="prepararAccion(${item.id}, 'No Completada')">
                                    <i class="fas fa-times me-1"></i> Denegar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        } else {
            contenedor.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-success text-center fw-bold p-4 shadow-sm border-0">
                        <i class="fas fa-check-circle fs-2 text-success d-block mb-2"></i>
                        ¡Excelente! No tienes visitas pendientes en este momento.
                    </div>
                </div>`;
        }
    } catch (error) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center">Error al conectar con el servidor.</div></div>`;
    }
}

/**
 * Configura visualmente el modal según la acción y limpia el formulario
 */
function prepararAccion(id, nuevoEstado) {
    idVisitaSeleccionada = id;
    estadoObjetivo = nuevoEstado;

    // Resetear el campo de comentario y errores
    const comentarioInput = document.getElementById('modal-comentario');
    const errorDiv = document.getElementById('error-comentario');
    comentarioInput.value = "";
    comentarioInput.classList.remove('is-invalid');
    errorDiv.style.display = 'none';

    const iconoContenedor = document.getElementById('modal-icono-contenedor');
    const icono = document.getElementById('modal-icono');
    const titulo = document.getElementById('modal-titulo');
    const texto = document.getElementById('modal-texto');
    const btnAccion = document.getElementById('btnEjecutarAccion');

    if (nuevoEstado === 'Completada') {
        // --- MODO VERDE: CONFIRMAR ---
        iconoContenedor.className = "text-success mb-4";
        icono.className = "fas fa-check-circle";
        titulo.textContent = "¿Confirmar Visita?";
        texto.textContent = "Ingrese una nota final sobre el resultado de la audiencia.";
        
        btnAccion.className = "btn btn-success btn-lg fw-bold px-5 shadow-sm";
        btnAccion.innerHTML = '<i class="fas fa-check me-2"></i> Confirmar';
    } else {
        // --- MODO ROJO: DENEGAR ---
        iconoContenedor.className = "text-danger mb-4";
        icono.className = "fas fa-exclamation-triangle";
        titulo.textContent = "¿Denegar Solicitud?";
        texto.textContent = "Indique el motivo por el cual se deniega esta audiencia.";
        
        btnAccion.className = "btn btn-danger btn-lg fw-bold px-5 shadow-sm";
        btnAccion.innerHTML = '<i class="fas fa-times me-2"></i> Denegar';
    }

    instanciaModal.show();
}

/**
 * Valida que el comentario esté escrito antes de llamar a la API
 */
function validarYEnviar() {
    const comentarioInput = document.getElementById('modal-comentario');
    const errorDiv = document.getElementById('error-comentario');
    const comentarioVal = comentarioInput.value.trim();

    if (comentarioVal === "") {
        comentarioInput.classList.add('is-invalid');
        errorDiv.style.display = 'block';
        comentarioInput.focus();
        return;
    }

    // Si todo está bien, ocultamos error y enviamos
    comentarioInput.classList.remove('is-invalid');
    errorDiv.style.display = 'none';
    ejecutarCambioEstado(comentarioVal);
}

/**
 * Llama a la API para guardar el cambio de estado y el comentario
 */
async function ejecutarCambioEstado(comentarioFinal) {
    if (!idVisitaSeleccionada || !estadoObjetivo) return;

    try {
        // Asegúrate de que tu api.js envíe el tercer parámetro 'comentario'
        const res = await apiAuditoria.cambiarEstado(idVisitaSeleccionada, estadoObjetivo, comentarioFinal);
        
        if (res.status === 1) {
            instanciaModal.hide();

            // Animación de salida de la tarjeta específica
            const tarjeta = document.getElementById(`tarjeta-visita-${idVisitaSeleccionada}`);
            if (tarjeta) {
                tarjeta.style.transition = "all 0.4s ease";
                tarjeta.style.opacity = "0";
                tarjeta.style.transform = "scale(0.8)";
                setTimeout(() => cargarVisitasPendientes(), 400);
            } else {
                cargarVisitasPendientes();
            }
        } else {
            alert("Error: " + res.message);
        }
    } catch (error) {
        alert("Ocurrió un error crítico al procesar la solicitud.");
    } finally {
        idVisitaSeleccionada = null;
        estadoObjetivo = null;
    }
}
// Variables de control global
let idVisitaSeleccionada = null;
let estadoObjetivo = null;
let instanciaModal = null;
let listaUsuariosGlobal = []; // Para almacenar los usuarios a derivar

document.addEventListener("DOMContentLoaded", () => {
    cargarVisitasPendientes();
    cargarUsuariosParaDerivar();

    const modalEl = document.getElementById('modalConfirmarAccion');
    if(modalEl){
        instanciaModal = new bootstrap.Modal(modalEl);
    }

    const btnEjecutar = document.getElementById('btnEjecutarAccion');
    if (btnEjecutar) {
        btnEjecutar.addEventListener('click', validarYEnviar);
    }

    // Buscador en vivo
    const buscador = document.getElementById('buscador-visitas');
    if (buscador) {
        buscador.addEventListener('input', function () {
            const termino = this.value.toLowerCase().trim();
            const tarjetas = document.querySelectorAll('#contenedor-visitas > div.col-md-6');
            
            tarjetas.forEach(tarjeta => {
                const textoTarjeta = tarjeta.textContent.toLowerCase();
                if (textoTarjeta.includes(termino)) {
                    tarjeta.style.display = '';
                } else {
                    tarjeta.style.display = 'none';
                }
            });
        });
    }
});

// ==========================================
// 1. CARGAR USUARIOS PARA EL SELECT
// ==========================================
async function cargarUsuariosParaDerivar() {
    try {
        const res = await apiUsuarios.getUsuarios();
        if (res && res.status === 1 && res.data) {
            listaUsuariosGlobal = res.data.filter(u => u.estado === 'Activo' || u.estado === 1);
        }
    } catch (error) {
        console.error("Error al cargar la lista de usuarios para derivación:", error);
    }
}

// ==========================================
// 2. CARGAR VISITAS PENDIENTES (CON PRIORIDAD Y TURNO)
// ==========================================
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
            
            // 1. ALGORITMO DE PRIORIZACIÓN
            // Ordena el array poniendo a los que tienen discapacidad al principio
            res.data.sort((a, b) => {
                let descA = a.discapacidad ? a.discapacidad.toLowerCase().trim() : 'ninguna';
                let descB = b.discapacidad ? b.discapacidad.toLowerCase().trim() : 'ninguna';
                
                let esDiscA = (descA !== 'ninguna' && descA !== '') ? 1 : 0;
                let esDiscB = (descB !== 'ninguna' && descB !== '') ? 1 : 0;
                
                return esDiscB - esDiscA; 
            });

            // 2. RENDERIZAR TARJETAS
            res.data.forEach((item, index) => {
                // Verificar si tiene discapacidad para mostrar la alerta visual
                let textoDiscapacidad = item.discapacidad ? item.discapacidad.trim() : 'Ninguna';
                let esDiscapacitado = (textoDiscapacidad.toLowerCase() !== 'ninguna' && textoDiscapacidad !== '');
                
                // HTML condicional del badge de prioridad
                let badgePrioridad = esDiscapacitado 
                    ? `<div class="mb-2"><span class="badge bg-danger shadow-sm py-2 px-3 fw-bold" style="font-size: 0.9rem;"><i class="fas fa-wheelchair me-1"></i> PRIORIDAD: ${textoDiscapacidad.toUpperCase()}</span></div>` 
                    : '';

                // Borde especial si es discapacitado
                let bordeTarjeta = esDiscapacitado ? 'border-left: 5px solid var(--yb-red) !important;' : 'border-left: 5px solid var(--yb-blue) !important;';

                // AQUÍ CREAMOS EL NÚMERO DE TURNO (Posición en la lista)
                let numeroTurno = index + 1;

                contenedor.innerHTML += `
                <div class="col-md-6 col-lg-4 mb-4" id="tarjeta-visita-${item.id}">
                    <div class="card text-center shadow-sm border-0 h-100 py-3 position-relative" style="${bordeTarjeta}">
                        
                        <div class="position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center shadow-sm fw-bold" 
                             style="width: 35px; height: 35px; border-radius: 50%; background-color: #ffc107; color: #000; font-size: 1.1rem; z-index: 1;">
                            ${numeroTurno}
                        </div>

                        <div class="card-body">
                            ${badgePrioridad}
                            <h5 class="card-title fw-bold text-black mt-2">${item.nombre_solicitante}</h5>
                            <h6 class="card-subtitle mb-3 text-muted">
                                <i class="fas fa-id-card me-1"></i> RUT: ${item.rut_solicitante} <br> 
                                <i class="fas fa-clock me-1 text-warning"></i> Hora de Cita: ${item.hora.substring(0, 5)}
                            </h6>
                            <p class="card-text bg-light p-3 rounded text-start small">
                                <strong class="text-primary"><i class="fas fa-comment-dots me-1"></i> Motivo original:</strong><br>
                                ${item.motivo}
                            </p>
                            
                            <div class="d-flex justify-content-center gap-3 mt-3 flex-wrap">
                                <button class="btn btn-sm btn-success text-white fw-bold shadow-sm px-3" onclick="prepararAccion(${item.id}, 'Completada')">
                                    <i class="fas fa-check"></i> Completada
                                </button>
                                <button class="btn btn-sm btn-warning text-dark fw-bold shadow-sm px-3" onclick="prepararAccion(${item.id}, 'Derivar')">
                                    <i class="fas fa-share"></i> Derivar
                                </button>
                                <button class="btn btn-sm btn-danger fw-bold shadow-sm px-3" onclick="prepararAccion(${item.id}, 'No Completada')">
                                    <i class="fas fa-times"></i> Denegada
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

// ==========================================
// 3. PREPARAR EL MODAL Y REINICIAR VALORES
// ==========================================
function prepararAccion(id, nuevoEstado) {
    idVisitaSeleccionada = id;
    estadoObjetivo = nuevoEstado;

    const comentarioInput = document.getElementById('modal-comentario');
    const errorDiv = document.getElementById('error-comentario');
    comentarioInput.value = "";
    comentarioInput.classList.remove('is-invalid', 'border-danger');
    errorDiv.style.display = 'none';

    const iconoContenedor = document.getElementById('modal-icono-contenedor');
    const icono = document.getElementById('modal-icono');
    const titulo = document.getElementById('modal-titulo');
    const texto = document.getElementById('modal-texto');
    const btnAccion = document.getElementById('btnEjecutarAccion');

    // === CREAR/BUSCAR EL SELECT DE USUARIOS DINÁMICAMENTE ===
    let selectContenedor = document.getElementById('contenedor-select-derivar');
    if (!selectContenedor) {
        selectContenedor = document.createElement('div');
        selectContenedor.id = 'contenedor-select-derivar';
        selectContenedor.className = 'text-start mb-3';
        selectContenedor.innerHTML = `
            <label class="form-label fw-bold text-dark small text-uppercase">Derivar a <span class="text-danger">(Obligatorio)</span></label>
            <select id="modal-select-usuario" class="form-select bg-light border-2">
                <option value="">Seleccione un usuario...</option>
            </select>
            <div id="error-select" class="text-danger small mt-2 fw-bold" style="display: none;">
                <i class="fas fa-exclamation-circle"></i> Debes seleccionar a quién derivar esta petición.
            </div>
        `;
        const contenedorComentario = comentarioInput.parentElement;
        contenedorComentario.parentElement.insertBefore(selectContenedor, contenedorComentario);
    }

    const selectUsuario = document.getElementById('modal-select-usuario');
    const errorSelect = document.getElementById('error-select');
    selectUsuario.classList.remove('is-invalid', 'border-danger');
    errorSelect.style.display = 'none';
    selectUsuario.value = ""; 

    if (nuevoEstado === 'Completada') {
        selectContenedor.style.display = 'none'; 
        iconoContenedor.className = "text-success mb-4";
        icono.className = "fas fa-check-circle";
        titulo.textContent = "Audiencia Completada";
        texto.textContent = "Por favor, redacte detalladamente en qué concluyó la reunión o qué acuerdos se tomaron.";
        
        btnAccion.className = "btn btn-success btn-lg fw-bold px-5 shadow-sm";
        btnAccion.innerHTML = '<i class="fas fa-check me-2"></i> Guardar Resolución';

    } else if (nuevoEstado === 'No Completada') {
        selectContenedor.style.display = 'none'; 
        iconoContenedor.className = "text-danger mb-4";
        icono.className = "fas fa-exclamation-triangle";
        titulo.textContent = "Audiencia Incumplida / Denegada";
        texto.textContent = "Justifique obligatoriamente por qué faltó el ciudadano o se incumplió la audiencia.";
        
        btnAccion.className = "btn btn-danger btn-lg fw-bold px-5 shadow-sm";
        btnAccion.innerHTML = '<i class="fas fa-times me-2"></i> Guardar Motivo';

    } else if (nuevoEstado === 'Derivar') {
        selectContenedor.style.display = 'block'; 
        
        selectUsuario.innerHTML = '<option value="">Seleccione un usuario...</option>';
        listaUsuariosGlobal.forEach(u => {
            selectUsuario.innerHTML += `<option value="${u.id}">${u.nombre} (${u.rol})</option>`;
        });

        iconoContenedor.className = "text-primary mb-4";
        icono.className = "fas fa-share-square";
        titulo.textContent = "Derivar Audiencia";
        texto.textContent = "Seleccione a quién asignar esta petición y deje un comentario o instrucciones.";
        
        btnAccion.className = "btn btn-primary text-white btn-lg fw-bold px-5 shadow-sm";
        btnAccion.innerHTML = '<i class="fas fa-paper-plane me-2"></i> Derivar Petición';
    }

    instanciaModal.show();
}

// ==========================================
// 4. VALIDAR OBLIGATORIEDAD Y ENVIAR A BD
// ==========================================
function validarYEnviar() {
    const comentarioInput = document.getElementById('modal-comentario');
    const errorDiv = document.getElementById('error-comentario');
    const comentarioVal = comentarioInput.value.trim();
    
    let usuarioDestinoVal = null;
    let hayErrores = false;

    if (comentarioVal === "") {
        comentarioInput.classList.add('is-invalid', 'border-danger');
        errorDiv.style.display = 'block';
        hayErrores = true;
    } else {
        comentarioInput.classList.remove('is-invalid', 'border-danger');
        errorDiv.style.display = 'none';
    }

    if (estadoObjetivo === 'Derivar') {
        const selectUsuario = document.getElementById('modal-select-usuario');
        const errorSelect = document.getElementById('error-select');
        usuarioDestinoVal = selectUsuario.value;

        if (usuarioDestinoVal === "") {
            selectUsuario.classList.add('is-invalid', 'border-danger');
            errorSelect.style.display = 'block';
            hayErrores = true;
        } else {
            selectUsuario.classList.remove('is-invalid', 'border-danger');
            errorSelect.style.display = 'none';
        }
    }

    if (hayErrores) return; 
    
    const btnAccion = document.getElementById('btnEjecutarAccion');
    btnAccion.disabled = true;
    btnAccion.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Procesando...';

    ejecutarCambioEstado(comentarioVal, usuarioDestinoVal);
}

// ==========================================
// 5. LLAMAR A LA API
// ==========================================
async function ejecutarCambioEstado(comentarioFinal, usuarioDestinoFinal) {
    if (!idVisitaSeleccionada || !estadoObjetivo) return;

    try {
        let res;
        
        if (estadoObjetivo === 'Derivar') {
            res = await apiAuditoria.derivarAuditoria(idVisitaSeleccionada, usuarioDestinoFinal, comentarioFinal);
        } else {
            res = await apiAuditoria.cambiarEstado(idVisitaSeleccionada, estadoObjetivo, comentarioFinal);
        }
        
        if (res.status === 1) {
            instanciaModal.hide();

            const tarjeta = document.getElementById(`tarjeta-visita-${idVisitaSeleccionada}`);
            if (tarjeta) {
                tarjeta.style.transition = "all 0.4s ease";
                tarjeta.style.opacity = "0";
                tarjeta.style.transform = "scale(0.8)";
                // Al volver a cargar, se renderizan las tarjetas restantes y el contador se actualiza solo
                setTimeout(() => cargarVisitasPendientes(), 400);
            } else {
                cargarVisitasPendientes();
            }
        } else {
            alert("Error de validación del servidor: " + res.message);
        }
    } catch (error) {
        alert("Ocurrió un error crítico de conexión al procesar la solicitud.");
    } finally {
        const btnAccion = document.getElementById('btnEjecutarAccion');
        if(btnAccion) btnAccion.disabled = false;
        
        idVisitaSeleccionada = null;
        estadoObjetivo = null;
    }
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
    
    // Seleccionamos todas las filas de la tabla
    const filas = tbody.querySelectorAll('tr.fila-busqueda');
    
    filas.forEach(fila => {
        // Obtenemos TODO el texto de la fila en minúsculas (igual que en las tarjetas)
        const textoFila = fila.textContent.toLowerCase();
        
        // Si el texto de la fila incluye lo que escribimos, la mostramos, sino la ocultamos
        if (textoFila.includes(termino)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

/* =========================================================================
   MÓDULO 1: LOGIN
   ========================================================================= */
async function procesarLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("usuario").value.trim();
    const passVal = document.getElementById("password").value;

    if (!userVal || !passVal) {
        mostrarNotificacion("Por favor, ingresa tu usuario y contraseña.", "warning");
        return;
    }

    try {
        const vuser = await validUserTokens(userVal, passVal);
        if (vuser.status === 1 && vuser.data && vuser.data.status === 1) {
            const rolUsuario = String(vuser.data.rol || '').toLowerCase().trim();
            if (['admin','secretaria'].includes(rolUsuario)) {
                window.location.href = "VistaGestionAuditoria.php?login=success";
            } else {
                window.location.href = "VistaListaAuditoria.php?login=success";
            }
        } else {
            const mensajeFallo = vuser.data ? vuser.data.message : (vuser.message || "Credenciales incorrectas.");
            mostrarNotificacion(mensajeFallo, "error");
            document.getElementById("password").value = '';
        }
    } catch (error) {
        mostrarNotificacion("Error al conectar con el servidor.", "error");
    }
}
/* =========================================================================
   MÓDULO 2: TURNOS
   ========================================================================= */
async function cargarTarjetasTurnos() {
    const contenedor = document.getElementById('contenedor-turnos');
    if (!contenedor) return;

    const respuesta = await apiTurnos.getTurnos();
    contenedor.innerHTML = '';

    if (respuesta.status === 1 && respuesta.data && respuesta.data.length > 0) {
        respuesta.data.forEach(turno => {
            const total = calcularHorasUI(turno.hora_entrada, turno.hora_salida);
            contenedor.innerHTML += `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card bg-white border-0 shadow-sm card-turno h-100">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="icon-turno me-3"><i class="bi bi-clock-fill text-primary fs-3"></i></div>
                                    <div>
                                        <h5 class="fw-bold text-black mb-0">${turno.nombre}</h5>
                                        <span class="badge bg-light text-dark border">ID: ${turno.IDturno}</span>
                                    </div>
                                </div>
                            </div>
                            <hr class="text-muted">
                            <div class="row mb-3">
                                <div class="col-6">
                                    <small class="text-muted fw-bold d-block">Entrada</small>
                                    <span class="fs-5 fw-bold" style="color: var(--yb-blue);">${turno.hora_entrada.substring(0, 5)} hrs</span>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted fw-bold d-block">Salida</small>
                                    <span class="fs-5 fw-bold" style="color: var(--yb-blue);">${turno.hora_salida.substring(0, 5)} hrs</span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
                                <small class="text-muted fw-semibold"><i class="bi bi-stopwatch me-1"></i> Total:</small>
                                <span class="fw-bold text-black">${total.horas} hrs ${total.minutos} mins</span>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2">
                            <button type="button" class="btn btn-sm btn-outline-primary flex-grow-1 fw-bold" onclick="editarTurno(${turno.IDturno}, '${turno.nombre}', '${turno.hora_entrada}', '${turno.hora_salida}')">
                                <i class="bi bi-pencil-square me-1"></i> Editar
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-danger px-3" onclick="confirmarBorrarTurno(${turno.IDturno}, '${turno.nombre}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    } else {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-warning text-center fw-bold shadow-sm border-0"><i class="bi bi-exclamation-circle me-2"></i> No hay turnos registrados en la base de datos.</div></div>`;
    }
}

function abrirModalTurno() {
    const modalEl = document.getElementById('modalFormTurno');
    if (!modalEl) return;
    if (document.getElementById('formTurno')) document.getElementById('formTurno').reset();
    if (document.getElementById('turno_id')) document.getElementById('turno_id').value = '';
    if (document.getElementById('tituloModalTurno')) document.getElementById('tituloModalTurno').innerHTML = '<i class="bi bi-clock-history me-2"></i> Registrar Nuevo Turno';

    const alerta = document.getElementById('alerta-calculo');
    if (alerta) {
        alerta.innerHTML = '<i class="bi bi-info-circle-fill me-2 fs-5"></i><span>Complete las horas.</span>';
        alerta.className = "alert alert-info py-2 small d-flex align-items-center mb-0";
    }
    
    // Autofocus en el nombre apenas abre la ventana
    modalEl.addEventListener('shown.bs.modal', () => { document.getElementById('turno_nombre').focus(); }, { once: true });

    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

function editarTurno(id, nombre, entrada, salida) {
    document.getElementById('turno_id').value = id;
    document.getElementById('turno_nombre').value = nombre;
    document.getElementById('turno_entrada').value = entrada.substring(0, 5);
    document.getElementById('turno_salida').value = salida.substring(0, 5);
    document.getElementById('tituloModalTurno').innerHTML = '<i class="bi bi-pencil-square me-2"></i> Editar Turno';
    calcularTiempoJornadaFormulario();
    
    const modalEl = document.getElementById('modalFormTurno');
    if (modalEl) {
        modalEl.addEventListener('shown.bs.modal', () => { document.getElementById('turno_nombre').focus(); }, { once: true });
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }
}

async function guardarTurno() {
    const id = document.getElementById('turno_id').value;
    const nombre = document.getElementById('turno_nombre').value;
    const hora_entrada = document.getElementById('turno_entrada').value;
    const hora_salida = document.getElementById('turno_salida').value;

    if (!nombre || !hora_entrada || !hora_salida) {
        mostrarNotificacion("Por favor completa todos los campos del turno.", "warning"); return;
    }

    const datos = { nombre, hora_entrada, hora_salida };
    let respuesta;

    if (id) {
        datos.id = id;
        respuesta = await apiTurnos.updateTurno(datos);
    } else {
        respuesta = await apiTurnos.createTurno(datos);
    }

    if (respuesta.status === 1) {
        mostrarNotificacion(id ? "Turno actualizado exitosamente." : "Turno creado exitosamente.", "success");
        modalFormTurnoInstance.hide();
        cargarTarjetasTurnos();
    } else {
        mostrarNotificacion("Error: " + respuesta.message, "error");
    }
}

function calcularTiempoJornadaFormulario() {
    const entradaVal = document.getElementById('turno_entrada').value;
    const salidaVal = document.getElementById('turno_salida').value;
    const alertaCalculo = document.getElementById('alerta-calculo');
    if (entradaVal && salidaVal) {
        const total = calcularHorasUI(entradaVal, salidaVal);
        alertaCalculo.innerHTML = `<strong>Total Jornada:</strong>&nbsp; ${total.horas} horas y ${total.minutos} minutos.`;
        alertaCalculo.className = "alert alert-success py-2 small d-flex align-items-center mb-0";
    }
}

function calcularHorasUI(entradaVal, salidaVal) {
    const fechaEntrada = new Date(`2000-01-01T${entradaVal}`);
    let fechaSalida = new Date(`2000-01-01T${salidaVal}`);
    if (fechaSalida < fechaEntrada) { fechaSalida.setDate(fechaSalida.getDate() + 1); }
    const diferenciaMs = fechaSalida - fechaEntrada;
    return { horas: Math.floor(diferenciaMs / (1000 * 60 * 60)), minutos: Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60)) };
}

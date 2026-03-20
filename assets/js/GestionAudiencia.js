let datosGestion = [];
let idSolicitudAEliminar = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarGestionDiaria();

    // Activar buscador en vivo
    const buscador = document.getElementById('buscador-solicitudes');
    if (buscador) {
        buscador.addEventListener('input', function () {
            const termino = this.value.toLowerCase().trim();
            filtrarTabla('tabla-pendientes', termino);
            filtrarTabla('tabla-historial-diario', termino);
        });
    }

    // ==========================================
    // AGREGAR EVENTOS DE FORMATEO A LOS RUT
    // ==========================================
    const inputsRut = ['crear-rut', 'editar-rut'];
    inputsRut.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.addEventListener('input', function (e) {
                this.value = formatearRut(this.value);

                if (this.value.length >= 8) {
                    if (validarRut(this.value)) {
                        this.classList.remove('is-invalid');
                        this.classList.add('is-valid');
                    } else {
                        this.classList.remove('is-valid');
                        this.classList.add('is-invalid');
                    }
                } else {
                    this.classList.remove('is-valid', 'is-invalid');
                }
            });
        }
    });
});

// ==========================================
// FUNCIONES DE RUT (FORMATEO Y VALIDACIÓN)
// ==========================================
function formatearRut(rut) {
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (valor.length === 0) return '';
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return valor.length > 1 ? `${cuerpo}-${dv}` : valor;
}

function validarRut(rutCompleto) {
    if (!/^[0-9]+-[0-9kK]{1}$/.test(rutCompleto.replace(/\./g, ''))) return false;
    let valor = rutCompleto.replace(/[^0-9kK]/g, '').toUpperCase();
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);
    let suma = 0;
    let multiplo = 2;
    for (let i = 1; i <= cuerpo.length; i++) {
        suma += multiplo * valor.charAt(cuerpo.length - i);
        if (multiplo < 7) { multiplo++; } else { multiplo = 2; }
    }
    let dvEsperado = 11 - (suma % 11);
    dvEsperado = (dvEsperado === 11) ? 0 : dvEsperado;
    dvEsperado = (dvEsperado === 10) ? "K" : dvEsperado.toString();
    return dv === dvEsperado;
}

// ==========================================
// 1. CARGAR DATOS REALES DESDE LA BD
// ==========================================
async function cargarGestionDiaria() {
    const tbodyPendientes = document.querySelector('#tabla-pendientes tbody');
    const tbodyHistorial = document.querySelector('#tabla-historial-diario tbody');
    if (!tbodyPendientes || !tbodyHistorial) return;

    tbodyPendientes.innerHTML = `<tr><td colspan="7" class="text-center">Cargando datos...</td></tr>`;
    tbodyHistorial.innerHTML = `<tr><td colspan="6" class="text-center">Cargando datos...</td></tr>`;

    const res = await apiAuditoria.getGestionDiaria();

    tbodyPendientes.innerHTML = '';
    tbodyHistorial.innerHTML = '';

    if (res.status === 1 && res.data && res.data.length > 0) {
        datosGestion = res.data;
        let hayPendientes = false;
        let hayHistorial = false;

        res.data.forEach((item, index) => {
            const rutFormateado = formatearRut(item.rut_solicitante.toString());
            if (item.estado === 'Pendiente') {
                hayPendientes = true;
                tbodyPendientes.innerHTML += `
                    <tr class="fila-busqueda">
                        <td class="rut-col">${rutFormateado}</td>
                        <td class="nombre-col">${item.nombre_solicitante}</td>
                        <td>${item.fecha}</td>
                        <td>${item.hora.substring(0, 5)}</td>
                        <td>${item.motivo.substring(0, 40)}...</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-warning shadow-sm fw-bold text-dark" onclick="abrirModalEditar(${index})"><i class="fas fa-edit"></i> Editar</button>
                            <button class="btn btn-sm btn-danger shadow-sm" onclick="abrirModalEliminar(${item.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            } else {
                hayHistorial = true;
                const badgeClass = item.estado === 'Completada' ? 'bg-success' : 'bg-danger';
                const rowClass = item.estado === 'Completada' ? 'bg-success-light' : 'bg-danger-yb-light';
                const icon = item.estado === 'Completada' ? '✅' : '❌';
                tbodyHistorial.innerHTML += `
                    <tr class="${rowClass} fila-busqueda">
                        <td class="ps-4 rut-col">${rutFormateado}</td>
                        <td class="nombre-col">${item.nombre_solicitante}</td>
                        <td>${item.fecha}</td>
                        <td>${item.hora.substring(0, 5)}</td>
                        <td>${item.motivo.substring(0, 40)}...</td>
                        <td><span class="badge ${badgeClass} shadow-sm px-3 py-2">${icon} ${item.estado}</span></td>
                    </tr>`;
            }
        });

        if (!hayPendientes) tbodyPendientes.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">No hay solicitudes pendientes.</td></tr>`;
        if (!hayHistorial) tbodyHistorial.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No hay historial registrado.</td></tr>`;
    } else {
        tbodyPendientes.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">No hay solicitudes registradas.</td></tr>`;
        tbodyHistorial.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No hay historial registrado.</td></tr>`;
    }
}

// ==========================================
// 2. CREAR SOLICITUD
// ==========================================
async function guardarNuevaSolicitud() {
    const rutIngresado = document.getElementById('crear-rut').value.trim();

    if (!validarRut(rutIngresado)) {
        alert("El RUT ingresado no es válido.");
        document.getElementById('crear-rut').focus();
        return;
    }

    const datos = {
        fecha: document.getElementById('crear-fecha').value,
        hora: document.getElementById('crear-hora').value,
        nombre_solicitante: document.getElementById('crear-nombre').value.trim(),
        rut_solicitante: rutIngresado, 
        motivo: document.getElementById('crear-motivo').value.trim()
    };

    if (!datos.rut_solicitante || !datos.nombre_solicitante || !datos.fecha || !datos.hora || !datos.motivo) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        const res = await apiAuditoria.createAuditoria(datos);
        if (res && res.status === 1) {
            bootstrap.Modal.getInstance(document.getElementById('modalCrear')).hide();
            document.getElementById('form-crear-solicitud').reset();
            document.getElementById('crear-rut').classList.remove('is-valid', 'is-invalid');
            cargarGestionDiaria();
        } else {
            alert("Error: " + (res.message || "La base de datos rechazó el dato."));
        }
    } catch (e) {
        alert("Error crítico de conexión.");
    }
}

// ==========================================
// 3. EDITAR SOLICITUD
// ==========================================
function abrirModalEditar(index) {
    const item = datosGestion[index];
    document.getElementById('editar-id').value = item.id;
    document.getElementById('editar-rut').value = formatearRut(item.rut_solicitante.toString());
    document.getElementById('editar-rut').classList.remove('is-invalid');
    document.getElementById('editar-rut').classList.add('is-valid');
    document.getElementById('editar-nombre').value = item.nombre_solicitante;
    document.getElementById('editar-fecha').value = item.fecha;
    document.getElementById('editar-hora').value = item.hora.substring(0, 5);
    document.getElementById('editar-motivo').value = item.motivo;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditar')).show();
}

async function guardarEdicion() {
    const rutIngresado = document.getElementById('editar-rut').value.trim();

    if (!validarRut(rutIngresado)) {
        alert("El RUT corregido no es válido.");
        return;
    }

    const datos = {
        id: document.getElementById('editar-id').value,
        rut_solicitante: rutIngresado, 
        nombre_solicitante: document.getElementById('editar-nombre').value.trim(),
        fecha: document.getElementById('editar-fecha').value,
        hora: document.getElementById('editar-hora').value,
        motivo: document.getElementById('editar-motivo').value.trim()
    };

    try {
        const res = await apiAuditoria.updateAuditoria(datos);
        if (res && res.status === 1) {
            bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
            cargarGestionDiaria();
        } else {
            alert("Error: " + (res.message || "Rechazo del servidor."));
        }
    } catch (e) {
        alert("Error crítico de conexión.");
    }
}

// ==========================================
// 4. ELIMINAR SOLICITUD
// ==========================================
function abrirModalEliminar(id) {
    idSolicitudAEliminar = id;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminar')).show();
}

async function ejecutarEliminar() {
    if (!idSolicitudAEliminar) return;
    const res = await apiAuditoria.deleteAuditoria(idSolicitudAEliminar);
    if (res.status === 1) {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
        idSolicitudAEliminar = null;
        cargarGestionDiaria();
    } else {
        alert("Error: " + res.message);
    }
}

// ==========================================
// 5. BUSCADOR EN TABLAS
// ==========================================
function filtrarTabla(tablaId, termino) {
    const tbody = document.querySelector(`#${tablaId} tbody`);
    if (!tbody) return;
    const terminoLimpio = termino.replace(/[^0-9kK]/g, '');
    const filas = tbody.querySelectorAll('tr.fila-busqueda');
    filas.forEach(fila => {
        const rut = fila.querySelector('.rut-col').textContent.toLowerCase().replace(/[^0-9kK]/g, '');
        const nombre = fila.querySelector('.nombre-col').textContent.toLowerCase();
        fila.style.display = (rut.includes(terminoLimpio) || nombre.includes(termino)) ? '' : 'none';
    });
}
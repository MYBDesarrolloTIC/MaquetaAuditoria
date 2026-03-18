let datosGestion = [];
let idSolicitudAEliminar = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarGestionDiaria();
    
    // Activar buscador en vivo
    const buscador = document.getElementById('buscador-solicitudes');
    if (buscador) {
        buscador.addEventListener('input', function() {
            const termino = this.value.toLowerCase().trim();
            filtrarTabla('tabla-pendientes', termino);
            filtrarTabla('tabla-historial-diario', termino);
        });
    }
});

// ==========================================
// 1. CARGAR DATOS REALES DESDE LA BD
// ==========================================
async function cargarGestionDiaria() {
    const tbodyPendientes = document.querySelector('#tabla-pendientes tbody');
    const tbodyHistorial = document.querySelector('#tabla-historial-diario tbody');
    if (!tbodyPendientes || !tbodyHistorial) return;

    tbodyPendientes.innerHTML = `<tr><td colspan="7" class="text-center">Cargando datos...</td></tr>`;
    tbodyHistorial.innerHTML = `<tr><td colspan="6" class="text-center">Cargando datos...</td></tr>`;

    // LLAMADA REAL A PHP
    const res = await apiAuditoria.getGestionDiaria();

    tbodyPendientes.innerHTML = '';
    tbodyHistorial.innerHTML = '';

    if (res.status === 1 && res.data && res.data.length > 0) {
        datosGestion = res.data; // Guardamos globalmente para usarlos en la edición
        let hayPendientes = false;
        let hayHistorial = false;

        res.data.forEach((item, index) => {
            if (item.estado === 'Pendiente') {
                hayPendientes = true;
                tbodyPendientes.innerHTML += `
                    <tr class="fila-busqueda">
                        <td class="ps-4"><input type="checkbox" class="check-eliminar" value="${item.id}"></td>
                        <td class="rut-col">${item.rut_solicitante}</td>
                        <td class="nombre-col">${item.nombre_solicitante}</td>
                        <td>${item.fecha}</td>
                        <td>${item.hora.substring(0, 5)}</td>
                        <td>${item.motivo.substring(0, 40)}...</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-warning shadow-sm fw-bold text-dark" onclick="abrirModalEditar(${index})"><i class="fas fa-edit"></i> Editar</button>
                            <button class="btn btn-sm btn-danger shadow-sm" onclick="abrirModalEliminar(${item.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            } else {
                hayHistorial = true;
                const badgeClass = item.estado === 'Completada' ? 'bg-success' : 'bg-danger';
                const rowClass = item.estado === 'Completada' ? 'bg-success-light' : 'bg-danger-yb-light';
                const icon = item.estado === 'Completada' ? '✅' : '❌';

                tbodyHistorial.innerHTML += `
                    <tr class="${rowClass} fila-busqueda">
                        <td class="ps-4 rut-col">${item.rut_solicitante}</td>
                        <td class="nombre-col">${item.nombre_solicitante}</td>
                        <td>${item.fecha}</td>
                        <td>${item.hora.substring(0, 5)}</td>
                        <td>${item.motivo.substring(0, 40)}...</td>
                        <td><span class="badge ${badgeClass} shadow-sm px-3 py-2">${icon} ${item.estado}</span></td>
                    </tr>
                `;
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
    const datos = {
        rut_solicitante: document.getElementById('crear-rut').value.trim(),
        nombre_solicitante: document.getElementById('crear-nombre').value.trim(),
        fecha: document.getElementById('crear-fecha').value,
        hora: document.getElementById('crear-hora').value,
        motivo: document.getElementById('crear-motivo').value.trim()
    };

    if (!datos.rut_solicitante || !datos.nombre_solicitante || !datos.fecha || !datos.hora || !datos.motivo) {
        alert("Por favor, completa todos los campos del formulario.");
        return;
    }

    const res = await apiAuditoria.createAuditoria(datos);
    if (res.status === 1) {
        // Cerramos el modal de forma segura
        const modalEl = document.getElementById('modalCrear');
        const modalObj = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalObj.hide();
        
        document.getElementById('form-crear-solicitud').reset();
        cargarGestionDiaria(); // Recarga la tabla con el nuevo dato
    } else {
        alert("Error al guardar: " + res.message);
    }
}

// ==========================================
// 3. EDITAR SOLICITUD
// ==========================================
function abrirModalEditar(index) {
    const item = datosGestion[index];
    
    document.getElementById('editar-id').value = item.id;
    document.getElementById('editar-rut').value = item.rut_solicitante;
    document.getElementById('editar-nombre').value = item.nombre_solicitante;
    document.getElementById('editar-fecha').value = item.fecha;
    document.getElementById('editar-hora').value = item.hora.substring(0, 5);
    document.getElementById('editar-motivo').value = item.motivo;
    
    const modalEl = document.getElementById('modalEditar');
    const modalObj = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalObj.show();
}

async function guardarEdicion() {
    const datos = {
        id: document.getElementById('editar-id').value,
        rut_solicitante: document.getElementById('editar-rut').value.trim(),
        nombre_solicitante: document.getElementById('editar-nombre').value.trim(),
        fecha: document.getElementById('editar-fecha').value,
        hora: document.getElementById('editar-hora').value,
        motivo: document.getElementById('editar-motivo').value.trim()
    };

    const res = await apiAuditoria.updateAuditoria(datos);
    if (res.status === 1) {
        const modalEl = document.getElementById('modalEditar');
        const modalObj = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalObj.hide();
        
        cargarGestionDiaria(); // Recarga la tabla actualizada
    } else {
        alert("Error al actualizar: " + res.message);
    }
}

// ==========================================
// 4. ELIMINAR SOLICITUD CON SEGURIDAD
// ==========================================
function abrirModalEliminar(id) {
    idSolicitudAEliminar = id;
    const modalEl = document.getElementById('modalEliminar');
    const modalObj = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalObj.show();
}

async function ejecutarEliminar() {
    if (!idSolicitudAEliminar) return;

    const res = await apiAuditoria.deleteAuditoria(idSolicitudAEliminar);
    
    if (res.status === 1) {
        const modalEl = document.getElementById('modalEliminar');
        const modalObj = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalObj.hide();
        
        idSolicitudAEliminar = null;
        cargarGestionDiaria(); // Recarga la tabla sin el dato borrado
    } else {
        alert("Error al eliminar: " + res.message);
    }
}

// ==========================================
// 5. BUSCADOR EN TABLAS
// ==========================================
function filtrarTabla(tablaId, termino) {
    const tbody = document.querySelector(`#${tablaId} tbody`);
    if (!tbody) return;
    
    const filas = tbody.querySelectorAll('tr.fila-busqueda');
    filas.forEach(fila => {
        const rut = fila.querySelector('.rut-col').textContent.toLowerCase();
        const nombre = fila.querySelector('.nombre-col').textContent.toLowerCase();
        
        if (rut.includes(termino) || nombre.includes(termino)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}
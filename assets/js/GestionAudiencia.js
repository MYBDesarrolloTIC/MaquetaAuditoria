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
// 1. CARGAR DATOS (PENDIENTES E HISTORIAL)
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
        let hayPendientes = false;
        let hayHistorial = false;

        res.data.forEach(item => {
            // Formatear RUT (ej: 198765432 -> 19.876.543-2) si es necesario, o mostrar crudo
            const rutFormateado = item.rut_solicitante; 

            if (item.estado === 'Pendiente') {
                hayPendientes = true;
                tbodyPendientes.innerHTML += `
                    <tr class="fila-busqueda">
                        <td class="ps-4"><input type="checkbox" class="check-eliminar" value="${item.id}"></td>
                        <td class="rut-col">${rutFormateado}</td>
                        <td class="nombre-col">${item.nombre_solicitante}</td>
                        <td>${item.fecha}</td>
                        <td>${item.hora.substring(0, 5)}</td>
                        <td>${item.motivo}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-warning" onclick="editarSolicitud(${item.id})"><i class="fas fa-edit"></i> Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarSolicitud(${item.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            } else {
                hayHistorial = true;
                // Colores para el estado
                const badgeClass = item.estado === 'Completada' ? 'bg-success' : 'bg-danger';
                const rowClass = item.estado === 'Completada' ? 'bg-success-light' : 'bg-danger-yb-light';
                const icon = item.estado === 'Completada' ? '✅' : '❌';

                tbodyHistorial.innerHTML += `
                    <tr class="${rowClass} fila-busqueda">
                        <td class="ps-4 rut-col">${rutFormateado}</td>
                        <td class="nombre-col">${item.nombre_solicitante}</td>
                        <td>${item.fecha}</td>
                        <td>${item.hora.substring(0, 5)}</td>
                        <td>${item.motivo}</td>
                        <td><span class="badge ${badgeClass}">${icon} ${item.estado}</span></td>
                    </tr>
                `;
            }
        });

        if (!hayPendientes) tbodyPendientes.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">No hay solicitudes pendientes.</td></tr>`;
        if (!hayHistorial) tbodyHistorial.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No hay historial registrado hoy.</td></tr>`;

    } else {
        tbodyPendientes.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">No hay solicitudes registradas.</td></tr>`;
        tbodyHistorial.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No hay historial registrado.</td></tr>`;
    }
}

// ==========================================
// 2. ELIMINAR SOLICITUD
// ==========================================
async function eliminarSolicitud(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta solicitud?")) {
        const res = await apiAuditoria.deleteAuditoria(id);
        if (res.status === 1) {
            alert("Solicitud eliminada correctamente.");
            cargarGestionDiaria(); // Recargamos las tablas
        } else {
            alert("Error: " + res.message);
        }
    }
}

// ==========================================
// 3. BUSCADOR EN TABLAS
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
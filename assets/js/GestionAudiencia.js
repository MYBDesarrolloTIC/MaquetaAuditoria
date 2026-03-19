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

    // ==========================================
    // AGREGAR EVENTOS DE FORMATEO A LOS RUT
    // ==========================================
    const inputsRut = ['crear-rut', 'editar-rut'];
    inputsRut.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.addEventListener('input', function(e) {
                // Formatea el valor mientras el usuario escribe
                this.value = formatearRut(this.value);
                
                // Dar feedback visual usando clases de Bootstrap (verde si es válido, rojo si es inválido)
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
    // Eliminar todo lo que no sea número o la letra K
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (valor.length === 0) return '';
    
    // Separar cuerpo del dígito verificador
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);
    
    // Poner puntos cada 3 números en el cuerpo
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Unir cuerpo con guion y dígito verificador
    return valor.length > 1 ? `${cuerpo}-${dv}` : valor;
}

function validarRut(rutCompleto) {
    // Si no tiene el formato básico, es falso
    if (!/^[0-9]+-[0-9kK]{1}$/.test(rutCompleto.replace(/\./g, ''))) return false;
    
    let valor = rutCompleto.replace(/[^0-9kK]/g, '').toUpperCase();
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);
    
    // Algoritmo Módulo 11 para validar RUT chileno
    let suma = 0;
    let multiplo = 2;
    
    for (let i = 1; i <= cuerpo.length; i++) {
        let index = multiplo * valor.charAt(cuerpo.length - i);
        suma = suma + index;
        if (multiplo < 7) { multiplo = multiplo + 1; } else { multiplo = 2; }
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
                // Formatear el RUT antes de mostrarlo en la tabla para que se vea bonito
                const rutFormateado = formatearRut(item.rut_solicitante.toString());
                
                tbodyPendientes.innerHTML += `
                    <tr class="fila-busqueda">
                        <td class="ps-4"><input type="checkbox" class="check-eliminar" value="${item.id}"></td>
                        <td class="rut-col">${rutFormateado}</td>
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
                const rutFormateado = formatearRut(item.rut_solicitante.toString());

                tbodyHistorial.innerHTML += `
                    <tr class="${rowClass} fila-busqueda">
                        <td class="ps-4 rut-col">${rutFormateado}</td>
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
    const rutIngresado = document.getElementById('crear-rut').value.trim();
    
    // Validar el RUT estrictamente antes de enviarlo
    if (!validarRut(rutIngresado)) {
        alert("El RUT ingresado no es válido. Por favor verifica e intenta nuevamente.");
        document.getElementById('crear-rut').focus();
        return;
    }

    // EL TRUCO DEFINITIVO: Le quitamos los puntos Y EL GUION para que pase como un número puro a la BD
    const rutLimpioParaBD = rutIngresado.replace(/[\.\-]/g, '');

    const datos = {
        rut_solicitante: rutLimpioParaBD, 
        nombre_solicitante: document.getElementById('crear-nombre').value.trim(),
        fecha: document.getElementById('crear-fecha').value,
        hora: document.getElementById('crear-hora').value,
        motivo: document.getElementById('crear-motivo').value.trim()
    };

    if (!datos.rut_solicitante || !datos.nombre_solicitante || !datos.fecha || !datos.hora || !datos.motivo) {
        alert("Por favor, completa todos los campos del formulario.");
        return;
    }

    try {
        const res = await apiAuditoria.createAuditoria(datos);
        
        // Escudo protector: verificamos que 'res' exista antes de preguntar por su status
        if (res && res.status === 1) {
            const modalEl = document.getElementById('modalCrear');
            const modalObj = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalObj.hide();
            
            document.getElementById('form-crear-solicitud').reset();
            document.getElementById('crear-rut').classList.remove('is-valid', 'is-invalid');
            
            cargarGestionDiaria(); 
        } else if (res && res.message) {
            alert("Error al guardar: " + res.message);
        } else {
            alert("Error del servidor: La base de datos rechazó el dato. Revisa la consola F12.");
        }
    } catch (e) {
        alert("Error crítico de conexión al intentar guardar.");
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
    
    const modalEl = document.getElementById('modalEditar');
    const modalObj = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalObj.show();
}

async function guardarEdicion() {
    const rutIngresado = document.getElementById('editar-rut').value.trim();
    
    if (!validarRut(rutIngresado)) {
        alert("El RUT corregido no es válido. Por favor verifica e intenta nuevamente.");
        document.getElementById('editar-rut').focus();
        return;
    }

    // EL TRUCO DEFINITIVO: Quitamos puntos y guion
    const rutLimpioParaBD = rutIngresado.replace(/[\.\-]/g, '');

    const datos = {
        id: document.getElementById('editar-id').value,
        rut_solicitante: rutLimpioParaBD, 
        nombre_solicitante: document.getElementById('editar-nombre').value.trim(),
        fecha: document.getElementById('editar-fecha').value,
        hora: document.getElementById('editar-hora').value,
        motivo: document.getElementById('editar-motivo').value.trim()
    };

    try {
        const res = await apiAuditoria.updateAuditoria(datos);
        
        if (res && res.status === 1) {
            const modalEl = document.getElementById('modalEditar');
            const modalObj = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalObj.hide();
            
            cargarGestionDiaria(); 
        } else if (res && res.message) {
            alert("Error al actualizar: " + res.message);
        } else {
            alert("Error del servidor: La base de datos rechazó la edición.");
        }
    } catch (e) {
        alert("Error crítico de conexión al intentar actualizar.");
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
        cargarGestionDiaria(); 
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
    
    // Eliminamos los puntos y el guion del término de búsqueda para facilitar
    const terminoLimpio = termino.replace(/[^0-9kK]/g, '');
    
    const filas = tbody.querySelectorAll('tr.fila-busqueda');
    filas.forEach(fila => {
        // Obtenemos el RUT de la tabla y también lo limpiamos para comparar
        const rut = fila.querySelector('.rut-col').textContent.toLowerCase().replace(/[^0-9kK]/g, '');
        const nombre = fila.querySelector('.nombre-col').textContent.toLowerCase();
        
        if (rut.includes(terminoLimpio) || nombre.includes(termino)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}
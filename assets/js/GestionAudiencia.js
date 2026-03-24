let datosGestion = [];
let idSolicitudAEliminar = null;
let timeoutBusqueda = null; // Para el autocompletado

document.addEventListener("DOMContentLoaded", () => {
    cargarGestionDiaria();

    // Activar buscador en vivo de la tabla
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

    // ==========================================
    // INICIALIZAR AUTOCOMPLETADO DE CIUDADANOS
    // ==========================================
    configurarAutocompletado('crear-nombre');
    configurarAutocompletado('crear-rut');
});

// ==========================================
// AUTOCOMPLETADO DE CIUDADANOS EN EL MODAL
// ==========================================
function configurarAutocompletado(inputId) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;

    // Crear el contenedor flotante (cascada)
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu w-100 shadow-lg border-0';
    dropdown.style.maxHeight = '250px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.position = 'absolute';
    dropdown.style.zIndex = '1050';
    
    // Lo posicionamos justo debajo del input
    inputEl.parentElement.style.position = 'relative';
    inputEl.parentElement.appendChild(dropdown);

    // Evento al escribir
    inputEl.addEventListener('input', function () {
        const termino = this.value.trim();
        clearTimeout(timeoutBusqueda);

        // Ocultar si hay menos de 3 caracteres
        if (termino.length < 3) {
            dropdown.classList.remove('show');
            return;
        }

        // Esperar 400ms antes de buscar para no saturar la base de datos
        timeoutBusqueda = setTimeout(async () => {
            dropdown.innerHTML = '<div class="px-3 py-2 text-muted small"><span class="spinner-border spinner-border-sm me-2"></span> Buscando similitudes...</div>';
            dropdown.classList.add('show');

            try {
                // Llamar a la API
                const res = await apiAuditoria.buscarCiudadano(termino);
                dropdown.innerHTML = '';

                if (res && res.status === 1 && res.data.length > 0) {
                    dropdown.innerHTML = '<h6 class="dropdown-header text-primary fw-bold bg-light border-bottom">Ciudadanos encontrados:</h6>';
                    
                    res.data.forEach(ciudadano => {
                        const rutFormateado = formatearRut(ciudadano.rut_solicitante.toString());
                        const item = document.createElement('a');
                        item.className = 'dropdown-item py-2 border-bottom';
                        item.style.cursor = 'pointer';
                        
                        // Mostramos el Nombre y el RUT resaltado
                        item.innerHTML = `
                            <div class="fw-bold text-dark">${ciudadano.nombres} ${ciudadano.apellido_p} ${ciudadano.apellido_m || ''}</div>
                            <div class="small text-muted"><i class="fas fa-id-card text-warning"></i> RUT: ${rutFormateado}</div>
                        `;

                        // Al hacer clic, rellenamos el formulario
                        item.addEventListener('click', () => {
                            autocompletarFormulario(ciudadano);
                            dropdown.classList.remove('show');
                        });

                        dropdown.appendChild(item);
                    });
                } else {
                    dropdown.innerHTML = '<div class="px-3 py-2 text-muted small">No se encontraron ciudadanos con esos datos.</div>';
                    setTimeout(() => dropdown.classList.remove('show'), 2000);
                }
            } catch (error) {
                dropdown.classList.remove('show');
            }
        }, 400);
    });

    // Ocultar la cascada si se hace clic afuera
    document.addEventListener('click', function(e) {
        if (!inputEl.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Función para rellenar los campos automáticamente
function autocompletarFormulario(data) {
    document.getElementById('crear-rut').value = formatearRut(data.rut_solicitante.toString());
    document.getElementById('crear-rut').classList.add('is-valid');
    
    document.getElementById('crear-nombre').value = data.nombres || data.nombre_solicitante || '';
    document.getElementById('crear-apellido-p').value = data.apellido_p || '';
    document.getElementById('crear-apellido-m').value = data.apellido_m || '';
    
    if (data.fecha_nacimiento) document.getElementById('crear-nacimiento').value = data.fecha_nacimiento;
    if (data.celular) document.getElementById('crear-celular').value = data.celular;
    if (data.correo) document.getElementById('crear-correo').value = data.correo;
    if (data.sector) document.getElementById('crear-sector').value = data.sector;
    if (data.direccion) document.getElementById('crear-direccion').value = data.direccion;

    // Discapacidad
    const checkDiscapacidad = document.getElementById('crear-check-discapacidad');
    const wrapperDiscapacidad = document.getElementById('wrapper-discapacidad');
    const descDiscapacidad = document.getElementById('crear-desc-discapacidad');

    if (data.discapacidad && data.discapacidad !== "Ninguna") {
        checkDiscapacidad.checked = true;
        wrapperDiscapacidad.classList.remove('d-none');
        descDiscapacidad.value = data.discapacidad;
    } else {
        checkDiscapacidad.checked = false;
        wrapperDiscapacidad.classList.add('d-none');
        descDiscapacidad.value = "";
    }

    if(typeof mostrarNotificacion === "function") {
        mostrarNotificacion("Datos del ciudadano cargados automáticamente.", "success");
    }
}

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
            const nombreMostrar = item.nombres ? `${item.nombres} ${item.apellido_p} ${item.apellido_m}` : item.nombre_solicitante;

            if (item.estado === 'Pendiente') {
                hayPendientes = true;
                tbodyPendientes.innerHTML += `
                  <tr class="fila-busqueda align-middle">
                        <td class="rut-col">${rutFormateado}</td>
                        <td class="nombre-col">${nombreMostrar}</td>
                        <td>${item.fecha}</td>
                        <td>${item.hora.substring(0, 5)}</td>
                        <td>${item.motivo.substring(0, 40)}...</td>
                        <td class="text-center" style="width: 120px;">
                            <div class="d-grid gap-2">
                                <button class="btn btn-sm btn-warning shadow-sm fw-bold text-dark" onclick="abrirModalEditar(${index})"><i class="fas fa-edit"></i> Editar</button>
                                <button class="btn btn-sm btn-danger shadow-sm fw-bold" onclick="abrirModalEliminar(${item.id})"><i class="fas fa-trash"></i> Eliminar</button>
                            </div>
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
                        <td class="nombre-col">${nombreMostrar}</td>
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
        if(typeof mostrarNotificacion === "function") mostrarNotificacion("El RUT ingresado no es válido.", "warning");
        else alert("El RUT ingresado no es válido.");
        document.getElementById('crear-rut').focus();
        return;
    }

    let tieneDiscapacidad = document.getElementById('crear-check-discapacidad').checked;
    let descripcionDiscapacidad = tieneDiscapacidad ? document.getElementById('crear-desc-discapacidad').value.trim() : "Ninguna";

    if (tieneDiscapacidad && descripcionDiscapacidad === "") {
        if(typeof mostrarNotificacion === "function") mostrarNotificacion("Especifique la discapacidad o desmarque la casilla.", "warning");
        document.getElementById('crear-desc-discapacidad').focus();
        return;
    }

    const nom = document.getElementById('crear-nombre').value.trim();
    const apP = document.getElementById('crear-apellido-p').value.trim();
    const apM = document.getElementById('crear-apellido-m').value.trim();
    const nombreCompleto = `${nom} ${apP} ${apM}`;

    const datos = {
        rut_solicitante: rutIngresado, 
        nombres: nom,
        apellido_p: apP,
        apellido_m: apM,
        nombre_solicitante: nombreCompleto,
        fecha_nacimiento: document.getElementById('crear-nacimiento').value,
        celular: document.getElementById('crear-celular').value.trim(),
        correo: document.getElementById('crear-correo').value.trim(),
        sector: document.getElementById('crear-sector').value.trim(),
        direccion: document.getElementById('crear-direccion').value.trim(),
        discapacidad: descripcionDiscapacidad,
        fecha: document.getElementById('crear-fecha').value,
        hora: document.getElementById('crear-hora').value,
        motivo: document.getElementById('crear-motivo').value.trim()
    };

    if (!datos.nombres || !datos.apellido_p || !datos.fecha || !datos.hora || !datos.motivo) {
        if(typeof mostrarNotificacion === "function") mostrarNotificacion("Por favor, completa todos los campos obligatorios.", "warning");
        return;
    }

    try {
        const res = await apiAuditoria.createAuditoria(datos);
        if (res && res.status === 1) {
            bootstrap.Modal.getInstance(document.getElementById('modalCrear')).hide();
            document.getElementById('form-crear-solicitud').reset();
            document.getElementById('crear-rut').classList.remove('is-valid', 'is-invalid');
            document.getElementById('wrapper-discapacidad').classList.add('d-none');
            
            if(typeof mostrarNotificacion === "function") mostrarNotificacion("Solicitud guardada correctamente.", "success");
            cargarGestionDiaria();
        } else {
            if(typeof mostrarNotificacion === "function") mostrarNotificacion("Error: " + (res.message || "Rechazo del servidor."), "error");
        }
    } catch (e) {
        if(typeof mostrarNotificacion === "function") mostrarNotificacion("Error crítico de conexión.", "error");
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
    
    document.getElementById('editar-nombre').value = item.nombres || item.nombre_solicitante || '';
    document.getElementById('editar-apellido-p').value = item.apellido_p || '';
    document.getElementById('editar-apellido-m').value = item.apellido_m || '';
    document.getElementById('editar-nacimiento').value = item.fecha_nacimiento || '';
    document.getElementById('editar-celular').value = item.celular || '';
    document.getElementById('editar-correo').value = item.correo || '';
    
    document.getElementById('editar-sector').value = item.sector || '';
    document.getElementById('editar-direccion').value = item.direccion || '';

    const checkDiscapacidad = document.getElementById('editar-check-discapacidad');
    const wrapperDiscapacidad = document.getElementById('editar-wrapper-discapacidad');
    const descDiscapacidad = document.getElementById('editar-desc-discapacidad');

    if (item.discapacidad && item.discapacidad !== "Ninguna" && item.discapacidad.trim() !== "") {
        checkDiscapacidad.checked = true;
        wrapperDiscapacidad.classList.remove('d-none');
        descDiscapacidad.value = item.discapacidad;
    } else {
        checkDiscapacidad.checked = false;
        wrapperDiscapacidad.classList.add('d-none');
        descDiscapacidad.value = "";
    }

    document.getElementById('editar-fecha').value = item.fecha;
    document.getElementById('editar-hora').value = item.hora.substring(0, 5);
    document.getElementById('editar-motivo').value = item.motivo;
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditar')).show();
}

async function guardarEdicion() {
    const rutIngresado = document.getElementById('editar-rut').value.trim();

    if (!validarRut(rutIngresado)) {
        if(typeof mostrarNotificacion === "function") mostrarNotificacion("El RUT corregido no es válido.", "warning");
        return;
    }

    let tieneDiscapacidad = document.getElementById('editar-check-discapacidad').checked;
    let descripcionDiscapacidad = tieneDiscapacidad ? document.getElementById('editar-desc-discapacidad').value.trim() : "Ninguna";

    const nom = document.getElementById('editar-nombre').value.trim();
    const apP = document.getElementById('editar-apellido-p').value.trim();
    const apM = document.getElementById('editar-apellido-m').value.trim();
    const nombreCompleto = `${nom} ${apP} ${apM}`;

    const datos = {
        id: document.getElementById('editar-id').value,
        rut_solicitante: rutIngresado, 
        nombres: nom,
        apellido_p: apP,
        apellido_m: apM,
        nombre_solicitante: nombreCompleto,
        fecha_nacimiento: document.getElementById('editar-nacimiento').value,
        celular: document.getElementById('editar-celular').value.trim(),
        correo: document.getElementById('editar-correo').value.trim(),
        sector: document.getElementById('editar-sector').value.trim(),
        direccion: document.getElementById('editar-direccion').value.trim(),
        discapacidad: descripcionDiscapacidad,
        fecha: document.getElementById('editar-fecha').value,
        hora: document.getElementById('editar-hora').value,
        motivo: document.getElementById('editar-motivo').value.trim()
    };

    try {
        const res = await apiAuditoria.updateAuditoria(datos);
        if (res && res.status === 1) {
            bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
            if(typeof mostrarNotificacion === "function") mostrarNotificacion("Solicitud actualizada correctamente.", "success");
            cargarGestionDiaria();
        } else {
            if(typeof mostrarNotificacion === "function") mostrarNotificacion("Error: " + (res.message || "Rechazo del servidor."), "error");
        }
    } catch (e) {
        if(typeof mostrarNotificacion === "function") mostrarNotificacion("Error crítico de conexión.", "error");
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
        if(typeof mostrarNotificacion === "function") mostrarNotificacion("Solicitud eliminada del sistema.", "success");
        cargarGestionDiaria();
    } else {
        if(typeof mostrarNotificacion === "function") mostrarNotificacion("Error: " + res.message, "error");
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
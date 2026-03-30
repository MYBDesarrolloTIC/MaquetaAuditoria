/* =======================================================================
 * ARCHIVO: GestionAudiencia.js 
 * SISTEMA: Gestión de Auditoría Municipal
 * ======================================================================= */

let datosGestion = [];
let idSolicitudAEliminar = null;
let timeoutBusqueda = null; 

document.addEventListener("DOMContentLoaded", () => {
    cargarGestionDiaria();

    const buscador = document.getElementById('buscador-solicitudes');
    if (buscador) {
        buscador.addEventListener('input', function () {
            const termino = this.value.toLowerCase().trim();
            filtrarTabla('tabla-pendientes', termino);
            filtrarTabla('tabla-historial-diario', termino);
        });
    }

    // Formateo de RUT en tiempo real al escribir
    const inputsRut = ['crear-rut', 'editar-rut'];
    inputsRut.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.addEventListener('input', function (e) {
                this.value = formatearRut(this.value);
                if (this.value.length >= 8) {
                    if (validarRut(this.value)) {
                        this.classList.replace('is-invalid', 'is-valid');
                        this.classList.add('is-valid'); // Asegurarnos de que se añada si no tenía is-invalid
                    } else {
                        this.classList.replace('is-valid', 'is-invalid');
                        this.classList.add('is-invalid');
                    }
                }
            });
        }
    });

    configurarAutocompletado('crear-nombre');
    configurarAutocompletado('crear-rut');
});

// ==========================================
// 1. CARGAR DATOS EN LAS TABLAS
// ==========================================
async function cargarGestionDiaria() {
    const tbodyPendientes = document.querySelector('#tabla-pendientes tbody');
    const tbodyHistorial = document.querySelector('#tabla-historial-diario tbody');
    if (!tbodyPendientes || !tbodyHistorial) return;

    tbodyPendientes.innerHTML = `<tr><td colspan="7" class="text-center py-4"><span class="spinner-border spinner-border-sm text-primary"></span> Cargando...</td></tr>`;

    const res = await apiAuditoria.getGestionDiaria();
    tbodyPendientes.innerHTML = '';
    tbodyHistorial.innerHTML = '';

    if (res.status === 1 && res.data) {
        datosGestion = res.data;
        let hayPendientes = false;

        res.data.forEach((item, index) => {
            const rutFormateado = formatearRut(String(item.rut_solicitante || ''));
            const nombreMostrar = `<div class="fw-bold text-dark">${item.nombre_solicitante}</div>`;
            const sectorMostrar = item.sector ? `<strong>${item.sector}</strong><br><small class="text-muted">${item.direccion || ''}</small>` : '<span class="text-muted small">No especificado</span>';
            const contacto = item.celular || item.telefono || 'Sin número';
            
            const fechaHora = `<div class="fw-bold">${item.fecha}</div><span class="badge bg-light text-primary border"><i class="fas fa-clock"></i> ${(item.hora || '').substring(0, 5)}</span>`;

           if (item.estado === 'Pendiente') {
                hayPendientes = true;
                tbodyPendientes.innerHTML += `
                  <tr class="fila-busqueda align-middle">
                        <td class="rut-col">${rutFormateado}</td>
                        <td class="nombre-col">${nombreMostrar}</td>
                        <td>${sectorMostrar}</td>
                        <td><i class="fas fa-phone text-success me-1"></i>${contacto}</td>
                        <td>${fechaHora}</td>
                        <td>${(item.motivo || '').substring(0, 30)}...</td>
                        <td class="text-center">
                            <div class="table-actions-container">
                                <button class="btn btn-sm btn-warning fw-bold text-dark" onclick="abrirModalEditar(${index})">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button class="btn btn-sm btn-danger fw-bold" onclick="abrirModalEliminar(${item.id})">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </td>
                    </tr>`;
            } else {
                const badgeClass = item.estado === 'Completada' ? 'bg-success' : 'bg-danger';
                tbodyHistorial.innerHTML += `
                    <tr class="fila-busqueda align-middle">
                        <td class="ps-4 rut-col">${rutFormateado}</td>
                        <td class="nombre-col">${nombreMostrar}</td>
                        <td>${sectorMostrar}</td>
                        <td><i class="fas fa-phone text-success me-1"></i>${contacto}</td>
                        <td>${fechaHora}</td>
                        <td>${(item.motivo || '').substring(0, 30)}...</td>
                        <td class="text-center"><span class="badge ${badgeClass} shadow-sm px-3 py-2">${item.estado}</span></td>
                    </tr>`;
            }
        });
        if (!hayPendientes) tbodyPendientes.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">No hay pendientes.</td></tr>`;
    }
}

// ==========================================
// 2. ABRIR MODAL EDITAR
// ==========================================
function abrirModalEditar(index) {
    const item = datosGestion[index];
    
    if (!item) {
        console.error("Error: No se encontraron datos para esta fila.");
        return;
    }
    
    document.getElementById('editar-id').value = item.id || '';
    document.getElementById('editar-rut').value = formatearRut(String(item.rut_solicitante || ''));
    
    let partes = (item.nombre_solicitante || "").trim().split(" ");
    document.getElementById('editar-nombre').value = item.nombres || partes[0] || "";
    document.getElementById('editar-apellido-p').value = item.apellido_p || partes[1] || "";
    document.getElementById('editar-apellido-m').value = item.apellido_m || partes.slice(2).join(" ") || "";
    
    document.getElementById('editar-nacimiento').value = item.fecha_nacimiento || "";
    document.getElementById('editar-celular').value = item.celular || item.telefono || "";
    document.getElementById('editar-correo').value = item.correo || "";
    document.getElementById('editar-sector').value = item.sector || "";
    document.getElementById('editar-direccion').value = item.direccion || "";

    const checkDisc = document.getElementById('editar-check-discapacidad');
    const wrapperDisc = document.getElementById('editar-wrapper-discapacidad');
    const descDisc = document.getElementById('editar-desc-discapacidad');

    if (item.discapacidad && item.discapacidad !== "Ninguna" && item.discapacidad.trim() !== "") {
        checkDisc.checked = true;
        wrapperDisc.classList.remove('d-none');
        descDisc.value = item.discapacidad;
    } else {
        checkDisc.checked = false;
        wrapperDisc.classList.add('d-none');
        descDisc.value = "";
    }

    document.getElementById('editar-fecha').value = item.fecha || "";
    document.getElementById('editar-hora').value = (item.hora || "").substring(0, 5);
    document.getElementById('editar-motivo').value = item.motivo || "";
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditar')).show();
}

// ==========================================
// 3. GUARDAR CAMBIOS (CREAR / EDITAR)
// ==========================================
async function guardarNuevaSolicitud() {
    const form = document.getElementById('form-crear-solicitud');
    if (!form.checkValidity()) return form.reportValidity();

    const datos = recogerDatosForm('crear');
    if (!validarRut(datos.rut_solicitante)) {
        alert("El RUT ingresado no es válido.");
        return;
    }

    const res = await apiAuditoria.createAuditoria(datos);
    if (res.status === 1) {
        bootstrap.Modal.getInstance(document.getElementById('modalCrear')).hide();
        form.reset();
        document.getElementById('crear-rut').classList.remove('is-valid', 'is-invalid');
        cargarGestionDiaria(); 
    } else {
        alert("Error del servidor: " + res.message);
    }
}

async function guardarEdicion() {
    const form = document.getElementById('form-editar-solicitud');
    if (!form.checkValidity()) return form.reportValidity();

    const datos = recogerDatosForm('editar');
    datos.id = document.getElementById('editar-id').value; 

    if (!validarRut(datos.rut_solicitante)) {
        alert("El RUT corregido no es válido.");
        return;
    }

    const res = await apiAuditoria.updateAuditoria(datos);
    if (res.status === 1) {
        bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
        cargarGestionDiaria(); 
    } else {
        alert("Error al actualizar: " + res.message);
    }
}

// ==========================================
// FUNCIONES AUXILIARES DE RECOLECCIÓN
// ==========================================
function recogerDatosForm(prefijo) {
    const nom = document.getElementById(`${prefijo}-nombre`).value.trim();
    const apP = document.getElementById(`${prefijo}-apellido-p`).value.trim();
    const apM = document.getElementById(`${prefijo}-apellido-m`).value.trim();
    
    return {
        rut_solicitante: document.getElementById(`${prefijo}-rut`).value.trim(),
        nombre_solicitante: `${nom} ${apP} ${apM}`,
        nombres: nom,
        apellido_p: apP,
        apellido_m: apM,
        fecha_nacimiento: document.getElementById(`${prefijo}-nacimiento`).value,
        celular: document.getElementById(`${prefijo}-celular`).value.trim(),
        correo: document.getElementById(`${prefijo}-correo`).value.trim(),
        sector: document.getElementById(`${prefijo}-sector`).value.trim(),
        direccion: document.getElementById(`${prefijo}-direccion`).value.trim(),
        discapacidad: document.getElementById(`${prefijo}-check-discapacidad`).checked ? document.getElementById(`${prefijo}-desc-discapacidad`).value : "Ninguna",
        fecha: document.getElementById(`${prefijo}-fecha`).value,
        hora: document.getElementById(`${prefijo}-hora`).value,
        motivo: document.getElementById(`${prefijo}-motivo`).value.trim()
    };
}

// ==========================================
// FUNCIONES DE RUT Y UTILIDADES
// ==========================================
function formatearRut(rut) {
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (valor.length < 2) return valor;
    let cuerpo = valor.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return cuerpo + '-' + valor.slice(-1);
}

// NUEVA FUNCIÓN AGREGADA AQUÍ:
function normalizarRutBusqueda(rut) {
    return String(rut || '')
        .replace(/\./g, '')
        .replace(/-/g, '')
        .trim()
        .toUpperCase();
}
function validarRut(rut) {
    let valor = rut.replace(/\./g, '').replace('-', '').toUpperCase();
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);
    let suma = 0, multi = 2;
    for (let i = 1; i <= cuerpo.length; i++) {
        suma += multi * valor.charAt(cuerpo.length - i);
        multi = multi < 7 ? multi + 1 : 2;
    }
    let dvEsperado = 11 - (suma % 11);
    dvEsperado = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();
    return dv === dvEsperado;
}

// ==========================================
// ELIMINAR Y FILTRAR TABLA
// ==========================================
function abrirModalEliminar(id) {
    idSolicitudAEliminar = id;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminar')).show();
}

async function ejecutarEliminar() {
    const res = await apiAuditoria.deleteAuditoria(idSolicitudAEliminar);
    if (res.status === 1) {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
        idSolicitudAEliminar = null;
        cargarGestionDiaria();
    } else {
        alert("Error al eliminar: " + res.message);
    }
}

function filtrarTabla(id, term) {
    const filas = document.querySelectorAll(`#${id} tbody tr.fila-busqueda`);
    filas.forEach(f => f.style.display = f.textContent.toLowerCase().includes(term) ? '' : 'none');
}

// ==========================================
// AUTOCOMPLETADO DE CIUDADANOS EN EL MODAL
// ==========================================
function configurarAutocompletado(inputId) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;

    // Crear el contenedor flotante (cascada)
    let dropdown = inputEl.parentElement.querySelector('.autocompletar-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'dropdown-menu w-100 shadow-lg border-0 autocompletar-dropdown';
        dropdown.style.maxHeight = '250px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.position = 'absolute';
        dropdown.style.zIndex = '1050';
        
        // Lo posicionamos justo debajo del input
        inputEl.parentElement.style.position = 'relative';
        inputEl.parentElement.appendChild(dropdown);
    }

    // Evento al escribir
    inputEl.addEventListener('input', function () {
        // Limpiamos puntos y guión para que la búsqueda en la BD sea exacta (Si es RUT)
        const valorVisible = this.value.trim();
        const termino = inputId.includes('rut') 
            ? normalizarRutBusqueda(valorVisible)
            : valorVisible.toLowerCase().trim();

        clearTimeout(timeoutBusqueda);

        // Ocultar si hay menos de 3 caracteres
        if (termino.length < 3) {
            dropdown.classList.remove('show');
            return;
        }

        // Esperar 350ms antes de buscar para no saturar la base de datos
        timeoutBusqueda = setTimeout(async () => {
            dropdown.innerHTML = '<div class="px-3 py-2 text-muted small"><span class="spinner-border spinner-border-sm me-2"></span> Buscando coincidencias...</div>';
            dropdown.classList.add('show');

            try {
                // Llamar a la API
                const res = await apiAuditoria.buscarCiudadano(termino);
                dropdown.innerHTML = '';

                if (res && res.status === 1 && res.data.length > 0) {
                    dropdown.innerHTML = '<h6 class="dropdown-header text-primary fw-bold bg-light border-bottom">Ciudadanos registrados:</h6>';
                    
                    res.data.forEach(ciudadano => {
                        const rutFormateado = formatearRut(String(ciudadano.rut_solicitante || ''));
                        const item = document.createElement('a');
                        item.className = 'dropdown-item py-2 border-bottom';
                        item.style.cursor = 'pointer';
                        
                        // Mostramos el Nombre y el RUT resaltado
                        item.innerHTML = `
                            <div class="fw-bold text-dark">${ciudadano.nombres || ciudadano.nombre_solicitante || ''} ${ciudadano.apellido_p || ''}</div>
                            <div class="small text-muted"><i class="fas fa-id-card text-warning me-1"></i> RUT: ${rutFormateado}</div>
                        `;

                        // TRUCO CLAVE: Usar 'mousedown' evita que el evento 'blur' del input 
                        // cierre el menú antes de que se registre la selección.
                        item.addEventListener('mousedown', function(e) {
                            e.preventDefault(); 
                            autocompletarFormulario(ciudadano);
                            dropdown.classList.remove('show');
                        });

                        dropdown.appendChild(item);
                    });
                } else {
                    dropdown.innerHTML = '<div class="px-3 py-2 text-muted small">No se encontró al ciudadano. Sigue escribiendo para registrarlo.</div>';
                    // Ocultar el mensaje después de 2 segundos
                    setTimeout(() => dropdown.classList.remove('show'), 2000);
                }
            } catch (error) {
                console.error("Error al buscar:", error);
                dropdown.classList.remove('show');
            }
        }, 350);
    });

    // Ocultar la cascada si el usuario hace clic en otra parte de la pantalla
    document.addEventListener('mousedown', function(e) {
        if (!inputEl.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// ==========================================
// FUNCIÓN PARA INYECTAR LOS DATOS SELECCIONADOS
// ==========================================
function autocompletarFormulario(data) {
    // 1. Inyectar RUT y validarlo visualmente
    const inputRut = document.getElementById('crear-rut');
    if(inputRut) {
        inputRut.value = formatearRut(String(data.rut_solicitante || ''));
        inputRut.classList.add('is-valid');
        inputRut.classList.remove('is-invalid');
    }
    
    // 2. Inyectar Nombres y Apellidos de forma segura (por si vienen nulos)
    if(document.getElementById('crear-nombre')) {
        document.getElementById('crear-nombre').value = data.nombres || data.nombre_solicitante || '';
    }
    if(document.getElementById('crear-apellido-p')) {
        document.getElementById('crear-apellido-p').value = data.apellido_p || '';
    }
    if(document.getElementById('crear-apellido-m')) {
        document.getElementById('crear-apellido-m').value = data.apellido_m || '';
    }
    
    // 3. Inyectar Datos de Contacto y Ubicación
    if (document.getElementById('crear-nacimiento')) {
        document.getElementById('crear-nacimiento').value = data.fecha_nacimiento || '';
    }
    
    // Limpiamos el '+56' si el backend lo devuelve, ya que tu diseño lo tiene fijo como etiqueta
    if (document.getElementById('crear-celular')) {
        let celLimpio = String(data.celular || data.telefono || '').replace('+56', '').trim();
        document.getElementById('crear-celular').value = celLimpio;
    }
    
    if (document.getElementById('crear-correo')) document.getElementById('crear-correo').value = data.correo || '';
    if (document.getElementById('crear-sector')) document.getElementById('crear-sector').value = data.sector || '';
    if (document.getElementById('crear-direccion')) document.getElementById('crear-direccion').value = data.direccion || '';

    // 4. Inyectar Estado de Discapacidad
    const checkDiscapacidad = document.getElementById('crear-check-discapacidad');
    const wrapperDiscapacidad = document.getElementById('wrapper-discapacidad');
    const descDiscapacidad = document.getElementById('crear-desc-discapacidad');

    if (checkDiscapacidad && wrapperDiscapacidad && descDiscapacidad) {
        if (data.discapacidad && data.discapacidad.toLowerCase() !== "ninguna" && data.discapacidad.trim() !== "") {
            checkDiscapacidad.checked = true;
            wrapperDiscapacidad.classList.remove('d-none'); // Muestra la caja de texto
            descDiscapacidad.value = data.discapacidad;
        } else {
            checkDiscapacidad.checked = false;
            wrapperDiscapacidad.classList.add('d-none'); // Oculta la caja de texto
            descDiscapacidad.value = "";
        }
    }

    // 5. Notificación Visual (Si tienes la función global disponible)
    if(typeof mostrarNotificacion === "function") {
        mostrarNotificacion("Datos del ciudadano cargados automáticamente.", "success");
    }
}
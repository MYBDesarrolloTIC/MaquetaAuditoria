async function cargarListaUsuarios() {
    const tbody = document.getElementById('tabla-usuarios');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-danger" role="status"></div></td></tr>`;
    const res = await apiUsuarios.getUsuarios();
    tbody.innerHTML = '';
    if (res.status === 1 && res.data && res.data.length > 0) {
        res.data.forEach(u => {
            let rolBadge = u.rol === 'superadmin' ? 'bg-danger-yb-light text-danger-yb' : 'bg-blue-yb-light text-blue-yb';
            let estadoBadge = u.estado === 'Activo' ? 'bg-success text-white' : 'bg-secondary text-white';
            tbody.innerHTML += `
            <tr>
                <td class="ps-4 py-3 fw-bold text-black"><i class="bi bi-person-circle text-muted me-2 fs-5 align-middle"></i> ${u.nombre}</td>
                <td class="py-3">${u.login}</td>
                <td class="py-3"><span class="badge ${rolBadge} border-0 px-2 py-1">${u.rol}</span></td>
                <td class="py-3"><span class="badge ${estadoBadge} rounded-pill">${u.estado}</span></td>
                <td class="text-end pe-4 py-3">
                    <button class="btn btn-sm btn-outline-primary" style="color: var(--yb-blue); border-color: var(--yb-blue);" onclick="editarUsuario(${u.id}, '${u.nombre}', '${u.login}', '${u.rol}', '${u.estado}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger ms-1" style="color: var(--yb-red); border-color: var(--yb-red);" onclick="abrirModalBorrarUsuario(${u.id})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`;
        });
    } else { tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No se encontraron usuarios.</td></tr>'; }
}

function abrirModalUsuario() {
    const modalEl = document.getElementById('modalFormUsuario');
    if (!modalEl) return;
    if (document.getElementById('formUsuario')) document.getElementById('formUsuario').reset();
    if (document.getElementById('usuario_id')) document.getElementById('usuario_id').value = '';
    if (document.getElementById('textoTituloModal')) document.getElementById('textoTituloModal').innerText = 'Registrar Nuevo Usuario';
    if (document.getElementById('hint-password')) document.getElementById('hint-password').style.display = 'none';
    if (document.getElementById('usuario_password')) document.getElementById('usuario_password').required = true;
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

function editarUsuario(id, nombre, login, rol, estado) {
    document.getElementById('usuario_id').value = id;
    document.getElementById('usuario_nombre').value = nombre;
    document.getElementById('usuario_login').value = login;
    document.getElementById('usuario_rol').value = rol;
    document.getElementById('usuario_estado').value = estado;
    document.getElementById('usuario_password').value = '';
    document.getElementById('usuario_password').required = false;
    document.getElementById('textoTituloModal').innerText = 'Editar Usuario';
    document.getElementById('hint-password').style.display = 'inline';
    new bootstrap.Modal(document.getElementById('modalFormUsuario')).show();
}

async function guardarUsuario() {
    const id = document.getElementById('usuario_id').value;
    const datos = {
        nombre: document.getElementById('usuario_nombre').value.trim(),
        login: document.getElementById('usuario_login').value.trim(),
        password: document.getElementById('usuario_password').value,
        rol: document.getElementById('usuario_rol').value,
        estado: document.getElementById('usuario_estado').value
    };
    if (!datos.nombre || !datos.login) { mostrarNotificacion("El nombre y el login son obligatorios.", "warning"); return; }
    let res;
    if (id) { datos.id = id; res = await apiUsuarios.updateUsuario(datos); } 
    else { res = await apiUsuarios.createUsuario(datos); }
    if (res.status === 1) {
        mostrarNotificacion("Usuario guardado exitosamente.", "success");
        bootstrap.Modal.getInstance(document.getElementById('modalFormUsuario')).hide();
        cargarListaUsuarios();
    } else { mostrarNotificacion("Error: " + res.message, "error"); }
}

function abrirModalBorrarUsuario(id) { document.getElementById('delete_usuario_id').value = id; new bootstrap.Modal(document.getElementById('modalBorrarUsuario')).show(); }

async function ejecutarBorrarUsuario() {
    const id = document.getElementById('delete_usuario_id').value;
    if (!id) return;
    const res = await apiUsuarios.deleteUsuario(id);
    if (res.status === 1) {
        mostrarNotificacion("Usuario eliminado con éxito.", "delete");
        bootstrap.Modal.getInstance(document.getElementById('modalBorrarUsuario')).hide();
        cargarListaUsuarios();
    } else { mostrarNotificacion("Error al eliminar: " + res.message, "error"); }
}

/* =========================================================================
   MÓDULO 8: DASHBOARD INICIO (CON AVISOS INTELIGENTES)
   ========================================================================= */
async function cargarEstadisticasDashboard() {
    try {
        const req = await fetch('../../controller/dashboard_controller.php?action=getStats');
        const res = await req.json();
        
        if (res.status === 1) {
            document.getElementById('dash-total-func').innerHTML = res.data.total_funcionarios || '0';
            document.getElementById('dash-presentes').innerHTML = res.data.presentes_hoy || '0';
            document.getElementById('dash-atrasos').innerHTML = res.data.atrasos_hoy || '0';
            document.getElementById('dash-licencias').innerHTML = res.data.licencias_activas || '0';

            const contenedorAvisos = document.getElementById('lista-avisos');
            if (contenedorAvisos) {
                let htmlAvisos = '';

                if (res.data.pendientes_enrolar && parseInt(res.data.pendientes_enrolar) > 0) {
                    htmlAvisos += `
                        <li class="list-group-item d-flex justify-content-between align-items-start border-0 px-0 text-black mb-3">
                            <i class="bi bi-exclamation-triangle-fill text-warning me-3 mt-1 fs-3"></i>
                            <div class="ms-2 me-auto">
                                <div class="fw-bold">Funcionarios sin credencial</div>
                                <span class="text-muted d-block mb-1">Tienes <b>${res.data.pendientes_enrolar}</b> funcionario(s) "Por Enrolar" en el sistema.</span>
                                <a href="VistaAsistencia.php" class="btn btn-sm btn-outline-warning fw-bold px-3 mt-2">Ir a enrolarlos</a>
                            </div>
                        </li>
                    `;
                }

                if (res.data.licencias_activas && parseInt(res.data.licencias_activas) > 0) {
                    htmlAvisos += `
                        <li class="list-group-item d-flex justify-content-between align-items-start border-0 px-0 text-black mb-3">
                            <i class="bi bi-file-medical-fill text-primary me-3 mt-1 fs-3"></i>
                            <div class="ms-2 me-auto">
                                <div class="fw-bold">Licencias y Feriados Activos</div>
                                <span class="text-muted">El día de hoy hay <b>${res.data.licencias_activas}</b> funcionario(s) con licencia médica o vacaciones.</span>
                            </div>
                        </li>
                    `;
                }

                if (res.data.atrasos_hoy && parseInt(res.data.atrasos_hoy) > 0) {
                    htmlAvisos += `
                        <li class="list-group-item d-flex justify-content-between align-items-start border-0 px-0 text-black mb-3">
                            <i class="bi bi-clock-history text-danger me-3 mt-1 fs-3"></i>
                            <div class="ms-2 me-auto">
                                <div class="fw-bold">Atrasos registrados</div>
                                <span class="text-muted">Se han detectado <b>${res.data.atrasos_hoy}</b> atraso(s) en la jornada de hoy.</span>
                            </div>
                        </li>
                    `;
                }

                if (htmlAvisos === '') {
                    htmlAvisos = `
                        <div class="alert alert-success text-center fw-bold shadow-sm border-0 d-flex flex-column align-items-center py-4">
                            <i class="bi bi-check-circle-fill text-success mb-2" style="font-size: 2.5rem;"></i>
                            ¡Todo en orden! No hay avisos pendientes en el sistema.
                        </div>
                    `;
                }

                contenedorAvisos.innerHTML = htmlAvisos;
            }
        } else {
            mostrarCerosDashboard();
            mostrarNotificacion("Error al cargar estadísticas: " + res.message, "warning");
        }
    } catch (error) {
        mostrarCerosDashboard();
        mostrarNotificacion("Error crítico al conectar con el servidor.", "error");
    }
}

function mostrarCerosDashboard() {
    document.getElementById('dash-total-func').innerHTML = '0';
    document.getElementById('dash-presentes').innerHTML = '0';
    document.getElementById('dash-atrasos').innerHTML = '0';
    document.getElementById('dash-licencias').innerHTML = '0';
    
    const contenedorAvisos = document.getElementById('lista-avisos');
    if (contenedorAvisos) {
        contenedorAvisos.innerHTML = '<div class="alert alert-secondary text-center">No se pudo cargar la información.</div>';
    }
}
/* =========================================================================
   MÓDULO 9: BORRADO GLOBAL (FUNCIONARIOS) E IMPORTACIÓN CSV
   ========================================================================= */
async function ejecutarBorradoSeguro() {
    const passwordInput = document.getElementById('password-admin-borrado').value;

    if (!passwordInput) {
        mostrarNotificacion("Debe ingresar la contraseña de autorización.", "warning");
        return;
    }

    const btnConfirmar = document.getElementById('btn-confirmar-borrado-seguro');
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Validando...';

    try {
        const formData = new FormData();
        formData.append('action', 'validarPassword');
        formData.append('password', passwordInput);

        // Envía la contraseña a validar al PHP
        const reqValidar = await fetch('../../controller/seguridad_controller.php', { method: 'POST', body: formData });
        const resValidar = await reqValidar.json();

        if (resValidar.status === 1) {
            // ¡CONTRASEÑA "admin1234" CORRECTA! PROCEDE A BORRAR
            if (tipoItemABorrar === 'turno' && turnoABorrarId) {
                const resBorrar = await apiTurnos.deleteTurno(turnoABorrarId);
                if (resBorrar.status === 1) {
                    mostrarNotificacion("Turno eliminado correctamente.", "success");
                    cargarTarjetasTurnos();
                } else { mostrarNotificacion(resBorrar.message, "error"); }
            } 
            else if (tipoItemABorrar === 'seccion' && seccionABorrarId) {
                const resBorrar = await apiSecciones.deleteSeccion(seccionABorrarId);
                if (resBorrar.status === 1) {
                    mostrarNotificacion("Sección eliminada correctamente.", "success");
                    cargarListaSecciones();
                } else { mostrarNotificacion(resBorrar.message, "error"); }
            }

            bootstrap.Modal.getInstance(document.getElementById('modalBorrarSeguro')).hide();
            turnoABorrarId = null;
            seccionABorrarId = null;

        } else {
            // CONTRASEÑA INCORRECTA
            mostrarNotificacion(resValidar.message, "error");
            document.getElementById('password-admin-borrado').value = '';
            document.getElementById('password-admin-borrado').focus();
        }
    } catch (error) {
        mostrarNotificacion("Error de conexión al validar la contraseña.", "error");
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = '<i class="bi bi-trash-fill me-2"></i>Confirmar Eliminación';
    }
}
const formImportar = document.getElementById('form-importar-csv');
if (formImportar) {
    formImportar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-importar');
        const fileInput = document.getElementById('archivo_csv');
        btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
        const formData = new FormData();
        formData.append('action', 'importar'); formData.append('archivo_csv', fileInput.files[0]);
        try {
            const req = await fetch('../../controller/migracion_controller.php', { method: 'POST', body: formData });
            const res = await req.json();
            if (res.status === 1) {
                mostrarNotificacion(res.message, "success");
                bootstrap.Modal.getInstance(document.getElementById('modalMigracion')).hide();
                if (typeof cargarListaFuncionarios === 'function') cargarListaFuncionarios();
            } else { mostrarNotificacion(res.message, "error"); }
        } catch (error) { mostrarNotificacion("Error de conexión.", "error"); } 
        finally { btn.disabled = false; btn.innerHTML = '<i class="bi bi-database-add me-2"></i> Procesar Archivo'; }
    });
}

function inicializarBuscadorUniversal(idInput, idContenedor, selectorFila) {
    const input = document.getElementById(idInput);
    const contenedor = document.getElementById(idContenedor);
    if (!input || !contenedor) return;

    // Limpieza agresiva en 3 tiempos para ganarle al autocompletado del navegador
    input.value = '';
    setTimeout(() => input.value = '', 100);
    setTimeout(() => input.value = '', 500);

    input.addEventListener('input', function () {
        const termino = this.value.toLowerCase().trim();
        const filas = contenedor.querySelectorAll(selectorFila);
        filas.forEach(fila => {
            const contenido = fila.textContent.toLowerCase();
            if (contenido.includes(termino)) { 
                fila.style.display = ''; 
            } else { 
                fila.style.setProperty('display', 'none', 'important'); 
            }
        });
    });
}
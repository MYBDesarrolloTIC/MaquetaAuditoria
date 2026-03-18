// assets/js/usuario.js
let datosUsuariosGlobal = []; 

document.addEventListener("DOMContentLoaded", () => {
    cargarListaUsuarios();
});

async function cargarListaUsuarios() {
    const contenedor = document.getElementById('contenedor-usuarios');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted fw-bold">Cargando usuarios del sistema...</p>
        </div>`;

    try {
        const res = await apiUsuarios.getUsuarios();
        contenedor.innerHTML = '';

        if (res && res.status === 1 && res.data && res.data.length > 0) {
            datosUsuariosGlobal = res.data; 
            
            res.data.forEach((u, index) => {
                let emoji = "👤";
                let badgeClass = "bg-secondary";
                let rolText = String(u.rol || '').toLowerCase();

                if (rolText === 'admin' || rolText === 'superadmin') {
                    emoji = "👨‍💻"; badgeClass = "bg-dark";
                } else if (rolText === 'alcalde') {
                    emoji = "👨‍⚖️"; badgeClass = "bg-primary";
                } else if (rolText === 'secretaria') {
                    emoji = "👩‍💼"; badgeClass = "bg-info text-dark"; 
                }

                let btnEliminarDisabled = u.login === 'admin' ? 'disabled' : '';

                contenedor.innerHTML += `
                <div class="col-md-3 mb-4" id="tarjeta-user-${u.id}">
                    <div class="card text-center shadow-sm border-0 h-100 py-3">
                        <div class="card-body">
                            <div class="mb-3">
                                <h1 class="display-4">${emoji}</h1>
                            </div>
                            <h5 class="card-title fw-bold text-black">${u.login}</h5>
                            <p class="text-muted mb-1 small">Nombre: ${u.nombre}</p>
                            <p class="badge ${badgeClass} mb-3 px-3 py-2">Rol: ${u.rol}</p>
                            <p class="small fw-bold text-${u.estado === 'Activo' ? 'success' : 'danger'}">${u.estado}</p>
                            
                            <div class="d-grid gap-2 d-md-block mt-2">
                                <button class="btn btn-sm btn-warning text-white fw-bold" onclick="abrirModalEditarUsuario(${index})">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button class="btn btn-sm btn-danger fw-bold" ${btnEliminarDisabled} onclick="eliminarUsuario(${u.id})">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        } else {
            contenedor.innerHTML = '<div class="col-12"><div class="alert alert-warning text-center">No se encontraron usuarios en la base de datos o token inválido.</div></div>';
        }
    } catch (e) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center">Error de conexión: ${e.message}</div></div>`;
    }
}

async function guardarNuevoUsuario() {
    const datos = {
        nombre: document.getElementById('crear-nombre-user').value.trim(),
        login: document.getElementById('crear-login-user').value.trim(),
        password: document.getElementById('crear-pass-user').value,
        rol: document.getElementById('crear-rol-user').value,
        estado: document.getElementById('crear-estado-user').value
    };

    if (!datos.nombre || !datos.login || !datos.password) return;

    const res = await apiUsuarios.createUsuario(datos);
    if (res.status === 1) {
        bootstrap.Modal.getInstance(document.getElementById('modalCrearUsuario')).hide();
        document.getElementById('form-crear-usuario').reset();
        cargarListaUsuarios();
    } else {
        alert("Error al guardar: " + res.message);
    }
}

function abrirModalEditarUsuario(index) {
    const u = datosUsuariosGlobal[index];
    
    document.getElementById('editar-id-user').value = u.id;
    document.getElementById('editar-nombre-user').value = u.nombre;
    document.getElementById('editar-login-user').value = u.login;
    document.getElementById('editar-pass-user').value = ""; 
    document.getElementById('editar-rol-user').value = String(u.rol || '').toLowerCase();
    document.getElementById('editar-estado-user').value = u.estado;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarUsuario')).show();
}

async function guardarEdicionUsuario() {
    const datos = {
        id: document.getElementById('editar-id-user').value,
        nombre: document.getElementById('editar-nombre-user').value.trim(),
        login: document.getElementById('editar-login-user').value.trim(),
        password: document.getElementById('editar-pass-user').value,
        rol: document.getElementById('editar-rol-user').value,
        estado: document.getElementById('editar-estado-user').value
    };

    const res = await apiUsuarios.updateUsuario(datos);
    if (res.status === 1) {
        bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario')).hide();
        cargarListaUsuarios();
    } else {
        alert("Error al actualizar: " + res.message);
    }
}

async function eliminarUsuario(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario del sistema?")) {
        const res = await apiUsuarios.deleteUsuario(id);
        
        if (res.status === 1) {
            const tarjeta = document.getElementById(`tarjeta-user-${id}`);
            if (tarjeta) {
                tarjeta.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                tarjeta.style.opacity = "0";
                tarjeta.style.transform = "scale(0.8)";
                setTimeout(() => tarjeta.remove(), 300);
            }
        } else {
            alert("Error al eliminar: " + res.message);
        }
    }
}
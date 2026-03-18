document.addEventListener("DOMContentLoaded", () => {
    cargarListaUsuarios();
});

// ==========================================
// 1. CARGAR LISTA DE USUARIOS (TARJETAS)
// ==========================================
async function cargarListaUsuarios() {
    const contenedor = document.getElementById('contenedor-usuarios');
    if (!contenedor) return;

    // Mostrar loader
    contenedor.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted fw-bold">Cargando usuarios del sistema...</p>
        </div>`;

    const res = await apiUsuarios.getUsuarios();

    contenedor.innerHTML = '';

    if (res.status === 1 && res.data && res.data.length > 0) {
        res.data.forEach(u => {
            
            // Lógica inteligente para dar colores y emojis según el rol
            let emoji = "👤";
            let badgeClass = "bg-secondary";
            let rolText = u.rol.toLowerCase();

            if (rolText === 'admin' || rolText === 'superadmin') {
                emoji = "👨‍💻";
                badgeClass = "bg-dark";
            } else if (rolText === 'alcalde') {
                emoji = "👨‍⚖️";
                badgeClass = "bg-primary";
            } else if (rolText === 'secretaria') {
                emoji = "👩‍💼";
                badgeClass = "bg-info text-dark"; 
            }

            // Protegemos al usuario 'admin' principal para que no se pueda borrar a sí mismo
            let btnEliminarDisabled = u.login === 'admin' ? 'disabled' : '';

            // Dibujamos la tarjeta
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
                        
                        <div class="d-grid gap-2 d-md-block mt-2">
                            <button class="btn btn-sm btn-warning text-white fw-bold" onclick="alert('Ventana de edición en construcción')">
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
        contenedor.innerHTML = '<div class="col-12"><div class="alert alert-warning text-center">No se encontraron usuarios en la base de datos.</div></div>';
    }
}

// ==========================================
// 2. ELIMINAR USUARIO
// ==========================================
async function eliminarUsuario(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario del sistema?")) {
        const res = await apiUsuarios.deleteUsuario(id);
        
        if (res.status === 1) {
            // Desaparecemos la tarjeta suavemente
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
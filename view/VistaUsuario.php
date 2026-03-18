<?php 
// 1. Cargamos el Header
include 'includes/Header.php'; 
?>

    <div class="header-seccion">
        <div>
            <h1>Gestión de Usuarios</h1>
            <p>Administración de cuentas, roles y accesos del sistema</p>
        </div>
        <div>
            <button class="btn btn-primary" id="btn-crear-usuario">
                <i class="fas fa-user-plus me-1"></i> Crear Nuevo Usuario
            </button>
        </div>
    </div>

    <div class="row mt-4" id="contenedor-usuarios">
        
        <div class="col-md-3 mb-4">
            <div class="card text-center shadow-sm border-0 h-100 py-3">
                <div class="card-body">
                    <div class="mb-3">
                        <h1 class="display-4">👩‍💼</h1>
                    </div>
                    <h5 class="card-title fw-bold text-black">Sec_Manana</h5>
                    <p class="text-muted mb-1 small">Nombre: Camila Díaz</p>
                    <p class="badge bg-secondary mb-3 px-3 py-2">Rol: Secretaria</p>
                    <div class="d-grid gap-2 d-md-block mt-2">
                        <button class="btn btn-sm btn-warning text-white fw-bold" title="Editar Contraseña o Rol"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn btn-sm btn-danger fw-bold" title="Eliminar Usuario"><i class="fas fa-trash"></i> Eliminar</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3 mb-4">
            <div class="card text-center shadow-sm border-0 h-100 py-3">
                <div class="card-body">
                    <div class="mb-3">
                        <h1 class="display-4">👨‍⚖️</h1>
                    </div>
                    <h5 class="card-title fw-bold text-black">Alcalde_Titular</h5>
                    <p class="text-muted mb-1 small">Nombre: Roberto Montes</p>
                    <p class="badge bg-primary mb-3 px-3 py-2">Rol: Alcalde</p>
                    <div class="d-grid gap-2 d-md-block mt-2">
                        <button class="btn btn-sm btn-warning text-white fw-bold"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn btn-sm btn-danger fw-bold"><i class="fas fa-trash"></i> Eliminar</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3 mb-4">
            <div class="card text-center shadow-sm border-0 h-100 py-3">
                <div class="card-body">
                    <div class="mb-3">
                        <h1 class="display-4">👨‍💻</h1>
                    </div>
                    <h5 class="card-title fw-bold text-black">Admin_TI</h5>
                    <p class="text-muted mb-1 small">Nombre: Equipo Informática</p>
                    <p class="badge bg-dark mb-3 px-3 py-2">Rol: Superusuario</p>
                    <div class="d-grid gap-2 d-md-block mt-2">
                        <button class="btn btn-sm btn-warning text-white fw-bold"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn btn-sm btn-danger fw-bold" disabled><i class="fas fa-trash"></i> Eliminar</button>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <script src="../controller/assets/script.js/usuario.js"></script>

<?php 
// 2. Cargamos el Footer
include 'includes/Footer.php'; 
?>
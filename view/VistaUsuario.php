<?php 
include 'includes/Header.php'; 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de Usuarios</title>
    <link rel="stylesheet" href="../controller/assets/css/Styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

    <?php include 'includes/Menu.php'; ?>

    <div class="content-wrapper">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Gestión de Usuarios del Sistema</h2>
            <button class="btn btn-primary" id="btn-crear-usuario">➕ Crear Nuevo Usuario</button>
        </div>

        <div class="row" id="contenedor-usuarios">
            
            <div class="col-md-3 mb-4">
                <div class="card text-center shadow-sm">
                    <div class="card-body">
                        <div class="mb-3">
                            <h1 class="display-4">👩‍💼</h1>
                        </div>
                        <h5 class="card-title">Sec_Manana</h5>
                        <p class="text-muted mb-1">Nombre: Camila Díaz</p>
                        <p class="badge bg-secondary mb-3">Rol: Secretaria</p>
                        <div class="d-grid gap-2 d-md-block">
                            <button class="btn btn-sm btn-warning" title="Editar Contraseña o Rol">✏️ Editar</button>
                            <button class="btn btn-sm btn-danger" title="Eliminar Usuario">🗑️ Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card text-center shadow-sm">
                    <div class="card-body">
                        <div class="mb-3">
                            <h1 class="display-4">👨‍⚖️</h1>
                        </div>
                        <h5 class="card-title">Alcalde_Titular</h5>
                        <p class="text-muted mb-1">Nombre: Roberto Montes</p>
                        <p class="badge bg-primary mb-3">Rol: Alcalde</p>
                        <div class="d-grid gap-2 d-md-block">
                            <button class="btn btn-sm btn-warning">✏️ Editar</button>
                            <button class="btn btn-sm btn-danger">🗑️ Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card text-center shadow-sm">
                    <div class="card-body">
                        <div class="mb-3">
                            <h1 class="display-4">👨‍💻</h1>
                        </div>
                        <h5 class="card-title">Admin_TI</h5>
                        <p class="text-muted mb-1">Nombre: Equipo Informática</p>
                        <p class="badge bg-dark mb-3">Rol: Superusuario</p>
                        <div class="d-grid gap-2 d-md-block">
                            <button class="btn btn-sm btn-warning">✏️ Editar</button>
                            <button class="btn btn-sm btn-danger" disabled>🗑️ Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <script src="../controller/assets/script.js/usuario.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<?php 
 include 'includes/Footer.php'; 
?>
</body>
</html>
<?php 
include 'includes/Header.php'; 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de Audiencia - Secretaria</title>
    <link rel="stylesheet" href="../controller/assets/css/Styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

    <?php include 'includes/Menu.php'; ?>

    <div class="content-wrapper">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Gestión de Solicitudes Diarias</h2>
            <div>
                <button class="btn btn-danger me-2" id="btn-eliminar-seleccionados">🗑️ Eliminar Seleccionados</button>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalCrear">➕ Crear Solicitud</button>
            </div>
        </div>

        <div class="mb-3">
            <input type="text" id="buscador-solicitudes" class="form-control" placeholder="🔍 Buscar por RUT o Nombre...">
        </div>

        <h4>Pendientes</h4>
        <table class="table table-bordered table-hover" id="tabla-pendientes">
            <thead>
                <tr class="table-info">
                    <th><input type="checkbox" id="checkAll"></th>
                    <th>RUT</th>
                    <th>Nombre Completo</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Motivo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr class="table-info">
                    <td><input type="checkbox"></td>
                    <td>19.876.543-2</td>
                    <td>María Silva Rojas</td>
                    <td>2026-03-16</td>
                    <td>11:15</td>
                    <td>Consulta subsidio habitacional</td>
                    <td>
                        <button class="btn btn-sm btn-warning">✏️ Editar</button>
                        <button class="btn btn-sm btn-danger">🗑️</button>
                    </td>
                </tr>
                <tr class="table-info">
                    <td><input type="checkbox"></td>
                    <td>20.123.456-7</td>
                    <td>Carlos Soto Tapia</td>
                    <td>2026-03-16</td>
                    <td>12:00</td>
                    <td>Renovación patente comercial</td>
                    <td>
                        <button class="btn btn-sm btn-warning">✏️ Editar</button>
                        <button class="btn btn-sm btn-danger">🗑️</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <h4 class="mt-5">Historial Diario</h4>
        <table class="table table-bordered" id="tabla-historial-diario">
            <thead>
                <tr>
                    <th>RUT</th>
                    <th>Nombre Completo</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                <tr class="table-success">
                    <td>12.345.678-9</td>
                    <td>Juan Pérez Gómez</td>
                    <td>2026-03-16</td>
                    <td>10:30</td>
                    <td>Reparación junta de vecinos</td>
                    <td><strong>✅ Completada</strong></td>
                </tr>
                <tr class="table-danger">
                    <td>15.678.901-2</td>
                    <td>Ana Rojas Muñoz</td>
                    <td>2026-03-16</td>
                    <td>09:00</td>
                    <td>Solicitud beca escolar</td>
                    <td><strong>❌ No Completada (No asistió)</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <script src="../controller/assets/script.js/GestionAudiencia.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<?php 
include 'includes/Footer.php'; 
?>
</body>
</html>
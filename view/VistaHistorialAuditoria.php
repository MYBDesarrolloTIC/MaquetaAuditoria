<?php 
include 'includes/Header.php'; 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Historial General de Auditoría</title>
    <link rel="stylesheet" href="../controller/assets/css/Styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

    <?php include 'includes/Menu.php'; ?>

    <div class="content-wrapper">
        <h2>Historial General de Asistencia</h2>
        <table class="table table-striped mt-4" id="tabla-historial-general">
            <thead class="table-dark">
                <tr>
                    <th>RUT</th>
                    <th>Nombre Completo</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Detalles</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>12.345.678-9</td>
                    <td>Juan Pérez Gómez</td>
                    <td>2026-03-16</td>
                    <td><span class="badge bg-success">Completada</span></td>
                    <td><button class="btn btn-info btn-sm text-white" data-bs-toggle="modal" data-bs-target="#modalDetalle">👁️ Ver Datos</button></td>
                </tr>
                <tr>
                    <td>15.678.901-2</td>
                    <td>Ana Rojas Muñoz</td>
                    <td>2026-03-16</td>
                    <td><span class="badge bg-danger">No Completada</span></td>
                    <td><button class="btn btn-info btn-sm text-white" data-bs-toggle="modal" data-bs-target="#modalDetalle">👁️ Ver Datos</button></td>
                </tr>
                <tr>
                    <td>11.222.333-4</td>
                    <td>Luis Gómez Cárdenas</td>
                    <td>2026-03-15</td>
                    <td><span class="badge bg-success">Completada</span></td>
                    <td><button class="btn btn-info btn-sm text-white" data-bs-toggle="modal" data-bs-target="#modalDetalle">👁️ Ver Datos</button></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="modal fade" id="modalDetalle" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalle de Solicitud</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="contenido-detalle-modal">
                    <p><strong>RUT:</strong> 12.345.678-9</p>
                    <p><strong>Nombre Completo:</strong> Juan Pérez Gómez</p>
                    <p><strong>Fecha y Hora:</strong> 16-03-2026 a las 10:30 hrs.</p>
                    <hr>
                    <p><strong>Motivo Extenso:</strong> Solicitud de fondos municipales para la reparación de la techumbre de la junta de vecinos #14 debido a los últimos temporales.</p>
                    <p><strong>Resolución / Estado:</strong> Completada. Derivado a Dirección de Obras.</p>
                </div>
            </div>
        </div>
    </div>

    <script src="../controller/assets/script.js/Historial.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<?php 
include 'includes/Footer.php'; 
?>
</body>
</html>
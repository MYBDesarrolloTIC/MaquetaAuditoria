<?php 
include 'includes/Header.php'; 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Lista de Auditoría - Alcalde</title>
    <link rel="stylesheet" href="../controller/assets/css/Styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    
    <?php include 'includes/Menu.php'; ?>
    
    <div class="content-wrapper">
        <h2>Visitas Pendientes</h2>
        <div class="row mt-4" id="contenedor-visitas">
            
            <div class="col-md-6 mb-4">
                <div class="card shadow-sm border-primary">
                    <div class="card-body">
                        <h5 class="card-title">Juan Pérez Gómez</h5>
                        <h6 class="card-subtitle mb-3 text-muted">RUT: 12.345.678-9 | Hora: 10:30 AM</h6>
                        <p class="card-text">
                            <strong>Motivo de Consulta:</strong><br>
                            Solicitud de fondos municipales para la reparación de la techumbre de la junta de vecinos #14.
                        </p>
                        <div class="d-flex justify-content-between mt-4">
                            <button type="button" class="btn btn-success">✅ Completada</button>
                            <button type="button" class="btn btn-danger">❌ No Completada / Denegada</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 mb-4">
                <div class="card shadow-sm border-info">
                    <div class="card-body">
                        <h5 class="card-title">María Silva Rojas</h5>
                        <h6 class="card-subtitle mb-3 text-muted">RUT: 19.876.543-2 | Hora: 11:15 AM</h6>
                        <p class="card-text">
                            <strong>Motivo de Consulta:</strong><br>
                            Consulta sobre el estado de postulación al subsidio habitacional rural y problemas con la ficha de protección.
                        </p>
                        <div class="d-flex justify-content-between mt-4">
                            <button type="button" class="btn btn-success">✅ Completada</button>
                            <button type="button" class="btn btn-danger">❌ No Completada / Denegada</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <script src="../controller/assets/script.js/ListaAuditoria.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
<?php 
include 'includes/Footer.php'; 
?>
</body>
</html>
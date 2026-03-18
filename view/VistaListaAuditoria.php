<?php 
// 1. Cargamos el Header (Trae todo el diseño, el Menú y abre la etiqueta <main>)
include 'includes/Header.php'; 
?>

    <div class="header-seccion">
        <div>
            <h1>Visitas Pendientes</h1>
            <p>Revisión y resolución de audiencias asignadas al Alcalde</p>
        </div>
        <div>
            </div>
    </div>

    <div class="row mt-4" id="contenedor-visitas">
        
        <div class="col-md-6 mb-4">
            <div class="card shadow-sm border-0 h-100" style="border-left: 5px solid var(--yb-blue) !important;">
                <div class="card-body p-4">
                    <h5 class="card-title fw-bold text-black">Juan Pérez Gómez</h5>
                    <h6 class="card-subtitle mb-3 text-muted"><i class="fas fa-id-card me-1"></i> RUT: 12.345.678-9 | <i class="fas fa-clock me-1 text-warning"></i> Hora: 10:30 AM</h6>
                    <p class="card-text bg-light p-3 rounded">
                        <strong class="text-primary"><i class="fas fa-comment-dots me-1"></i> Motivo de Consulta:</strong><br>
                        Solicitud de fondos municipales para la reparación de la techumbre de la junta de vecinos #14.
                    </p>
                    <div class="d-flex justify-content-between mt-4">
                        <button type="button" class="btn btn-success fw-bold"><i class="fas fa-check me-1"></i> Completada</button>
                        <button type="button" class="btn btn-danger fw-bold"><i class="fas fa-times me-1"></i> Denegada</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6 mb-4">
            <div class="card shadow-sm border-0 h-100" style="border-left: 5px solid var(--yb-blue) !important;">
                <div class="card-body p-4">
                    <h5 class="card-title fw-bold text-black">María Silva Rojas</h5>
                    <h6 class="card-subtitle mb-3 text-muted"><i class="fas fa-id-card me-1"></i> RUT: 19.876.543-2 | <i class="fas fa-clock me-1 text-warning"></i> Hora: 11:15 AM</h6>
                    <p class="card-text bg-light p-3 rounded">
                        <strong class="text-primary"><i class="fas fa-comment-dots me-1"></i> Motivo de Consulta:</strong><br>
                        Consulta sobre el estado de postulación al subsidio habitacional rural y problemas con la ficha de protección.
                    </p>
                    <div class="d-flex justify-content-between mt-4">
                        <button type="button" class="btn btn-success fw-bold"><i class="fas fa-check me-1"></i> Completada</button>
                        <button type="button" class="btn btn-danger fw-bold"><i class="fas fa-times me-1"></i> Denegada</button>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <script src="../controller/assets/script.js/ListaAuditoria.js"></script>

<?php 
// 2. Cargamos el Footer (Cierra el <main> y carga JS de Bootstrap)
include 'includes/Footer.php'; 
?>
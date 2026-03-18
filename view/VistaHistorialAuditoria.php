<?php 
// 1. Cargamos el Header
include 'includes/Header.php'; 
?>

    <div class="header-seccion">
        <div>
            <h1>Historial General de Asistencia</h1>
            <p>Registro histórico de todas las solicitudes y audiencias</p>
        </div>
        <div>
        </div>
    </div>

    <div class="card shadow-sm border-0 mb-5">
        <div class="table-responsive">
            <table class="table table-hover mb-0" id="tabla-historial-general">
                <thead class="bg-light">
                    <tr>
                        <th class="ps-4">RUT</th>
                        <th>Nombre Completo</th>
                        <th>Fecha y Hora</th>
                        <th>Estado</th>
                        <th class="text-center">Detalles</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="ps-4">11.222.333-4</td>
                        <td class="fw-bold text-black">Roberto Castillo</td>
                        <td>2026-03-10 a las 10:30</td>
                        <td><span class="badge bg-success shadow-sm px-3 py-2">Completada</span></td>
                        <td class="text-center">
                            <button class="btn btn-info btn-sm text-white fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#modalDetalle">
                                <i class="fas fa-eye me-1"></i> Ver Datos
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td class="ps-4">14.555.666-7</td>
                        <td class="fw-bold text-black">Loreto Echeverría</td>
                        <td>2026-03-12 a las 09:00</td>
                        <td><span class="badge bg-danger shadow-sm px-3 py-2">No Completada</span></td>
                        <td class="text-center">
                            <button class="btn btn-info btn-sm text-white fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#modalDetalle">
                                <i class="fas fa-eye me-1"></i> Ver Datos
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="modal fade" id="modalDetalle" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px; overflow: hidden;">
                <div class="modal-header border-0 pb-0 pt-4 px-4 bg-white text-center d-block">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge bg-light text-muted border px-3 py-2 fw-bold">
                            <i class="far fa-calendar-alt me-2"></i> 2026-03-10 a las 10:30
                        </span>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="mx-auto bg-primary text-white d-flex align-items-center justify-content-center shadow-sm" style="width: 60px; height: 60px; border-radius: 50%;">
                        <i class="fas fa-user fs-3"></i>
                    </div>
                    <h4 class="fw-bold text-black mt-3 mb-1">Roberto Castillo</h4>
                    <p class="text-muted small fw-bold mb-3">RUT: 11.222.333-4</p>
                </div>
                
                <div class="modal-body px-4 pt-0 pb-4 bg-white">
                    <hr class="border-secondary opacity-25 border-2 border-dashed my-3">
                    
                    <div class="bg-light p-3 rounded-3 mb-3 border">
                        <span class="d-block text-muted small fw-bold mb-2 text-uppercase"><i class="fas fa-align-left me-1"></i> Motivo Extenso de la Consulta</span>
                        <p class="text-black mb-0 fs-6" style="line-height: 1.5;">
                            Solicitud de pavimentación en calle principal debido a los baches generados por las últimas lluvias. Se adjuntan firmas de vecinos.
                        </p>
                    </div>

                    <div class="d-flex justify-content-between align-items-center p-3 bg-success-light border rounded-3 border-start-5" style="border-left: 5px solid #198754 !important;">
                        <div>
                            <span class="d-block text-muted small fw-bold text-uppercase">Resolución Final</span>
                            <span class="fw-bold fs-5 text-success">Completada</span>
                        </div>
                        <div>
                            <i class="fas fa-check-circle fs-1 text-success shadow-sm rounded-circle"></i>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <script src="../controller/assets/script.js/Historial.js"></script>

<?php include 'includes/Footer.php'; ?>
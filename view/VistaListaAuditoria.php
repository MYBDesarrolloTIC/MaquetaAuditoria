<?php include 'includes/Header.php'; ?>

<div class="header-seccion">
    <div>
        <h1>Visitas Pendientes</h1>
        <p>Revisión y resolución de audiencias asignadas al Alcalde</p>
    </div>
</div>

<div class="row mt-4" id="contenedor-visitas">
    <!-- NOTA PARA TI: Así es como tu JS debe generar cada tarjeta ahora -->
    <!-- Te dejo este bloque de ejemplo para que veas la estructura de los botones horizontales -->
    <div class="col-md-6 col-lg-4 mb-4">
        <div class="card shadow-sm h-100 border-start-blue">
            <div class="card-body">
                <h5 class="fw-bold text-dark">Nombre del Ciudadano</h5>
                <p class="text-muted small mb-3">
                    <i class="fas fa-id-card"></i> RUT: 12345678-9 | <i class="fas fa-clock text-warning"></i> Hora: 16:24
                </p>
                <div class="bg-light p-3 rounded mb-3">
                    <span class="text-primary fw-bold"><i class="fas fa-comment-dots"></i> Motivo original:</span><br>
                    <span class="text-dark">Descripción de la solicitud...</span>
                </div>
            </div>
            
            <!-- AQUI ESTÁ LA MAGIA PARA LOS BOTONES HORIZONTALES -->
            <div class="card-footer bg-white border-0 pt-0 pb-3 mt-auto">
                <div class="d-flex justify-content-between gap-2">
                    <button class="btn btn-success flex-fill fw-bold shadow-sm" onclick="abrirModalAccion('Completada', /* ID */)">
                        <i class="fas fa-check me-1"></i> Completada
                    </button>
                    <button class="btn btn-danger flex-fill fw-bold shadow-sm" onclick="abrirModalAccion('Incumplida', /* ID */)">
                        <i class="fas fa-times me-1"></i> Denegada
                    </button>
                </div>
            </div>
            <!-- FIN DE LA MAGIA -->

        </div>
    </div>
    <!-- Fin del bloque de ejemplo -->
</div>

<!-- Modal para confirmar la acción -->
<div class="modal fade" id="modalConfirmarAccion" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 15px; overflow: hidden;">
            <div class="modal-body p-5 text-center">
                <div id="modal-icono-contenedor" class="mb-4">
                    <i id="modal-icono" style="font-size: 5rem;"></i>
                </div>
                
                <h3 id="modal-titulo" class="fw-bold mb-3"></h3>
                <p id="modal-texto" class="text-muted mb-4 fs-5"></p>

                <div class="text-start mb-4">
                    <label for="modal-comentario" class="form-label fw-bold text-dark small text-uppercase">Comentario <span class="text-danger">(Obligatorio)</span></label>
                    <textarea id="modal-comentario" class="form-control bg-light border-2" rows="4" placeholder="Escriba detalladamente qué pasó o en qué concluyó la audiencia..." required></textarea>
                    
                    <div id="error-comentario" class="text-danger small mt-2 fw-bold" style="display: none;">
                        <i class="fas fa-exclamation-circle"></i> Debes ingresar un comentario obligatorio para poder continuar.
                    </div>
                </div>
                
                <div class="d-flex justify-content-center gap-3">
                    <button type="button" class="btn btn-light btn-lg fw-bold px-4" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-lg fw-bold px-5 shadow-sm" id="btnEjecutarAccion"></button>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="../model/api.js"></script>
<script src="../assets/js/ListaAuditoria.js"></script>

<?php include 'includes/Footer.php'; ?>
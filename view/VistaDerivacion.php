<?php include 'includes/Header.php'; ?>

<div class="header-seccion">
    <div>
        <h1>Mis Derivaciones</h1>
        <p>Gestión de peticiones y tareas que te han sido asignadas</p>
    </div>
</div>

<div class="mb-4 bg-white p-3 shadow-sm" style="border-radius: 12px;">
    <input type="text" id="buscador-derivaciones" class="form-control form-control-lg bg-light border-0" placeholder="🔍 Buscar por RUT, Nombre, Apellido o Motivo...">
</div>

<div class="row mt-4" id="contenedor-derivaciones">
    </div>

<div class="modal fade" id="modalResolverDerivacion" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 15px; overflow: hidden;">
            <div class="modal-body p-5 text-center">
                <div class="text-success mb-4">
                    <i class="fas fa-check-circle" style="font-size: 5rem;"></i>
                </div>
                
                <h3 class="fw-bold mb-3">Completar Petición</h3>
                <p class="text-muted mb-4 fs-5">Por favor, redacte detalladamente cómo se resolvió esta petición asignada.</p>

                <div class="text-start mb-4">
                    <label for="modal-comentario-resolucion" class="form-label fw-bold text-dark small text-uppercase">Comentario de Resolución <span class="text-danger">(Obligatorio)</span></label>
                    <textarea id="modal-comentario-resolucion" class="form-control bg-light border-2" rows="4" placeholder="Escriba los detalles de la resolución..." required></textarea>
                    
                    <div id="error-comentario-resolucion" class="text-danger small mt-2 fw-bold" style="display: none;">
                        <i class="fas fa-exclamation-circle"></i> Debes ingresar un comentario obligatorio para poder completar la tarea.
                    </div>
                </div>
                
                <div class="d-flex justify-content-center gap-3">
                    <button type="button" class="btn btn-light btn-lg fw-bold px-4" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-success btn-lg fw-bold px-5 shadow-sm" id="btnResolverDerivacion" onclick="validarYResolver()">
                        <i class="fas fa-check me-2"></i> Marcar como Completada
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="../model/api.js"></script>
<script src="../assets/js/Derivaciones.js"></script>

<?php include 'includes/Footer.php'; ?>
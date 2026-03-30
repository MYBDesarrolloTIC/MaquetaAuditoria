<?php include 'includes/Header.php'; ?>

    <div class="header-seccion">
        <i class="fas fa-history header-icon-bg"></i>
        <div>
            <h1>Historial General de Asistencia</h1>
            <p>Registro histórico de todas las solicitudes y audiencias</p>
        </div>
    </div>

    <div class="mb-4 bg-white p-3 shadow-sm" style="border-radius: 12px;">
        <input type="text" id="buscador-historial" class="form-control form-control-lg bg-light border-0" placeholder="🔍 Buscar por RUT o Nombre...">
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
                </tbody>
            </table>
        </div>
    </div>

    <div class="modal fade" id="modalDetalle" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px; overflow: hidden;">
                <div class="modal-header border-0 pb-0 pt-4 px-4 bg-white text-center d-block">
                    <button type="button" class="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close"></button>
                    <div class="mx-auto bg-primary text-white d-flex align-items-center justify-content-center shadow-sm" style="width: 60px; height: 60px; border-radius: 50%;">
                        <i class="fas fa-file-alt fs-3"></i>
                    </div>
                    <h4 class="fw-bold text-black mt-3 mb-1">Detalles de la Audiencia</h4>
                </div>
                
                <div class="modal-body px-4 pt-0 pb-4 bg-white" id="contenido-detalle-modal">
                </div>
            </div>
        </div>
    </div>

    <script src="../model/api.js"></script>
    <script src="../assets/js/Historial.js"></script>
    <script src="../assets/js/alertas.js"></script>

<?php include 'includes/Footer.php'; ?>
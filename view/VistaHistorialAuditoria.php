<?php 
// 1. Cargamos el Header (Trae todo el diseño, el Menú y abre la etiqueta <main>)
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
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th class="text-center">Detalles</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="ps-4">12.345.678-9</td>
                        <td>Juan Pérez Gómez</td>
                        <td>2026-03-16</td>
                        <td><span class="badge bg-success">Completada</span></td>
                        <td class="text-center">
                            <button class="btn btn-info btn-sm text-white" data-bs-toggle="modal" data-bs-target="#modalDetalle">
                                <i class="fas fa-eye"></i> Ver Datos
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td class="ps-4">15.678.901-2</td>
                        <td>Ana Rojas Muñoz</td>
                        <td>2026-03-16</td>
                        <td><span class="badge bg-danger">No Completada</span></td>
                        <td class="text-center">
                            <button class="btn btn-info btn-sm text-white" data-bs-toggle="modal" data-bs-target="#modalDetalle">
                                <i class="fas fa-eye"></i> Ver Datos
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="modal fade" id="modalDetalle" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content border-0 shadow">
                <div class="modal-header bg-light">
                    <h5 class="modal-title fw-bold text-black"><i class="fas fa-file-alt text-primary me-2"></i> Detalle de Solicitud</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="contenido-detalle-modal">
                    <p><strong>RUT:</strong> 12.345.678-9</p>
                    <p><strong>Nombre Completo:</strong> Juan Pérez Gómez</p>
                    <p><strong>Fecha y Hora:</strong> 16-03-2026 a las 10:30 hrs.</p>
                    <hr>
                    <p><strong>Motivo Extenso:</strong> Solicitud de fondos municipales para la reparación de la techumbre de la junta de vecinos #14 debido a los últimos temporales.</p>
                    <p class="mb-0"><strong>Resolución / Estado:</strong> Completada. Derivado a Dirección de Obras.</p>
                </div>
            </div>
        </div>
    </div>

    <script src="../controller/assets/script.js/Historial.js"></script>

<?php 
// 2. Cargamos el Footer (Cierra el <main>, el contenedor y carga JS de Bootstrap)
include 'includes/Footer.php'; 
?>
<?php include 'includes/Header.php'; ?>

    <div class="header-seccion">
        <div>
            <h1>Gestión de Solicitudes Diarias</h1>
            <p>Administración de audiencias y trámites diarios</p>
        </div>
        <div>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalCrear">
                <i class="fas fa-plus"></i> Crear Solicitud
            </button>
        </div>
    </div>

   <div class="mb-4 bg-white p-3 shadow-sm" style="border-radius: 12px;">
        <input type="text" id="buscador-solicitudes" class="form-control" placeholder="🔍 Buscar por RUT o Nombre...">
    </div>  

    <h4 class="mb-3 text-black"><i class="fas fa-clock text-warning"></i> Pendientes</h4>
    <div class="card shadow-sm border-0 mb-5">
        <div class="table-responsive">
            <table class="table table-hover mb-0" id="tabla-pendientes">
                <thead class="bg-light">
                    <tr>
                        <th>RUT</th>
                        <th>Ciudadano</th>
                        <th>Ubicación</th>
                        <th>Contacto</th>
                        <th>Fecha y Hora</th>
                        <th>Motivo</th>
                        <th class="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    </tbody>
            </table>
        </div>
    </div>

    <h4 class="mb-3 text-black"><i class="fas fa-history text-primary"></i> Historial Diario</h4>
    <div class="card shadow-sm border-0 mb-4">
        <div class="table-responsive">
            <table class="table mb-0" id="tabla-historial-diario">
                <thead class="bg-light">
                    <tr>
                        <th class="ps-4">RUT</th>
                        <th>Ciudadano</th>
                        <th>Ubicación</th>
                        <th>Fecha y Hora</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    </tbody>
            </table>
        </div>
    </div>

   <div class="modal fade" id="modalCrear" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 1000px;">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 15px; overflow: hidden;">
                <div class="modal-header border-0 py-4 px-5" style="background: linear-gradient(135deg, var(--yb-blue) 0%, #2a5298 100%);">
                    <h4 class="modal-title fw-bold text-white mb-0"><i class="fas fa-file-signature me-2 text-warning"></i> Registrar Nueva Solicitud</h4>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-5 bg-light">
                    <form id="form-crear-solicitud">
                        <div class="row g-4">
                            
                            <div class="col-md-6">
                                <div class="bg-white p-4 rounded-4 shadow-sm h-100 border-top border-3 border-primary d-flex flex-column">
                                    <h6 class="text-primary fw-bold mb-4"><i class="fas fa-id-card me-2"></i>Identificación del Solicitante</h6>
                                    
                                    <div class="mb-3">
                                        <label class="form-label text-muted small fw-bold">RUT DEL CIUDADANO</label>
                                        <input type="text" class="form-control form-control-lg bg-light" id="crear-rut" placeholder="Ej: 12.345.678-9" required>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label text-muted small fw-bold">NOMBRES</label>
                                        <input type="text" class="form-control form-control-lg bg-light" id="crear-nombre" placeholder="Nombres" required>
                                    </div>
                                    
                                    <div class="row g-3 mb-3">
                                        <div class="col-6">
                                            <label class="form-label text-muted small fw-bold">APELLIDO PATERNO</label>
                                            <input type="text" class="form-control form-control-lg bg-light" id="crear-apellido-p" placeholder="Paterno" required>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label text-muted small fw-bold">APELLIDO MATERNO</label>
                                            <input type="text" class="form-control form-control-lg bg-light" id="crear-apellido-m" placeholder="Materno" required>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label text-muted small fw-bold">FECHA DE NACIMIENTO</label>
                                        <input type="date" class="form-control form-control-lg bg-light" id="crear-nacimiento" required>
                                    </div>
                                    
                                    <div class="row g-3 mb-2">
                                        <div class="col-5">
                                            <label class="form-label text-muted small fw-bold">CELULAR</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-light">+56</span>
                                                <input type="text" class="form-control form-control-lg bg-light" id="crear-celular" placeholder="9..." maxlength="9" required>
                                            </div>
                                        </div>
                                        <div class="col-7">
                                            <label class="form-label text-muted small fw-bold">CORREO <span class="fw-normal text-black-50">(Opcional)</span></label>
                                            <input type="email" class="form-control form-control-lg bg-light" id="crear-correo" placeholder="ejemplo@correo.com">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="bg-white p-4 rounded-4 shadow-sm h-100 border-top border-3 border-warning d-flex flex-column">
                                    <h6 class="text-warning-dark fw-bold mb-4"><i class="fas fa-map-marker-alt me-2"></i>Ubicación y Detalles de la Cita</h6>
                                    
                                    <div class="row g-3 mb-3">
                                        <div class="col-5">
                                            <label class="form-label text-muted small fw-bold">SECTOR</label>
                                            <input type="text" class="form-control form-control-lg bg-light" id="crear-sector" placeholder="Ej: Centro" required>
                                        </div>
                                        <div class="col-7">
                                            <label class="form-label text-muted small fw-bold">DIRECCIÓN</label>
                                            <input type="text" class="form-control form-control-lg bg-light" id="crear-direccion" placeholder="Ej: Pasaje 1 #123" required>
                                        </div>
                                    </div>

                                    <div class="mb-3 p-3 bg-light rounded-3 border">
                                        <div class="form-check form-switch mb-0">
                                            <input class="form-check-input" type="checkbox" id="crear-check-discapacidad" role="switch" onchange="document.getElementById('wrapper-discapacidad').classList.toggle('d-none', !this.checked);">
                                            <label class="form-check-label fw-bold text-dark" for="crear-check-discapacidad">¿Presenta alguna discapacidad?</label>
                                        </div>
                                        
                                        <div id="wrapper-discapacidad" class="mt-2 d-none">
                                            <label class="form-label text-muted small fw-bold">ESPECIFIQUE LA DISCAPACIDAD</label>
                                            <input type="text" class="form-control bg-white" id="crear-desc-discapacidad" placeholder="Ej: Movilidad reducida, visual, auditiva...">
                                        </div>
                                    </div>
                                    
                                    <div class="row g-3 mb-3">
                                        <div class="col-sm-6">
                                            <label class="form-label text-muted small fw-bold">FECHA DE CITA</label>
                                            <input type="date" class="form-control form-control-lg bg-light" id="crear-fecha" required>
                                        </div>
                                        <div class="col-sm-6">
                                            <label class="form-label text-muted small fw-bold">HORA</label>
                                            <input type="time" class="form-control form-control-lg bg-light" id="crear-hora" required>
                                        </div>
                                    </div>
                                    
                                    <div class="flex-grow-1 d-flex flex-column mb-2">
                                        <label class="form-label text-muted small fw-bold">MOTIVO / OBSERVACIONES</label>
                                        <textarea class="form-control bg-light flex-grow-1" id="crear-motivo" placeholder="Describa el motivo detalladamente..." style="resize: none;" required></textarea>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </form>
                </div>
                <div class="modal-footer border-0 px-5 py-4 bg-white">
                    <button type="button" class="btn btn-light btn-lg px-4 text-muted fw-bold" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary btn-lg px-5 fw-bold shadow-sm" onclick="guardarNuevaSolicitud()"><i class="fas fa-save me-2"></i> Guardar Solicitud</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalEditar" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 1000px;">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 15px; overflow: hidden;">
                <div class="modal-header border-0 py-4 px-5 bg-warning">
                    <h4 class="modal-title fw-bold text-dark mb-0"><i class="fas fa-edit me-2"></i> Editar Solicitud</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-5 bg-light">
                    <form id="form-editar-solicitud">
                        <input type="hidden" id="editar-id">
                        
                        <div class="row g-4">
                            
                            <div class="col-md-6">
                                <div class="bg-white p-4 rounded-4 shadow-sm h-100 border-top border-3 border-warning d-flex flex-column">
                                    <h6 class="text-warning-dark fw-bold mb-4"><i class="fas fa-id-card me-2"></i>Datos a Corregir</h6>
                                    
                                    <div class="mb-3">
                                        <label class="form-label text-muted small fw-bold">RUT DEL CIUDADANO</label>
                                        <input type="text" class="form-control form-control-lg bg-light" id="editar-rut" required>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label text-muted small fw-bold">NOMBRES</label>
                                        <input type="text" class="form-control form-control-lg bg-light" id="editar-nombre" required>
                                    </div>
                                    
                                    <div class="row g-3 mb-3">
                                        <div class="col-6">
                                            <label class="form-label text-muted small fw-bold">APELLIDO PATERNO</label>
                                            <input type="text" class="form-control form-control-lg bg-light" id="editar-apellido-p" required>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label text-muted small fw-bold">APELLIDO MATERNO</label>
                                            <input type="text" class="form-control form-control-lg bg-light" id="editar-apellido-m" required>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label text-muted small fw-bold">FECHA DE NACIMIENTO</label>
                                        <input type="date" class="form-control form-control-lg bg-light" id="editar-nacimiento" required>
                                    </div>
                                    
                                    <div class="row g-3 mb-2">
                                        <div class="col-5">
                                            <label class="form-label text-muted small fw-bold">CELULAR</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-light">+56</span>
                                                <input type="text" class="form-control form-control-lg bg-light" id="editar-celular" maxlength="9" required>
                                            </div>
                                        </div>
                                        <div class="col-7">
                                            <label class="form-label text-muted small fw-bold">CORREO <span class="fw-normal text-black-50">(Opcional)</span></label>
                                            <input type="email" class="form-control form-control-lg bg-light" id="editar-correo">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="bg-white p-4 rounded-4 shadow-sm h-100 border-top border-3 border-secondary d-flex flex-column">
                                    <h6 class="text-secondary fw-bold mb-4"><i class="fas fa-map-marker-alt me-2"></i>Ubicación y Detalles de la Cita</h6>
                                    
                                    <div class="row g-3 mb-3">
                                        <div class="col-5">
                                            <label class="form-label text-muted small fw-bold">SECTOR</label>
                                            <input type="text" class="form-control form-control-lg bg-light" id="editar-sector" required>
                                        </div>
                                        <div class="col-7">
                                            <label class="form-label text-muted small fw-bold">DIRECCIÓN</label>
                                            <input type="text" class="form-control form-control-lg bg-light" id="editar-direccion" required>
                                        </div>
                                    </div>

                                    <div class="mb-3 p-3 bg-light rounded-3 border">
                                        <div class="form-check form-switch mb-0">
                                            <input class="form-check-input" type="checkbox" id="editar-check-discapacidad" role="switch" onchange="document.getElementById('editar-wrapper-discapacidad').classList.toggle('d-none', !this.checked);">
                                            <label class="form-check-label fw-bold text-dark" for="editar-check-discapacidad">¿Presenta alguna discapacidad?</label>
                                        </div>
                                        
                                        <div id="editar-wrapper-discapacidad" class="mt-2 d-none">
                                            <label class="form-label text-muted small fw-bold">ESPECIFIQUE LA DISCAPACIDAD</label>
                                            <input type="text" class="form-control bg-white" id="editar-desc-discapacidad">
                                        </div>
                                    </div>
                                    
                                    <div class="row g-3 mb-3">
                                        <div class="col-sm-6">
                                            <label class="form-label text-muted small fw-bold">FECHA DE CITA</label>
                                            <input type="date" class="form-control form-control-lg bg-light" id="editar-fecha" required>
                                        </div>
                                        <div class="col-sm-6">
                                            <label class="form-label text-muted small fw-bold">HORA</label>
                                            <input type="time" class="form-control form-control-lg bg-light" id="editar-hora" required>
                                        </div>
                                    </div>
                                    
                                    <div class="flex-grow-1 d-flex flex-column mb-2">
                                        <label class="form-label text-muted small fw-bold">MOTIVO / OBSERVACIONES</label>
                                        <textarea class="form-control bg-light flex-grow-1" id="editar-motivo" style="resize: none;" required></textarea>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </form>
                </div>
                <div class="modal-footer border-0 px-5 py-4 bg-white">
                    <button type="button" class="btn btn-light btn-lg px-4 text-muted fw-bold" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-warning btn-lg px-5 fw-bold text-dark shadow-sm" onclick="guardarEdicion()"><i class="fas fa-save me-2"></i> Guardar Cambios</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalEliminar" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 15px; overflow: hidden;">
                <div class="modal-body p-5 text-center">
                    <div class="text-danger mb-4"><i class="fas fa-exclamation-triangle" style="font-size: 5rem;"></i></div>
                    <h3 class="fw-bold mb-3">¿Eliminar Solicitud?</h3>
                    <p class="text-muted mb-4 fs-5">Esta acción no se puede deshacer. ¿Estás seguro de que deseas borrar este registro del sistema?</p>
                    <div class="d-flex justify-content-center gap-3">
                        <button type="button" class="btn btn-light btn-lg fw-bold px-4" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger btn-lg fw-bold px-5 shadow-sm" onclick="ejecutarEliminar()"><i class="fas fa-trash me-2"></i> Sí, Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

<script src="../model/api.js"></script>
<script src="../assets/js/GestionAudiencia.js"></script>

<?php include 'includes/Footer.php'; ?>
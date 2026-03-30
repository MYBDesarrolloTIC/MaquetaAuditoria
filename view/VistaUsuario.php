<?php include 'includes/Header.php'; ?>

    <div class="header-seccion">
        <i class="fas fa-users-cog header-icon-bg"></i>
        <div>
            <h1>Gestión de Usuarios</h1>
            <p>Administración de cuentas, roles y accesos del sistema</p>
        </div>
        <div>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalCrearUsuario">
                <i class="fas fa-user-plus me-1"></i> Crear Nuevo Usuario
            </button>
        </div>
    </div>

    <div class="row mt-4" id="contenedor-usuarios">
    </div>

    <div class="modal fade" id="modalCrearUsuario" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 15px;">
                <div class="modal-header border-0 py-4 px-5 bg-primary">
                    <h4 class="modal-title fw-bold text-white mb-0"><i class="fas fa-user-plus me-2"></i> Crear Usuario</h4>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4 bg-light">
                    <form id="form-crear-usuario">
                        <div class="mb-3">
                            <label class="form-label fw-bold text-muted small">Nombre Completo</label>
                            <input type="text" class="form-control" id="crear-nombre-user" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold text-muted small">Nombre de Usuario (Login)</label>
                            <input type="text" class="form-control" id="crear-login-user" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold text-muted small">Contraseña</label>
                            <input type="password" class="form-control" id="crear-pass-user" required>
                        </div>
                        <div class="row">
                            <div class="col-6 mb-3">
                                <label class="form-label fw-bold text-muted small">Rol</label>
                                <select class="form-select" id="crear-rol-user">
                                    <option value="admin">Administrador</option>
                                    <option value="alcalde">Alcalde</option>
                                    <option value="secretaria">Secretaria</option>
                                    <option value="director">Director</option>
                                </select>
                            </div>
                            <div class="col-6 mb-3">
                                <label class="form-label fw-bold text-muted small">Estado</label>
                                <select class="form-select" id="crear-estado-user">
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer border-0 bg-white">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="guardarNuevoUsuario()"><i class="fas fa-save me-1"></i> Guardar</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalEditarUsuario" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 15px;">
                <div class="modal-header border-0 py-4 px-5 bg-warning">
                    <h4 class="modal-title fw-bold text-dark mb-0"><i class="fas fa-user-edit me-2"></i> Editar Usuario</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4 bg-light">
                    <form id="form-editar-usuario">
                        <input type="hidden" id="editar-id-user">
                        <div class="mb-3">
                            <label class="form-label fw-bold text-muted small">Nombre Completo</label>
                            <input type="text" class="form-control" id="editar-nombre-user" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold text-muted small">Nombre de Usuario (Login)</label>
                            <input type="text" class="form-control" id="editar-login-user" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold text-muted small">Nueva Contraseña (Dejar vacío para no cambiar)</label>
                            <input type="password" class="form-control" id="editar-pass-user">
                        </div>
                        <div class="row">
                            <div class="col-6 mb-3">
                                <label class="form-label fw-bold text-muted small">Rol</label>
                                <select class="form-select" id="editar-rol-user">
                                    <option value="admin">Administrador</option>
                                    <option value="alcalde">Alcalde</option>
                                    <option value="secretaria">Secretaria</option>
                                </select>
                            </div>
                            <div class="col-6 mb-3">
                                <label class="form-label fw-bold text-muted small">Estado</label>
                                <select class="form-select" id="editar-estado-user">
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer border-0 bg-white">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-warning fw-bold" onclick="guardarEdicionUsuario()"><i class="fas fa-save me-1"></i> Guardar Cambios</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalEliminarUsuario" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 15px;">
                <div class="modal-header border-0 py-4 px-5 bg-danger">
                    <h4 class="modal-title fw-bold text-white mb-0"><i class="fas fa-exclamation-triangle me-2"></i> Confirmar Eliminación</h4>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-5 bg-light text-center">
                    <i class="fas fa-trash-alt text-danger mb-3" style="font-size: 4rem;"></i>
                    <h5 class="fw-bold text-dark mb-3">¿Estás absolutamente seguro?</h5>
                    <p class="text-muted mb-0">Esta acción eliminará al usuario del sistema y no se podrá deshacer.</p>
                </div>
                <div class="modal-footer border-0 bg-white justify-content-center pb-4">
                    <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger px-4 fw-bold" onclick="ejecutarEliminarUsuario()"><i class="fas fa-trash me-1"></i> Sí, Eliminar</button>
                </div>
            </div>
        </div>
    </div>

    <script src="../model/api.js"></script>
    <script src="../assets/js/usuario.js"></script>
    <script src="../assets/js/alertas.js"></script>

<?php include 'includes/Footer.php'; ?>
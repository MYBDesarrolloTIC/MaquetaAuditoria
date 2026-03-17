<?php 
// 1. Cargamos el Header (Esto trae el CSS, FontAwesome, abre el app-wrapper y carga el MENÚ)
include 'includes/Header.php'; 
?>

<main class="main-content">
    
    <div class="header-seccion">
        <div>
            <h1>Gestión de Solicitudes Diarias</h1>
            <p>Administración de audiencias y trámites diarios</p>
        </div>
        <div>
            <button class="btn btn-danger me-2" id="btn-eliminar-seleccionados">
                <i class="fas fa-trash"></i> Eliminar Seleccionados
            </button>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalCrear">
                <i class="fas fa-plus"></i> Crear Solicitud
            </button>
        </div>
    </div>

    <div class="mb-4 card p-3 shadow-sm border-0">
        <input type="text" id="buscador-solicitudes" class="form-control" placeholder="🔍 Buscar por RUT o Nombre...">
    </div>

    <h4 class="mb-3 text-black"><i class="fas fa-clock text-warning"></i> Pendientes</h4>
    <div class="card shadow-sm border-0 mb-5">
        <div class="table-responsive">
            <table class="table table-hover mb-0" id="tabla-pendientes">
                <thead class="bg-light">
                    <tr>
                        <th class="ps-4"><input type="checkbox" id="checkAll"></th>
                        <th>RUT</th>
                        <th>Nombre Completo</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Motivo</th>
                        <th class="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="ps-4"><input type="checkbox"></td>
                        <td>19.876.543-2</td>
                        <td>María Silva Rojas</td>
                        <td>2026-03-16</td>
                        <td>11:15</td>
                        <td>Consulta subsidio habitacional</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-warning"><i class="fas fa-edit"></i> Editar</button>
                            <button class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                    <tr>
                        <td class="ps-4"><input type="checkbox"></td>
                        <td>20.123.456-7</td>
                        <td>Carlos Soto Tapia</td>
                        <td>2026-03-16</td>
                        <td>12:00</td>
                        <td>Renovación patente comercial</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-warning"><i class="fas fa-edit"></i> Editar</button>
                            <button class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
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
                        <th>Nombre Completo</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="bg-success-light">
                        <td class="ps-4">12.345.678-9</td>
                        <td>Juan Pérez Gómez</td>
                        <td>2026-03-16</td>
                        <td>10:30</td>
                        <td>Reparación junta de vecinos</td>
                        <td><span class="badge bg-success">✅ Completada</span></td>
                    </tr>
                    <tr class="bg-danger-yb-light">
                        <td class="ps-4">15.678.901-2</td>
                        <td>Ana Rojas Muñoz</td>
                        <td>2026-03-16</td>
                        <td>09:00</td>
                        <td>Solicitud beca escolar</td>
                        <td><span class="badge bg-danger">❌ No Completada (No asistió)</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

</main>

<script src="../controller/assets/script.js/GestionAudiencia.js"></script>

<?php 
// 3. Cargamos el Footer (Esto cierra el app-wrapper y carga los scripts globales)
include 'includes/Footer.php'; 
?>
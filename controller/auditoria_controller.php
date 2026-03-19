<?php
require_once 'Conexion.php';
require_once 'JwtHandler.php';

header('Content-Type: application/json');

// ========================================================================
// 1. MIDDLEWARE: VALIDACIÓN DE SEGURIDAD
// ========================================================================
$headers = apache_request_headers();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado. Token no proporcionado.']);
    exit;
}

$token = $matches[1];
$jwt = new JwtHandler();
$tokenData = $jwt->validarToken($token);

// AHORA PERMITIMOS 3 ROLES: admin, alcalde y secretaria
if (!$tokenData || !in_array($tokenData['rol'], ['admin', 'alcalde', 'secretaria'])) {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado. Permisos insuficientes.']);
    exit;
}

// ========================================================================
// 2. PROCESAMIENTO DE AUDITORÍAS
// ========================================================================
$db = new Conexion();
$con = $db->conectar();

$action = isset($_GET['action']) ? $_GET['action'] : '';
$json = file_get_contents('php://input');
$datos = json_decode($json, true);

if (isset($datos['action'])) {
    $action = $datos['action'];
}

switch ($action) {

    // --- LEER AUDITORÍAS PENDIENTES (ALCALDE) ---
    case 'getPendientes':
        try {
            $sql = "SELECT a.id, a.fecha, a.hora, a.nombre_solicitante, a.rut_solicitante, a.motivo, e.nombre as estado 
                    FROM auditoria a
                    INNER JOIN estado_auditoria e ON a.id_estado = e.id
                    WHERE e.nombre = 'Pendiente'
                    ORDER BY a.fecha ASC, a.hora ASC";

            $stmt = $con->prepare($sql);
            $stmt->execute();
            $auditorias = $stmt->fetchAll();

            echo json_encode(['status' => 1, 'data' => $auditorias]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error al obtener los datos.']);
        }
        break;

    // --- CAMBIAR ESTADO DE AUDITORÍA (ALCALDE) ---
    case 'cambiarEstado':
        // El JS de tu amigo envía la variable como 'comentario'
        if (!isset($datos['id']) || !isset($datos['nuevo_estado']) || !isset($datos['comentario']) || trim($datos['comentario']) === '') {
            echo json_encode(['status' => 0, 'message' => 'El comentario de resolución es obligatorio.']);
            exit;
        }

        try {
            $stmtEstado = $con->prepare("SELECT id FROM estado_auditoria WHERE nombre = ?");
            $stmtEstado->execute([$datos['nuevo_estado']]);
            $id_estado = $stmtEstado->fetchColumn();

            // 1. Extraemos los datos de la bandeja de entrada (auditoria)
            $stmtSelect = $con->prepare("SELECT * FROM auditoria WHERE id = ?");
            $stmtSelect->execute([$datos['id']]);
            $auditoria = $stmtSelect->fetch();

            if (!$auditoria) {
                echo json_encode(['status' => 0, 'message' => 'La solicitud no existe o ya fue procesada.']);
                exit;
            }

            // 2. Insertamos en el historial sumando el comentario
            $sqlInsert = "INSERT INTO historial (fecha, hora, nombre_solicitante, rut_solicitante, motivo, resolucion, id_estado, id_usuario) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmtInsert = $con->prepare($sqlInsert);
            $stmtInsert->execute([
                $auditoria['fecha'],
                $auditoria['hora'],
                $auditoria['nombre_solicitante'],
                $auditoria['rut_solicitante'],
                $auditoria['motivo'],
                trim($datos['comentario']), // Aquí entra el texto del Alcalde
                $id_estado,
                $tokenData['id']
            ]);

            // 3. Borramos la solicitud de la bandeja de pendientes
            $stmtDelete = $con->prepare("DELETE FROM auditoria WHERE id = ?");
            $stmtDelete->execute([$datos['id']]);

            echo json_encode(['status' => 1, 'message' => 'Audiencia resuelta y movida al historial.']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error al procesar la auditoría.']);
        }
        break;

    // ====================================================================
    // NUEVOS MÉTODOS PARA LA SECRETARIA Y EL ADMIN
    // ====================================================================

    // --- LEER AUDITORÍAS DIARIAS (Pendientes e Historial) ---
    case 'getGestionDiaria':
        try {
            // Unimos ambas tablas para que la secretaria vea las pendientes y las ya resueltas
            $sql = "SELECT a.id, a.fecha, a.hora, a.nombre_solicitante, a.rut_solicitante, a.motivo, e.nombre as estado 
                    FROM auditoria a
                    INNER JOIN estado_auditoria e ON a.id_estado = e.id
                    UNION ALL 
                    SELECT h.id, h.fecha, h.hora, h.nombre_solicitante, h.rut_solicitante, h.motivo, e.nombre as estado 
                    FROM historial h
                    INNER JOIN estado_auditoria e ON h.id_estado = e.id
                    ORDER BY fecha DESC, hora DESC";

            $stmt = $con->prepare($sql);
            $stmt->execute();
            $todas = $stmt->fetchAll();

            echo json_encode(['status' => 1, 'data' => $todas]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error al obtener la gestión diaria.']);
        }
        break;

    // --- CREAR NUEVA SOLICITUD ---
    case 'createAuditoria':
        if (!in_array($tokenData['rol'], ['admin', 'secretaria'])) {
            echo json_encode(['status' => 0, 'message' => 'Solo secretaría o admin pueden crear solicitudes.']);
            exit;
        }

        try {
            $stmtEstado = $con->prepare("SELECT id FROM estado_auditoria WHERE nombre = 'Pendiente'");
            $stmtEstado->execute();
            $id_estado = $stmtEstado->fetchColumn();

            $sql = "INSERT INTO auditoria (fecha, hora, nombre_solicitante, rut_solicitante, motivo, id_estado, id_usuario) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $con->prepare($sql);
            $stmt->execute([
                $datos['fecha'],
                $datos['hora'],
                $datos['nombre_solicitante'],
                $datos['rut_solicitante'], // ¡AQUÍ ESTÁ EL CAMBIO! Pasa directo.
                $datos['motivo'],
                $id_estado,
                $tokenData['id']
            ]);

            echo json_encode(['status' => 1, 'message' => 'Solicitud creada con éxito.']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error al guardar en la base de datos.']);
        }
        break;

    // --- EDITAR SOLICITUD ---
    case 'updateAuditoria':
        if (!in_array($tokenData['rol'], ['admin', 'secretaria'])) {
            echo json_encode(['status' => 0, 'message' => 'No tienes permisos para editar.']);
            exit;
        }

        try {
            $sql = "UPDATE auditoria SET fecha = ?, hora = ?, nombre_solicitante = ?, rut_solicitante = ?, motivo = ? WHERE id = ?";
            $stmt = $con->prepare($sql);
            $stmt->execute([
                $datos['fecha'],
                $datos['hora'],
                $datos['nombre_solicitante'],
                $datos['rut_solicitante'], // ¡AQUÍ ESTÁ EL CAMBIO! Pasa directo.
                $datos['motivo'],
                $datos['id']
            ]);

            echo json_encode(['status' => 1, 'message' => 'Solicitud actualizada correctamente.']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error al actualizar.']);
        }
        break;

    // --- ELIMINAR SOLICITUD ---
    case 'deleteAuditoria':
        if (!in_array($tokenData['rol'], ['admin', 'secretaria'])) {
            echo json_encode(['status' => 0, 'message' => 'No tienes permisos para eliminar.']);
            exit;
        }

        try {
            $sql = "DELETE FROM auditoria WHERE id = ?";
            $stmt = $con->prepare($sql);
            $stmt->execute([$datos['id']]);

            echo json_encode(['status' => 1, 'message' => 'Solicitud eliminada.']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error al eliminar.']);
        }
        break;

    default:
        echo json_encode(['status' => 0, 'message' => 'Acción no reconocida.']);
        break;
}

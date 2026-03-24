<?php
require_once 'Conexion.php';
require_once 'JwtHandler.php';

header('Content-Type: application/json');

// ========================================================================
// 1. MIDDLEWARE DE SEGURIDAD
// ========================================================================
$headers = apache_request_headers();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado. Token no proporcionado.']);
    exit;
}

$tokenData = (new JwtHandler())->validarToken($matches[1]);

if (!$tokenData || !in_array($tokenData['rol'], ['admin', 'alcalde', 'secretaria'])) {
    echo json_encode(['status' => 0, 'message' => 'Permisos insuficientes para ver el historial.']);
    exit;
}

// ========================================================================
// 2. CONEXIÓN Y PROCESAMIENTO
// ========================================================================
$con = (new Conexion())->conectar();
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {

    // --- LEER TODO EL HISTORIAL (Solo Admin, Secretaria y Alcalde) ---
    case 'getHistorial':
        try {
            $sql = "SELECT h.id, h.fecha, h.hora, h.motivo, h.resolucion, 
                           hd.comentario_alcalde as comentario_derivacion, 
                           e.nombre as estado,
                           c.rut as rut_solicitante, c.nombre as nombre_solicitante, 
                           c.nombres, c.apellido_p, c.apellido_m, c.fecha_nacimiento, 
                           c.telefono as celular, c.correo, c.sector, c.direccion, c.discapacidad,
                           u_resp.nombre as responsable_resolucion,
                           u_dir.nombre as director_asignado
                    FROM historial h
                    INNER JOIN estado_auditoria e ON h.id_estado = e.id
                    INNER JOIN ciudadanos c ON h.id_ciudadano = c.id
                    INNER JOIN usuarios u_resp ON h.id_usuario = u_resp.id
                    LEFT JOIN historial_derivaciones hd ON hd.id_historial = h.id
                    LEFT JOIN usuarios u_dir ON hd.id_director = u_dir.id 
                    ORDER BY h.fecha DESC, h.hora DESC";
            
            $stmt = $con->prepare($sql);
            $stmt->execute();

            echo json_encode(['status' => 1, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['status' => 0, 'message' => 'Acción no reconocida.']);
        break;
}
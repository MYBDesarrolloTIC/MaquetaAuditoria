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

// El historial es una vista general, permitimos a los 3 roles
if (!$tokenData || !in_array($tokenData['rol'], ['admin', 'secretaria'])) {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado. Permisos insuficientes.']);
    exit;
}

// ========================================================================
// 2. PROCESAMIENTO DEL HISTORIAL
// ========================================================================
$db = new Conexion();
$con = $db->conectar();

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'getHistorialGeneral') {
    try {
        // Ahora consultamos directamente a la tabla historial
        $sql = "SELECT h.id, h.fecha, h.hora, h.nombre_solicitante, h.rut_solicitante, h.motivo, h.resolucion, e.nombre as estado 
                FROM historial h
                INNER JOIN estado_auditoria e ON h.id_estado = e.id
                ORDER BY h.fecha DESC, h.hora DESC"; 
        
        $stmt = $con->prepare($sql);
        $stmt->execute();
        $historial = $stmt->fetchAll();
        
        echo json_encode(['status' => 1, 'data' => $historial]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 0, 'message' => 'Error al obtener el historial general.']);
    }
} else {
    echo json_encode(['status' => 0, 'message' => 'Acción no reconocida.']);
}
?>
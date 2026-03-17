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
if (!$tokenData || !in_array($tokenData['rol'], ['admin', 'alcalde', 'secretaria'])) {
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
        // Traemos todas las auditorías EXCEPTO las que están en estado "Pendiente"
        $sql = "SELECT a.id, a.fecha, a.hora, a.nombre_solicitante, a.rut_solicitante, a.motivo, e.nombre as estado 
                FROM auditoria a
                INNER JOIN estado_auditoria e ON a.id_estado = e.id
                WHERE e.nombre != 'Pendiente'
                ORDER BY a.fecha DESC, a.hora DESC"; 
        
        $stmt = $con->prepare($sql);
        $stmt->execute();
        $historial = $stmt->fetchAll();
        
        // Entregamos la data lista para que tu amigo la dibuje en su tabla
        echo json_encode(['status' => 1, 'data' => $historial]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 0, 'message' => 'Error al obtener el historial general.']);
    }
} else {
    echo json_encode(['status' => 0, 'message' => 'Acción no reconocida.']);
}
?>
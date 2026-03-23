<?php
require_once 'Conexion.php';
require_once 'JwtHandler.php';

header('Content-Type: application/json');

// ========================================================================
// 1. MIDDLEWARE: VALIDACIÓN DE SEGURIDAD (4 ROLES)
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

if (!$tokenData || !in_array($tokenData['rol'], ['admin', 'alcalde', 'secretaria', 'director'])) {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado. Permisos insuficientes.']);
    exit;
}

// ========================================================================
// 2. CONFIGURACIÓN DE CONEXIÓN Y RECEPCIÓN DE DATOS
// ========================================================================
$db = new Conexion();
$con = $db->conectar();

$action = isset($_GET['action']) ? $_GET['action'] : '';
$json = file_get_contents('php://input');
$datos = json_decode($json, true);
if (isset($datos['action'])) { $action = $datos['action']; }

// ========================================================================
// 3. ENRUTADOR PRINCIPAL (SWITCH)
// ========================================================================
switch ($action) {

    // --------------------------------------------------------------------
    // VISTA ALCALDE: LEER BANDEJA PENDIENTE
    // --------------------------------------------------------------------
    case 'getPendientes':
        try {
            $sql = "SELECT a.id, a.fecha, a.hora, a.nombre_solicitante, a.rut_solicitante, a.motivo, e.nombre as estado 
                    FROM auditoria a
                    INNER JOIN estado_auditoria e ON a.id_estado = e.id
                    WHERE e.nombre = 'Pendiente'
                    ORDER BY a.fecha ASC, a.hora ASC";
            $stmt = $con->prepare($sql);
            $stmt->execute();
            echo json_encode(['status' => 1, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --------------------------------------------------------------------
    // VISTA ALCALDE: DERIVAR A UN DIRECTOR (Usa tabla intermedia)
    // --------------------------------------------------------------------
    case 'derivarAuditoria':
        if (!isset($datos['id']) || !isset($datos['usuario_destino']) || !isset($datos['comentario'])) {
            echo json_encode(['status' => 0, 'message' => 'Faltan datos para derivar la solicitud.']);
            exit;
        }

        try {
            $con->beginTransaction(); // Iniciamos transacción para asegurar ambas inserciones

            // 1. Cambiamos el estado en la tabla principal
            $stmtEstado = $con->prepare("SELECT id FROM estado_auditoria WHERE nombre = 'Derivada'");
            $stmtEstado->execute();
            $id_estado = $stmtEstado->fetchColumn();

            $sqlUpd = "UPDATE auditoria SET id_estado = ? WHERE id = ?";
            $con->prepare($sqlUpd)->execute([$id_estado, $datos['id']]);

            // 2. Insertamos en la tabla intermedia de derivaciones
            $sqlDeriv = "INSERT INTO derivaciones (id_auditoria, id_director, comentario_alcalde) VALUES (?, ?, ?)";
            $con->prepare($sqlDeriv)->execute([$datos['id'], $datos['usuario_destino'], trim($datos['comentario'])]);

            $con->commit();
            echo json_encode(['status' => 1, 'message' => 'Solicitud derivada correctamente al Director.']);
        } catch (PDOException $e) {
            $con->rollBack();
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --- LECTURA DE DERIVACIONES (ADMIN VE TODO, DIRECTOR VE LO SUYO) ---
    case 'getMisDerivaciones':
        try {
            if ($tokenData['rol'] === 'admin') {
                // El Admin ve absolutamente todas las derivaciones activas y a quién están asignadas
                $sql = "SELECT a.id, a.fecha, a.hora, a.nombre_solicitante, a.rut_solicitante, a.motivo, 
                               d.comentario_alcalde as comentario_derivacion, e.nombre as estado, 
                               u.nombre as nombre_director
                        FROM auditoria a
                        INNER JOIN estado_auditoria e ON a.id_estado = e.id
                        INNER JOIN derivaciones d ON d.id_auditoria = a.id
                        INNER JOIN usuarios u ON d.id_director = u.id
                        WHERE e.nombre = 'Derivada'
                        ORDER BY a.fecha ASC, a.hora ASC";
                
                $stmt = $con->prepare($sql);
                $stmt->execute();
            } else {
                // El Director solo ve las que tienen su propio ID
                $sql = "SELECT a.id, a.fecha, a.hora, a.nombre_solicitante, a.rut_solicitante, a.motivo, 
                               d.comentario_alcalde as comentario_derivacion, e.nombre as estado, 
                               u.nombre as nombre_director
                        FROM auditoria a
                        INNER JOIN estado_auditoria e ON a.id_estado = e.id
                        INNER JOIN derivaciones d ON d.id_auditoria = a.id
                        INNER JOIN usuarios u ON d.id_director = u.id
                        WHERE e.nombre = 'Derivada' AND d.id_director = ?
                        ORDER BY a.fecha ASC, a.hora ASC";
                
                $stmt = $con->prepare($sql);
                $stmt->execute([$tokenData['id']]);
            }
            
            echo json_encode(['status' => 1, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --------------------------------------------------------------------
    // VISTA DIRECTOR: COMPLETAR/RESOLVER SU DERIVACIÓN
    // --------------------------------------------------------------------
    case 'resolverDerivacion':
        if (!isset($datos['id']) || !isset($datos['comentario']) || trim($datos['comentario']) === '') {
            echo json_encode(['status' => 0, 'message' => 'El comentario de resolución es obligatorio.']);
            exit;
        }

        try {
            $con->beginTransaction();

            $stmtEstado = $con->prepare("SELECT id FROM estado_auditoria WHERE nombre = 'Completada'");
            $stmtEstado->execute();
            $id_estado = $stmtEstado->fetchColumn();

            // Rescatamos datos de auditoria y de la derivación
            $stmtAud = $con->prepare("SELECT * FROM auditoria WHERE id = ?");
            $stmtAud->execute([$datos['id']]);
            $auditoria = $stmtAud->fetch(PDO::FETCH_ASSOC);

            $stmtDeriv = $con->prepare("SELECT * FROM derivaciones WHERE id_auditoria = ?");
            $stmtDeriv->execute([$datos['id']]);
            $derivacion = $stmtDeriv->fetch(PDO::FETCH_ASSOC);

            // Insertamos al historial
            $sqlHist = "INSERT INTO historial (fecha, hora, nombre_solicitante, rut_solicitante, motivo, resolucion, id_estado, id_usuario) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $con->prepare($sqlHist)->execute([
                $auditoria['fecha'], $auditoria['hora'], $auditoria['nombre_solicitante'], $auditoria['rut_solicitante'], 
                $auditoria['motivo'], trim($datos['comentario']), $id_estado, $tokenData['id']
            ]);
            
            // Recuperamos el ID que se acaba de crear en el historial
            $id_historial = $con->lastInsertId();

            // Insertamos la derivación en el historial_derivaciones
            if ($derivacion) {
                $sqlHistDeriv = "INSERT INTO historial_derivaciones (id_historial, id_director, comentario_alcalde) VALUES (?, ?, ?)";
                $con->prepare($sqlHistDeriv)->execute([$id_historial, $derivacion['id_director'], $derivacion['comentario_alcalde']]);
            }

            // Limpiamos las tablas activas
            $con->prepare("DELETE FROM derivaciones WHERE id_auditoria = ?")->execute([$datos['id']]);
            $con->prepare("DELETE FROM auditoria WHERE id = ?")->execute([$datos['id']]);

            $con->commit();
            echo json_encode(['status' => 1, 'message' => 'Derivación resuelta y enviada al historial.']);
        } catch (PDOException $e) {
            $con->rollBack();
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --------------------------------------------------------------------
    // VISTA ALCALDE: COMPLETAR/DENEGAR DIRECTAMENTE
    // --------------------------------------------------------------------
    case 'cambiarEstado':
        if (!isset($datos['id']) || !isset($datos['nuevo_estado']) || !isset($datos['comentario'])) {
            echo json_encode(['status' => 0, 'message' => 'Faltan datos de resolución.']);
            exit;
        }

        try {
            $con->beginTransaction();

            $stmtEstado = $con->prepare("SELECT id FROM estado_auditoria WHERE nombre = ?");
            $stmtEstado->execute([$datos['nuevo_estado']]);
            $id_estado = $stmtEstado->fetchColumn();

            $stmtAud = $con->prepare("SELECT * FROM auditoria WHERE id = ?");
            $stmtAud->execute([$datos['id']]);
            $auditoria = $stmtAud->fetch(PDO::FETCH_ASSOC);

            // Al historial directo (sin pasar por derivaciones)
            $sqlHist = "INSERT INTO historial (fecha, hora, nombre_solicitante, rut_solicitante, motivo, resolucion, id_estado, id_usuario) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $con->prepare($sqlHist)->execute([
                $auditoria['fecha'], $auditoria['hora'], $auditoria['nombre_solicitante'], $auditoria['rut_solicitante'], 
                $auditoria['motivo'], trim($datos['comentario']), $id_estado, $tokenData['id']
            ]);

            $con->prepare("DELETE FROM auditoria WHERE id = ?")->execute([$datos['id']]);

            $con->commit();
            echo json_encode(['status' => 1, 'message' => 'Audiencia movida al historial.']);
        } catch (PDOException $e) {
            $con->rollBack();
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --------------------------------------------------------------------
    // VISTA SECRETARIA: GESTIÓN DIARIA (UNION ALL DE TABLAS ACTIVAS E HISTORIAL)
    // --------------------------------------------------------------------
    case 'getGestionDiaria':
        try {
            // Protegemos el UNION ALL asegurando que ambas consultas devuelven las mismas 9 columnas
            $sql = "SELECT a.id, a.fecha, a.hora, a.nombre_solicitante, a.rut_solicitante, a.motivo, NULL as resolucion, d.comentario_alcalde as comentario_derivacion, e.nombre as estado 
                    FROM auditoria a
                    INNER JOIN estado_auditoria e ON a.id_estado = e.id
                    LEFT JOIN derivaciones d ON d.id_auditoria = a.id
                    UNION ALL 
                    SELECT h.id, h.fecha, h.hora, h.nombre_solicitante, h.rut_solicitante, h.motivo, h.resolucion, hd.comentario_alcalde as comentario_derivacion, e.nombre as estado 
                    FROM historial h
                    INNER JOIN estado_auditoria e ON h.id_estado = e.id
                    LEFT JOIN historial_derivaciones hd ON hd.id_historial = h.id
                    ORDER BY fecha DESC, hora DESC";

            $stmt = $con->prepare($sql);
            $stmt->execute();
            echo json_encode(['status' => 1, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --------------------------------------------------------------------
    // METODOS CRUD BÁSICOS (SECRETARIA Y ADMIN)
    // --------------------------------------------------------------------
    case 'createAuditoria':
        if (!in_array($tokenData['rol'], ['admin', 'secretaria'])) { exit; }
        try {
            $stmtEstado = $con->prepare("SELECT id FROM estado_auditoria WHERE nombre = 'Pendiente'");
            $stmtEstado->execute();
            $sql = "INSERT INTO auditoria (fecha, hora, nombre_solicitante, rut_solicitante, motivo, id_estado, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $con->prepare($sql)->execute([$datos['fecha'], $datos['hora'], $datos['nombre_solicitante'], $datos['rut_solicitante'], $datos['motivo'], $stmtEstado->fetchColumn(), $tokenData['id']]);
            echo json_encode(['status' => 1, 'message' => 'Solicitud creada con éxito.']);
        } catch (PDOException $e) { echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]); }
        break;

    case 'updateAuditoria':
        if (!in_array($tokenData['rol'], ['admin', 'secretaria'])) { exit; }
        try {
            $sql = "UPDATE auditoria SET fecha = ?, hora = ?, nombre_solicitante = ?, rut_solicitante = ?, motivo = ? WHERE id = ?";
            $con->prepare($sql)->execute([$datos['fecha'], $datos['hora'], $datos['nombre_solicitante'], $datos['rut_solicitante'], $datos['motivo'], $datos['id']]);
            echo json_encode(['status' => 1, 'message' => 'Solicitud actualizada correctamente.']);
        } catch (PDOException $e) { echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]); }
        break;

    case 'deleteAuditoria':
        if (!in_array($tokenData['rol'], ['admin', 'secretaria'])) { exit; }
        try {
            $con->prepare("DELETE FROM auditoria WHERE id = ?")->execute([$datos['id']]);
            echo json_encode(['status' => 1, 'message' => 'Solicitud eliminada.']);
        } catch (PDOException $e) { echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]); }
        break;

    default:
        echo json_encode(['status' => 0, 'message' => 'Acción no reconocida.']);
        break;
}
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
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado.']);
    exit;
}

$tokenData = (new JwtHandler())->validarToken($matches[1]);
if (!$tokenData || !in_array($tokenData['rol'], ['admin', 'alcalde', 'secretaria', 'director'])) {
    echo json_encode(['status' => 0, 'message' => 'Permisos insuficientes.']);
    exit;
}

// ========================================================================
// 2. CONEXIÓN Y ENRUTADOR
// ========================================================================
$con = (new Conexion())->conectar();
$json = file_get_contents('php://input');
$datos = json_decode($json, true);
$action = isset($_GET['action']) ? $_GET['action'] : (isset($datos['action']) ? $datos['action'] : '');

switch ($action) {

    // --- LEER PENDIENTES (ALCALDE) ---
    case 'getPendientes':
        try {
            $sql = "SELECT a.id, a.fecha, a.hora, c.nombre as nombre_solicitante, 
                           c.rut as rut_solicitante, c.telefono, c.correo, c.discapacidad, 
                           a.motivo, e.nombre as estado 
                    FROM auditoria a
                    INNER JOIN estado_auditoria e ON a.id_estado = e.id
                    INNER JOIN ciudadanos c ON a.id_ciudadano = c.id
                    WHERE e.nombre = 'Pendiente' 
                    ORDER BY 
                        CASE 
                            WHEN c.discapacidad IS NOT NULL AND c.discapacidad != 'Ninguna' THEN 0 
                            ELSE 1 
                        END ASC, 
                        a.fecha ASC, 
                        a.hora ASC";
            $stmt = $con->prepare($sql);
            $stmt->execute();
            echo json_encode(['status' => 1, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --- LEER MIS DERIVACIONES (DIRECTOR) ---
    case 'getMisDerivaciones':
        try {
            $esAdmin = ($tokenData['rol'] === 'admin');
            $sql = "SELECT a.id, a.fecha, a.hora, c.nombre as nombre_solicitante, c.rut as rut_solicitante, c.telefono, c.correo, a.motivo, 
                           d.comentario_alcalde as comentario_derivacion, e.nombre as estado, u.nombre as nombre_director
                    FROM auditoria a
                    INNER JOIN estado_auditoria e ON a.id_estado = e.id
                    INNER JOIN ciudadanos c ON a.id_ciudadano = c.id
                    INNER JOIN derivaciones d ON d.id_auditoria = a.id
                    INNER JOIN usuarios u ON d.id_director = u.id
                    WHERE e.nombre = 'Derivada' " . (!$esAdmin ? "AND d.id_director = ?" : "") . " ORDER BY a.fecha ASC, a.hora ASC";

            $stmt = $con->prepare($sql);
            $esAdmin ? $stmt->execute() : $stmt->execute([$tokenData['id']]);
            echo json_encode(['status' => 1, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --- DERIVAR A UN DIRECTOR (ALCALDE) ---
    case 'derivarAuditoria':
        if (!isset($datos['id'], $datos['usuario_destino'], $datos['comentario'])) {
            exit;
        }
        try {
            $con->beginTransaction();
            $id_estado = $con->query("SELECT id FROM estado_auditoria WHERE nombre = 'Derivada'")->fetchColumn();
            $con->prepare("UPDATE auditoria SET id_estado = ? WHERE id = ?")->execute([$id_estado, $datos['id']]);
            $con->prepare("INSERT INTO derivaciones (id_auditoria, id_director, comentario_alcalde) VALUES (?, ?, ?)")
                ->execute([$datos['id'], $datos['usuario_destino'], trim($datos['comentario'])]);
            $con->commit();
            echo json_encode(['status' => 1, 'message' => 'Derivada correctamente.']);
        } catch (PDOException $e) {
            $con->rollBack();
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --- RESOLVER DERIVACIÓN (DIRECTOR) ---
    case 'resolverDerivacion':
        if (!isset($datos['id'], $datos['comentario'])) {
            exit;
        }
        try {
            $con->beginTransaction();
            $id_estado = $con->query("SELECT id FROM estado_auditoria WHERE nombre = 'Completada'")->fetchColumn();

            $auditoria = $con->query("SELECT * FROM auditoria WHERE id = " . intval($datos['id']))->fetch(PDO::FETCH_ASSOC);
            $derivacion = $con->query("SELECT * FROM derivaciones WHERE id_auditoria = " . intval($datos['id']))->fetch(PDO::FETCH_ASSOC);

            // Ahora guardamos el id_ciudadano en el historial
            $con->prepare("INSERT INTO historial (fecha, hora, id_ciudadano, motivo, resolucion, id_estado, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)")
                ->execute([$auditoria['fecha'], $auditoria['hora'], $auditoria['id_ciudadano'], $auditoria['motivo'], trim($datos['comentario']), $id_estado, $tokenData['id']]);
            $id_historial = $con->lastInsertId();

            if ($derivacion) {
                $con->prepare("INSERT INTO historial_derivaciones (id_historial, id_director, comentario_alcalde) VALUES (?, ?, ?)")
                    ->execute([$id_historial, $derivacion['id_director'], $derivacion['comentario_alcalde']]);
            }

            $con->prepare("DELETE FROM derivaciones WHERE id_auditoria = ?")->execute([$datos['id']]);
            $con->prepare("DELETE FROM auditoria WHERE id = ?")->execute([$datos['id']]);
            $con->commit();
            echo json_encode(['status' => 1, 'message' => 'Resuelta.']);
        } catch (PDOException $e) {
            $con->rollBack();
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;
        
        case 'denegarDerivacion':
        if (!isset($datos['id'])) {
            echo json_encode([
                'status' => 0,
                'message' => 'ID no recibido'
            ]);
            exit;
        }

        try {
            $con->beginTransaction();

            $id_estado = $con->query("SELECT id FROM estado_auditoria WHERE nombre = 'Denegada'")->fetchColumn();

            $auditoria = $con->query("SELECT * FROM auditoria WHERE id = " . intval($datos['id']))->fetch(PDO::FETCH_ASSOC);
            $derivacion = $con->query("SELECT * FROM derivaciones WHERE id_auditoria = " . intval($datos['id']))->fetch(PDO::FETCH_ASSOC);

            if (!$auditoria) {
                $con->rollBack();
                echo json_encode([
                    'status' => 0,
                    'message' => 'No se encontró la auditoría'
                ]);
                exit;
            }

            $con->prepare("INSERT INTO historial (fecha, hora, id_ciudadano, motivo, resolucion, id_estado, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)")
                ->execute([
                    $auditoria['fecha'],
                    $auditoria['hora'],
                    $auditoria['id_ciudadano'],
                    $auditoria['motivo'],
                    'Derivación denegada',
                    $id_estado,
                    $tokenData['id']
                ]);

            $id_historial = $con->lastInsertId();

            if ($derivacion) {
                $con->prepare("INSERT INTO historial_derivaciones (id_historial, id_director, comentario_alcalde) VALUES (?, ?, ?)")
                    ->execute([
                        $id_historial,
                        $derivacion['id_director'],
                        $derivacion['comentario_alcalde']
                    ]);
            }

            $con->prepare("DELETE FROM derivaciones WHERE id_auditoria = ?")->execute([$datos['id']]);
            $con->prepare("DELETE FROM auditoria WHERE id = ?")->execute([$datos['id']]);

            $con->commit();

            echo json_encode([
                'status' => 1,
                'message' => 'Derivación denegada correctamente'
            ]);
        } catch (PDOException $e) {
            $con->rollBack();
            echo json_encode([
                'status' => 0,
                'message' => 'Error SQL: ' . $e->getMessage()
            ]);
        }
        exit;

    // --- CAMBIAR ESTADO NORMAL (ALCALDE) ---
    case 'cambiarEstado':
        if (!isset($datos['id'], $datos['nuevo_estado'], $datos['comentario'])) {
            exit;
        }
        try {
            $con->beginTransaction();
            $stmtE = $con->prepare("SELECT id FROM estado_auditoria WHERE nombre = ?");
            $stmtE->execute([$datos['nuevo_estado']]);
            $id_estado = $stmtE->fetchColumn();

            $auditoria = $con->query("SELECT * FROM auditoria WHERE id = " . intval($datos['id']))->fetch(PDO::FETCH_ASSOC);

            $con->prepare("INSERT INTO historial (fecha, hora, id_ciudadano, motivo, resolucion, id_estado, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)")
                ->execute([$auditoria['fecha'], $auditoria['hora'], $auditoria['id_ciudadano'], $auditoria['motivo'], trim($datos['comentario']), $id_estado, $tokenData['id']]);

            $con->prepare("DELETE FROM auditoria WHERE id = ?")->execute([$datos['id']]);
            $con->commit();
            echo json_encode(['status' => 1, 'message' => 'Movida al historial.']);
        } catch (PDOException $e) {
            $con->rollBack();
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --- GESTIÓN DIARIA (SECRETARIA) ---
    case 'getGestionDiaria':
        try {
            $sql = "SELECT a.id, a.fecha, a.hora, a.motivo, NULL as resolucion, 
                           d.comentario_alcalde as comentario_derivacion, e.nombre as estado,
                           c.rut as rut_solicitante, c.nombre as nombre_solicitante, 
                           c.nombres, c.apellido_p, c.apellido_m, c.fecha_nacimiento, 
                           c.telefono as celular, c.correo, c.sector, c.direccion, c.discapacidad
                    FROM auditoria a
                    INNER JOIN estado_auditoria e ON a.id_estado = e.id
                    INNER JOIN ciudadanos c ON a.id_ciudadano = c.id
                    LEFT JOIN derivaciones d ON d.id_auditoria = a.id
                    UNION ALL 
                    SELECT h.id, h.fecha, h.hora, h.motivo, h.resolucion, 
                           hd.comentario_alcalde as comentario_derivacion, e.nombre as estado,
                           c.rut as rut_solicitante, c.nombre as nombre_solicitante, 
                           c.nombres, c.apellido_p, c.apellido_m, c.fecha_nacimiento, 
                           c.telefono as celular, c.correo, c.sector, c.direccion, c.discapacidad
                    FROM historial h
                    INNER JOIN estado_auditoria e ON h.id_estado = e.id
                    INNER JOIN ciudadanos c ON h.id_ciudadano = c.id
                    LEFT JOIN historial_derivaciones hd ON hd.id_historial = h.id
                    ORDER BY fecha DESC, hora DESC";
            $stmt = $con->prepare($sql);
            $stmt->execute();
            echo json_encode(['status' => 1, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    case 'buscarCiudadano':
        $termino = isset($_GET['termino']) ? $_GET['termino'] : '';
        if (strlen($termino) < 3) {
            echo json_encode(['status' => 1, 'data' => []]);
            exit;
        }
        try {
            // Buscamos coincidencias por RUT o por Nombre
            $sql = "SELECT * FROM ciudadanos WHERE rut LIKE ? OR nombre LIKE ? LIMIT 10";
            $stmt = $con->prepare($sql);
            $like = "%" . $termino . "%";
            $stmt->execute([$like, $like]);
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Mapeamos los datos para que el frontend los entienda como los programó
            $ciudadanos = array_map(function ($c) {
                return [
                    'rut_solicitante' => $c['rut'],
                    'nombre_solicitante' => $c['nombre'],
                    'nombres' => $c['nombre'], // Para compatibilidad con el JS
                    'celular' => $c['telefono'],
                    'correo' => $c['correo']
                ];
            }, $resultados);

            echo json_encode(['status' => 1, 'data' => $ciudadanos]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    // --- CREAR Y EDITAR AUDITORÍA (CON GESTIÓN COMPLETA DE CIUDADANO) ---
    case 'createAuditoria':
    case 'updateAuditoria':
        if (!in_array($tokenData['rol'], ['admin', 'secretaria'])) {
            exit;
        }
        try {
            // 1. Atrapamos EXACTAMENTE las variables que envía el Frontend
            $rut = trim($datos['rut_solicitante']);
            $nombre_completo = trim($datos['nombre_solicitante']);
            $nombres = isset($datos['nombres']) ? trim($datos['nombres']) : null;
            $apellido_p = isset($datos['apellido_p']) ? trim($datos['apellido_p']) : null;
            $apellido_m = isset($datos['apellido_m']) ? trim($datos['apellido_m']) : null;
            $fecha_nacimiento = isset($datos['fecha_nacimiento']) && $datos['fecha_nacimiento'] !== '' ? $datos['fecha_nacimiento'] : null;
            $celular = isset($datos['celular']) ? trim($datos['celular']) : null;
            $correo = isset($datos['correo']) ? trim($datos['correo']) : null;
            $sector = isset($datos['sector']) ? trim($datos['sector']) : null;
            $direccion = isset($datos['direccion']) ? trim($datos['direccion']) : null;
            $discapacidad = isset($datos['discapacidad']) && trim($datos['discapacidad']) !== '' ? trim($datos['discapacidad']) : 'Ninguna';

            // 2. Comprobar si el ciudadano ya existe en la BD
            $stmtC = $con->prepare("SELECT id FROM ciudadanos WHERE rut = ?");
            $stmtC->execute([$rut]);
            $id_ciudadano = $stmtC->fetchColumn();

            if ($id_ciudadano) {
                // Si existe, actualizamos TODOS sus datos por si la secretaria corrigió algo (dirección, celular, etc)
                $sqlUpd = "UPDATE ciudadanos SET 
                            nombre = ?, nombres = ?, apellido_p = ?, apellido_m = ?, 
                            telefono = ?, correo = ?, fecha_nacimiento = ?, 
                            sector = ?, direccion = ?, discapacidad = ? 
                           WHERE id = ?";
                $con->prepare($sqlUpd)->execute([
                    $nombre_completo,
                    $nombres,
                    $apellido_p,
                    $apellido_m,
                    $celular,
                    $correo,
                    $fecha_nacimiento,
                    $sector,
                    $direccion,
                    $discapacidad,
                    $id_ciudadano
                ]);
            } else {
                // Si es nuevo, lo insertamos con toda su ficha técnica
                $sqlIns = "INSERT INTO ciudadanos 
                           (rut, nombre, nombres, apellido_p, apellido_m, telefono, correo, fecha_nacimiento, sector, direccion, discapacidad) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $con->prepare($sqlIns)->execute([
                    $rut,
                    $nombre_completo,
                    $nombres,
                    $apellido_p,
                    $apellido_m,
                    $celular,
                    $correo,
                    $fecha_nacimiento,
                    $sector,
                    $direccion,
                    $discapacidad
                ]);
                $id_ciudadano = $con->lastInsertId();
            }

            // 3. Finalmente, guardamos la auditoría apuntando al ID del ciudadano
            if ($action === 'createAuditoria') {
                $id_estado = $con->query("SELECT id FROM estado_auditoria WHERE nombre = 'Pendiente'")->fetchColumn();
                $con->prepare("INSERT INTO auditoria (fecha, hora, id_ciudadano, motivo, id_estado, id_usuario) VALUES (?, ?, ?, ?, ?, ?)")
                    ->execute([$datos['fecha'], $datos['hora'], $id_ciudadano, $datos['motivo'], $id_estado, $tokenData['id']]);
                echo json_encode(['status' => 1, 'message' => 'Solicitud creada con éxito.']);
            } else {
                $con->prepare("UPDATE auditoria SET fecha = ?, hora = ?, id_ciudadano = ?, motivo = ? WHERE id = ?")
                    ->execute([$datos['fecha'], $datos['hora'], $id_ciudadano, $datos['motivo'], $datos['id']]);
                echo json_encode(['status' => 1, 'message' => 'Solicitud actualizada.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    case 'deleteAuditoria':
        if (!in_array($tokenData['rol'], ['admin', 'secretaria'])) {
            exit;
        }
        try {
            $con->prepare("DELETE FROM auditoria WHERE id = ?")->execute([$datos['id']]);
            echo json_encode(['status' => 1, 'message' => 'Solicitud eliminada.']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['status' => 0, 'message' => 'Acción no reconocida.']);
        break;
}

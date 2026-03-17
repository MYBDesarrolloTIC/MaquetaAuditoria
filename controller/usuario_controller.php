<?php
require_once 'Conexion.php';
require_once 'JwtHandler.php';

header('Content-Type: application/json');

// ========================================================================
// 1. MIDDLEWARE: VALIDACIÓN DE SEGURIDAD (TOKEN Y ROL)
// ========================================================================
$headers = apache_request_headers();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

// Verificamos que venga la palabra "Bearer " seguida del token
if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado. Token no proporcionado.']);
    exit;
}

$token = $matches[1];
$jwt = new JwtHandler();
$tokenData = $jwt->validarToken($token);

// Si el token es inválido, expiró, o el rol NO es admin, lo echamos.
if (!$tokenData || $tokenData['rol'] !== 'admin') {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado. Permisos insuficientes.']);
    exit;
}

// ========================================================================
// 2. PROCESAMIENTO DEL CRUD
// ========================================================================
$db = new Conexion();
$con = $db->conectar();

// Las peticiones GET envían la variable 'action' por la URL. Las POST por el body (JSON).
$action = isset($_GET['action']) ? $_GET['action'] : '';
$json = file_get_contents('php://input');
$datos = json_decode($json, true);

if (isset($datos['action'])) {
    $action = $datos['action'];
}

switch ($action) {

    // --- LEER USUARIOS ---
    case 'getUsuarios':
        // El frontend espera campos específicos, formateamos el estado a texto para que se vea bien en la tabla
        $sql = "SELECT u.id, u.nombre, u.login, r.nombre as rol, IF(u.estado = 1, 'Activo', 'Inactivo') as estado 
                FROM usuarios u 
                INNER JOIN roles r ON u.id_rol = r.id";
        $stmt = $con->prepare($sql);
        $stmt->execute();
        $usuarios = $stmt->fetchAll();
        
        echo json_encode(['status' => 1, 'data' => $usuarios]);
        break;

    // --- CREAR USUARIO ---
    case 'createUsuario':
        // Buscamos el ID del rol que manda el frontend (ej. 'secretaria' -> id 3)
        $stmtRol = $con->prepare("SELECT id FROM roles WHERE nombre = ?");
        $stmtRol->execute([$datos['rol']]);
        $id_rol = $stmtRol->fetchColumn();

        if(!$id_rol) {
            echo json_encode(['status' => 0, 'message' => 'Rol inválido.']);
            exit;
        }

        $passHash = password_hash($datos['password'], PASSWORD_BCRYPT);
        $estado = ($datos['estado'] === 'Activo' || $datos['estado'] == 1) ? 1 : 0;

        try {
            $sql = "INSERT INTO usuarios (nombre, login, password, id_rol, estado) VALUES (?, ?, ?, ?, ?)";
            $stmt = $con->prepare($sql);
            $stmt->execute([$datos['nombre'], $datos['login'], $passHash, $id_rol, $estado]);
            echo json_encode(['status' => 1, 'message' => 'Usuario creado exitosamente.']);
        } catch (PDOException $e) {
            // El error 23000 es de duplicidad (login único)
            if ($e->getCode() == 23000) {
                echo json_encode(['status' => 0, 'message' => 'El login (usuario) ya existe.']);
            } else {
                echo json_encode(['status' => 0, 'message' => 'Error de base de datos.']);
            }
        }
        break;

    // --- EDITAR USUARIO ---
    case 'updateUsuario':
        $stmtRol = $con->prepare("SELECT id FROM roles WHERE nombre = ?");
        $stmtRol->execute([$datos['rol']]);
        $id_rol = $stmtRol->fetchColumn();
        
        $estado = ($datos['estado'] === 'Activo' || $datos['estado'] == 1) ? 1 : 0;

        // Si el frontend envía una nueva contraseña, la actualizamos. Si está vacía, la conservamos.
        if (!empty($datos['password'])) {
            $passHash = password_hash($datos['password'], PASSWORD_BCRYPT);
            $sql = "UPDATE usuarios SET nombre = ?, login = ?, password = ?, id_rol = ?, estado = ? WHERE id = ?";
            $params = [$datos['nombre'], $datos['login'], $passHash, $id_rol, $estado, $datos['id']];
        } else {
            $sql = "UPDATE usuarios SET nombre = ?, login = ?, id_rol = ?, estado = ? WHERE id = ?";
            $params = [$datos['nombre'], $datos['login'], $id_rol, $estado, $datos['id']];
        }

        try {
            $stmt = $con->prepare($sql);
            $stmt->execute($params);
            echo json_encode(['status' => 1, 'message' => 'Usuario actualizado.']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 0, 'message' => 'Error al actualizar. Verifique que el login no esté duplicado.']);
        }
        break;

    // --- ELIMINAR USUARIO ---
    case 'deleteUsuario':
        // Protección extra: No dejar que el admin se borre a sí mismo. (Opcional pero recomendado)
        if ($datos['id'] == $tokenData['id']) {
            echo json_encode(['status' => 0, 'message' => 'No puedes eliminar tu propia cuenta.']);
            exit;
        }

        try {
            $sql = "DELETE FROM usuarios WHERE id = ?";
            $stmt = $con->prepare($sql);
            $stmt->execute([$datos['id']]);
            echo json_encode(['status' => 1, 'message' => 'Usuario eliminado.']);
        } catch (PDOException $e) {
            // En una BD normalizada, si el usuario ya tiene registros de auditoría asociados, MySQL no te dejará borrarlo.
            echo json_encode(['status' => 0, 'message' => 'No se puede eliminar porque tiene registros asociados. (Mejor desactívelo)']);
        }
        break;

    default:
        echo json_encode(['status' => 0, 'message' => 'Acción no reconocida.']);
        break;
}
?>
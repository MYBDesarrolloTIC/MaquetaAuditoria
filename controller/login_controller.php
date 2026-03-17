<?php
require_once 'Conexion.php';
require_once 'JwtHandler.php';

header('Content-Type: application/json');

$json = file_get_contents('php://input');
$datos = json_decode($json, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($datos['username'])) {
    $db = new Conexion();
    $con = $db->conectar();

    $usuario = $datos['username'];
    $password = $datos['password'];

    // MODIFICADO: Hacemos un JOIN con la tabla roles para traer el nombre del rol
    $sql = "SELECT u.id, u.login, u.password, u.estado, r.nombre as rol 
            FROM usuarios u 
            INNER JOIN roles r ON u.id_rol = r.id 
            WHERE u.login = ?";
            
    $stmt = $con->prepare($sql);
    $stmt->execute([$usuario]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        if ($user['estado'] == 1) {
            
            $jwt = new JwtHandler();
            // Generamos el token guardando el ID del usuario y el texto de su rol
            $token = $jwt->generarToken(['id' => $user['id'], 'rol' => $user['rol']]);

            // Devolvemos la estructura EXACTA que Login.js de tu compañero espera
            echo json_encode([
                "status" => 1,
                "message" => "Acceso concedido",
                "token" => $token, 
                "data" => [
                    "status" => 1, 
                    "rol" => $user['rol'] // Se envía el texto ('admin', 'secretaria', etc.) gracias al JOIN
                ]
            ]);
        } else {
            echo json_encode(["status" => 0, "message" => "Usuario inactivo"]);
        }
    } else {
        echo json_encode(["status" => 0, "message" => "Usuario o contraseña incorrectos"]);
    }
} else {
    echo json_encode(["status" => 0, "message" => "Datos incompletos"]);
}
<?php
require_once 'Conexion.php';
require_once 'JwtHandler.php';

$json = file_get_contents('php://input');
$datos = json_decode($json, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($datos['username'])) {
    $db = new Conexion();
    $con = $db->conectar();

    $usuario = $datos['username'];
    $password = $datos['password'];

    $stmt = $con->prepare("SELECT id, login, password, rol, estado FROM usuarios WHERE login = ?");
    $stmt->execute([$usuario]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        if ($user['estado'] == 1) {
            
            // Instanciar nuestro manejador JWT
            $jwt = new JwtHandler();
            
            // Los datos que irán dentro del token (No enviar passwords ni info sensible aquí)
            $tokenData = [
                'id' => $user['id'],
                'rol' => $user['rol']
            ];

            // Generar el Token
            $token = $jwt->generarToken($tokenData);

            // Responder SOLO con el token y un mensaje de éxito
            echo json_encode([
                "status" => 1,
                "message" => "Acceso concedido",
                "token" => $token,
                "rol" => $user['rol'] // Se envía el rol solo para saber a qué vista redirigir en JS
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
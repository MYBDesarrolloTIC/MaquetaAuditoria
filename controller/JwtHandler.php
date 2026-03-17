<?php
class JwtHandler {
    // ESTA CLAVE DEBE SER SECRETA Y COMPLEJA. ¡No la compartas!
    private $secret = 'M1_Cl4v3_S3cr3t4_Y3rb4sBu3n4s_2026!'; 

    // 1. FUNCIÓN PARA CREAR EL TOKEN (Al iniciar sesión)
    public function generarToken($data) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'iat' => time(), // Tiempo en que se emitió el token
            'exp' => time() + (60 * 60 * 8), // Expira en 8 horas
            'data' => $data // Aquí va el ID y ROL del usuario
        ]);

        // Codificar a Base64Url
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        // Crear la firma de seguridad
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    // 2. FUNCIÓN PARA VALIDAR EL TOKEN (Al acceder a datos protegidos)
    public function validarToken($token) {
        // Un token JWT siempre tiene 3 partes separadas por puntos
        $partes = explode('.', $token);
        if (count($partes) !== 3) return false;

        $header = $partes[0];
        $payload = $partes[1];
        $firmaRecibida = $partes[2];

        // Volvemos a calcular la firma con nuestro secreto usando el header y payload recibidos
        $firmaCalculada = hash_hmac('sha256', $header . "." . $payload, $this->secret, true);
        $base64UrlFirmaCalculada = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($firmaCalculada));

        // Si la firma que calculamos es idéntica a la que trae el token, el token es auténtico
        if (hash_equals($base64UrlFirmaCalculada, $firmaRecibida)) {
            // Decodificamos el payload para ver los datos
            $datosDecodificados = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
            
            // Verificamos que el token no haya expirado
            if ($datosDecodificados['exp'] >= time()) {
                return $datosDecodificados['data']; // Retorna los datos (id, rol) si es válido
            }
        }
        
        // Si la firma no coincide o el token expiró, retornamos false
        return false;
    }
}
?>
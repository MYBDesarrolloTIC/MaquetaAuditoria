<?php
class JwtHandler {
    // Clave secreta del servidor. ¡No la compartas!
    private $secret = 'M1_Cl4v3_S3cr3t4_Y3rb4sBu3n4s_2026!'; 

    public function generarToken($data) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'iat' => time(),
            'exp' => time() + (60 * 60 * 8), // Expira en 8 horas
            'data' => $data // Aquí va el ID y ROL del usuario
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
}
?>
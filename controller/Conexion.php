<?php

class Conexion {

    private $host = "localhost";

    private $db   = "bdmaquetaauditoria";

    private $user = "root";

    private $pass = "";

    private $charset = "utf8mb4";



    public function conectar() {

        try {

            $conexion = "mysql:host=" . $this->host . ";dbname=" . $this->db . ";charset=" . $this->charset;

            $options = [

                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,

                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

                PDO::ATTR_EMULATE_PREPARES   => false,

            ];

            return new PDO($conexion, $this->user, $this->pass, $options);

        } catch (PDOException $e) {

            print_r('Error conexión: ' . $e->getMessage());

        }

    }

}

?>
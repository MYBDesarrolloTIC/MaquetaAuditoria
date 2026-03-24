-- =========================================================================
-- 1. LIMPIEZA TOTAL (En orden inverso de dependencias para evitar errores)
-- =========================================================================
DROP TABLE IF EXISTS historial_derivaciones;
DROP TABLE IF EXISTS derivaciones;
DROP TABLE IF EXISTS historial;
DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS ciudadanos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS estado_auditoria;

-- =========================================================================
-- 2. TABLAS CATÁLOGO (Sin dependencias)
-- =========================================================================

-- Estados posibles de una solicitud
CREATE TABLE estado_auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);
INSERT INTO estado_auditoria (nombre) VALUES 
('Pendiente'), 
('Completada'), 
('No Completada'),
('Derivada');

-- Roles del sistema municipal
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
);
INSERT INTO roles (nombre) VALUES 
('admin'),
('alcalde'),
('secretaria'),
('director');

-- =========================================================================
-- 3. DIRECTORIO DE CIUDADANOS (Expandido con los nuevos datos del Frontend)
-- =========================================================================
CREATE TABLE ciudadanos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(15) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    nombres VARCHAR(100) DEFAULT NULL,
    apellido_p VARCHAR(100) DEFAULT NULL, 
    apellido_m VARCHAR(100) DEFAULT NULL, 
    fecha_nacimiento DATE DEFAULT NULL,
    telefono VARCHAR(50) DEFAULT NULL,
    correo VARCHAR(100) DEFAULT NULL,
    sector VARCHAR(100) DEFAULT NULL,
    direccion VARCHAR(255) DEFAULT NULL,
    discapacidad VARCHAR(255) DEFAULT 'Ninguna'
);

-- =========================================================================
-- 4. TABLA DE USUARIOS DEL SISTEMA
-- =========================================================================
CREATE TABLE usuarios ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    estado INT DEFAULT 1,
    FOREIGN KEY (id_rol) REFERENCES roles(id)
);

-- Usuario Administrador por defecto (password: admin123)
INSERT INTO usuarios (nombre, login, password, id_rol, estado) 
VALUES ('Administrador', 'admin', '$2y$10$g8irZnlC2vceeOfY.1ArFuSs1YKwCfaTxakr84uy7iJdfqQ3bLSne', 1, 1);

-- =========================================================================
-- 5. TABLAS DE FLUJO PRINCIPAL (Auditorías e Historial)
-- =========================================================================

-- Bandeja de Entrada Activa (Solo pendientes y derivadas)
CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    id_ciudadano INT NOT NULL,
    motivo TEXT NOT NULL,
    id_estado INT NOT NULL,
    id_usuario INT NOT NULL, 
    FOREIGN KEY (id_ciudadano) REFERENCES ciudadanos(id),
    FOREIGN KEY (id_estado) REFERENCES estado_auditoria(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- Archivo Histórico (Solo completadas o rechazadas)
CREATE TABLE historial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    id_ciudadano INT NOT NULL,
    motivo TEXT NOT NULL,
    resolucion TEXT NOT NULL,
    id_estado INT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_ciudadano) REFERENCES ciudadanos(id),
    FOREIGN KEY (id_estado) REFERENCES estado_auditoria(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- =========================================================================
-- 6. TABLAS INTERMEDIAS (Lógica de Derivaciones)
-- =========================================================================

-- Derivaciones Activas (Solo existen mientras la auditoría está derivada a un director)
CREATE TABLE derivaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_auditoria INT NOT NULL,
    id_director INT NOT NULL,
    comentario_alcalde TEXT NOT NULL,
    FOREIGN KEY (id_auditoria) REFERENCES auditoria(id) ON DELETE CASCADE,
    FOREIGN KEY (id_director) REFERENCES usuarios(id)
);

-- Historial de Derivaciones (Mantiene el registro de qué director resolvió qué cosa)
CREATE TABLE historial_derivaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT NOT NULL,
    id_director INT NOT NULL,
    comentario_alcalde TEXT NOT NULL,
    FOREIGN KEY (id_historial) REFERENCES historial(id) ON DELETE CASCADE,
    FOREIGN KEY (id_director) REFERENCES usuarios(id)
);
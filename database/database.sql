-- Eliminar tablas en orden correcto (por dependencias)
DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS estado_auditoria;

-- Crear tablas base
CREATE TABLE estado_auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE roles(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
);

-- Insertar roles (ANTES de usarlos)
INSERT INTO roles (nombre) VALUES 
('admin'),
('alcalde'),
('secretaria');

-- Crear usuarios
CREATE TABLE usuarios ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    estado INT DEFAULT 1,
    FOREIGN KEY (id_rol) REFERENCES roles(id)
);

-- Usuario de prueba(password: admin123)
INSERT INTO usuarios (nombre, login, password, id_rol, estado) 
VALUES ('Administrador', 'admin', '$2y$10$7rls9m.7v8n2H6W8U/5bu.H8tF6p6f1.3g7p6k5l4m3n2o1p2q3r', 1, 1);

-- Crear auditoría
CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    nombre_solicitante VARCHAR(255) NOT NULL,
    rut_solicitante INT NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    id_estado INT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_estado) REFERENCES estado_auditoria(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE historial(
	id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    nombre_solicitante VARCHAR(255) NOT NULL,
    rut_solicitante INT NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    id_estado INT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_estado) REFERENCES estado_auditoria(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);
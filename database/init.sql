CREATE DATABASE IF NOT EXISTS sportreserve_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sportreserve_db;

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('DEPORTISTA', 'ADMIN', 'ENTRENADOR') DEFAULT 'DEPORTISTA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabla de Espacios Deportivos
CREATE TABLE IF NOT EXISTS spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('CANCHA', 'SALON', 'ZONA_PESAS') NOT NULL,
    capacity INT DEFAULT 10,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabla de Reservas
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    space_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_space FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Datos de prueba (Semilla inicial)
-- Nota: La contraseña de prueba encriptada corresponde a "123456" con bcrypt
INSERT INTO users (name, email, password, role) VALUES
('Admin Sistema', 'admin@sportreserve.com', '$2b$10$w8u7eM3GjQh8Zk/XoK8Fye.ZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'ADMIN'),
('Carlos Perez', 'carlos@sportreserve.com', '$2b$10$w8u7eM3GjQh8Zk/XoK8Fye.ZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'DEPORTISTA'),
('Entrenador Laura', 'laura@sportreserve.com', '$2b$10$w8u7eM3GjQh8Zk/XoK8Fye.ZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'ENTRENADOR');

INSERT INTO spaces (name, type, capacity, is_active) VALUES
('Cancha Sintética de Fútbol 5', 'CANCHA', 10, 1),
('Cancha de Tenis 1', 'CANCHA', 4, 1),
('Salón de Spinning', 'SALON', 20, 1);
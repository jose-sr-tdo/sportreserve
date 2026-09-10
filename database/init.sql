-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-09-2026 a las 22:52:19
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sportreserve_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `space_id` int(11) NOT NULL,
  `reservation_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('CONFIRMED','CANCELLED') DEFAULT 'CONFIRMED',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reservations`
--

INSERT INTO `reservations` (`id`, `user_id`, `space_id`, `reservation_date`, `start_time`, `end_time`, `status`, `created_at`) VALUES
(1, 4, 1, '2026-09-15', '08:00:00', '09:00:00', 'CONFIRMED', '2026-09-10 20:39:37'),
(2, 4, 1, '2026-09-15', '09:00:00', '10:00:00', 'CONFIRMED', '2026-09-10 20:44:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `spaces`
--

CREATE TABLE `spaces` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('CANCHA','SALON','ZONA_PESAS') NOT NULL,
  `capacity` int(11) DEFAULT 10,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `spaces`
--

INSERT INTO `spaces` (`id`, `name`, `type`, `capacity`, `is_active`, `created_at`) VALUES
(1, 'Cancha Sintética de Fútbol 5', 'CANCHA', 10, 1, '2026-09-10 17:02:07'),
(2, 'Cancha de Tenis 1', 'CANCHA', 4, 1, '2026-09-10 17:02:07'),
(3, 'Salón de Spinning', 'SALON', 20, 1, '2026-09-10 17:02:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('DEPORTISTA','ADMIN','ENTRENADOR') DEFAULT 'DEPORTISTA',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Admin Sistema', 'admin@sportreserve.com', '$2b$10$w8u7eM3GjQh8Zk/XoK8Fye.ZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'ADMIN', '2026-09-10 17:02:07'),
(2, 'Carlos Perez', 'carlos@sportreserve.com', '$2b$10$w8u7eM3GjQh8Zk/XoK8Fye.ZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'DEPORTISTA', '2026-09-10 17:02:07'),
(3, 'Entrenador Laura', 'laura@sportreserve.com', '$2b$10$w8u7eM3GjQh8Zk/XoK8Fye.ZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'ENTRENADOR', '2026-09-10 17:02:07'),
(4, 'Juan Perez', 'juan@example.com', '$2b$10$F6IPbafzdKl.L3Ibr/wzHur0swCwb6U3dtOsmiZm3mPzCf3/EH.d.', 'DEPORTISTA', '2026-09-10 20:15:01');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reservation_user` (`user_id`),
  ADD KEY `fk_reservation_space` (`space_id`);

--
-- Indices de la tabla `spaces`
--
ALTER TABLE `spaces`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `spaces`
--
ALTER TABLE `spaces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `fk_reservation_space` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reservation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

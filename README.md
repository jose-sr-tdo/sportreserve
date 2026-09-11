# SportReserve — Sistema de Reservas para Espacios Deportivos

Plataforma web modular desarrollada para la gestión y reserva de espacios deportivos (canchas y salones), con control estricto de concurrencia y prevención de colisiones horarias. Proyecto académico desarrollado para el curso de **Arquitectura de Software** (Ingeniería de Software).

---

## 🌐 Enlaces del Proyecto Desplegado

* **Frontend en Producción:** [https://temporal.jsro.site](https://temporal.jsro.site)
* **Backend API (Render):** [https://sportreserve-api-s2ni.onrender.com/api/health](https://sportreserve-api-s2ni.onrender.com/api/health)

---

## 📐 Decisiones Arquitectónicas

### 1. Estilo Arquitectónico: Monolito Modular por Capas (Layered Architecture)
Se implementó una arquitectura en capas tradicional con separación estricta de responsabilidades para garantizar mantenibilidad, bajo acoplamiento y alta cohesión:

* **Capa de Presentación / API:** Controladores REST en Express que gestionan peticiones HTTP, códigos de estado y serialización JSON.
* **Capa de Lógica de Negocio (Services):** Orquestación de casos de uso, validación de reglas temporales y manejo de transacciones ACID.
* **Capa de Acceso a Datos (Repositories):** Aislamiento de consultas SQL a MySQL sin acoplar la lógica de negocio al motor de base de datos.
* **Capa de Base de Datos:** Motor relacional MySQL con transacciones explícitas.

### 2. Control de Concurrencia y Consistencia (Anti Double-Booking)
La prevención de solapamientos de reservas se resuelve en dos niveles:
1. **Validación Lógica:** Comprobación de intersección de rangos temporales:
   `(start_time < endTime AND end_time > startTime)` para un espacio y fecha específicos con estado `CONFIRMED`.
2. **Aislamiento Transaccional:** Se utiliza una conexión dedicada del Pool ejecutando `START TRANSACTION`, validación de colisión, inserción y `COMMIT` (con `ROLLBACK` automático ante cualquier excepción o conflicto HTTP 409).

---

## 🧩 Patrones de Diseño Implementados

1. **Repository (Estructural / Datos):**
   * *Problema:* Evitar que los controladores o servicios dependan directamente de sentencias SQL.
   * *Ubicación:* `backend/src/repositories/` (`userRepository.js`, `spaceRepository.js`, `reservationRepository.js`).
   * *Ventaja:* Facilita la mantenibilidad y desacopla el motor relacional de la lógica de negocio.

2. **Factory (Creacional):**
   * *Problema:* Construcción homogénea y controlada de notificaciones para diferentes eventos.
   * *Ubicación:* `backend/src/patterns/notificationFactory.js`.
   * *Ventaja:* Centraliza la creación de los objetos de notificación (`CONFIRMATION`, `CANCELLATION`) sin dispersar lógica condicional en la aplicación.

3. **Observer (Comportamiento):**
   * *Problema:* El motor de reservas debe notificar a usuarios y generar logs sin acoplarse al canal de envío.
   * *Ubicación:* `backend/src/patterns/eventEmitter.js`.
   * *Ventaja:* Principio Abierto/Cerrado (OCP). Permite añadir nuevos suscriptores (email real, SMS, auditoría) sin alterar el servicio de reservas.

---

## 🛠️ Stack Tecnológico

* **Backend:** Node.js (v24), Express 4, JWT, bcrypt, mysql2.
* **Base de Datos:** MySQL 8.0 (Alojada en Hostinger y compatible con XAMPP local).
* **Frontend:** Single Page Application (SPA) con HTML5, Bootstrap 5 y Vue 3 (vía CDN).
* **Despliegue Cloud:** Render (Web Service para Node.js) + Hostinger (MySQL Remoto y hosting estático).

---

## 📁 Estructura del Repositorio

```text
sportreserve/
├── backend/
│   ├── src/
│   │   ├── config/          # Pool de conexiones MySQL
│   │   ├── controllers/     # Controladores HTTP (Auth, Booking, Spaces)
│   │   ├── services/        # Lógica de negocio y control transaccional
│   │   ├── repositories/    # Patrón Repository (Consultas SQL)
│   │   ├── patterns/        # Patrones Factory y Observer
│   │   ├── middlewares/     # Validación JWT y control de roles
│   │   └── index.js         # Entrada del servidor Express
│   ├── .env.example         # Plantilla de variables de entorno
│   └── package.json
├── frontend/
│   └── index.html           # SPA con Bootstrap 5 y Vue 3 CDN
├── database/
│   └── init.sql             # Script DDL y datos iniciales de prueba
├── docs/                    # Diagramas UML y documentación técnica
└── README.md

# 🏥 Sistema de Monitoreo Hospitalario - HUSRT

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

Una plataforma robusta y escalable diseñada para el monitoreo en tiempo real de infraestructura hospitalaria. Este sistema utiliza una arquitectura de **Microservicios** para gestionar dispositivos, ubicaciones, métricas y alertas, garantizando alta disponibilidad y seguridad mediante un sistema de control de acceso basado en roles (RBAC).

---

## 🏗️ Arquitectura del Sistema

El proyecto está compuesto por 8 microservicios orquestados con **Docker Compose**:

| Servicio | Responsabilidad | Ubicación |
| :--- | :--- | :--- |
| **`gateway`** | Punto de entrada único. Gestiona la seguridad y el ruteo. | `apps/gateway` |
| **`auth-service`** | Gestión de usuarios, sesiones JWT y sistema de roles. | `services/auth-service` |
| **`frontend`** | Interfaz de usuario moderna construida con React y Vite. | `apps/frontend` |
| **`users-service`** | Gestión de perfiles y personal médico. | `services/users-service` |
| **`devices-service`** | Control de inventario de dispositivos hospitalarios. | `services/devices-service` |
| **`locations-service`** | Gestión de sedes, pisos y salas del hospital. | `services/locations-service` |
| **`metrics-service`** | Procesamiento de datos y estadísticas en tiempo real. | `services/metrics-service` |
| **`alerts-service`** | Sistema de notificaciones y gestión de estados críticos. | `services/alerts-service` |
| **`db`** | Base de datos centralizada PostgreSQL 15. | Docker Image |

---

## 🔐 Control de Acceso (RBAC)

El sistema implementa una jerarquía de seguridad avanzada para proteger la información sensible:

*   **Administrador:** Acceso total, gestión de cuentas y aprobación de cambios de rol.
*   **Operador:** Gestión operativa de dispositivos, ubicaciones y alertas.
*   **Visor (Default):** Acceso de solo lectura a dashboard y métricas.

> [!TIP]
> **Superusuario por defecto:**
> - **Email:** `admin@husrt.com`
> - **Password:** `admin123`

---

## 🚀 Inicio Rápido

Para desplegar todo el ecosistema de microservicios, asegúrate de tener instalado **Docker** y **Docker Compose**, luego ejecuta:

```bash
# Clonar el repositorio
git clone https://github.com/owners06/Sistema-de-Monitoreo_HUSRT.git

# Entrar al directorio
cd Sistema-de-Monitoreo_HUSRT

# Levantar todos los servicios
docker-compose up -d --build
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 👥 Colaboradores

Este proyecto ha sido desarrollado con dedicación por:

*   **Camilo PG** - [@Camilo-PG7](https://github.com/Camilo-PG7)
*   **Juan Dueñas**
*   **Vanesa**

---

## 📝 Licencia
Este proyecto es de uso académico y profesional para el entorno hospitalario HUSRT.
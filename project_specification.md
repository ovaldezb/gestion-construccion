# Especificación del Proyecto - Sistema de Gestión de Constructora

## 1. Visión General del Proyecto
Desarrollo de un sistema integral para la gestión de recursos en obras de construcción. El sistema permitirá el control de asistencia de personal, inventario de herramientas (incluyendo vehículos) y gestión de materiales de almacén, diferenciando flujos de trabajo entre administradores y supervisores en sitio.

## 2. Actores y Permisos
### 2.1 Administrador
*   **Responsabilidades:** Configuración global del sistema.
*   **Capacidades:**
    *   Gestión de **Locaciones**.
    *   Alta de **Supervisores** y asignación a una Locación específica.
    *   Alta de **Productos** (Catálogo de Materiales).
    *   Registro de **Entrada de Material** (Abastecimiento de Almacén).
    *   Registro de **Salida de Material** (Envío a locaciones).

### 2.2 Supervisor
*   **Responsabilidades:** Operación diaria en la locación asignada.
*   **Capacidades:**
    *   Alta de **Obreros/Empleados** (Generación de QR).
    *   Toma de **Asistencia** (Entrada/Salida) mediante escaneo de QR de obreros.
    *   Registro de **Préstamo/Devolución de Herramientas** mediante escaneo de QR de herramientas.
    *   Registro de comentarios sobre el estado de las herramientas al recibirlas.

### 2.3 Obrero (Empleado)
*   **Rol Pasivo:** No interactúa directamente con la App.
*   **Características:**
    *   Posee un código QR único generado a partir de su ID de MongoDB con el formato `employee/{_id}`.
    *   Tipos: **Fijo** (una sola locación) o **Itinerante** (múltiples obras).

## 3. Módulos Funcionales

### 3.1 Gestión de Personal (Obreros)
*   **Datos:** ID Único, Nombre, Apellidos, Tipo (Fijo/Itinerante), Locación Base (si es fijo).
*   **Funcionalidad Clave:** Generación de imagen QR al dar de alta (contenido: `employee/{_id}`). Esta imagen debe ser exportable para compartir (WhatsApp/Impresión).
*   **Lógica de Negocio:** Validación de unicidad del empleado.

### 3.2 Control de Asistencia
*   **Mecanismo:** Escaneo de QR del empleado (formato `employee/{_id}`) por parte del Supervisor.
*   **Datos Registrados:** Empleado, Supervisor, Locación, Fecha/Hora, Tipo (Entrada/Salida).

### 3.3 Gestión de Herramientas (Activos Fijos)
*   **Alcance:** Herramientas menores, maquinaria y vehículos (autos/camionetas).
*   **Datos:** ID Único (MongoDB `_id`), Descripción, Tipo, Estado.
*   **QR:** Formato `tool/{_id}`.
*   **Flujo de Préstamo:**
    1.  Supervisor selecciona acción (Salida/Préstamo).
    2.  Escanea QR Herramienta.
    3.  Asigna a Empleado (Escaneo QR Empleado o selección - *A definir si el préstamo es personal*).
*   **Flujo de Devolución:**
    1.  Supervisor selecciona acción (Entrada/Devolución).
    2.  Escanea QR Herramienta.
    3.  Ingresa comentario obligatorio/opcional sobre el estado (ej: "Se recibió con el mango roto").

### 3.4 Gestión de Materiales (Consumibles)
*   **Control de Stock:** Centralizado.
*   **Entradas:** Admin registra ingreso de proveedores. Aumenta Stock Global.
*   **Salidas:** Admin registra envío a una Locación. Disminuye Stock Global.
*   **Catálogo:** Funcionalidad para dar de alta nuevos productos desde cero si no existen.

## 4. Arquitectura Técnica

### 4.1 Stack Tecnológico
*   **Frontend (Móvil):** Flutter (Dart).
*   **Backend:** AWS Lambda con TypeScript (Node.js).
*   **Base de Datos:** MongoDB (MongoDB Atlas).
*   **Autenticación:** Amazon Cognito (User Pools).
*   **Infraestructura:** AWS API Gateway, Serverless Framework / AWS CDK.

### 4.2 Automatización y Calidad (DevOps)
*   **Repositorio:** Git (GitHub).
*   **CI/CD:** GitHub Actions.
    *   **Branches:** `master` (Prod con aprobación manual), `develop` (Staging/Dev).
*   **Calidad de Código:** SonarQube / SonarCloud integrado en el pipeline.
*   **Testing:** Jest (Backend), Flutter Test (Frontend). Cobertura de pruebas unitarias e integración.
*   **Diseño:** Principios SOLID obligatorios.

## 5. Análisis de Base de Datos y Sugerencias

### 5.1 Revisión del Esquema Propuesto
El esquema gráfico es un buen punto de partida. Para MongoDB, sugiero las siguientes adaptaciones para aprovechar su naturaleza documental y evitar 'joins' excesivos, manteniendo la integridad referencial:

1.  **Colección `Empleados`:**
    *   Agregar campo `qrUrl`: String (URL a S3 donde se guarda la imagen del QR).
    *   Indexar `idLocacion` para búsquedas rápidas de personal por obra.

2.  **Colección `ToolRecord` (Historial):**
    *   Este esquema está diseñado como un "Log de Eventos". Es correcto para auditoría.
    *   **Sugerencia:** Agregar un campo `estadoHerramienta` (Enum: Bueno, Reparación, Dañado) en el registro de devolución.
    *   **Mejora de Performance:** Si la consulta frecuente es "¿Dónde está la herramienta X ahora?", sugiero **desnormalizar** el estado actual dentro de la colección `Herramienta` (ej: campo `currentHolder: idEmpleado` y `status: 'PRESTADO' | 'DISPONIBLE'`). El `ToolRecord` queda como histórico.

3.  **Colección `RegistroMateriales`:**
    *   Correcto. Asegurar que las operaciones de stock usen `$inc` (operador atómico de Mongo) para evitar condiciones de carrera si dos admins registran material simultáneamente.

### 5.2 Sugerencias de Performance y Optimización

1.  **Soporte Offline (Crítico para Construcción):**
    *   Las obras a menudo tienen mala señal. La App Flutter debería usar una base de datos local (ej: **Hive** o **SQLite**) para "encolar" los registros de asistencia y movimientos.
    *   Implementar un "Worker" en background en Flutter que sincronice con la API Lambda cuando recupere conexión.

2.  **Generación de QRs:**
    *   **Backend:** Recomiendo generar los QRs en una Lambda al crear el registro y guardar la imagen en **AWS S3**. Guardar la URL pública en MongoDB. Esto asegura que el código QR siempre sea el mismo independientemente del dispositivo que lo consulte.

3.  **Optimización de Consultas (Populate vs Lookup):**
    *   En Mongoose (TypeScript), usar `populate` es cómodo, pero para reportes masivos (ej: "Asistencia de todo el mes"), es mejor usar `aggregate` con `$lookup` en la base de datos para no traer miles de documentos a la memoria de la Lambda y unirlos ahí.

4.  **AWS Lambda Cold Starts:**
    *   Usar herramientas de bundling como **esbuild** (incluido en Serverless Framework v3/v4) para minificar el código y reducir el tiempo de arranque.
    *   Mantener la conexión a MongoDB fuera del `handler` de la Lambda para aprovechar la reutilización de contenedores (database connection pooling).

5.  **Cognito Custom Attributes:**
    *   Guardar el `role` (Admin/Supervisor) y `locationId` dentro de los "Custom Attributes" de Cognito. Así, la Lambda puede saber quién hace la petición y desde dónde, simplemente leyendo el Token JWT, sin tener que consultar la colección de Usuarios en cada petición.

## 6. Siguientes Pasos
1.  Inicializar Repositorio y configuración de Serverless.
2.  Definir Modelos Mongoose (Interface Definition).
3.  Configurar Cognito User Pools y Grupos.

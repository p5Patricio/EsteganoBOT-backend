# 🕵️‍♂️ EsteganoBot Backend

API robusta y segura para el procesamiento de esteganografía, permitiendo ocultar y revelar mensajes secretos en imágenes PNG y JPEG.

## 🚀 Características

- **Esteganografía Segura:** Implementación basada en la librería `steggy`.
- **Protección con Contraseña:** Soporte para cifrado opcional de mensajes ocultos.
- **Validación Estricta:** Verificación de tipos MIME, extensiones y *Magic Bytes* para prevenir inyecciones de archivos maliciosos.
- **Resiliencia en Producción:**
  - Sanitización de errores para evitar fugas de información.
  - Limpieza automática programada de archivos temporales en `/uploads`.
  - Rate Limiting y Headers de seguridad vía `helmet`.
- **Arquitectura Limpia:** Separación clara entre rutas, controladores, servicios y middleware.

## 🛠️ Tecnologías

- **Node.js** & **Express**
- **Multer:** Gestión de subida de archivos.
- **Steggy:** Motor de esteganografía.
- **Jest:** Suite de pruebas con alta cobertura.
- **Helmet & CORS:** Seguridad en headers y control de origen.

## 📥 Instalación

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno (ver `.env.example`):
   ```bash
   cp .env.example .env
   ```

## 🧪 Pruebas

Ejecutar la suite completa de tests unitarios y de integración:
```bash
npm test
```

## 🛡️ Seguridad

Este backend ha sido auditado para producción:
- Los errores 500 están sanitizados.
- Máximo tamaño de archivo configurable (default 5MB).
- Limpieza de disco automática para evitar ataques de denegación de servicio por almacenamiento.

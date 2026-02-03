# 🧩 Sistema Web - Taller de Analítica Empresarial

Sistema web responsive para gestionar el taller "De decisiones a preguntas: ¿qué necesitamos saber para dirigir mejor el negocio?"

## 📋 Características

- ✅ **4 Módulos del Taller:**
  - Mapa de Decisiones Clave
  - Preguntas Críticas del Negocio
  - Fricciones de Información
  - Votación Ejecutiva

- ✅ **Funcionalidades:**
  - Múltiples gerentes pueden participar simultáneamente
  - Diseño responsive (mobile-first)
  - Dashboard con gráficos en tiempo real
  - Consolidación de preguntas más votadas
  - Almacenamiento en base de datos MySQL

## 🚀 Instalación

### Requisitos Previos
- Node.js v14 o superior
- SQL Server (acceso al servidor remoto configurado)

### Pasos de Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar la base de datos:**

Ejecutar el script SQL para crear la base de datos y tablas en SQL Server:
- Abrir SQL Server Management Studio (SSMS)
- Conectarse al servidor: `162.248.53.192`
- Usuario: `IdentyWebUser`
- Ejecutar el archivo `database-sqlserver.sql`

3. **Verificar configuración:**

El archivo `server-sqlserver.js` ya contiene las credenciales de conexión:
- Servidor: 162.248.53.192
- Usuario: IdentyWebUser
- Base de datos: taller_analitica
- Puerto: 1433 (por defecto SQL Server)

4. **Iniciar el servidor:**

**Para SQL Server (Producción):**
```bash
node server-sqlserver.js
```

**Para SQLite (Desarrollo Local):**
```bash
node server-sqlite.js
```

5. **Acceder a la aplicación:**

Abrir el navegador en: `http://localhost:3000`

## 📱 Uso del Sistema

### Para Participantes:

1. **Registro Inicial:**
   - Ingresar nombre completo, área/gerencia y email
   - Hacer clic en "Comenzar Taller"

2. **Módulo 1 - Mapa de Decisiones:**
   - Registrar máximo 3 decisiones clave
   - Especificar frecuencia e impacto
   - Usar lenguaje simple y directo

3. **Módulo 2 - Preguntas Críticas:**
   - Formular preguntas en lenguaje natural
   - Relacionar con decisiones específicas
   - Evitar KPIs, fórmulas o tablas

4. **Módulo 3 - Fricciones:**
   - Identificar problemas con la información actual
   - Describir situación y consecuencias
   - Enfoque en mejora, no en culpables

5. **Módulo 4 - Votación:**
   - 3 votos de impacto (🔵)
   - 2 votos de urgencia (🔴)
   - Votar por las preguntas más importantes

6. **Dashboard:**
   - Ver estadísticas generales
   - Gráficos de distribución
   - Top 10 preguntas más votadas

## 🗄️ Estructura de la Base de Datos

- **gerentes:** Participantes del taller
- **decisiones:** Decisiones clave registradas
- **preguntas_criticas:** Preguntas del negocio
- **fricciones:** Problemas de información
- **votaciones:** Votos de impacto y urgencia
- **sesiones_taller:** Control de sesiones

## 🔧 Tecnologías Utilizadas

- **Backend:** Node.js + Express
- **Base de Datos:** SQL Server (Producción) / SQLite (Desarrollo)
- **Frontend:** HTML5 + CSS3 + JavaScript (Vanilla)
- **Gráficos:** Chart.js
- **Arquitectura:** Monolito

## 📊 API Endpoints

### Gerentes
- `POST /api/gerentes` - Registrar participante
- `GET /api/gerentes` - Listar participantes

### Decisiones
- `POST /api/decisiones` - Crear decisión
- `GET /api/decisiones` - Listar decisiones

### Preguntas Críticas
- `POST /api/preguntas-criticas` - Crear pregunta
- `GET /api/preguntas-criticas` - Listar preguntas

### Fricciones
- `POST /api/fricciones` - Crear fricción
- `GET /api/fricciones` - Listar fricciones

### Votaciones
- `POST /api/votaciones` - Registrar voto
- `DELETE /api/votaciones/:gerenteId/:preguntaId/:tipoVoto` - Eliminar voto
- `GET /api/votaciones/resumen` - Resumen de votaciones
- `GET /api/votaciones/gerente/:gerenteId` - Votos de un gerente

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales

## 🎨 Responsive Design

El sistema está optimizado para:
- 📱 Móviles (320px+)
- 📱 Tablets (640px+)
- 💻 Desktop (1024px+)

## 🔒 Seguridad

- Validación de datos en cliente y servidor
- Prepared statements para prevenir SQL injection
- CORS habilitado para desarrollo
- Sanitización de inputs

## 📝 Notas Importantes

- Los datos se almacenan en tiempo real
- Múltiples usuarios pueden trabajar simultáneamente
- El sistema mantiene la sesión del usuario en localStorage
- Los votos son únicos por gerente y pregunta

## 🐛 Troubleshooting

**Error de conexión a SQL Server:**
- Verificar que el servidor SQL Server en `162.248.53.192` esté activo
- Confirmar credenciales en `server-sqlserver.js`
- Revisar firewall y permisos de red (puerto 1433)
- Verificar que la base de datos `taller_analitica` exista
- Si no puedes conectar, usa `server-sqlite.js` para desarrollo local

**Puerto 3000 en uso:**
- Cambiar el puerto en el archivo del servidor (variable PORT)
- O detener el proceso que usa el puerto 3000

**Gráficos no se muestran:**
- Verificar conexión a internet (Chart.js se carga desde CDN)
- Revisar consola del navegador para errores

**Timeout de conexión:**
- El servidor SQL Server puede tardar en responder
- Aumentar `connectTimeout` en la configuración si es necesario

## 👥 Soporte

Para soporte técnico o preguntas sobre el sistema, contactar al equipo de desarrollo.

---

**Desarrollado para Massy Group - Taller de Analítica 2026**

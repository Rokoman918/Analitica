# 📋 Instrucciones para Configurar SQL Server

## ⚠️ Estado Actual

El sistema está intentando conectarse a SQL Server pero está recibiendo el error:
```
Login failed for user 'IdentyWebUser'
```

## 🔧 Pasos para Resolver

### Opción 1: Verificar y Corregir Credenciales

1. **Confirma las credenciales correctas del servidor SQL Server:**
   - Servidor: `162.248.53.192`
   - Usuario: ¿Es correcto `IdentyWebUser`?
   - Contraseña: ¿Es correcta `Tatiana2006`?
   - Puerto: `1433` (por defecto)

2. **Edita el archivo `config-sqlserver.js` con las credenciales correctas:**
   ```javascript
   module.exports = {
       server: '162.248.53.192',
       user: 'TU_USUARIO_CORRECTO',
       password: 'TU_PASSWORD_CORRECTO',
       database: 'taller_analitica',
       port: 1433,
       // ... resto de la configuración
   };
   ```

### Opción 2: Verificar Permisos en SQL Server

El usuario debe tener permisos para:
- Conectarse al servidor SQL Server
- Acceder a la base de datos `taller_analitica`
- Crear tablas (si la BD no existe)
- Ejecutar operaciones INSERT, SELECT, UPDATE, DELETE

**Comandos SQL para verificar/otorgar permisos:**

```sql
-- Verificar si el usuario existe
SELECT name FROM sys.server_principals WHERE name = 'IdentyWebUser';

-- Otorgar permisos a la base de datos
USE taller_analitica;
GO

-- Crear usuario en la base de datos si no existe
CREATE USER IdentyWebUser FOR LOGIN IdentyWebUser;
GO

-- Otorgar permisos
ALTER ROLE db_datareader ADD MEMBER IdentyWebUser;
ALTER ROLE db_datawriter ADD MEMBER IdentyWebUser;
ALTER ROLE db_ddladmin ADD MEMBER IdentyWebUser;
GO
```

### Opción 3: Crear la Base de Datos Manualmente

1. **Conectarse a SQL Server con SQL Server Management Studio (SSMS)**
2. **Ejecutar el script `database-sqlserver.sql`**
3. **Verificar que las tablas se crearon correctamente:**
   ```sql
   USE taller_analitica;
   GO
   
   SELECT TABLE_NAME 
   FROM INFORMATION_SCHEMA.TABLES 
   WHERE TABLE_TYPE = 'BASE TABLE';
   ```

### Opción 4: Usar SQLite para Desarrollo Local

Si no tienes acceso inmediato a SQL Server, puedes usar la versión SQLite:

```bash
node server-sqlite.js
```

Esta versión funciona completamente sin necesidad de servidor SQL Server.

## 🔍 Diagnóstico de Problemas Comunes

### Error: "Login failed for user"
- **Causa:** Credenciales incorrectas o usuario sin permisos
- **Solución:** Verificar usuario/contraseña y permisos en SQL Server

### Error: "Cannot open database"
- **Causa:** La base de datos `taller_analitica` no existe
- **Solución:** Ejecutar el script `database-sqlserver.sql`

### Error: "Connection timeout"
- **Causa:** Firewall bloqueando puerto 1433 o servidor inaccesible
- **Solución:** Verificar conectividad de red y firewall

### Error: "SSL/TLS error"
- **Causa:** Problemas con certificados SSL
- **Solución:** Ya está configurado `encrypt: false` y `trustServerCertificate: true`

## 🚀 Una vez configurado correctamente

```bash
# Iniciar el servidor con SQL Server
node server-sqlserver.js

# Deberías ver:
# ✅ Conexión exitosa a SQL Server
# 📊 Base de datos: taller_analitica
# 🚀 Servidor corriendo en http://localhost:3000
```

## 📞 Información Necesaria

Para ayudarte mejor, necesito confirmar:

1. ¿Cuál es el usuario correcto de SQL Server?
2. ¿Cuál es la contraseña correcta?
3. ¿La base de datos `taller_analitica` ya existe o hay que crearla?
4. ¿Tienes acceso a SQL Server Management Studio para ejecutar el script?
5. ¿Prefieres usar SQLite mientras se resuelve el acceso a SQL Server?

## 💡 Recomendación

**Para empezar a trabajar inmediatamente:**
```bash
node server-sqlite.js
```

Esto te permitirá probar todo el sistema mientras se configuran las credenciales correctas de SQL Server. Los datos se pueden migrar después.

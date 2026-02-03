# 🚀 Guía de Despliegue en Render.com (GRATIS)

## 📋 Requisitos Previos

1. Cuenta en GitHub (gratis)
2. Cuenta en Render.com (gratis)
3. Tu base de datos SQL Server ya está funcionando en `162.248.53.192`

---

## 🔧 Paso 1: Preparar el Repositorio en GitHub

### 1.1 Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `taller-analitica-massy`
3. Descripción: "Sistema web para taller de decisiones empresariales"
4. Selecciona: **Privado** (para proteger tus credenciales)
5. Click en **"Create repository"**

### 1.2 Subir el código a GitHub

Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit - Sistema Taller Analítica"

# Conectar con tu repositorio de GitHub
git remote add origin https://github.com/TU_USUARIO/taller-analitica-massy.git

# Subir el código
git branch -M main
git push -u origin main
```

**⚠️ IMPORTANTE:** Asegúrate de que el archivo `.gitignore` contenga:
```
node_modules/
.env
*.db
npm-debug.log
.DS_Store
*.log
```

---

## 🌐 Paso 2: Desplegar en Render.com

### 2.1 Crear cuenta en Render

1. Ve a https://render.com
2. Click en **"Get Started"**
3. Regístrate con tu cuenta de GitHub
4. Autoriza a Render para acceder a tus repositorios

### 2.2 Crear nuevo Web Service

1. En el dashboard de Render, click en **"New +"**
2. Selecciona **"Web Service"**
3. Click en **"Connect a repository"**
4. Busca y selecciona: `taller-analitica-massy`
5. Click en **"Connect"**

### 2.3 Configurar el servicio

Completa los siguientes campos:

**Información Básica:**
- **Name:** `taller-analitica-massy`
- **Region:** Selecciona la más cercana (ej: Ohio, USA)
- **Branch:** `main`
- **Root Directory:** (dejar vacío)

**Build & Deploy:**
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Plan:**
- Selecciona: **Free** (gratis)

### 2.4 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega las siguientes variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DB_SERVER` | `162.248.53.192` |
| `DB_USER` | `IdentyWebUser` |
| `DB_PASSWORD` | `Tatiana2006` |
| `DB_NAME` | `taller_analitica` |
| `DB_PORT` | `1433` |
| `DB_ENCRYPT` | `false` |
| `DB_TRUST_CERT` | `true` |

**⚠️ IMPORTANTE:** Estas variables son sensibles. Render las encripta automáticamente.

### 2.5 Desplegar

1. Click en **"Create Web Service"**
2. Render comenzará a:
   - Clonar tu repositorio
   - Instalar dependencias (`npm install`)
   - Iniciar el servidor (`npm start`)
3. Espera 2-5 minutos mientras se despliega

---

## ✅ Paso 3: Verificar el Despliegue

### 3.1 Obtener la URL

Una vez completado el despliegue, Render te dará una URL como:
```
https://taller-analitica-massy.onrender.com
```

### 3.2 Probar el sistema

1. Abre la URL en tu navegador
2. Deberías ver la pantalla de registro/login
3. Crea un usuario de prueba
4. Verifica que puedas:
   - Crear decisiones
   - Crear preguntas
   - Crear fricciones
   - Votar
   - Ver el dashboard

---

## 📱 Paso 4: Compartir con los Participantes

Comparte la URL con todos los gerentes que participarán en el taller:

```
https://taller-analitica-massy.onrender.com
```

**Características del plan gratuito:**
- ✅ Hosting ilimitado
- ✅ SSL/HTTPS automático
- ✅ 750 horas/mes de uso
- ⚠️ El servicio se "duerme" después de 15 minutos de inactividad
- ⚠️ Primera carga puede tardar 30-60 segundos (mientras "despierta")

---

## 🔄 Paso 5: Actualizar el Sistema

Cuando hagas cambios en el código:

```bash
# Hacer cambios en tu código local
# ...

# Guardar cambios
git add .
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main
```

**Render detectará automáticamente los cambios y re-desplegará el sistema.**

---

## 🐛 Solución de Problemas

### El servicio no inicia

1. Ve a **"Logs"** en el dashboard de Render
2. Busca errores de conexión a SQL Server
3. Verifica que las variables de entorno estén correctas

### Error de conexión a SQL Server

Verifica que tu servidor SQL Server:
- Permita conexiones desde IPs externas
- El puerto 1433 esté abierto
- El firewall permita conexiones entrantes

### El sitio está lento

- Es normal en el plan gratuito
- El servicio "despierta" en la primera visita
- Considera actualizar a un plan de pago si necesitas mejor rendimiento

---

## 💡 Alternativas Gratuitas

Si Render no funciona, puedes probar:

1. **Railway.app** - Similar a Render, también gratis
2. **Fly.io** - 3 máquinas virtuales gratis
3. **Vercel** - Mejor para frontend, pero soporta Node.js

---

## 📊 Monitoreo

En el dashboard de Render puedes ver:
- **Logs en tiempo real** - Para debugging
- **Métricas** - CPU, memoria, requests
- **Deploys** - Historial de despliegues
- **Events** - Actividad del servicio

---

## 🎉 ¡Listo!

Tu sistema de Taller de Analítica está ahora disponible en internet de forma gratuita y accesible desde cualquier dispositivo con conexión a internet.

**URL de tu aplicación:**
```
https://taller-analitica-massy.onrender.com
```

**Comparte esta URL con todos los participantes del taller.**

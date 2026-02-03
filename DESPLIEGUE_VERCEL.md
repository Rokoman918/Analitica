# 🚀 Guía de Despliegue en Vercel (GRATIS y MÁS FÁCIL)

## ¿Por qué Vercel?

✅ **Más fácil que Render**  
✅ **Despliegue en 2 minutos**  
✅ **SSL automático**  
✅ **Sin "dormir" el servicio**  
✅ **Dominio personalizado gratis**  
✅ **100% gratis para proyectos personales**

---

## 🚀 Método 1: Despliegue Súper Rápido (CLI)

### Paso 1: Instalar Vercel CLI

Abre la terminal y ejecuta:

```bash
npm install -g vercel
```

### Paso 2: Desplegar

En la carpeta de tu proyecto, ejecuta:

```bash
vercel
```

**Sigue las instrucciones:**

1. **"Set up and deploy?"** → Presiona `Y` (Yes)
2. **"Which scope?"** → Selecciona tu cuenta
3. **"Link to existing project?"** → Presiona `N` (No)
4. **"What's your project's name?"** → `taller-analitica-massy`
5. **"In which directory is your code located?"** → `.` (punto)
6. **"Want to override the settings?"** → Presiona `N` (No)

**¡Listo!** Vercel te dará una URL como:
```
https://taller-analitica-massy.vercel.app
```

### Paso 3: Configurar Variables de Entorno

Ejecuta estos comandos uno por uno:

```bash
vercel env add DB_SERVER
# Escribe: 162.248.53.192

vercel env add DB_USER
# Escribe: IdentyWebUser

vercel env add DB_PASSWORD
# Escribe: Tatiana2006

vercel env add DB_NAME
# Escribe: taller_analitica

vercel env add DB_PORT
# Escribe: 1433

vercel env add DB_ENCRYPT
# Escribe: false

vercel env add DB_TRUST_CERT
# Escribe: true
```

### Paso 4: Re-desplegar con las Variables

```bash
vercel --prod
```

**¡Tu aplicación está en línea!** 🎉

---

## 🌐 Método 2: Despliegue desde GitHub (Interfaz Web)

### Paso 1: Subir a GitHub

```bash
git init
git add .
git commit -m "Preparar para Vercel"
git remote add origin https://github.com/TU_USUARIO/taller-analitica-massy.git
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a https://vercel.com
2. Click en **"Sign Up"** (regístrate con GitHub)
3. Click en **"Add New..."** → **"Project"**
4. Selecciona tu repositorio: `taller-analitica-massy`
5. Click en **"Import"**

### Paso 3: Configurar el Proyecto

**Framework Preset:** Selecciona `Other`

**Build & Development Settings:**
- Build Command: `npm install` (o dejar vacío)
- Output Directory: `public`
- Install Command: `npm install`

### Paso 4: Agregar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

| Name | Value |
|------|-------|
| `DB_SERVER` | `162.248.53.192` |
| `DB_USER` | `IdentyWebUser` |
| `DB_PASSWORD` | `Tatiana2006` |
| `DB_NAME` | `taller_analitica` |
| `DB_PORT` | `1433` |
| `DB_ENCRYPT` | `false` |
| `DB_TRUST_CERT` | `true` |

### Paso 5: Desplegar

1. Click en **"Deploy"**
2. Espera 1-2 minutos
3. ¡Listo! Tu app está en línea

---

## 🔄 Actualizar la Aplicación

### Si usaste CLI:

```bash
# Haz cambios en tu código
# ...

# Re-despliega
vercel --prod
```

### Si usaste GitHub:

```bash
# Haz cambios en tu código
# ...

# Sube a GitHub
git add .
git commit -m "Actualización"
git push origin main
```

**Vercel detecta automáticamente los cambios y re-despliega.**

---

## 📱 Compartir con los Participantes

Tu URL será algo como:

```
https://taller-analitica-massy.vercel.app
```

O puedes configurar un dominio personalizado gratis:

```
https://taller-massy.com
```

---

## ⚡ Ventajas de Vercel vs Render

| Característica | Vercel | Render |
|----------------|--------|--------|
| Velocidad de despliegue | ⚡ 1-2 min | 🐢 3-5 min |
| Se "duerme" el servicio | ❌ No | ✅ Sí (15 min) |
| Primera carga | ⚡ Instantánea | 🐢 30-60 seg |
| Límite de uso | 100 GB/mes | 750 hrs/mes |
| SSL/HTTPS | ✅ Automático | ✅ Automático |
| Dominio personalizado | ✅ Gratis | ✅ Gratis |
| Facilidad de uso | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'mssql'"

Asegúrate de que `package.json` tenga:
```json
"dependencies": {
  "mssql": "^10.0.0"
}
```

### Error de conexión a SQL Server

Verifica que tu servidor SQL Server:
- Permita conexiones desde cualquier IP
- Puerto 1433 esté abierto
- Firewall permita conexiones entrantes

### Ver logs en tiempo real

```bash
vercel logs
```

O en la web: Dashboard → Tu proyecto → "Logs"

---

## 📊 Monitoreo

En el dashboard de Vercel puedes ver:
- **Analytics** - Visitas, rendimiento
- **Logs** - Errores y debugging
- **Deployments** - Historial de despliegues
- **Domains** - Configurar dominios personalizados

---

## 💡 Comandos Útiles

```bash
# Ver tus proyectos
vercel ls

# Ver logs
vercel logs

# Ver información del proyecto
vercel inspect

# Eliminar un despliegue
vercel remove [deployment-url]

# Ver variables de entorno
vercel env ls
```

---

## 🎉 ¡Listo!

Tu sistema está ahora en línea con Vercel. Es:
- ✅ **Más rápido** que Render
- ✅ **Más fácil** de configurar
- ✅ **Siempre activo** (no se duerme)
- ✅ **100% gratis**

**URL de tu aplicación:**
```
https://taller-analitica-massy.vercel.app
```

---

## 🆚 ¿Vercel o Render?

**Usa Vercel si:**
- ✅ Quieres el despliegue más rápido
- ✅ No quieres que el servicio se "duerma"
- ✅ Prefieres usar CLI (línea de comandos)

**Usa Render si:**
- ✅ Prefieres interfaz web completa
- ✅ Necesitas más control sobre el servidor
- ✅ No te importa que se "duerma" tras 15 min

**Mi recomendación: Vercel** 🚀

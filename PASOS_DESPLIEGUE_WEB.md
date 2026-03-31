# 🚀 Despliegue en Vercel - Método Web (MÁS FÁCIL)

## 📋 Paso 1: Crear Repositorio en GitHub

1. **Ve a GitHub:** https://github.com/new

2. **Completa:**
   - Repository name: `taller-analitica-massy`
   - Description: `Sistema web para taller de decisiones empresariales`
   - Visibilidad: **Private** (para proteger credenciales)

3. **Click en "Create repository"**

4. **Copia la URL** que aparece (algo como: `https://github.com/TU_USUARIO/taller-analitica-massy.git`)

---

## 📋 Paso 2: Subir tu Código a GitHub

Ejecuta estos comandos en la terminal (uno por uno):

```bash
# Conectar con GitHub (usa la URL que copiaste)
git remote add origin https://github.com/TU_USUARIO/taller-analitica-massy.git

# Cambiar a rama main
git branch -M main

# Subir el código
git push -u origin main
```

**Si te pide usuario y contraseña:**
- Usuario: Tu usuario de GitHub
- Contraseña: Usa un **Personal Access Token** (no tu contraseña normal)
  - Créalo en: https://github.com/settings/tokens
  - Permisos necesarios: `repo`

---

## 📋 Paso 3: Conectar Vercel con GitHub

1. **Ve a Vercel:** https://vercel.com/signup

2. **Click en "Continue with GitHub"**

3. **Autoriza Vercel** para acceder a tus repositorios

4. **Ya estás dentro del Dashboard de Vercel**

---

## 📋 Paso 4: Importar tu Proyecto

1. **En el Dashboard de Vercel, click en "Add New..."** → **"Project"**

2. **Busca tu repositorio:** `taller-analitica-massy`

3. **Click en "Import"**

4. **Configuración del proyecto:**
   - Framework Preset: **Other**
   - Root Directory: (dejar vacío)
   - Build Command: (dejar vacío o `npm install`)
   - Output Directory: `public`
   - Install Command: `npm install`

---

## 📋 Paso 5: Agregar Variables de Entorno

**ANTES de hacer click en "Deploy", agrega las variables de entorno:**

En la sección **"Environment Variables"**, agrega estas 7 variables:

### Variable 1:
- **Name:** `DB_SERVER`
- **Value:** `162.248.53.192`
- Click en **"Add"**

### Variable 2:
- **Name:** `DB_USER`
- **Value:** `IdentyWebUser`
- Click en **"Add"**

### Variable 3:
- **Name:** `DB_PASSWORD`
- **Value:** `Tatiana2006`
- Click en **"Add"**

### Variable 4:
- **Name:** `DB_NAME`
- **Value:** `taller_analitica`
- Click en **"Add"**

### Variable 5:
- **Name:** `DB_PORT`
- **Value:** `1433`
- Click en **"Add"**

### Variable 6:
- **Name:** `DB_ENCRYPT`
- **Value:** `false`
- Click en **"Add"**

### Variable 7:
- **Name:** `DB_TRUST_CERT`
- **Value:** `true`
- Click en **"Add"**

---

## 📋 Paso 6: Desplegar

1. **Click en "Deploy"**

2. **Espera 1-2 minutos** mientras Vercel:
   - Clona tu repositorio
   - Instala dependencias
   - Despliega tu aplicación

3. **¡Listo!** Verás un mensaje de éxito con confeti 🎉

---

## 🌐 Paso 7: Obtener tu URL

Tu aplicación estará disponible en:

```
https://taller-analitica-massy.vercel.app
```

O una URL similar que Vercel te asigne.

**Copia esta URL y compártela con los participantes del taller.**

---

## ✅ Verificar que Funciona

1. **Abre la URL** en tu navegador

2. **Prueba:**
   - Registrar un usuario
   - Crear una decisión
   - Crear una pregunta
   - Crear una fricción
   - Votar
   - Ver el dashboard

3. **Si algo falla:**
   - Ve a tu proyecto en Vercel
   - Click en "Logs" para ver errores
   - Verifica que las variables de entorno estén correctas

---

## 🔄 Actualizar tu Aplicación

Cuando hagas cambios en el código:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

**Vercel detectará automáticamente los cambios y re-desplegará.**

---

## 🎉 ¡Listo!

Tu sistema está ahora en línea y accesible desde cualquier dispositivo con internet.

**URL de tu aplicación:**
```
https://taller-analitica-massy.vercel.app
```

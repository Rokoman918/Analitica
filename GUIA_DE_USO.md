# 📘 Guía de Uso - Sistema de Taller de Analítica

## ✅ Base de Datos SQL Server Creada

**Servidor:** 162.248.53.192  
**Base de datos:** `taller_analitica`  
**Usuario:** IdentyWebUser  
**Estado:** ✅ Conectado y funcionando

---

## 🔗 Flujo de Relaciones del Sistema

El sistema está diseñado para que **todo esté relacionado** y el usuario vea sus datos conectados al cambiar de pestaña:

```
👤 USUARIO
    ↓
📊 MÓDULO 1: Decisiones
    ↓ (enlace: decision_id)
❓ MÓDULO 2: Preguntas Críticas
    ↓ (enlace: pregunta_critica_id)
⚠️ MÓDULO 3: Fricciones
    ↓
🗳️ MÓDULO 4: Votación
```

---

## 📋 Cómo Funciona Paso a Paso

### **1️⃣ MÓDULO 1: Mapa de Decisiones**

El usuario crea sus decisiones (máximo 3):
- Decisión: "Ajustar presupuesto de área"
- Frecuencia: Mensual
- Impacto: Alto

**Datos guardados en tabla:** `decisiones`
```sql
id | gerente_id | decision | frecuencia | impacto
1  | 5          | Ajustar presupuesto... | Mensual | Alto
```

---

### **2️⃣ MÓDULO 2: Preguntas Críticas**

**Al cambiar a esta pestaña:**
- ✅ Se ejecuta automáticamente `loadMisDecisiones()`
- ✅ El selector muestra SOLO las decisiones del usuario actual
- ✅ El usuario selecciona una decisión del dropdown

**Ejemplo del selector:**
```
┌─────────────────────────────────────────────────┐
│ Selecciona tu Decisión *                        │
├─────────────────────────────────────────────────┤
│ Ajustar presupuesto de área (Mensual - Alto)   │
│ Definir estrategia comercial (Trimestral - Crítico) │
│ Aprobar contrataciones (Semanal - Medio)       │
└─────────────────────────────────────────────────┘
```

El usuario formula su pregunta:
- Pregunta: "¿Dónde se está yendo el dinero sin generar valor?"

**Datos guardados en tabla:** `preguntas_criticas`
```sql
id | gerente_id | decision_id | pregunta_clave
1  | 5          | 1           | ¿Dónde se está yendo el dinero...
```

**✅ RELACIÓN CREADA:** La pregunta queda enlazada a la decisión #1

**Visualización:**
Al ver la lista de preguntas, se muestra:
```
┌──────────────────────────────────────────────────┐
│ ¿Dónde se está yendo el dinero sin generar valor?│
│                                                   │
│ 📊 Decisión: Ajustar presupuesto de área        │
│ Por: Juan Pérez (Finanzas)                      │
└──────────────────────────────────────────────────┘
```

---

### **3️⃣ MÓDULO 3: Fricciones de Información**

**Al cambiar a esta pestaña:**
- ✅ Se ejecuta automáticamente `loadMisPreguntas()`
- ✅ El selector muestra SOLO las preguntas del usuario actual
- ✅ El usuario selecciona una pregunta del dropdown

**Ejemplo del selector:**
```
┌─────────────────────────────────────────────────┐
│ Selecciona tu Pregunta Crítica *                │
├─────────────────────────────────────────────────┤
│ ¿Dónde se está yendo el dinero sin generar...  │
│ ¿Cuál es el ROI real de cada campaña...        │
│ ¿Qué productos generan más margen...           │
└─────────────────────────────────────────────────┘
```

El usuario describe la fricción:
- Situación actual: "Los reportes llegan con 15 días de retraso"
- Consecuencia: "Decisiones basadas en datos obsoletos"

**Datos guardados en tabla:** `fricciones`
```sql
id | gerente_id | pregunta_critica_id | situacion_actual | consecuencia
1  | 5          | 1                   | Los reportes... | Decisiones basadas...
```

**✅ RELACIÓN CREADA:** La fricción queda enlazada a la pregunta #1

**Visualización con TODA la cadena:**
```
┌──────────────────────────────────────────────────┐
│ ❓ Pregunta Crítica:                             │
│ ¿Dónde se está yendo el dinero sin generar valor?│
│                                                   │
│ 📊 Decisión:                                     │
│ Ajustar presupuesto de área                     │
│                                                   │
│ Hoy qué pasa: Los reportes llegan con 15 días... │
│ Consecuencia: Decisiones basadas en datos...    │
│                                                   │
│ Por: Juan Pérez (Finanzas)                      │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Características Clave

### ✅ **Carga Automática al Cambiar Pestaña**
```javascript
function switchTab(tabName) {
    if (tabName === 'modulo2') {
        loadMisDecisiones();  // ← Carga decisiones del usuario
    } else if (tabName === 'modulo3') {
        loadMisPreguntas();   // ← Carga preguntas del usuario
    }
}
```

### ✅ **Filtrado por Usuario**
Solo ve sus propias decisiones y preguntas en los selectores:
```javascript
const misDecisiones = data.data.filter(d => d.gerente_id === currentUser.id);
const misPreguntas = data.data.filter(p => p.gerente_id === currentUser.id);
```

### ✅ **Múltiples Preguntas por Decisión**
Un usuario puede crear varias preguntas para la misma decisión:
```
Decisión: "Ajustar presupuesto"
  ├─ Pregunta 1: "¿Dónde se va el dinero?"
  ├─ Pregunta 2: "¿Qué áreas gastan más?"
  └─ Pregunta 3: "¿Cuál es el ROI de cada gasto?"
```

### ✅ **Visualización de Relaciones**
Los queries SQL usan JOINs para traer toda la información relacionada:
```sql
-- En preguntas_criticas
SELECT p.*, g.nombre as gerente_nombre, g.area,
       d.decision as decision_texto
FROM preguntas_criticas p 
JOIN gerentes g ON p.gerente_id = g.id 
LEFT JOIN decisiones d ON p.decision_id = d.id

-- En fricciones
SELECT f.*, g.nombre as gerente_nombre, g.area,
       p.pregunta_clave as pregunta_texto,
       d.decision as decision_texto
FROM fricciones f 
JOIN gerentes g ON f.gerente_id = g.id 
LEFT JOIN preguntas_criticas p ON f.pregunta_critica_id = p.id
LEFT JOIN decisiones d ON p.decision_id = d.id
```

---

## 🚀 Iniciar el Sistema

```bash
# Servidor en producción con SQL Server
node server-sqlserver.js
```

**URL:** http://localhost:3000

**Desde móvil:**
1. Obtén IP de tu PC: `ipconfig`
2. Accede: `http://[TU_IP]:3000`

---

## 📊 Estructura de Tablas en SQL Server

### **gerentes**
```
id | nombre | area | email | fecha_registro
```

### **decisiones**
```
id | gerente_id | decision | frecuencia | impacto | fecha_creacion
```

### **preguntas_criticas**
```
id | gerente_id | decision_id | pregunta_clave | fecha_creacion
                    ↑
                RELACIÓN con decisiones
```

### **fricciones**
```
id | gerente_id | pregunta_critica_id | situacion_actual | consecuencia
                        ↑
                RELACIÓN con preguntas_criticas
                    (que a su vez tiene decision_id)
```

### **votaciones**
```
id | gerente_id | pregunta_critica_id | tipo_voto | fecha_voto
```

---

## ✅ Validaciones Implementadas

1. **No puedes crear preguntas sin decisiones**
   - Si no tienes decisiones, el selector está deshabilitado
   - Muestra mensaje: "⚠️ Primero debes crear al menos una decisión en el Módulo 1"

2. **No puedes crear fricciones sin preguntas**
   - Si no tienes preguntas, el selector está deshabilitado
   - Muestra mensaje: "⚠️ Primero debes crear al menos una pregunta crítica en el Módulo 2"

3. **Trazabilidad completa**
   - Cada fricción muestra su pregunta relacionada
   - Cada pregunta muestra su decisión relacionada
   - Todo está enlazado al usuario que lo creó

---

## 🎉 Sistema Listo

La base de datos SQL Server está creada y funcionando con todas las relaciones correctas. El usuario puede navegar entre pestañas y ver automáticamente sus datos relacionados para completar cada módulo del taller.

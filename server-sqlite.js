const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let db;

function initDatabase() {
    try {
        db = new Database('taller.db');
        
        db.exec(`
            CREATE TABLE IF NOT EXISTS gerentes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                area TEXT,
                email TEXT,
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS decisiones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gerente_id INTEGER NOT NULL,
                decision TEXT NOT NULL,
                frecuencia TEXT NOT NULL,
                impacto TEXT NOT NULL,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS preguntas_criticas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gerente_id INTEGER NOT NULL,
                decision_id INTEGER,
                pregunta_clave TEXT NOT NULL,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE,
                FOREIGN KEY (decision_id) REFERENCES decisiones(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS fricciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gerente_id INTEGER NOT NULL,
                pregunta_critica_id INTEGER,
                situacion_actual TEXT NOT NULL,
                consecuencia TEXT NOT NULL,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE,
                FOREIGN KEY (pregunta_critica_id) REFERENCES preguntas_criticas(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS votaciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gerente_id INTEGER NOT NULL,
                pregunta_critica_id INTEGER NOT NULL,
                tipo_voto TEXT NOT NULL,
                fecha_voto DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE,
                FOREIGN KEY (pregunta_critica_id) REFERENCES preguntas_criticas(id) ON DELETE CASCADE,
                UNIQUE(gerente_id, pregunta_critica_id, tipo_voto)
            );

            CREATE INDEX IF NOT EXISTS idx_decisiones_gerente ON decisiones(gerente_id);
            CREATE INDEX IF NOT EXISTS idx_preguntas_gerente ON preguntas_criticas(gerente_id);
            CREATE INDEX IF NOT EXISTS idx_fricciones_gerente ON fricciones(gerente_id);
            CREATE INDEX IF NOT EXISTS idx_votaciones_pregunta ON votaciones(pregunta_critica_id);
        `);
        
        console.log('✅ Base de datos SQLite inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error.message);
        process.exit(1);
    }
}

app.post('/api/gerentes', (req, res) => {
    try {
        const { nombre, area, email } = req.body;
        const stmt = db.prepare('INSERT INTO gerentes (nombre, area, email) VALUES (?, ?, ?)');
        const result = stmt.run(nombre, area, email);
        res.json({ success: true, gerenteId: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/gerentes', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM gerentes ORDER BY fecha_registro DESC');
        const rows = stmt.all();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/decisiones', (req, res) => {
    try {
        const { gerente_id, decision, frecuencia, impacto } = req.body;
        const stmt = db.prepare('INSERT INTO decisiones (gerente_id, decision, frecuencia, impacto) VALUES (?, ?, ?, ?)');
        const result = stmt.run(gerente_id, decision, frecuencia, impacto);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/decisiones', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT d.*, g.nombre as gerente_nombre, g.area 
            FROM decisiones d 
            JOIN gerentes g ON d.gerente_id = g.id 
            ORDER BY d.fecha_creacion DESC
        `);
        const rows = stmt.all();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/preguntas-criticas', (req, res) => {
    try {
        const { gerente_id, decision_id, pregunta_clave } = req.body;
        const stmt = db.prepare('INSERT INTO preguntas_criticas (gerente_id, decision_id, pregunta_clave) VALUES (?, ?, ?)');
        const result = stmt.run(gerente_id, decision_id, pregunta_clave);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/preguntas-criticas', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT p.*, g.nombre as gerente_nombre, g.area,
                   d.decision as decision_texto
            FROM preguntas_criticas p 
            JOIN gerentes g ON p.gerente_id = g.id 
            LEFT JOIN decisiones d ON p.decision_id = d.id
            ORDER BY p.fecha_creacion DESC
        `);
        const rows = stmt.all();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/fricciones', (req, res) => {
    try {
        const { gerente_id, pregunta_critica_id, situacion_actual, consecuencia } = req.body;
        const stmt = db.prepare('INSERT INTO fricciones (gerente_id, pregunta_critica_id, situacion_actual, consecuencia) VALUES (?, ?, ?, ?)');
        const result = stmt.run(gerente_id, pregunta_critica_id, situacion_actual, consecuencia);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/fricciones', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT f.*, g.nombre as gerente_nombre, g.area,
                   p.pregunta_clave as pregunta_texto,
                   d.decision as decision_texto
            FROM fricciones f 
            JOIN gerentes g ON f.gerente_id = g.id 
            LEFT JOIN preguntas_criticas p ON f.pregunta_critica_id = p.id
            LEFT JOIN decisiones d ON p.decision_id = d.id
            ORDER BY f.fecha_creacion DESC
        `);
        const rows = stmt.all();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/votaciones', (req, res) => {
    try {
        const { gerente_id, pregunta_critica_id, tipo_voto } = req.body;
        const stmt = db.prepare('INSERT OR REPLACE INTO votaciones (gerente_id, pregunta_critica_id, tipo_voto) VALUES (?, ?, ?)');
        const result = stmt.run(gerente_id, pregunta_critica_id, tipo_voto);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/votaciones/:gerenteId/:preguntaId/:tipoVoto', (req, res) => {
    try {
        const { gerenteId, preguntaId, tipoVoto } = req.params;
        const stmt = db.prepare('DELETE FROM votaciones WHERE gerente_id = ? AND pregunta_critica_id = ? AND tipo_voto = ?');
        stmt.run(gerenteId, preguntaId, tipoVoto);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/votaciones/resumen', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT 
                p.id,
                p.pregunta_clave,
                d.decision as decision_texto,
                g.nombre as gerente_nombre,
                g.area,
                SUM(CASE WHEN v.tipo_voto = 'impacto' THEN 1 ELSE 0 END) as votos_impacto,
                SUM(CASE WHEN v.tipo_voto = 'urgencia' THEN 1 ELSE 0 END) as votos_urgencia,
                COUNT(v.id) as total_votos
            FROM preguntas_criticas p
            LEFT JOIN votaciones v ON p.id = v.pregunta_critica_id
            LEFT JOIN decisiones d ON p.decision_id = d.id
            LEFT JOIN gerentes g ON p.gerente_id = g.id
            GROUP BY p.id, p.pregunta_clave, d.decision, g.nombre, g.area
            HAVING COUNT(v.id) > 0
            ORDER BY total_votos DESC, votos_impacto DESC, votos_urgencia DESC
        `);
        const rows = stmt.all();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/votaciones/gerente/:gerenteId', (req, res) => {
    try {
        const { gerenteId } = req.params;
        const stmt = db.prepare('SELECT pregunta_critica_id, tipo_voto FROM votaciones WHERE gerente_id = ?');
        const rows = stmt.all(gerenteId);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/dashboard/stats', (req, res) => {
    try {
        const decisiones = db.prepare('SELECT COUNT(*) as total FROM decisiones').get();
        const preguntas = db.prepare('SELECT COUNT(*) as total FROM preguntas_criticas').get();
        const fricciones = db.prepare('SELECT COUNT(*) as total FROM fricciones').get();
        const gerentes = db.prepare('SELECT COUNT(*) as total FROM gerentes').get();
        const votaciones = db.prepare('SELECT COUNT(*) as total FROM votaciones').get();
        
        const impactoData = db.prepare('SELECT impacto, COUNT(*) as cantidad FROM decisiones GROUP BY impacto').all();
        const frecuenciaData = db.prepare('SELECT frecuencia, COUNT(*) as cantidad FROM decisiones GROUP BY frecuencia').all();

        res.json({
            success: true,
            stats: {
                totalDecisiones: decisiones.total,
                totalPreguntas: preguntas.total,
                totalFricciones: fricciones.total,
                totalGerentes: gerentes.total,
                totalVotaciones: votaciones.total,
                impacto: impactoData,
                frecuencia: frecuenciaData
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDatabase();

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📱 Accede desde tu teléfono usando la IP de tu computadora en la misma red`);
});

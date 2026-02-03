const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let pool;

async function initDatabase() {
    try {
        pool = mysql.createPool(config.db);
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a la base de datos MySQL');
        connection.release();
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error.message);
        process.exit(1);
    }
}

app.post('/api/gerentes', async (req, res) => {
    try {
        const { nombre, area, email } = req.body;
        const [result] = await pool.query(
            'INSERT INTO gerentes (nombre, area, email) VALUES (?, ?, ?)',
            [nombre, area, email]
        );
        res.json({ success: true, gerenteId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/gerentes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM gerentes ORDER BY fecha_registro DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/decisiones', async (req, res) => {
    try {
        const { gerente_id, decision, frecuencia, impacto } = req.body;
        const [result] = await pool.query(
            'INSERT INTO decisiones (gerente_id, decision, frecuencia, impacto) VALUES (?, ?, ?, ?)',
            [gerente_id, decision, frecuencia, impacto]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/decisiones', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT d.*, g.nombre as gerente_nombre, g.area 
            FROM decisiones d 
            JOIN gerentes g ON d.gerente_id = g.id 
            ORDER BY d.fecha_creacion DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/preguntas-criticas', async (req, res) => {
    try {
        const { gerente_id, decision_relacionada, pregunta_clave } = req.body;
        const [result] = await pool.query(
            'INSERT INTO preguntas_criticas (gerente_id, decision_relacionada, pregunta_clave) VALUES (?, ?, ?)',
            [gerente_id, decision_relacionada, pregunta_clave]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/preguntas-criticas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, g.nombre as gerente_nombre, g.area 
            FROM preguntas_criticas p 
            JOIN gerentes g ON p.gerente_id = g.id 
            ORDER BY p.fecha_creacion DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/fricciones', async (req, res) => {
    try {
        const { gerente_id, pregunta, situacion_actual, consecuencia } = req.body;
        const [result] = await pool.query(
            'INSERT INTO fricciones (gerente_id, pregunta, situacion_actual, consecuencia) VALUES (?, ?, ?, ?)',
            [gerente_id, pregunta, situacion_actual, consecuencia]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/fricciones', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT f.*, g.nombre as gerente_nombre, g.area 
            FROM fricciones f 
            JOIN gerentes g ON f.gerente_id = g.id 
            ORDER BY f.fecha_creacion DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/votaciones', async (req, res) => {
    try {
        const { gerente_id, pregunta_critica_id, tipo_voto } = req.body;
        const [result] = await pool.query(
            'INSERT INTO votaciones (gerente_id, pregunta_critica_id, tipo_voto) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE fecha_voto = CURRENT_TIMESTAMP',
            [gerente_id, pregunta_critica_id, tipo_voto]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/votaciones/:gerenteId/:preguntaId/:tipoVoto', async (req, res) => {
    try {
        const { gerenteId, preguntaId, tipoVoto } = req.params;
        await pool.query(
            'DELETE FROM votaciones WHERE gerente_id = ? AND pregunta_critica_id = ? AND tipo_voto = ?',
            [gerenteId, preguntaId, tipoVoto]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/votaciones/resumen', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id,
                p.pregunta_clave,
                p.decision_relacionada,
                COUNT(CASE WHEN v.tipo_voto = 'impacto' THEN 1 END) as votos_impacto,
                COUNT(CASE WHEN v.tipo_voto = 'urgencia' THEN 1 END) as votos_urgencia,
                COUNT(v.id) as total_votos
            FROM preguntas_criticas p
            LEFT JOIN votaciones v ON p.id = v.pregunta_critica_id
            GROUP BY p.id, p.pregunta_clave, p.decision_relacionada
            ORDER BY total_votos DESC, votos_impacto DESC, votos_urgencia DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/votaciones/gerente/:gerenteId', async (req, res) => {
    try {
        const { gerenteId } = req.params;
        const [rows] = await pool.query(
            'SELECT pregunta_critica_id, tipo_voto FROM votaciones WHERE gerente_id = ?',
            [gerenteId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [decisiones] = await pool.query('SELECT COUNT(*) as total FROM decisiones');
        const [preguntas] = await pool.query('SELECT COUNT(*) as total FROM preguntas_criticas');
        const [fricciones] = await pool.query('SELECT COUNT(*) as total FROM fricciones');
        const [gerentes] = await pool.query('SELECT COUNT(*) as total FROM gerentes');
        const [votaciones] = await pool.query('SELECT COUNT(*) as total FROM votaciones');
        
        const [impactoData] = await pool.query(`
            SELECT impacto, COUNT(*) as cantidad 
            FROM decisiones 
            GROUP BY impacto
        `);
        
        const [frecuenciaData] = await pool.query(`
            SELECT frecuencia, COUNT(*) as cantidad 
            FROM decisiones 
            GROUP BY frecuencia
        `);

        res.json({
            success: true,
            stats: {
                totalDecisiones: decisiones[0].total,
                totalPreguntas: preguntas[0].total,
                totalFricciones: fricciones[0].total,
                totalGerentes: gerentes[0].total,
                totalVotaciones: votaciones[0].total,
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

initDatabase().then(() => {
    app.listen(config.server.port, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${config.server.port}`);
    });
});

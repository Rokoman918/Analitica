const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const config = require('./config-sqlserver');

let pool;

async function initDatabase() {
    try {
        pool = await sql.connect(config);
        console.log('✅ Conexión exitosa a SQL Server');
        console.log(`📊 Base de datos: ${config.database}`);
    } catch (error) {
        console.error('❌ Error conectando a SQL Server:', error.message);
        console.error('Detalles:', error);
        process.exit(1);
    }
}

app.post('/api/gerentes', async (req, res) => {
    try {
        const { nombre, area, email } = req.body;
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('area', sql.NVarChar, area)
            .input('email', sql.NVarChar, email)
            .query('INSERT INTO gerentes (nombre, area, email) OUTPUT INSERTED.id VALUES (@nombre, @area, @email)');
        
        res.json({ success: true, gerenteId: result.recordset[0].id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/gerentes', async (req, res) => {
    try {
        const result = await pool.request()
            .query('SELECT * FROM gerentes ORDER BY fecha_registro DESC');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/decisiones', async (req, res) => {
    try {
        const { gerente_id, decision, frecuencia, impacto } = req.body;
        const result = await pool.request()
            .input('gerente_id', sql.Int, gerente_id)
            .input('decision', sql.NVarChar, decision)
            .input('frecuencia', sql.NVarChar, frecuencia)
            .input('impacto', sql.NVarChar, impacto)
            .query('INSERT INTO decisiones (gerente_id, decision, frecuencia, impacto) OUTPUT INSERTED.id VALUES (@gerente_id, @decision, @frecuencia, @impacto)');
        
        res.json({ success: true, id: result.recordset[0].id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/decisiones', async (req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT d.*, g.nombre as gerente_nombre, g.area 
                FROM decisiones d 
                JOIN gerentes g ON d.gerente_id = g.id 
                ORDER BY d.fecha_creacion DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/preguntas-criticas', async (req, res) => {
    try {
        const { gerente_id, decision_id, pregunta_clave } = req.body;
        const result = await pool.request()
            .input('gerente_id', sql.Int, gerente_id)
            .input('decision_id', sql.Int, decision_id)
            .input('pregunta_clave', sql.NVarChar, pregunta_clave)
            .query('INSERT INTO preguntas_criticas (gerente_id, decision_id, pregunta_clave) OUTPUT INSERTED.id VALUES (@gerente_id, @decision_id, @pregunta_clave)');
        
        res.json({ success: true, id: result.recordset[0].id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/preguntas-criticas', async (req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT p.*, g.nombre as gerente_nombre, g.area,
                       d.decision as decision_texto
                FROM preguntas_criticas p 
                JOIN gerentes g ON p.gerente_id = g.id 
                LEFT JOIN decisiones d ON p.decision_id = d.id
                ORDER BY p.fecha_creacion DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/fricciones', async (req, res) => {
    try {
        const { gerente_id, pregunta_critica_id, situacion_actual, consecuencia } = req.body;
        const result = await pool.request()
            .input('gerente_id', sql.Int, gerente_id)
            .input('pregunta_critica_id', sql.Int, pregunta_critica_id)
            .input('situacion_actual', sql.NVarChar, situacion_actual)
            .input('consecuencia', sql.NVarChar, consecuencia)
            .query('INSERT INTO fricciones (gerente_id, pregunta_critica_id, situacion_actual, consecuencia) OUTPUT INSERTED.id VALUES (@gerente_id, @pregunta_critica_id, @situacion_actual, @consecuencia)');
        
        res.json({ success: true, id: result.recordset[0].id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/fricciones', async (req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT f.*, g.nombre as gerente_nombre, g.area,
                       p.pregunta_clave as pregunta_texto,
                       d.decision as decision_texto
                FROM fricciones f 
                JOIN gerentes g ON f.gerente_id = g.id 
                LEFT JOIN preguntas_criticas p ON f.pregunta_critica_id = p.id
                LEFT JOIN decisiones d ON p.decision_id = d.id
                ORDER BY f.fecha_creacion DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/votaciones', async (req, res) => {
    try {
        const { gerente_id, pregunta_critica_id, tipo_voto } = req.body;
        
        const checkResult = await pool.request()
            .input('gerente_id', sql.Int, gerente_id)
            .input('pregunta_critica_id', sql.Int, pregunta_critica_id)
            .input('tipo_voto', sql.NVarChar, tipo_voto)
            .query('SELECT id FROM votaciones WHERE gerente_id = @gerente_id AND pregunta_critica_id = @pregunta_critica_id AND tipo_voto = @tipo_voto');
        
        if (checkResult.recordset.length > 0) {
            res.json({ success: true, id: checkResult.recordset[0].id });
        } else {
            const result = await pool.request()
                .input('gerente_id', sql.Int, gerente_id)
                .input('pregunta_critica_id', sql.Int, pregunta_critica_id)
                .input('tipo_voto', sql.NVarChar, tipo_voto)
                .query('INSERT INTO votaciones (gerente_id, pregunta_critica_id, tipo_voto) OUTPUT INSERTED.id VALUES (@gerente_id, @pregunta_critica_id, @tipo_voto)');
            
            res.json({ success: true, id: result.recordset[0].id });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/votaciones/:gerenteId/:preguntaId/:tipoVoto', async (req, res) => {
    try {
        const { gerenteId, preguntaId, tipoVoto } = req.params;
        await pool.request()
            .input('gerente_id', sql.Int, gerenteId)
            .input('pregunta_critica_id', sql.Int, preguntaId)
            .input('tipo_voto', sql.NVarChar, tipoVoto)
            .query('DELETE FROM votaciones WHERE gerente_id = @gerente_id AND pregunta_critica_id = @pregunta_critica_id AND tipo_voto = @tipo_voto');
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/votaciones/resumen', async (req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT 
                    p.id,
                    p.pregunta_clave,
                    p.decision_relacionada,
                    SUM(CASE WHEN v.tipo_voto = 'impacto' THEN 1 ELSE 0 END) as votos_impacto,
                    SUM(CASE WHEN v.tipo_voto = 'urgencia' THEN 1 ELSE 0 END) as votos_urgencia,
                    COUNT(v.id) as total_votos
                FROM preguntas_criticas p
                LEFT JOIN votaciones v ON p.id = v.pregunta_critica_id
                GROUP BY p.id, p.pregunta_clave, p.decision_relacionada
                ORDER BY total_votos DESC, votos_impacto DESC, votos_urgencia DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/votaciones/gerente/:gerenteId', async (req, res) => {
    try {
        const { gerenteId } = req.params;
        const result = await pool.request()
            .input('gerente_id', sql.Int, gerenteId)
            .query('SELECT pregunta_critica_id, tipo_voto FROM votaciones WHERE gerente_id = @gerente_id');
        
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const decisiones = await pool.request().query('SELECT COUNT(*) as total FROM decisiones');
        const preguntas = await pool.request().query('SELECT COUNT(*) as total FROM preguntas_criticas');
        const fricciones = await pool.request().query('SELECT COUNT(*) as total FROM fricciones');
        const gerentes = await pool.request().query('SELECT COUNT(*) as total FROM gerentes');
        const votaciones = await pool.request().query('SELECT COUNT(*) as total FROM votaciones');
        
        const impactoData = await pool.request().query('SELECT impacto, COUNT(*) as cantidad FROM decisiones GROUP BY impacto');
        const frecuenciaData = await pool.request().query('SELECT frecuencia, COUNT(*) as cantidad FROM decisiones GROUP BY frecuencia');

        res.json({
            success: true,
            stats: {
                totalDecisiones: decisiones.recordset[0].total,
                totalPreguntas: preguntas.recordset[0].total,
                totalFricciones: fricciones.recordset[0].total,
                totalGerentes: gerentes.recordset[0].total,
                totalVotaciones: votaciones.recordset[0].total,
                impacto: impactoData.recordset,
                frecuencia: frecuenciaData.recordset
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📱 Accede desde tu teléfono usando la IP de tu computadora en la misma red`);
    });
});

process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando conexión a SQL Server...');
    await pool.close();
    process.exit(0);
});

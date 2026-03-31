const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const https = require('https');

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
        const { nombre, area, email, capa } = req.body;
        const capaValue = capa || 'Estratégico';
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('area', sql.NVarChar, area)
            .input('email', sql.NVarChar, email)
            .input('capa', sql.NVarChar, capaValue)
            .query('INSERT INTO gerentes (nombre, area, email, capa) OUTPUT INSERTED.id VALUES (@nombre, @area, @email, @capa)');
        
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

// ========== ANALYTICS ENDPOINTS ==========

// Cadena completa: Decisión → Pregunta → Fricción → Votos
app.get('/api/analytics/cadena-completa', async (req, res) => {
    try {
        const { capa } = req.query;
        let capaFilter = '';
        if (capa && capa !== 'Todas') {
            capaFilter = `WHERE g.capa = @capa`;
        }
        const request = pool.request();
        if (capa && capa !== 'Todas') {
            request.input('capa', sql.NVarChar, capa);
        }
        const result = await request.query(`
            SELECT 
                g.id as gerente_id, g.nombre, g.area, g.capa,
                d.id as decision_id, d.decision, d.frecuencia, d.impacto,
                p.id as pregunta_id, p.pregunta_clave,
                f.id as friccion_id, f.situacion_actual, f.consecuencia,
                ISNULL((SELECT SUM(CASE WHEN v.tipo_voto = 'impacto' THEN 1 ELSE 0 END) FROM votaciones v WHERE v.pregunta_critica_id = p.id), 0) as votos_impacto,
                ISNULL((SELECT SUM(CASE WHEN v.tipo_voto = 'urgencia' THEN 1 ELSE 0 END) FROM votaciones v WHERE v.pregunta_critica_id = p.id), 0) as votos_urgencia,
                ISNULL((SELECT COUNT(*) FROM votaciones v WHERE v.pregunta_critica_id = p.id), 0) as total_votos
            FROM gerentes g
            LEFT JOIN decisiones d ON d.gerente_id = g.id
            LEFT JOIN preguntas_criticas p ON p.decision_id = d.id
            LEFT JOIN fricciones f ON f.pregunta_critica_id = p.id
            ${capaFilter}
            ORDER BY g.area, g.nombre, d.impacto DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error analytics cadena:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Scoring compuesto por pregunta
app.get('/api/analytics/scoring', async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT 
                p.id as pregunta_id,
                p.pregunta_clave,
                d.decision,
                d.frecuencia,
                d.impacto,
                g.nombre as gerente_nombre,
                g.area,
                g.capa,
                ISNULL(vi.votos_impacto, 0) as votos_impacto,
                ISNULL(vi.votos_urgencia, 0) as votos_urgencia,
                ISNULL(vi.total_votos, 0) as total_votos,
                (SELECT COUNT(*) FROM fricciones f WHERE f.pregunta_critica_id = p.id) as num_fricciones,
                -- Score compuesto
                (ISNULL(vi.votos_impacto, 0) * 3) + 
                (ISNULL(vi.votos_urgencia, 0) * 2) + 
                (CASE d.frecuencia 
                    WHEN 'Diaria' THEN 6 WHEN 'Semanal' THEN 5 WHEN 'Quincenal' THEN 4 
                    WHEN 'Mensual' THEN 3 WHEN 'Trimestral' THEN 2 WHEN 'Anual' THEN 1 ELSE 0 END) +
                (CASE d.impacto 
                    WHEN 'Crítico' THEN 8 WHEN 'Alto' THEN 6 WHEN 'Medio' THEN 3 WHEN 'Bajo' THEN 1 ELSE 0 END) +
                ((SELECT COUNT(*) FROM fricciones f WHERE f.pregunta_critica_id = p.id) * 1.5)
                as score
            FROM preguntas_criticas p
            JOIN decisiones d ON p.decision_id = d.id
            JOIN gerentes g ON p.gerente_id = g.id
            LEFT JOIN (
                SELECT 
                    pregunta_critica_id,
                    SUM(CASE WHEN tipo_voto = 'impacto' THEN 1 ELSE 0 END) as votos_impacto,
                    SUM(CASE WHEN tipo_voto = 'urgencia' THEN 1 ELSE 0 END) as votos_urgencia,
                    COUNT(*) as total_votos
                FROM votaciones GROUP BY pregunta_critica_id
            ) vi ON vi.pregunta_critica_id = p.id
            ORDER BY score DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error analytics scoring:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Análisis cross-funcional por área
app.get('/api/analytics/cross-funcional', async (req, res) => {
    try {
        const areas = await pool.request().query(`
            SELECT 
                g.area,
                g.capa,
                COUNT(DISTINCT d.id) as total_decisiones,
                COUNT(DISTINCT p.id) as total_preguntas,
                COUNT(DISTINCT f.id) as total_fricciones,
                COUNT(DISTINCT g.id) as total_gerentes,
                ISNULL(SUM(CASE WHEN d.impacto = 'Crítico' THEN 1 ELSE 0 END), 0) as decisiones_criticas,
                ISNULL(SUM(CASE WHEN d.impacto = 'Alto' THEN 1 ELSE 0 END), 0) as decisiones_altas
            FROM gerentes g
            LEFT JOIN decisiones d ON d.gerente_id = g.id
            LEFT JOIN preguntas_criticas p ON p.gerente_id = g.id
            LEFT JOIN fricciones f ON f.gerente_id = g.id
            GROUP BY g.area, g.capa
            ORDER BY total_fricciones DESC
        `);
        res.json({ success: true, data: areas.recordset });
    } catch (error) {
        console.error('Error analytics cross-funcional:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Heatmap: Frecuencia x Impacto
app.get('/api/analytics/heatmap', async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT frecuencia, impacto, COUNT(*) as cantidad
            FROM decisiones d
            JOIN gerentes g ON d.gerente_id = g.id
            GROUP BY frecuencia, impacto
            ORDER BY 
                CASE frecuencia WHEN 'Diaria' THEN 1 WHEN 'Semanal' THEN 2 WHEN 'Quincenal' THEN 3 WHEN 'Mensual' THEN 4 WHEN 'Trimestral' THEN 5 WHEN 'Anual' THEN 6 END,
                CASE impacto WHEN 'Bajo' THEN 1 WHEN 'Medio' THEN 2 WHEN 'Alto' THEN 3 WHEN 'Crítico' THEN 4 END
        `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error analytics heatmap:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Exportar datos completos en JSON
app.get('/api/analytics/export/json', async (req, res) => {
    try {
        const gerentes = await pool.request().query('SELECT * FROM gerentes ORDER BY area, nombre');
        const decisiones = await pool.request().query(`
            SELECT d.*, g.nombre as gerente_nombre, g.area, g.capa 
            FROM decisiones d JOIN gerentes g ON d.gerente_id = g.id ORDER BY d.id
        `);
        const preguntas = await pool.request().query(`
            SELECT p.*, g.nombre as gerente_nombre, g.area, g.capa, d.decision, d.frecuencia, d.impacto
            FROM preguntas_criticas p 
            JOIN gerentes g ON p.gerente_id = g.id 
            LEFT JOIN decisiones d ON p.decision_id = d.id ORDER BY p.id
        `);
        const fricciones = await pool.request().query(`
            SELECT f.*, g.nombre as gerente_nombre, g.area, g.capa, 
                   p.pregunta_clave, d.decision
            FROM fricciones f 
            JOIN gerentes g ON f.gerente_id = g.id 
            LEFT JOIN preguntas_criticas p ON f.pregunta_critica_id = p.id
            LEFT JOIN decisiones d ON p.decision_id = d.id ORDER BY f.id
        `);
        const votaciones = await pool.request().query(`
            SELECT v.*, g.nombre as gerente_nombre, p.pregunta_clave
            FROM votaciones v 
            JOIN gerentes g ON v.gerente_id = g.id 
            JOIN preguntas_criticas p ON v.pregunta_critica_id = p.id ORDER BY v.id
        `);

        res.json({
            success: true,
            export_date: new Date().toISOString(),
            data: {
                gerentes: gerentes.recordset,
                decisiones: decisiones.recordset,
                preguntas_criticas: preguntas.recordset,
                fricciones: fricciones.recordset,
                votaciones: votaciones.recordset
            }
        });
    } catch (error) {
        console.error('Error export:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Exportar datos en CSV
app.get('/api/analytics/export/csv', async (req, res) => {
    try {
        const { tabla } = req.query;
        let query = '';
        let filename = 'export.csv';

        switch (tabla) {
            case 'scoring':
                query = `
                    SELECT p.id, p.pregunta_clave, d.decision, d.frecuencia, d.impacto,
                        g.nombre, g.area, g.capa,
                        ISNULL((SELECT SUM(CASE WHEN v.tipo_voto='impacto' THEN 1 ELSE 0 END) FROM votaciones v WHERE v.pregunta_critica_id=p.id),0) as votos_impacto,
                        ISNULL((SELECT SUM(CASE WHEN v.tipo_voto='urgencia' THEN 1 ELSE 0 END) FROM votaciones v WHERE v.pregunta_critica_id=p.id),0) as votos_urgencia,
                        (SELECT COUNT(*) FROM fricciones f WHERE f.pregunta_critica_id=p.id) as fricciones
                    FROM preguntas_criticas p
                    JOIN decisiones d ON p.decision_id=d.id JOIN gerentes g ON p.gerente_id=g.id`;
                filename = 'scoring_preguntas.csv';
                break;
            case 'cadena':
                query = `
                    SELECT g.nombre, g.area, g.capa, d.decision, d.frecuencia, d.impacto,
                        p.pregunta_clave, f.situacion_actual, f.consecuencia
                    FROM gerentes g
                    LEFT JOIN decisiones d ON d.gerente_id=g.id
                    LEFT JOIN preguntas_criticas p ON p.decision_id=d.id
                    LEFT JOIN fricciones f ON f.pregunta_critica_id=p.id`;
                filename = 'cadena_completa.csv';
                break;
            default:
                query = `SELECT g.nombre, g.area, g.capa, d.decision, d.frecuencia, d.impacto,
                    p.pregunta_clave, f.situacion_actual, f.consecuencia
                    FROM gerentes g
                    LEFT JOIN decisiones d ON d.gerente_id=g.id
                    LEFT JOIN preguntas_criticas p ON p.decision_id=d.id
                    LEFT JOIN fricciones f ON f.pregunta_critica_id=p.id`;
                filename = 'taller_completo.csv';
        }

        const result = await pool.request().query(query);
        const rows = result.recordset;

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'No hay datos' });
        }

        const headers = Object.keys(rows[0]);
        const csvContent = [
            headers.join(','),
            ...rows.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csvContent);
    } catch (error) {
        console.error('Error CSV export:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Clasificación de fricciones con OpenAI
app.post('/api/analytics/clasificar-fricciones', async (req, res) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(400).json({ success: false, error: 'OpenAI API Key no configurada' });
        }

        const fricciones = await pool.request().query(`
            SELECT f.id, f.situacion_actual, f.consecuencia,
                   p.pregunta_clave, d.decision, g.area, g.capa
            FROM fricciones f
            JOIN gerentes g ON f.gerente_id = g.id
            LEFT JOIN preguntas_criticas p ON f.pregunta_critica_id = p.id
            LEFT JOIN decisiones d ON p.decision_id = d.id
        `);

        if (fricciones.recordset.length === 0) {
            return res.json({ success: true, data: [], message: 'No hay fricciones para clasificar' });
        }

        const friccionesText = fricciones.recordset.map((f, i) => 
            `${i+1}. Área: ${f.area} | Capa: ${f.capa} | Decisión: ${f.decision || 'N/A'} | Pregunta: ${f.pregunta_clave || 'N/A'} | Situación: ${f.situacion_actual} | Consecuencia: ${f.consecuencia}`
        ).join('\n');

        const prompt = `Eres un consultor experto en estrategia de datos y analítica empresarial. Analiza las siguientes fricciones de información identificadas en talleres con gerentes de Massy Group.

Para cada fricción, clasifícala en UNA de estas categorías:
- DISPONIBILIDAD: El dato no existe o no se recopila
- OPORTUNIDAD: El dato existe pero llega tarde
- CALIDAD: El dato existe pero es incorrecto o incompleto
- ACCESIBILIDAD: El dato existe pero es difícil de obtener (silos, Excel personal, etc.)
- GRANULARIDAD: El dato existe pero no al nivel de detalle necesario
- INTEGRACIÓN: Los datos están en múltiples sistemas sin conectar

Además, para cada fricción sugiere:
1. Una acción concreta para resolver la fricción
2. El esfuerzo estimado (Bajo/Medio/Alto)
3. El tipo de solución (Dashboard, ETL/Pipeline, Data Governance, Nueva fuente de datos, Integración de sistemas, Capacitación)

FRICCIONES:
${friccionesText}

Responde SOLO en formato JSON válido como un array de objetos con esta estructura:
[{"id": 1, "categoria": "DISPONIBILIDAD", "accion": "...", "esfuerzo": "Medio", "tipo_solucion": "Nueva fuente de datos", "insight": "..."}]

IMPORTANTE: Responde SOLO el JSON, sin texto adicional, sin markdown, sin backticks.`;

        const requestBody = JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 4000
        });

        const aiResponse = await new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'api.openai.com',
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            }, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Error parsing OpenAI response'));
                    }
                });
            });
            req.on('error', reject);
            req.write(requestBody);
            req.end();
        });

        if (aiResponse.error) {
            return res.status(500).json({ success: false, error: aiResponse.error.message });
        }

        const content = aiResponse.choices[0].message.content.trim();
        let clasificaciones;
        try {
            clasificaciones = JSON.parse(content);
        } catch (e) {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            clasificaciones = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        }

        const resultado = fricciones.recordset.map((f, i) => ({
            ...f,
            clasificacion: clasificaciones[i] || { categoria: 'SIN CLASIFICAR', accion: '', esfuerzo: '', tipo_solucion: '', insight: '' }
        }));

        res.json({ success: true, data: resultado });
    } catch (error) {
        console.error('Error clasificación IA:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Analytics page
app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDatabase().then(() => {
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
console.log(`📱 Accede desde tu teléfono usando la IP de tu computadora en la misma red`);
});
});

process.on('SIGINT', async () => {
console.log('\n🛑 Cerrando conexión a SQL Server...');
await pool.close();
process.exit(0);
});

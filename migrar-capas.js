const sql = require('mssql');
const config = require('./config-sqlserver');

async function migrar() {
    try {
        const pool = await sql.connect(config);
        console.log('✅ Conectado a SQL Server');

        // Agregar columna 'capa' a gerentes si no existe
        const checkColumn = await pool.request().query(`
            SELECT COUNT(*) as existe 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'gerentes' AND COLUMN_NAME = 'capa'
        `);

        if (checkColumn.recordset[0].existe === 0) {
            await pool.request().query(`
                ALTER TABLE gerentes 
                ADD capa NVARCHAR(20) DEFAULT 'Estratégico' 
                    CHECK (capa IN ('Estratégico', 'Táctico', 'Operativo'))
            `);
            console.log('✅ Columna "capa" agregada a tabla gerentes');

            // Actualizar registros existentes como Estratégico
            await pool.request().query(`
                UPDATE gerentes SET capa = 'Estratégico' WHERE capa IS NULL
            `);
            console.log('✅ Registros existentes marcados como "Estratégico"');
        } else {
            console.log('ℹ️ La columna "capa" ya existe');
        }

        await pool.close();
        console.log('✅ Migración completada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

migrar();

const sql = require('mssql');

const config = {
    server: '162.248.53.192',
    user: 'IdentyWebUser',
    password: 'Tatiana2006',
    database: 'master',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000
    }
};

async function crearBaseDatos() {
    try {
        console.log('🔌 Conectando a SQL Server...');
        const pool = await sql.connect(config);
        console.log('✅ Conectado exitosamente');

        console.log('\n📊 Creando base de datos taller_analitica...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'taller_analitica')
            BEGIN
                CREATE DATABASE taller_analitica;
                PRINT 'Base de datos creada exitosamente';
            END
            ELSE
            BEGIN
                PRINT 'La base de datos ya existe';
            END
        `);

        console.log('✅ Base de datos verificada/creada');

        console.log('\n🔄 Cambiando a base de datos taller_analitica...');
        await pool.close();
        
        const configTaller = { ...config, database: 'taller_analitica' };
        const poolTaller = await sql.connect(configTaller);

        console.log('\n📋 Creando tablas...');

        // Tabla gerentes
        await poolTaller.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[gerentes]') AND type in (N'U'))
            BEGIN
                CREATE TABLE gerentes (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    nombre NVARCHAR(100) NOT NULL,
                    area NVARCHAR(100),
                    email NVARCHAR(100),
                    fecha_registro DATETIME2 DEFAULT GETDATE()
                );
                CREATE INDEX idx_nombre ON gerentes(nombre);
                PRINT 'Tabla gerentes creada';
            END
        `);

        // Tabla decisiones
        await poolTaller.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[decisiones]') AND type in (N'U'))
            BEGIN
                CREATE TABLE decisiones (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    gerente_id INT NOT NULL,
                    decision NVARCHAR(MAX) NOT NULL,
                    frecuencia NVARCHAR(50) NOT NULL CHECK (frecuencia IN ('Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Anual')),
                    impacto NVARCHAR(50) NOT NULL CHECK (impacto IN ('Bajo', 'Medio', 'Alto', 'Crítico')),
                    fecha_creacion DATETIME2 DEFAULT GETDATE(),
                    FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE
                );
                CREATE INDEX idx_gerente ON decisiones(gerente_id);
                CREATE INDEX idx_impacto ON decisiones(impacto);
                PRINT 'Tabla decisiones creada';
            END
        `);

        // Tabla preguntas_criticas
        await poolTaller.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[preguntas_criticas]') AND type in (N'U'))
            BEGIN
                CREATE TABLE preguntas_criticas (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    gerente_id INT NOT NULL,
                    decision_id INT,
                    pregunta_clave NVARCHAR(MAX) NOT NULL,
                    fecha_creacion DATETIME2 DEFAULT GETDATE(),
                    FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE NO ACTION,
                    FOREIGN KEY (decision_id) REFERENCES decisiones(id) ON DELETE NO ACTION
                );
                CREATE INDEX idx_gerente ON preguntas_criticas(gerente_id);
                CREATE INDEX idx_decision ON preguntas_criticas(decision_id);
                PRINT 'Tabla preguntas_criticas creada';
            END
        `);

        // Tabla fricciones
        await poolTaller.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[fricciones]') AND type in (N'U'))
            BEGIN
                CREATE TABLE fricciones (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    gerente_id INT NOT NULL,
                    pregunta_critica_id INT,
                    situacion_actual NVARCHAR(MAX) NOT NULL,
                    consecuencia NVARCHAR(MAX) NOT NULL,
                    fecha_creacion DATETIME2 DEFAULT GETDATE(),
                    FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE NO ACTION,
                    FOREIGN KEY (pregunta_critica_id) REFERENCES preguntas_criticas(id) ON DELETE NO ACTION
                );
                CREATE INDEX idx_gerente ON fricciones(gerente_id);
                CREATE INDEX idx_pregunta_critica ON fricciones(pregunta_critica_id);
                PRINT 'Tabla fricciones creada';
            END
        `);

        // Tabla votaciones
        await poolTaller.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[votaciones]') AND type in (N'U'))
            BEGIN
                CREATE TABLE votaciones (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    gerente_id INT NOT NULL,
                    pregunta_critica_id INT NOT NULL,
                    tipo_voto NVARCHAR(20) NOT NULL CHECK (tipo_voto IN ('impacto', 'urgencia')),
                    fecha_voto DATETIME2 DEFAULT GETDATE(),
                    FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE NO ACTION,
                    FOREIGN KEY (pregunta_critica_id) REFERENCES preguntas_criticas(id) ON DELETE NO ACTION,
                    CONSTRAINT unique_voto UNIQUE (gerente_id, pregunta_critica_id, tipo_voto)
                );
                CREATE INDEX idx_pregunta ON votaciones(pregunta_critica_id);
                CREATE INDEX idx_tipo ON votaciones(tipo_voto);
                PRINT 'Tabla votaciones creada';
            END
        `);

        // Tabla sesiones_taller
        await poolTaller.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sesiones_taller]') AND type in (N'U'))
            BEGIN
                CREATE TABLE sesiones_taller (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    nombre_sesion NVARCHAR(200) NOT NULL,
                    fecha_inicio DATETIME2 DEFAULT GETDATE(),
                    fecha_fin DATETIME2 NULL,
                    activa BIT DEFAULT 1
                );
                CREATE INDEX idx_activa ON sesiones_taller(activa);
                PRINT 'Tabla sesiones_taller creada';
            END
        `);

        console.log('\n✅ Todas las tablas creadas exitosamente');
        console.log('\n📊 Verificando tablas...');

        const result = await poolTaller.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);

        console.log('\n📋 Tablas en la base de datos:');
        result.recordset.forEach(row => {
            console.log(`   ✓ ${row.TABLE_NAME}`);
        });

        await poolTaller.close();
        console.log('\n🎉 ¡Base de datos configurada correctamente!');
        console.log('\n▶️  Ahora puedes ejecutar: node server-sqlserver.js');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    }
}

crearBaseDatos();

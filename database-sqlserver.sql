-- Script de creación de base de datos para Taller de Analítica - SQL Server
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'taller_analitica')
BEGIN
    CREATE DATABASE taller_analitica;
END
GO

USE taller_analitica;
GO

-- Tabla de gerentes/participantes
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
END
GO

-- Tabla de decisiones (Módulo 1: Mapa de decisiones)
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
END
GO

-- Tabla de preguntas críticas (Módulo 2)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[preguntas_criticas]') AND type in (N'U'))
BEGIN
    CREATE TABLE preguntas_criticas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        gerente_id INT NOT NULL,
        decision_id INT,
        pregunta_clave NVARCHAR(MAX) NOT NULL,
        fecha_creacion DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE,
        FOREIGN KEY (decision_id) REFERENCES decisiones(id) ON DELETE SET NULL
    );
    CREATE INDEX idx_gerente ON preguntas_criticas(gerente_id);
    CREATE INDEX idx_decision ON preguntas_criticas(decision_id);
END
GO

-- Tabla de fricciones de información (Módulo 3)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[fricciones]') AND type in (N'U'))
BEGIN
    CREATE TABLE fricciones (
        id INT IDENTITY(1,1) PRIMARY KEY,
        gerente_id INT NOT NULL,
        pregunta_critica_id INT,
        situacion_actual NVARCHAR(MAX) NOT NULL,
        consecuencia NVARCHAR(MAX) NOT NULL,
        fecha_creacion DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE,
        FOREIGN KEY (pregunta_critica_id) REFERENCES preguntas_criticas(id) ON DELETE SET NULL
    );
    CREATE INDEX idx_gerente ON fricciones(gerente_id);
    CREATE INDEX idx_pregunta_critica ON fricciones(pregunta_critica_id);
END
GO

-- Tabla de votaciones (Módulo 4)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[votaciones]') AND type in (N'U'))
BEGIN
    CREATE TABLE votaciones (
        id INT IDENTITY(1,1) PRIMARY KEY,
        gerente_id INT NOT NULL,
        pregunta_critica_id INT NOT NULL,
        tipo_voto NVARCHAR(20) NOT NULL CHECK (tipo_voto IN ('impacto', 'urgencia')),
        fecha_voto DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE,
        FOREIGN KEY (pregunta_critica_id) REFERENCES preguntas_criticas(id) ON DELETE CASCADE,
        CONSTRAINT unique_voto UNIQUE (gerente_id, pregunta_critica_id, tipo_voto)
    );
    CREATE INDEX idx_pregunta ON votaciones(pregunta_critica_id);
    CREATE INDEX idx_tipo ON votaciones(tipo_voto);
END
GO

-- Tabla de sesiones del taller
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
END
GO

PRINT 'Base de datos taller_analitica creada exitosamente';
GO

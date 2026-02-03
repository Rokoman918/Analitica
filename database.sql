-- Script de creación de base de datos para Taller de Analítica
CREATE DATABASE IF NOT EXISTS taller_analitica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taller_analitica;

-- Tabla de gerentes/participantes
CREATE TABLE IF NOT EXISTS gerentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    email VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB;

-- Tabla de decisiones (Módulo 1: Mapa de decisiones)
CREATE TABLE IF NOT EXISTS decisiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gerente_id INT NOT NULL,
    decision TEXT NOT NULL,
    frecuencia ENUM('Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Anual') NOT NULL,
    impacto ENUM('Bajo', 'Medio', 'Alto', 'Crítico') NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE,
    INDEX idx_gerente (gerente_id),
    INDEX idx_impacto (impacto)
) ENGINE=InnoDB;

-- Tabla de preguntas críticas (Módulo 2)
CREATE TABLE IF NOT EXISTS preguntas_criticas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gerente_id INT NOT NULL,
    decision_relacionada TEXT,
    pregunta_clave TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE,
    INDEX idx_gerente (gerente_id)
) ENGINE=InnoDB;

-- Tabla de fricciones de información (Módulo 3)
CREATE TABLE IF NOT EXISTS fricciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gerente_id INT NOT NULL,
    pregunta TEXT NOT NULL,
    situacion_actual TEXT NOT NULL,
    consecuencia TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE,
    INDEX idx_gerente (gerente_id)
) ENGINE=InnoDB;

-- Tabla de votaciones (Módulo 4)
CREATE TABLE IF NOT EXISTS votaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gerente_id INT NOT NULL,
    pregunta_critica_id INT NOT NULL,
    tipo_voto ENUM('impacto', 'urgencia') NOT NULL,
    fecha_voto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gerente_id) REFERENCES gerentes(id) ON DELETE CASCADE,
    FOREIGN KEY (pregunta_critica_id) REFERENCES preguntas_criticas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_voto (gerente_id, pregunta_critica_id, tipo_voto),
    INDEX idx_pregunta (pregunta_critica_id),
    INDEX idx_tipo (tipo_voto)
) ENGINE=InnoDB;

-- Tabla de sesiones del taller
CREATE TABLE IF NOT EXISTS sesiones_taller (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sesion VARCHAR(200) NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NULL,
    activa BOOLEAN DEFAULT TRUE,
    INDEX idx_activa (activa)
) ENGINE=InnoDB;

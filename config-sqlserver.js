module.exports = {
    server: process.env.DB_SERVER || '162.248.53.192',
    user: process.env.DB_USER || 'IdentyWebUser',
    password: process.env.DB_PASSWORD || 'Tatiana2006',
    database: process.env.DB_NAME || 'taller_analitica',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true' || false,
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true' || true,
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

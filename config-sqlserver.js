module.exports = {
    server: '162.248.53.192',
    user: 'IdentyWebUser',
    password: 'Tatiana2006',
    database: 'taller_analitica',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
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

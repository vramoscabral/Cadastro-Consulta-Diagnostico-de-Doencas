const mariadb = require('mariadb');

// Cria o pool de conexões
const pool = mariadb.createPool({
    host: '120-- etc host do pc',
    port: '3306',
    user: 'root',
    password: 'senha do heidisql',
    database: 'goiaba',
    connectionLimit: 5
});

// Verifica se a conexão foi bem sucedida
pool.getConnection()
    .then(conn => {
        console.log('Conexão com o banco de dados estabelecida.');
        conn.end();
    })
    .catch(erro => {
        console.log('Erro ao conectar com o banco de dados:', erro);
    });

module.exports = pool;
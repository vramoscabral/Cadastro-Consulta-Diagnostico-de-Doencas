const readline = require('readline-sync');
const database = require('./database');
const pool = require('./database/index.js');  // Importa o pool de conexões

/*async function listarUsuarios() {
    sql = 'SELECT * FROM usuarios';
    usuarios = await database.query(sql);
    return usuarios;
}

async function listarLivros() {
    sql = 'SELECT * FROM livros';
    livros = await database.query(sql);
    return livros;
}
*/

async function cadastrarDoenca(cid, nomeTecnico, idPatogeno) {
    const query = 'INSERT INTO doenca (cid, nome_tecnico, id_patogeno) VALUES (?, ?, ?)';
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.query(query, [cid, nomeTecnico, idPatogeno]);
        return;
    } catch (err) {
        throw err;  // Propaga o erro para ser tratado em outro lugar
    } finally {
        if (conn) conn.end();  // Fecha a conexão com o banco de dados
    }
}

async function cadastrarNomePopular(cid, nomePopular) {
    const query = 'INSERT INTO nome_popular (pcid, nome) VALUES (?, ?)';
    let conn;

    try {
        conn = await pool.getConnection();
        const result = await conn.query(query, [cid, nomePopular]);
        return result;  // Retorna o resultado da query
    } catch (err) {
        throw err;  // Propaga o erro
    } finally {
        if (conn) conn.end();  // Fecha a conexão com o banco de dados
    }
}

async function cadastrarPatogeno(idPatogeno, tipoPatogeno) {
    const query = 'INSERT INTO patogeno (nome_cientifico, tipo) VALUES (?, ?)';
    let conn;

    try {
        conn = await pool.getConnection();
        const result = await conn.query(query, [idPatogeno, tipoPatogeno]);
        return result;
    } catch (err) {
        throw err;  // Propaga o erro
    } finally {
        if (conn) conn.end();  // Fecha a conexão com o banco de dados
    }
}

async function cadastrarSintoma(nome) {
    const query = 'INSERT INTO sintoma (nome) VALUES (?)';
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.query(query, [nome]);
        return;
    } catch (err) {
        throw err;  // Propaga o erro
    } finally {
        if (conn) conn.end();  // Fecha a conexão com o banco de dados
    }
}

async function cadastrarSintomaDoenca(cid, sintoma, ocorrencia) {
    const query = 'INSERT INTO sintoma_doenca (cid_doenca, nome_sintoma, ocorrencia) VALUES (?, ?, ?)';
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.query(query, [cid, sintoma, ocorrencia]);
        return;
    } catch (err) {
        throw err;  // Propaga o erro
    } finally {
        if (conn) conn.end();  // Fecha a conexão com o banco de dados
    }
}

async function listarDoencas() {
    sql = `SELECT d.cid AS id, d.id_patogeno AS patogeno,
    d.nome_tecnico AS doença,
    GROUP_CONCAT(
        CONCAT(sd.nome_sintoma, ' (', sd.ocorrencia, ')')
        ORDER BY FIELD(sd.ocorrencia, 'muito comum', 'comum', 'pouco comum')
        SEPARATOR ', '
    ) AS sintomas
    FROM sintoma_doenca AS sd
    JOIN doenca AS d ON sd.cid_doenca = d.cid
    GROUP BY d.nome_tecnico;`
    doencas = await database.query(sql);
    return doencas;
}

async function pesquisanTech(nomeTech) {
    const query = `SELECT d.nome_tecnico AS doença,
d.cid AS id, d.id_patogeno AS patogeno,
    GROUP_CONCAT(
        CONCAT(sd.nome_sintoma, ' (', sd.ocorrencia, ')')
        ORDER BY FIELD(sd.ocorrencia, 'muito comum', 'comum', 'pouco comum')
        SEPARATOR ', '
    ) AS sintomas
FROM 
    sintoma_doenca AS sd
JOIN 
    doenca AS d ON sd.cid_doenca = d.cid
WHERE d.nome_tecnico = ?
GROUP BY 
    d.cid`;
    
    const result = await database.query(query, [nomeTech]);
    return result;
}

async function pesquisaCid(cid) {
    const query = `SELECT d.nome_tecnico AS doença,
d.cid AS id, d.id_patogeno AS patogeno,
    GROUP_CONCAT(
        CONCAT(sd.nome_sintoma, ' (', sd.ocorrencia, ')')
        ORDER BY FIELD(sd.ocorrencia, 'muito comum', 'comum', 'pouco comum')
        SEPARATOR ', '
    ) AS sintomas
FROM 
    sintoma_doenca AS sd
JOIN 
    doenca AS d ON sd.cid_doenca = d.cid
WHERE d.cid = ?
GROUP BY 
    d.cid`;
    
    const result = await database.query(query, [cid]);
    return result;
}

async function pesquisanPop(nomepop) {
    const query = `SELECT d.cid AS id, d.id_patogeno AS patogeno,
    d.nome_tecnico AS doença,
    GROUP_CONCAT(
        CONCAT(sd.nome_sintoma, ' (', sd.ocorrencia, ')')
        ORDER BY FIELD(sd.ocorrencia, 'muito comum', 'comum', 'pouco comum')
        SEPARATOR ', '
    ) AS sintomas, np.nome AS nome_pop
FROM 
    sintoma_doenca AS sd
JOIN 
    doenca AS d ON sd.cid_doenca = d.cid
JOIN
	 nome_popular AS np ON sd.cid_doenca = np.pcid
WHERE np.nome = ?
GROUP BY 
    d.cid, d.id_patogeno, d.nome_tecnico, np.nome`;
    
    const result = await database.query(query, [nomepop]);
    return result;
}

async function pesquisaPatg(patg) {
    const query = `SELECT d.cid AS id, d.id_patogeno AS patogeno,
    d.nome_tecnico AS doença,
    GROUP_CONCAT(
        CONCAT(sd.nome_sintoma, ' (', sd.ocorrencia, ')')
        ORDER BY FIELD(sd.ocorrencia, 'muito comum', 'comum', 'pouco comum')
        SEPARATOR ', '
    ) AS sintomas
FROM 
    sintoma_doenca AS sd
JOIN 
    doenca AS d ON sd.cid_doenca = d.cid
WHERE d.id_patogeno = ?
GROUP BY 
    d.cid, d.id_patogeno, d.nome_tecnico`;
    
    const result = await database.query(query, [patg]);
    return result;
}


async function listarDoencasPeloSintoma(sintomas) {
    // Certifique-se de que sintomas é um array
    if (!Array.isArray(sintomas)) {
        throw new Error("sintomas deve ser um array.");
    }
    sintomasSQL = "\'" + sintomas + "\'" 
    console.log("última vez sintomas: ", sintomas)
    console.log("Tipo sintomas: ", typeof(sintomas))
    // Construa a string de placeholders para os sintomas
    const sintomasList = sintomas[0].split(',');
    for (let i = 0; i < sintomasList.length; i++) {
        sintomasList[i] = `'${sintomasList[i]}'`;
    }
    console.log("List sintomas: ", sintomasList)

    // Consulta SQL ajustada usando placeholders
    const sql = `
        SELECT 
            d.cid AS id,
            d.nome_tecnico AS nome,
            SUM(
                CASE 
                    WHEN sd.nome_sintoma IS NOT NULL THEN
                        CASE sd.ocorrencia
                            WHEN 'muito comum' THEN 5
                            WHEN 'comum' THEN 4
                            WHEN 'pouco comum' THEN 3
                            WHEN 'raro' THEN 2
                            WHEN 'muito raro' THEN 1
                            ELSE 0
                        END
                    ELSE 0
                END
            ) - 
            (
                LENGTH(${sintomasSQL}) - LENGTH(REPLACE(${sintomasSQL}, ',', '')) + 1 
                - COUNT(sd.nome_sintoma)
            ) AS pontuacao
        FROM 
            doenca AS d
        LEFT JOIN 
            sintoma_doenca AS sd ON d.cid = sd.cid_doenca AND sd.nome_sintoma IN (${sintomasList})
        GROUP BY 
            d.cid
        ORDER BY 
            pontuacao DESC;
    `;

    // Crie a lista de parâmetros para a consulta
    const parametros = [sintomasSQL,sintomasSQL,sintomasList];

    console.log("SQL:", sql);
    console.log("Parâmetros:", parametros);

    // Execute a consulta usando o banco de dados
    const doencas = await database.query(sql);
    // console.log(doencas)y
    return doencas;
}

    


module.exports = { 
    cadastrarPatogeno, 
    cadastrarDoenca,
    cadastrarNomePopular,
    cadastrarSintoma,
    cadastrarSintomaDoenca,
    listarDoencas,
    pesquisanTech,
    pesquisaCid,
    pesquisanPop,
    pesquisaPatg,
    listarDoencasPeloSintoma };

    

const express = require('express');
const bodyParser = require('body-parser');
const { 
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
    listarDoencasPeloSintoma} = require('./index.js');
const { query } = require('./database/index.js');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.json());

// Rota para a página inicial
app.get('/', (req, res) => {
    res.render('index');
});

// Rota para a página de cadastro de doenças
app.get('/verificapatogeno', (req, res) => {
    res.render('verificapatogeno');
});

app.post('/cadastrar-patogeno', async (req, res) => {
    const { idPatogeno, tipoPatogeno } = req.body;
    let processo;

    try {
        // Chama a função assíncrona para processar o cadastro
        const result = await cadastrarPatogeno(idPatogeno, tipoPatogeno);

        processo=1;
        res.render('cadastrar', { idPatogeno, processo });
    } catch (err) {
        processo=2;
        //res.render('cadastrar', { idPatogeno, processo });
        res.render('cadastrar', { idPatogeno, processo });
    }
});

// Rota para processar o cadastro de doenças
app.post('/cadastrar-doenca', async (req, res) => {
    const { nomeTecnico, cid, idPatog } = req.body;

    try {
        // Chama a função assíncrona para processar o cadastro
        await cadastrarDoenca(cid, nomeTecnico, idPatog);

        res.render('sucesso', { cid, nomeTecnico });
    } catch (err) {
        // Renderize a página de erro com a mensagem de erro
        res.status(500).render('erro', { mensagem: "Erro ao cadastrar a doença: " + err.message });
    }
});

app.get('/cadsintoma', (req, res) => {
    const { cid, nomeTecnico } = req.query;
    res.render('cadsintoma', { cid, nomeTecnico });
});

app.post('/cadsintomas', async (req, res) => {
    const pcid = req.body.pcid;
    const nometech = req.body.nometech;
    const nomesSintomas = req.body.nomeSintoma;
    const incidencias = req.body.incidencia;
    
    try {

        // Processa cada sintoma e sua incidência
        for (let i = 0; i < nomesSintomas.length; i++) {
            const sintoma = nomesSintomas[i];
            const incidencia = incidencias[i];

            try {
                await cadastrarSintoma(sintoma);
            } catch (err) {}

            // Associa o sintoma à doença com a incidência
            await cadastrarSintomaDoenca(pcid, sintoma, incidencia);
        }

        // Renderiza a página de sucesso
        res.render('sucessosint', { pcid, nometech });

    } catch (err) {
        // Renderiza a página de erro com a mensagem de erro
        res.status(500).render('erro', { mensagem: "Erro ao cadastrar sintomas: " + err.message });
    }
});

app.get('/cadnomepopular', (req, res) => {
    const { pcid, nometech } = req.query;
    res.render('cadnomepopular', { pcid, nometech });
});

app.get('/sucessofim', (req, res) => {
    const { ppcid, nnometech } = req.query;
    res.render('sucessofim', { ppcid, nnometech });
});

app.post('/cadnomepopulars', async (req, res) => {
    const ppcid = req.body.ppcid;
    const nnometech = req.body.nnometech;
    const nomesPopulares = req.body.nomePopular; // Isso será um array de nomes populares
    
    try {
        // Chama a função assíncrona para processar o cadastro
        nomesPopulares.forEach(async nome => {
            await cadastrarNomePopular(ppcid, nome);
        });

        res.render('sucessofim', { ppcid, nnometech });
    } catch (err) {
        // Renderize a página de erro com a mensagem de erro
        res.status(500).render('erro', { mensagem: "Erro ao cadastrar nome popular: " + err.message });
    }
});

app.post('/pesquisantech', async (req, res) => {
    const nometech = req.body.nomeTech;
    let processo;

    try {
        result = await pesquisanTech(nometech);
        
        if (result.length == 0) {
            processo = 0;
            res.render('result', { result, processo });
        } else {
            processo = 1;
            res.render('result', { result, processo });
        }
    } catch (err) {
        // Renderize a página de erro com a mensagem de erro
        res.status(500).render('erro', { mensagem: "Erro: " + err.message });
    }
});

app.post('/pesquisacid', async (req, res) => {
    const cid = req.body.cid;
    let processo;

    try {
        result = await pesquisaCid(cid);
        
        if (result.length == 0) {
            processo = 0;
            res.render('result', { result, processo });
        } else {
            processo = 1;
            res.render('result', { result, processo });
        }
    } catch (err) {
        // Renderize a página de erro com a mensagem de erro
        res.status(500).render('erro', { mensagem: "Erro: " + err.message });
    }
});

app.post('/pesquisanpop', async (req, res) => {
    const nomepop = req.body.nomePop;
    let processo;

    try {
        result = await pesquisanPop(nomepop);
        
        if (result.length == 0) {
            processo = 0;
            res.render('result', { result, processo });
        } else {
            processo = 2;
            res.render('result', { result, processo });
        }
    } catch (err) {
        // Renderize a página de erro com a mensagem de erro
        res.status(500).render('erro', { mensagem: "Erro: " + err.message });
    }
});
app.post('/pesquisapatg', async (req, res) => {
    const patg = req.body.patg;
    let processo;

    try {
        result = await pesquisaPatg(patg);
        
        if (result.length == 0) {
            processo = 0;
            res.render('result', { result, processo });
        } else {
            processo = 1;
            res.render('result', { result, processo });
        }
    } catch (err) {
        // Renderize a página de erro com a mensagem de erro
        res.status(500).render('erro', { mensagem: "Erro: " + err.message });
    }
});

app.post('/pesquisasintoma', (req, res) => {
    let sintomas = req.body.nomeSintoma; // Captura os sintomas enviados pelo formulário

    // Redireciona para a rota de resultados, passando os sintomas na query string
    res.redirect(`/resultdiag?sintomas=${sintomas.join(',')}`);
});

app.get('/resultdiag', async (req, res) => {
    try {
        let sintomas = req.query.sintomas;

        // Verifica se os sintomas foram passados corretamente
        if (!sintomas) {
            return res.status(400).render('erro', { mensagem: "Nenhum sintoma foi enviado." });
        }

        // Converte a string de sintomas em array
        sintomas = sintomas.split(',');

        const result = await listarDoencasPeloSintoma(sintomas);
        console.log("Doenças encontradas:", result);

        const perPage = 10; // Número máximo de doenças por página
        const page = parseInt(req.query.page) || 1; // Página atual, padrão 1

        const start = (page - 1) * perPage;
        const end = page * perPage;
        const paginatedDoencas = result.slice(start, end);

        // Renderiza a página de resultado com as doenças paginadas
        res.render('resultdiag', {
            doencas: paginatedDoencas,
            currentPage: page,
            totalPages: Math.ceil(result.length / perPage),
            sintomas // Passa os sintomas para manter na query string da paginação
        });
    } catch (err) {
        res.status(500).render('erro', { mensagem: "Erro ao listar doenças: " + err.message });
    }
});


// Rota para a página de consulta de doenças
app.get('/consultaindex', (req, res) => {
    res.render('consultaindex');
});

app.get('/consultar', (req, res) => {
    res.render('consultar');
});

app.get('/listadoencas', async (req,res) => {
    try {
        const perPage = 10;  // Número máximo de doenças por página
        const page = parseInt(req.query.page) || 1;  // Página atual, padrão 1
        // Chama a função assíncrona listar doencas
        const doencas = await listarDoencas();
        
        // Cálculo para encontrar o índice das doenças na página atual
        const start = (page - 1) * perPage;
        const end = page * perPage;
        const paginatedDoencas = doencas.slice(start, end);


        res.render('listadoencas', {
            doencas: paginatedDoencas,
            currentPage: page,
            totalPages: Math.ceil(doencas.length / perPage)
        });
    } catch (err) {
        // Renderize a página de erro com a mensagem de erro
        res.status(500).render('erro', { mensagem: "Erro ao listar doencas:" + err.message });
    }
});


app.get('/searchnpop', (req, res) => {
    res.render('searchnpop');
});

app.get('/searchntech', (req, res) => {
    res.render('searchntech');
});

app.get('/searchcid', (req, res) => {
    res.render('searchcid');
});

app.get('/searchpatg', (req, res) => {
    res.render('searchpatg');
});

app.get('/searchsimptoms', (req, res) => {
    res.render('searchsimptoms');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor está rodando em localhost:${port}`);
});

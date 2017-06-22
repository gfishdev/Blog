const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const dbFolder = __dirname + '/db';
const contatosDbPath = dbFolder + '/contatos.json';

// antes do servidor iniciar, verifica se a pasta db não existe
//se não existe, cria
if(!fs.existsSync(dbFolder))
    fs.mkdirSync(dbFolder);

var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'dist')));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/api/contato', function(req, res) {
    // le os contatos já gravados
    tryRead(contatosDbPath, function (contatos) {
        //inclui o novo contato
        contatos.push(req.body);
        //escreve arquivo com o contato novo
        fs.writeFile(contatosDbPath, JSON.stringify(contatos), function (err) {
            if(err) {
                res.statsu(500).json({error: 'Opa, detectamos um probleminha! Tente novamente mais tarde!'});
                return ;
            }
            //envia http code 200 e json com {success: true}
            res.status(200).json({sucess: true});
        });
    });
});

app.get('/api/artigo/*', function(req, res) {
    const artigosDbPath = dbFolder + '/artigos.json';
    tryRead(artigosDbPath, function(artigos) {
        var artigo = artigos.filter((artigo) => {
            return parseInt(artigo.id) == parseInt(req.params[0]);
        });
        res.status(200).json(artigo[0]);
    });
});

app.get('/api/artigos', function(req, res) {
    const artigosDbPath = dbFolder + '/artigos.json';
    tryRead(artigosDbPath, function(artigos) {
        res.status(200).json(artigos);
    });
});

// se o arquivo não existe, retorna JSON array vazio
// se o arquivo existe, retorna JSON array com todos os controles
var tryRead = function(path, callback) {
    fs.readFile(path, 'utf8', function (err, contatos) {
        if (err) return callback([]);
        var contatosJSON = [];
        try {
            contatosJSON = JSON.parse(contatos);
        }
        catch (err) { }

        return callback(contatosJSON);
    });
}

app.get('*', function(req, res) {
    res.status(404).send({error: 'API Not found'});
});

app.listen(process.env.PORT || 3000, function() {
    console.log('escutando na porta 3000');
});
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const { Parser } = require('json2csv');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com o banco MySQL no Railway
const connection = mysql.createConnection({
  host: 'yamanote.proxy.rlwy.net',
  user: 'root',
  password: 'RkjbYpMdIaBDKvBrVYLIpGfumeNFlkQA',
  database: 'railway',
  port: 34062
});

// Teste de conexão
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err);
    return;
  }
  console.log('✅ Conectado ao MySQL com sucesso!');
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 🔥 Registrar presença
app.post('/api/presenca', (req, res) => {
  const { nome, agregado } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const hoje = new Date();
  const dataFormatada = hoje.toISOString().split('T')[0]; // Formato YYYY-MM-DD

  const sql = 'INSERT INTO presencas (nome, agregado, data) VALUES (?, ?, ?)';
  const values = [nome, agregado || '', dataFormatada];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('❌ Erro ao inserir no MySQL:', err.sqlMessage || err.message || err);
      return res.status(500).json({ error: 'Erro ao registrar presença no banco.' });
    }
    console.log('✅ Presença registrada no MySQL:', results);
    res.json({ message: 'Presença registrada com sucesso!' });
  });
});

// 🔥 Listar presenças
app.get('/api/lista', (req, res) => {
  const sql = 'SELECT * FROM presencas ORDER BY id DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Erro ao listar presenças:', err);
      return res.status(500).json({ error: 'Erro ao buscar presenças.' });
    }
    res.json(results);
  });
});

// 🔥 Limpar presenças (remove tudo)
app.delete('/api/limpar', (req, res) => {
  const sql = 'DELETE FROM presencas';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Erro ao limpar presenças:', err);
      return res.status(500).json({ error: 'Erro ao limpar presenças.' });
    }
    res.json({ message: 'Lista de presença limpa com sucesso!' });
  });
});



app.get('/ping', (req, res) => {
  res.send('pong');
});


app.get('/api/backup', (req, res) => {
  const sql = 'SELECT * FROM presencas ORDER BY id DESC';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao gerar backup:', err);
      return res.status(500).json({ error: 'Erro ao gerar backup' });
    }

    try {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(results);

      const dataAtual = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup_presencas_${dataAtual}.csv`;

      // 🔽 Configura o download
      res.header('Content-Type', 'text/csv');
      res.attachment(fileName);
      res.send(csv);

    } catch (err) {
      console.error('Erro ao converter para CSV:', err);
      res.status(500).json({ error: 'Erro ao gerar CSV' });
    }
  });
});

// 🔥 SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


// 🔥 Start servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

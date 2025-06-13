const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = process.env.PORT || 3000;
const CSV_FILE = path.join(__dirname, 'presencas.csv');

app.use(cors());
app.use(express.json());

// Ajuste aqui conforme sua estrutura. Exemplo:
// Se backend e public estão no mesmo nível:
app.use(express.static(path.join(__dirname, '../public')));

// Escrita no CSV, seu código permanece igual
// Escrita no CSV, seu código permanece igual
// Escrita no CSV, seu código permanece igual
// Escrita no CSV, seu código permanece igual
// Escrita no CSV, seu código permanece igual
const csvWriter = createCsvWriter({
  path: CSV_FILE,
  header: [
    { id: 'nome', title: 'Nome' },
    { id: 'agregado', title: 'Agregado' },
    { id: 'data', title: 'Data' }
  ],
  append: fs.existsSync(CSV_FILE)
});

app.post('/api/presenca', async (req, res) => {
  const { nome, agregado } = req.body;

  const novaPresenca = {
    nome,
    agregado: agregado || '',
    data: new Date().toISOString()
  };

  try {
    await csvWriter.writeRecords([novaPresenca]);
    res.json({ message: 'Presença registrada com sucesso (CSV)!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar no CSV.' });
  }
});

// Rota para baixar o CSV
app.get('/api/presencas', (req, res) => {
  if (fs.existsSync(CSV_FILE)) {
    res.download(CSV_FILE, 'lista-presenca.csv');
  } else {
    res.status(404).json({ error: 'Arquivo CSV não encontrado.' });
  }
});

// Rota para listar os dados em JSON
app.get('/api/lista', (req, res) => {
  if (!fs.existsSync(CSV_FILE)) {
    return res.status(404).json({ error: 'Arquivo CSV não encontrado.' });
  }

  const csv = fs.readFileSync(CSV_FILE, 'utf-8');
  const linhas = csv.trim().split('\n').slice(1); // ignora cabeçalho

  const presencas = linhas.map(linha => {
    const [nome, agregado, data] = linha.split(',');
    return { nome, agregado, data };
  });

  res.json(presencas);
});

// fallback para o front, para rotas SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

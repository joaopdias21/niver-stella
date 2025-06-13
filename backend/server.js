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
app.use(express.static(path.join(__dirname, '../public'))); // frontend

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

// fallback: se alguém acessar algo que não é /api/, envia o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

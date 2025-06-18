const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// 🔥 Importa a chave do Firebase
const serviceAccount = require('../firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const presencasCollection = db.collection('presencas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 🔥 Registrar presença
app.post('/api/presenca', async (req, res) => {
  const { nome, agregado } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const hoje = new Date();
  const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;

  try {
    await presencasCollection.add({
      nome,
      agregado: agregado || '',
      data: dataFormatada
    });
    res.json({ message: 'Presença registrada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar presença.' });
  }
});

// 🔥 Listar presenças
app.get('/api/lista', async (req, res) => {
  try {
    const snapshot = await presencasCollection.get();
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar presenças.' });
  }
});

// 🔥 Limpar presenças (remove tudo)
app.delete('/api/limpar', async (req, res) => {
  try {
    const snapshot = await presencasCollection.get();
    const deletions = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletions);
    res.json({ message: 'Lista de presença limpa com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao limpar presenças.' });
  }
});

// 🔥 SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

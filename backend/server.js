const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 🔥 Importa a chave do Firebaseeeeee
const admin = require('firebase-admin') ;
 
admin.initializeApp({
  
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
  }),

});




const db = admin.firestore();
const presencasCollection = db.collection('presencas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));


// Logo após carregar as variáveis de ambiente e antes de inicializar o Firebase:
console.log('=== Variáveis de ambiente ===');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY (início):', process.env.FIREBASE_PRIVATE_KEY?.slice(0, 30)); // s


// 🔥 Registrar presença
app.post('/api/presenca', async (req, res) => {
  console.log('POST /api/presenca recebido com body:', req.body);

  const { nome, agregado } = req.body;

  if (!nome) {
    console.log('Erro: nome obrigatório não fornecido');
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const hoje = new Date();
  const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}/${
    (hoje.getMonth() + 1).toString().padStart(2, '0')
  }/${hoje.getFullYear()}`;

  try {
    console.log('Tentando adicionar presença no Firestore...');
    await presencasCollection.add({
      nome,
      agregado: agregado || '',
      data: dataFormatada,
    });
    console.log('Presença adicionada com sucesso:', { nome, agregado, data: dataFormatada });
    res.json({ message: 'Presença registrada com sucesso!' });
  } catch (error) {
    console.error('Erro no Firebase:', error);
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

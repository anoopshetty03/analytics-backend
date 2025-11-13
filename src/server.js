require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { connectWithRetry } = require('./config/db');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({limit: '1mb'}));

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

async function start(){
  try {
    await connectWithRetry();
    app.listen(PORT, ()=> console.log('DB connected. Listening', PORT));
  } catch(err){
    console.error('Failed to start', err);
    process.exit(1);
  }
}
start();

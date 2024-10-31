// index.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const fetchRates = require('./services/fetchRates');

const app = express();

// Middleware
app.use(express.json());

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Veri çekme işlemini başlatma (uygulama ilk çalıştığında)
fetchRates();

// Cron job tanımlama
cron.schedule(process.env.FETCH_TIME, () => {
  console.log('Cron job çalıştı:', new Date());
  fetchRates();
});

// Sunucuyu Başlatma
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

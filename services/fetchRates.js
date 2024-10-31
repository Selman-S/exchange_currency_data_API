const axios = require('axios');
const cheerio = require('cheerio');
const Rate = require('../models/Rate');
require('dotenv').config();

const fetchRates = async () => {
  try {
    
    // Altın fiyatlarını çekme
    const goldResponse = await axios.get(process.env.GOLD_URL);
    await parseAndSaveData(goldResponse.data, 'gold');
    
    
    // Döviz kurlarını çekme
    const currencyResponse = await axios.get(process.env.CURRENCY_URL);
    await parseAndSaveData(currencyResponse.data, 'currency');
    
  

    console.log('Veriler başarıyla çekildi ve kaydedildi');
  } catch (error) {
     console.error('Veri çekme hatası:', error);
  }
};

const parseAndSaveData = async (html, type) => {
  const $ = cheerio.load(html);
  const rates = [];
  
  // Tabloyu seçme (sitenin HTML yapısına göre ayarlamanız gerekebilir)
  $('.table tbody tr').each((index, element) => {
    let name;
    if (type === 'gold') {
  
       name = $(element).find('td:nth-child(1)').text().trim();
      
    }else if (type === 'currency') {
      name = $(element).find('td:nth-child(1) h5').text().trim();
    }
      if (name === '') {
        return;
        
      }

  
    const buyPrice = parseFloat($(element).find('[id$="Buy"]').text().replace(',', '.'));
    const sellPrice = parseFloat($(element).find('[id$="Sell"]').text().replace(',', '.'));


    // Yeni bir Rate nesnesi oluşturma
    const rate = new Rate({
      type,
      name,
      buyPrice,
      sellPrice,
      date: new Date(), // Bugünün tarihi
    });
    rates.push(rate);
  });


  // Veritabanına kaydetme
  for (const rate of rates) {
    const rateData = rate.toObject();
    delete rateData._id; // _id alanını çıkarıyoruz

    await Rate.findOneAndUpdate(
      { type: rate.type, name: rate.name, date: { $gte: startOfToday(), $lte: endOfToday() } },
      rateData,
      { upsert: true, new: true }
    );
  }
};

// Yardımcı fonksiyonlar
const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const endOfToday = () => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
};

module.exports = fetchRates;

const axios = require('axios');
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

// Models to try in order of preference (and cost/speed)
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

async function analyzeTasks(tasks) {
  const now = new Date();

  const prompt = `
      Sen uzman bir proje yöneticisi yapay zekasın.
      Şu anki Tarih ve Saat: ${now.toISOString()}
      
      Aşağıdaki görev listesini (JSON) analiz et:
      ${JSON.stringify(tasks, null, 2)}
      
      Amacın: Planlama çakışmalarını, gerçekçi olmayan teslim tarihlerini ve öncelik hatalarını tespit etmektir.
      
      Kurallar:
      1. 'deadline' (Son Teslim Tarihi) ile Şu Anki Tarihi KARŞILAŞTIR. Eğer tarih geçmişse veya çok yaklaştıysa (24 saat içinde) ve görev tamamlanmadıysa, bu YÜKSEK RİSKTİR.
      2. Bağımlılıkları (Dependencies) KONTROL ET. Eğer Görev B, Görev A'ya bağlıysa; ancak Görev A'nın teslim tarihi Görev B'den sonraysa, bu KRİTİK BİR ÇAKIŞMADIR.
      3. Süreyi (Duration) KONTROL ET. Eğer bir görevin süresi, teslim tarihine kalan süreden fazlaysa, bu bir RİSKTİR.
      4. Öncelik (Yüksek > Orta > Düşük) ve Aciliyet (Tarih) durumuna göre görevleri yeniden sıralamayı öner.
      
      SADECE HAM JSON DÖNDÜR. MARKDOWN YOK. YORUM YOK. JSON cevap Türkçe olmalı.
      Format:
      {
        "risks": [
           { "taskId": "görev id'si", "message": "Riskin nedenini açıklayan net, Türkçe bir mesaj." }
        ],
        "suggestions": [
           "Uygulanabilir net öneri 1 (Türkçe)",
           "Uygulanabilir net öneri 2 (Türkçe)"
        ]
      }
      
      Eğer her şey mükemmel görünüyorsa, öneriler kısmında motive edici Türkçe bir mesaj ver.
  `;

  for (const model of MODELS) {
    try {
      console.log(`Analyzing with model: ${model}...`);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

      const response = await axios.post(url, {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        const text = response.data.candidates[0].content.parts[0].text;
        console.log(`Success with ${model}`);

        // Clean JSON
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
          const jsonText = text.substring(firstBrace, lastBrace + 1);
          return JSON.parse(jsonText);
        }
      }
    } catch (error) {
      console.error(`Error with ${model}:`, error.response ? error.response.data : error.message);
      // Try next model
    }
  }

  return {
    risks: [],
    suggestions: ["Yapay zeka bağlantısı sağlanamadı. Lütfen API anahtarınızı kontrol edin."]
  };
}

module.exports = { analyzeTasks };

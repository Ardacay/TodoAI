const axios = require('axios');
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

// Models to try in order of preference (and cost/speed)
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

async function analyzeTasks(tasks) {
  const now = new Date();

  // Pre-calculate time differences to help the AI (LLMs are sometimes bad at date math)
  const tasksWithContext = tasks.map(t => {
    let hoursRemaining = null;
    if (t.deadline) {
      const deadlineDate = new Date(t.deadline);
      const diffMs = deadlineDate - now;
      hoursRemaining = (diffMs / (1000 * 60 * 60)).toFixed(1);
    }
    return {
      ...t,
      hoursRemaining: hoursRemaining ? `${hoursRemaining} saat` : 'Belirsiz',
      isOverdue: hoursRemaining && parseFloat(hoursRemaining) < 0
    };
  });

  const prompt = `
      Sen uzman bir proje yöneticisi yapay zekasın.
      Şu anki Tarih ve Saat: ${now.toISOString()}
      
      Aşağıdaki görev listesini (JSON) analiz et:
      ${JSON.stringify(tasksWithContext, null, 2)}
      
      Amacın: Planlama çakışmalarını, gerçekçi olmayan teslim tarihlerini ve öncelik hatalarını tespit etmektir.
      
      Kurallar:
      1. 'hoursRemaining' (Kalan Saat) değerini KONTROL ET. Eğer negatifse, görev GECİKMİŞTİR (YÜKSEK RİSK).
      2. 'duration' (Tahmini Süre) ile 'hoursRemaining' değerini KARŞILAŞTIR. Eğer Duration > hoursRemaining ise (ve görev tamamlanmadıysa), bu bir "YETİŞME RİSKİ"dir.
         Örnek: Duration 5 saat ama hoursRemaining 2 saat ise -> RİSK.
      3. Bağımlılıkları KONTROL ET. Eğer Görev B, Görev A'ya bağlıysa; ancak A'nın teslim tarihi B'den sonraysa RİSKTİR.
      4. Öncelik ve Aciliyet durumuna göre sıralama önerileri yap.
      
      SADECE HAM JSON DÖNDÜR. MARKDOWN YOK. YORUM YOK. JSON cevap Türkçe olmalı.
      Format:
      {
        "risks": [
           { 
             "taskId": "görev id'si", 
             "taskTitle": "Görev Adı",
             "message": "Riskin nedenini açıklayan net, Türkçe bir mesaj." 
           }
        ],
        "suggestions": [
           "Uygulanabilir net öneri 1 (Türkçe)",
           "Uygulanabilir net öneri 2 (Türkçe)"
        ]
      }
      
      Eğer her şey mükemmel görünüyorsa, risk dizisi boş olsun ve öneriler kısmında motive edici Türkçe bir mesaj ver.
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
          const result = JSON.parse(jsonText);

          // Post-process to ensure task titles are correct (AI can be unreliable with copying names)
          if (result.risks && Array.isArray(result.risks)) {
            result.risks = result.risks.map(risk => {
              const originalTask = tasks.find(t => t.id === risk.taskId);
              return {
                ...risk,
                taskTitle: originalTask ? originalTask.title : risk.taskTitle || "Bilinmeyen Görev"
              };
            });
          }

          return result;
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

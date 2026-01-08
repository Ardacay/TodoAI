const axios = require('axios');
require("dotenv").config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    console.log("---------------------------------------------------");
    console.log("Mevcut Modeller Listeleniyor...");

    if (!key) {
        console.error("❌ HATA: GEMINI_API_KEY bulunamadı!");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        console.log("✅ BAŞARILI! Erişim sağlandı.");
        console.log("Kullanılabilir Modeller:");

        const models = response.data.models;
        if (models && models.length > 0) {
            models.forEach(model => {
                if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${model.name}`);
                }
            });
        } else {
            console.log("⚠️  Hiçbir model bulunamadı.");
        }

    } catch (error) {
        console.error("❌ BAŞARISIZ: Liste alınamadı.");
        if (error.response) {
            console.error("HTTP Status:", error.response.status);
            console.error("Hata Mesajı:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Hata:", error.message);
        }
    }
    console.log("---------------------------------------------------");
}

listModels();

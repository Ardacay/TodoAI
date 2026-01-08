const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log("Fetching available models...");
        // For google-generative-ai version > 0.1.0 (approx), listModels is on the genAI instance or similar? 
        // Actually typically it's not directly exposed in the high level helper sometimes. 
        // But let's try getting a model and running count tokens or something simple to verify auth.
        // Or just try specific models.

        // Actually, simply trying a generation with a fallback model list might be better.

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Testing gemini-1.5-flash...");
        try {
            await model.generateContent("Test");
            console.log("SUCCESS: gemini-1.5-flash works.");
        } catch (e) { console.log("FAILED gemini-1.5-flash: " + e.message) }

        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Testing gemini-pro...");
        try {
            await model2.generateContent("Test");
            console.log("SUCCESS: gemini-pro works.");
        } catch (e) { console.log("FAILED gemini-pro: " + e.message) }

    } catch (error) {
        console.error("Global Error:", error);
    }
}

listModels();

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS_TO_TRY = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

async function analyzeTasks(tasks) {
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Trying AI model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const now = new Date();

      const prompt = `
      You are an expert project manager AI.
      Current Date and Time: ${now.toISOString()}
      
      Analyze the following tasks JSON list:
      ${JSON.stringify(tasks, null, 2)}
      
      Your goal is to identify scheduling conflicts, unrealistic deadlines, and priority mismanagement.
      
      Rules:
      1. COMPARE the 'deadline' with Current Date. If deadline is passed or very close (within 24 hours) and not completed, its a HIGH RISK.
      2. CHECK Dependencies. If Task B depends on Task A, but Task A has a later deadline than Task B, that is a CRITICAL CONFLICT.
      3. CHECK Duration. If a task takes longer than the time remaining until deadline, that is a RISK.
      4. Suggest re-ordering tasks based on Priority (High > Medium > Low) and Urgency (Deadline).
      
      RETURN ONLY RAW JSON. NO MARKDOWN. NO COMMENTS.
      Format:
      {
        "risks": [
           { "taskId": "id of task", "message": "Clear explanation of the risk why." }
        ],
        "suggestions": [
           "Specific actionable advice 1",
           "Specific actionable advice 2"
        ]
      }
      
      If everything looks perfect, give positive reinforcement in suggestions.
    `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      console.log(`Success with ${modelName}. Response:`, text);

      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
        return JSON.parse(text);
      } else {
        throw new Error("Invalid JSON format");
      }
    } catch (error) {
      console.error(`Failed with model ${modelName}:`, error.message);
      // Continue to next model
    }
  }

  return {
    risks: [],
    suggestions: ["Üzgünüm, şu an hiçbir yapay zeka modeline erişilemiyor. Lütfen API anahtarınızı ve internet bağlantınızı kontrol edin."]
  };
}

module.exports = { analyzeTasks };

import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Initialize Gemini API
console.log("[AI Chat] Checking API Key...");
if (!process.env.GEMINI_API_KEY) {
    console.error("[AI Chat] GEMINI_API_KEY is NOT defined in environment variables!");
} else {
    console.log("[AI Chat] GEMINI_API_KEY is present (Length: " + process.env.GEMINI_API_KEY.length + ")");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const aiChat = async (req, res) => {
    console.log("[AI Chat] POST /api/ai-chat request received");
    try {
        const { message, disabilityType, assistiveNeeds } = req.body;
        console.log("[AI Chat] Message:", message);
        console.log("[AI Chat] Context:", { disabilityType, assistiveNeeds });

        if (!message) {
            console.warn("[AI Chat] No message provided in request body");
            return res.status(400).json({ success: false, message: "No message provided." });
        }

        let contextPrompt = "";
        if (disabilityType || assistiveNeeds) {
            contextPrompt = `\n[Context: The user has identified with the following accessibility needs: ${disabilityType ? `Disability: ${disabilityType}. ` : ""}${assistiveNeeds ? `Assistive Needs: ${assistiveNeeds}.` : ""}. Please provide career advice and job search assistance with these needs in mind.]\n`;
        }

        const systemPrompt = `You are an AI Career Assistant for a job portal called Superio. 
Your goal is to help users find jobs, improve their resumes, and provide career advice. 
Be encouraging, professional, and focus on accessibility and inclusion.
Keep your responses concise and helpful.
${contextPrompt}
User: ${message}
AI Assistant:`;

        console.log("[AI Chat] Sending request to Gemini API...");
        const result = await model.generateContent(systemPrompt);
        console.log("[AI Chat] Gemini API response received");
        const response = await result.response;
        const reply = response.text();
        console.log("[AI Chat] AI Reply:", reply);

        res.json({ success: true, reply });
    } catch (error) {
        console.error("[AI Chat] ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to generate AI response.", error: error.message });
    }
};

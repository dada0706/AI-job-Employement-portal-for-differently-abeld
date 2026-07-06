import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import "dotenv/config";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No resume file uploaded." });
        }

        const fileBuffer = req.file.buffer;
        const fileType = req.file.mimetype;
        let text = "";

        // Extract text based on file type
        if (fileType === "application/pdf") {
            const parser = new PDFParse({ data: fileBuffer });
            const pdfData = await parser.getText();
            text = pdfData.text;
        } else if (
            fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            fileType === "application/msword"
        ) {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            text = result.value;
        } else {
            return res.status(400).json({ success: false, message: "Unsupported file format. Please upload PDF or DOCX." });
        }

        if (!text || text.trim() === "") {
            return res.status(400).json({ success: false, message: "Could not extract text from the document." });
        }

        // Call Gemini API
        const prompt = `
Analyze the following resume text. 
1. Extract employment history with company, start date, and end date.
2. Detect gaps longer than 3 months.
3. Provide suggestions for explaining the gaps.

Return the result as a structured JSON object exactly matching this schema:
{
"jobs": [
    { "company": "Company Name", "start": "Month Year", "end": "Month Year (or Present)"}
],
"gaps": [
    { "start": "Month Year", "end": "Month Year", "duration": "X months"}
],
"suggestions": [
    "Suggestion 1", "Suggestion 2"
]
}

Resume Text:
${text}
`;

        // Instruct Gemini to return JSON
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        res.json({ success: true, data });
    } catch (error) {
        console.error("Resume analysis error:", error);
        res.status(500).json({ success: false, message: "Failed to analyze resume.", error: error.message });
    }
};

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
const MODEL = "gemini-2.5-flash";

/**
 * Truncate text to avoid token overflow
 */
const truncateText = (text, maxChars = 12000) => {
  return text.length > maxChars ? text.substring(0, maxChars) + "..." : text;
};

/**
 * Safely parse JSON returned from AI
 */
const safeJSONParse = (content) => {
  try {
    const jsonStr = content.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Invalid JSON returned from AI:", content.slice(0, 300));
    throw new Error("AI returned invalid JSON");
  }
};

/**
 * Generate summary
 */
const generateSummary = async (text) => {
  try {
    const truncated = truncateText(text);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `You are an expert academic assistant. Generate a clear, structured summary of the following text. Use bullet points for key concepts and important details.\n\n${truncated}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Summary generation error:", error.message);
    throw new Error("Failed to generate summary: " + error.message);
  }
};

/**
 * Generate flashcards
 */
const generateFlashcards = async (text, count = 10) => {
  try {
    const truncated = truncateText(text);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `You are an expert educator. Generate exactly ${count} flashcards from the following text.
Return ONLY a valid JSON array with no markdown, no extra text, like this:
[{"question":"...","answer":"..."},{"question":"...","answer":"..."}]

Text:
${truncated}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    return safeJSONParse(content);
  } catch (error) {
    console.error("Flashcard generation error:", error.message);
    throw new Error("Failed to generate flashcards: " + error.message);
  }
};

/**
 * Generate quiz questions
 */
const generateQuiz = async (text, count = 5) => {
  try {
    const truncated = truncateText(text);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `You are an expert educator. Generate exactly ${count} multiple-choice quiz questions from the following text.
Each question must have exactly 4 options labeled A, B, C, D and one correct answer.
Return ONLY a valid JSON array with no markdown, no extra text, like this:
[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":"A. ..."}]

Text:
${truncated}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    return safeJSONParse(content);
  } catch (error) {
    console.error("Quiz generation error:", error.message);
    throw new Error("Failed to generate quiz: " + error.message);
  }
};

/**
 * Chat with document context
 * @param {string} documentText - The full extracted text of the document
 * @param {Array} history - Array of { role: 'user'|'assistant', content: string }
 * @param {string} userMessage - The latest user message
 */
const chatWithDocument = async (documentText, history = [], userMessage) => {
  try {
    const truncated = truncateText(documentText, 10000);
    const model = genAI.getGenerativeModel({ model: MODEL });

    // Build the conversation parts
    const systemContext = `You are an AI learning assistant helping a student understand a document. 
Answer questions clearly and helpfully based on the document content provided below.

DOCUMENT CONTENT:
${truncated}

---
If the question is not related to the document, still try to help but mention it may be outside the document scope.`;

    // Convert history to Gemini chat format
    const chatHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemContext }] },
        { role: "model", parts: [{ text: "Understood! I have read the document and I'm ready to help you learn from it. What would you like to know?" }] },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Chat error:", error.message);
    throw new Error("Failed to process chat: " + error.message);
  }
};

module.exports = { generateSummary, generateFlashcards, generateQuiz, chatWithDocument };
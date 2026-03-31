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


/**
 * Generate quiz with difficulty level
 * @param {string} text - Document text
 * @param {number} count - Number of questions
 * @param {'easy'|'medium'|'hard'} difficulty
 */
const generateQuizWithDifficulty = async (text, count = 5, difficulty = "medium") => {
  try {
    const truncated = truncateText(text);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const difficultyInstruction = {
      easy: "Generate basic recall and definition questions. Focus on key terms, simple facts, and straightforward concepts. Questions should be answerable directly from the text.",
      medium: "Generate a mix of comprehension and application questions. Include some that require understanding relationships between concepts and applying knowledge to scenarios.",
      hard: "Generate challenging analysis, evaluation, and synthesis questions. Include questions that require comparing concepts, identifying implications, critical thinking, and drawing conclusions beyond the literal text.",
    }[difficulty];

    const prompt = `You are an expert educator. Generate exactly ${count} multiple-choice quiz questions from the following text.
Difficulty: ${difficulty.toUpperCase()} — ${difficultyInstruction}
Each question must have exactly 4 options labeled A, B, C, D and one correct answer.
Also provide a brief explanation for the correct answer.
Return ONLY a valid JSON array with no markdown, no extra text, like this:
[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":"A. ...","explanation":"..."}]

Text:
${truncated}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    return safeJSONParse(content);
  } catch (error) {
    console.error("Difficulty quiz generation error:", error.message);
    throw new Error("Failed to generate quiz: " + error.message);
  }
};

/**
 * Generate personalized learning recommendations from quiz history
 * @param {Array} quizHistory - Array of quiz objects with score, title, difficulty, questions
 */
const generateRecommendations = async (quizHistory) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const historyContext = quizHistory
      .slice(-10) // use last 10 quizzes max
      .map((q) => ({
        title: q.title,
        difficulty: q.difficulty || "medium",
        score: q.score,
        total: q.totalQuestions,
        percentage: q.totalQuestions > 0 ? Math.round((q.score / q.totalQuestions) * 100) : 0,
        timedOut: q.timedOut || false,
      }));

    const avgScore =
      historyContext.length > 0
        ? Math.round(historyContext.reduce((sum, q) => sum + q.percentage, 0) / historyContext.length)
        : 0;

    const prompt = `You are a personalized AI learning coach. Analyze this student's quiz history and generate actionable learning recommendations.

Quiz History (most recent first):
${JSON.stringify(historyContext, null, 2)}

Overall average score: ${avgScore}%
Total quizzes taken: ${historyContext.length}

Based on this data, generate 4-6 personalized recommendations. Consider:
- Topics where the student scored below 70% → high priority
- Topics with timeouts suggest time management issues
- Patterns in difficulty levels attempted
- Suggestions for what to study next

Return ONLY a valid JSON object with no markdown:
{
  "overallSummary": "2-3 sentence summary of the student's learning progress",
  "recommendations": [
    {
      "topic": "specific topic or skill name",
      "reason": "why this is recommended based on their data",
      "priority": "high|medium|low",
      "suggestedAction": "specific actionable step to take",
      "resourceType": "document|quiz|flashcard|review"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    return safeJSONParse(content);
  } catch (error) {
    console.error("Recommendations generation error:", error.message);
    throw new Error("Failed to generate recommendations: " + error.message);
  }
};

module.exports = { generateSummary, generateFlashcards, generateQuiz, generateQuizWithDifficulty, generateRecommendations, chatWithDocument };
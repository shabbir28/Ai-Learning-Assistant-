const pdfParse = require("pdf-parse");
const fs = require("fs");

/**
 * Extracts text from a PDF file
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF parse error:", error.message);
    throw new Error("Failed to extract text from PDF");
  }
};

module.exports = { extractTextFromPDF };

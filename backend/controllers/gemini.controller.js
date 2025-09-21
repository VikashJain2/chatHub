import { getChatSession } from "../utils/chatSession.js";
import { addToHistory } from "../utils/historyManager.js";

export const genAIChat = async (req, res) => {
  try {
    const { userId } = req.user;
    const { prompt } = req.body;

    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Prompt" });
    }

    const finalPrompt = `
${prompt}

Return strictly as a JSON array of complete suggestions.
- Each suggestion should be a full response (do NOT split a single suggestion into multiple lines).
- Example format: ["Complete suggestion 1", "Complete suggestion 2", "Complete suggestion 3"]
- Do NOT include any explanation, markdown, or extra text outside the array.
`;

    const chatSession = getChatSession(userId);
    const result = await chatSession.sendMessage(finalPrompt);
    let aiResponse = result.response.text();

    addToHistory(userId, "user", prompt);
    addToHistory(userId, "model", aiResponse);

    aiResponse = aiResponse.replace(/```(json)?/g, "").trim();

    let suggestions = [];
    try {
      suggestions = JSON.parse(aiResponse);
      if (!Array.isArray(suggestions)) suggestions = [aiResponse];
    } catch {
      suggestions = [aiResponse];
    }

    return res.status(200).json({ success: true, response: suggestions });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

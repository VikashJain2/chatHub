import model from "../config/gemini.js";
import { defaultGenerationConfig } from "../config/generationConfig.js";
import { getUserHistory } from "./historyManager.js";

const chatSession = {};
export const getChatSession = (userId) => {
  if (!chatSession[userId]) {
    chatSession[userId] = model.startChat({
      generationConfig: defaultGenerationConfig,
      history: getUserHistory(userId),
    });
  }
  return chatSession[userId];
};

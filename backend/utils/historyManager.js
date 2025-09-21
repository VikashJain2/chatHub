const chatHistory = {};

export const getUserHistory = (userId) => {
  if (!chatHistory[userId]) chatHistory[userId] = [];
  return chatHistory[userId];
};

export const addToHistory = (userId, role, text) => {
  if (!chatHistory[userId]) chatHistory[userId] = [];
  chatHistory[userId].push({ role, parts: [{ text }] });
};

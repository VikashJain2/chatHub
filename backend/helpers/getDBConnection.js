import db from "../config/db.js";
export const getDBConnection = async () => {
  try {
    return await db.getConnection();
  } catch (error) {
    console.error("Failed to get database connection:", error);
    throw new Error("Database connection failed");
  }
};
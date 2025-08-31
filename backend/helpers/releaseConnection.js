// Helper function to safely release database connections
export const releaseConnection = (connection) => {
  if (connection && typeof connection.release === "function") {
    connection.release();
  }
};
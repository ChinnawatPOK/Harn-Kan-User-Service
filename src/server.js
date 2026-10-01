import app from "./app.js";
import env from "./config/env.js";
import connectDatabase from "./config/database.js";

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`User Service running on port ${env.PORT}`);
    });

    return server;
  } catch (error) {
    console.error("Failed to start User Service:", error.message);

    process.exit(1);
  }
};

startServer();

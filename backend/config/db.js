const mongoose = require("mongoose");

/**
 * Connect to MongoDB with basic retry/backoff.
 * Does not call process.exit on first failure; instead retries a few times
 * so the server can start and recover in flaky network environments.
 */
const connectDB = async (options = {}) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not defined in .env");

  const maxRetries = options.maxRetries || 5;
  const baseDelay = options.baseDelayMs || 1000; // 1s

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt += 1;
      await mongoose.connect(uri, {
        // mongoose v6+ removed useNewUrlParser/useUnifiedTopology flags but leaving for compatibility
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connected");
      return mongoose.connection;
    } catch (err) {
      console.error(
        `MongoDB connection attempt ${attempt} failed:`,
        err && err.message ? err.message : err,
      );
      if (attempt >= maxRetries) {
        console.error(`MongoDB: reached max retries (${maxRetries}).`);
        // do not exit process here; caller can decide what to do
        throw err;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying MongoDB connection in ${delay}ms...`);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

module.exports = connectDB;

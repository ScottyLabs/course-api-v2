import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import routes from "./controllers/index.js";
import cors from "cors";
import { KeyStore, generateSigningRequestHandler } from "passlink-server";

dotenv.config();

KeyStore.readKey(process.env.LOGIN_API_KEY);

const signingRequestHandler = generateSigningRequestHandler({
  redirectUrl: 'https://stg-course.scottylabs.org',
  restrictDomain: true,
  applicationId: process.env.LOGIN_API_ID
}, KeyStore.getSecretKey(), true);

const app = express();
const port = process.env.PORT || 3000;
const database = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());

// Set up Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

routes(app);

app.get("/", function (req, res) {
  res.send("ScottyLabs Course API");
});

app.get("/signingrequest", signingRequestHandler);

app.listen(port, () => console.log(`App listening on port ${port}.`));

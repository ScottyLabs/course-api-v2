import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import routes from "./controllers/index.js";
import cors from "cors";

dotenv.config();
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

app.listen(port, () => console.log(`App listening on port ${port}.`));

import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import routes from './routes/routes.js';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const database = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Set up Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

routes(app);

app.get("/", function(req, res) {
    res.send("ScottyLabs CourseAPI Homepage r. Spring 2020");
});

app.listen(port, () =>
    console.log(`App listening on port ${port}.`)
);
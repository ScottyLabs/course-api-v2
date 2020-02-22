import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import routes from './src/routes/routes.js';

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

routes(app);

app.get("/", function(req, res) {
    res.send("ScottyLabs CourseAPI Homepage");
});

app.listen(port, () =>
    console.log(`App listening on port ${port}.`)
);
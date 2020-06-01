import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import routes from './routes/routes.js';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const database = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set cors policy
var whitelist = [
  'http://course.scottylabs.org',
  'https://course.scottylabs.org',
];

var corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

if (process.env.NODE_ENV === 'production') app.use(cors(corsOptions));
else app.use(cors());

// Set up Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app);

app.get('/', function (req, res) {
  res.send('ScottyLabs Course API');
});

app.listen(port, () => console.log(`App listening on port ${port}.`));

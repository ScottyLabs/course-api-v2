import fs from 'fs';
import mongoose from "mongoose";
import {fceSchema} from "../models/fceModel.js"
import dotenv from "dotenv";

dotenv.config();
const database = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const FCE  = mongoose.model("FCE", fceSchema);

const fceUpload = async ()  => {
    let fces = fs.readFileSync('./FCEs.json');
    fces = JSON.parse(fces); //data getting lost here :(
    console.log(fces.length);
    let count = 0;

    for (let entry of fces) {
        const document = new FCE(entry);
        await document.save();
        count++;
        //console.log(count);
    }
}

fceUpload();
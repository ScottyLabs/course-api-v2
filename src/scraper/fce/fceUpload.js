import fs from "fs";
import mongoose from "mongoose";
import { fceSchema } from "../../models/fceModel.js";
import dotenv from "dotenv";

dotenv.config();
const database = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const FCE = mongoose.model("FCE", fceSchema);

const fceUpload = async () => {
  let fces = fs.readFileSync("./results/FCEs.json");
  fces = JSON.parse(fces);
  console.log(fces.length);
  let count = 0;

  let courses = new Set();

  for (let entry of fces) {
    console.log(entry.courseID, entry.semester, entry.year);
    
    const docs = await FCE.find({
      courseID: entry.courseID,
      year: entry.year,
      semester: entry.semester,
    });

    if (docs.length > 0 && !courses.has(entry.courseID)) {
      console.log(`Found data for ${entry.courseID}, deleting and rewriting...`);
      await FCE.find({
        courseID: entry.courseID,
        year: entry.year,
        semester: entry.semester,
      }).deleteMany();
    }

    courses.add(entry.courseID);

    const document = new FCE(entry);
    await document.save();
    count++;
    //console.log(count);
  }
};

fceUpload().then(() => process.exit());

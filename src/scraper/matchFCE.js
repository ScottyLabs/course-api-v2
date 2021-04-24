import mongoose from "mongoose";
import { fceSchema } from "../models/fceModel.js";
import { courseSchema } from "../models/courseModel.js";
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
const Course = mongoose.model("Course", courseSchema)

FCE.find({}, async (error, fce) => {
    if (error) {
        console.log("error")
        return null //console.log(error)
    }
    let checked = new Set()
    let missing = []

    for (let f of fce) {
        //console.log(f.courseID)
        if (!checked.has (f.courseID)) {
            try {
                const courseExists = await Course.find({courseID : f.courseID})
                if (courseExists.length === 0) {
                    missing.push(f.courseID)
                    //console.log(f.courseID, missing)
                }
            }
            catch (err) {
                return null //console.log (err)
            }
            checked.add(f.courseID)
        }
    }

    //console.log (missing)
    for (let elem of missing) {
        console.log (elem)
    }
})
import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const database = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var db = mongoose.connection;
const FCEs = db.collection("fces");

FCEs.aggregate([
    {
        //Group course offerings by instructor, averaging overall ratings
        $group: {
            _id: "$instructor",
            andrewID: {$max: "$andrewID"},
            respectForStudents: {$avg: {$arrayElemAt: ["$rating", 6]}},
            interestInLearning: {$avg: {$arrayElemAt: ["$rating", 0]}},
            providesFeedback: {$avg: {$arrayElemAt: ["$rating", 2]}},
            departments: {$addToSet: "$department"},
            courseInfo: {$push: {
                courseID: "$courseID",
                year: "$year",
                semester: "$semester",
                hrsPerWeek: "$hrsPerWeek",
                rating7: {$arrayElemAt: ["$rating", 7]},
                rating8: {$arrayElemAt: ["$rating", 8]}
            }}
        }
    },
    {
        $unwind: {
            path: "$courseInfo",
            preserveNullAndEmptyArrays: false
        }
    },
    {
        //Groups different iterations of the same course taught by the same professor, averaging instructor+course ratings
        $group: {
            _id: { instructor: "$_id", courseID: "$courseInfo.courseID" },
            //instructor info
            andrewID: {$first: "$andrewID"},
            respectForStudents: {$first: "$respectForStudents"},
            interestInLearning: {$first: "$interestInLearning"},
            providesFeedback: {$first: "$providesFeedback"},
            departments: {$first: "$departments"},
            //course info
            teachingRating: {$avg: "$courseInfo.rating7"},
            overallRating: {$avg: "$courseInfo.rating8"},
            semesters: {$push: {
                hrsPerWeek: "$courseInfo.hrsPerWeek",
                year: "$courseInfo.year",
                semester: "$courseInfo.semester",
                isSummer: {$eq: ["$courseInfo.semester", "summer"]}
            }}
        }
    },
    {
        $unwind: {
            path: "$semesters",
            preserveNullAndEmptyArrays: false
        }
    },
    {
        //Groups as above, but separates academic year & summer and averages FCE over each
        $group: {
            _id: { instructor: "$_id.instructor", courseID: "$_id.courseID", isSummer: "$semesters.isSummer" },
            andrewID: {$first: "$andrewID"},
            respectForStudents: {$first: "$respectForStudents"},
            interestInLearning: {$first: "$interestInLearning"},
            providesFeedback: {$first: "$providesFeedback"},
            departments: {$first: "$departments"},
            hrsPerWeek: {$avg: "$semesters.hrsPerWeek"},
            teachingRating: {$first: "$teachingRating"},
            overallRating: {$first: "$overallRating"},
            semesters: {$push: {
                year: "$semesters.year",
                semester: "$semesters.semester"
            }}
        }
    },
    {
        $addFields: {
            yearHrsPerWeek: {$cond: {"if": "$_id.isSummer", then: null, "else": "$hrsPerWeek"}},
            summerHrsPerWeek: {$cond:{"if": "$_id.isSummer", then: "$hrsPerWeek", "else": null}}
        }
    },
    {
        $unwind: {
            path: "$semesters",
            preserveNullAndEmptyArrays: false
        }
    },
    {
        //Combines the academic year & summer data
        $group: {
            _id: { instructor: "$_id.instructor", courseID: "$_id.courseID" },
            andrewID: {$first: "$andrewID"},
            respectForStudents: {$first: "$respectForStudents"},
            interestInLearning: {$first: "$interestInLearning"},
            providesFeedback: {$first: "$providesFeedback"},
            departments: {$first: "$departments"},
            yearHrsPerWeek: {$avg: "$yearHrsPerWeek"},
            summerHrsPerWeek: {$avg: "$summerHrsPerWeek"},
            teachingRating: {$first: "$teachingRating"},
            overallRating: {$first: "$overallRating"},
            semesters: {$push: {
                year: "$semesters.year",
                semester: "$semesters.semester"
            }}
        }
    },
    {
        //Combines the course data to get back to grouping by instructor, duplicating the name field
        $group: {
            _id: "$_id.instructor",
            name: {$first: "$_id.instructor"},
            andrewID: {$first: "$andrewID"},
            departments: {$first: "$departments"},
            courses: {$push: {
                courseID: "$_id.courseID",
                yearHrsPerWeek: "$yearHrsPerWeek",
                summerHrsPerWeek: "$summerHrsPerWeek",
                teachingRating: "$teachingRating",
                overallRating: "$overallRating",
                semesters: "$semesters"
            }},
            respectForStudents: {$first: "$respectForStudents"},
            interestInLearning: {$first: "$interestInLearning"},
            providesFeedback: {$first: "$providesFeedback"}
        }
    },
    {
        //Finally, gives each object its own ID
        $set: {
            _id: "$ObjectId()"
        }
    }],
    (err, cursor) => {
        if (err) console.log("Failed to get data.");
        else {
            cursor.toArray((error, documents) => {
                if (error) { console.log("Failed to get documents.") }
                else {
                    if (!fs.existsSync("./results")) {
                        fs.mkdirSync("./results");
                    }
                    fs.writeFile(
                        "./results/profs.json",
                        JSON.stringify(documents, null, 2),
                        function (err) {
                            console.log(err);
                            process.exit();
                        }
                    );
                }
            });
        }
    }
);

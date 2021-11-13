import mongoose from "mongoose";
import { fceSchema } from "../models/fceModel.js";

const FCE = mongoose.model("FCE", fceSchema);

let ratings = FCE.aggregate([
    {
        $group: {
            _id: "$instructor",
            andrewID: {$first: "$andrewID"},
            respectForStudents: {$avg: {$arrayElemAt: ["$rating", 6]}},
            interestInLearning: {$avg: {$arrayElemAt: ["$rating", 0]}},
            providesFeedback: {$avg: {$arrayElemAt: ["$rating", 2]}},
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
        $group: {
            _id: { instructor: "$_id", courseID: "$courseInfo.courseID" },
            //instructor info
            andrewID: {$first: "$andrewID"},
            respectForStudents: {$first: "$respectForStudents"},
            interestInLearning: {$first: "$interestInLearning"},
            providesFeedback: {$first: "$providesFeedback"},
            //course info
            hrsPerWeek: {$avg: "$courseInfo.hrsPerWeek"},
            teachingRating: {$avg: "$courseInfo.rating7"},
            overallRating: {$avg: "$courseInfo.rating8"},
            semesters: {$push: {
                year: "$courseInfo.year",
                semester: "$courseInfo.semester"
            }}
        }
    },
    {
        $group: {
            _id: "$_id.instructor",
            andrewID: { $first: "$andrewID" },
            courses: {$push: {
                courseID: "$_id.courseID",
                hrsPerWeek: "$hrsPerWeek",
                teachingRating: "$teachingRating",
                overallRating: "$overallRating",
                semesters: "$semesters"
            }},
            respectForStudents: { $first: "$respectForStudents" },
            interestInLearning: { $first: "$interestInLearning" },
            providesFeedback: { $first: "$interestInLearning" }
        }
    }
]);

console.log(res);

// TODO: Split up academic year / summer aggregation


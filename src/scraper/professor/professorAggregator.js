import mongoose from "mongoose";
import { fceSchema } from "../models/fceModel.js";

const FCE = mongoose.model("FCE", fceSchema);

let ratings = FCE.aggregate([
    {
        $group: { //test
            _id: "$instructor",
            andrewID: {$first: "$andrewID"},
            respectForStudents: { $avg: { $arrayElemAt: [ "$rating", 6 ] }},
            interestInLearning: { $avg: { $arrayElemAt: [ "$rating", 0 ] }},
            providesFeedback: { $avg: { $arrayElemAt: [ "$rating", 2 ] }},
            courseInfo: {$push: {
                courseID: "$courseID",
                year: "$year",
                semester: "$semester",
                hrsPerWeek: "$hrsPerWeek",
                rating7: {$arrayElemAt: ["$rating", 7]},
                rating8: {$arrayElemAt: ["$rating", 8]}
            }}
    },
    { 
    $group: {
        _id: { instructor: "$instructor", courseID: "$courseID" },
        andrewID: {$first: "$andrewID"},
        hrsPerWeek: {$avg: "$hrsPerWeek"},
        teachingRating: { $avg: { $arrayElemAt: [ "$rating", 7 ] } },
        overallRating: {$avg: { $arrayElemAt: [ "$rating", 8 ] } },
        semesters: {$push: {year: "$year", semester: "$semester"}},
        rating0: {$push: {$arrayElemAt: ["$rating", 0]}},
        rating2: {$push: {$arrayElemAt: ["$rating", 2]}},
        rating6: {$push: {$arrayElemAt: ["$rating", 6]}}
    }
    },
    {
        $group: {
            _id: "$_id.instructor",                           // "cnewstea"
            andrewID: { $first: "$andrewID" },                // “NEWSTEAD, CLIVE”
            courses: {$push: {
                courseID: "$_id.courseID",                  // “15-151”
                hrsPerWeek: "$hrsPerWeek",                  // 21.52
                teachingRating: "$teachingRating",          // 4.74
                overallRating: "$overallRating",            // 4.26
                semesters: "$semesters"                     // [{year: “2017”, semester: “summer”}, …]
            }},
            respectForStudents: { $avg: { $concatArrays: } },     // 5.00
            interestInLearning: { $avg: { $arrayElemAt: [ "$rating", 0 ] } },     // 5.00
            providesFeedback: { $avg: { $arrayElemAt: [ "$rating", 2 ] } }        // 4.00
        }
    }
]);

console.log(res);

// TODO: Split up academic year / summer aggregation


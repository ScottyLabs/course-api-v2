import mongoose from "mongoose";
import { fceSchema } from "../models/fceModel.js";

const FCE = mongoose.model("FCE", fceSchema);

let ratings = FCE.aggregate([
    {
        //Group course offerings by instructor, averaging overall ratings
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
        //Groups different iterations of the same course taught by the same professor, averaging instructor+course ratings
        $group: {
            _id: { instructor: "$_id", courseID: "$courseInfo.courseID" },
            //instructor info
            andrewID: {$first: "$andrewID"},
            respectForStudents: {$first: "$respectForStudents"},
            interestInLearning: {$first: "$interestInLearning"},
            providesFeedback: {$first: "$providesFeedback"},
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
        //Combines the course data to get back to grouping by instructor
        $group: {
            _id: "$_id.instructor",
            andrewID: {$first: "$andrewID"},
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
    }
]);

console.log(ratings);


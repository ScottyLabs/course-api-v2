import mongoose from 'mongoose';
import { fceSchema } from '../models/fceModel';
import { parseFCEData } from '../api/parser';
import { standardizeID } from '../api/util.js';

const FCE = mongoose.model('FCE', fceSchema);
const resultFilter = "-_id -__v -fce._id -fce.fall._id -fce.spring._id -fce.summer._id";

// Filters results to return only entries with specified instructor
function _purgeOtherInstructors(instructor, fce) {
    let entries = fce.fce;
    let deleteYears = [];
    entries.forEach((yearEntry, yearIdx) => {
        let sems = ["spring", "fall", "summer"];
        let deleteSems = [];
        sems.forEach(sem => {
            // Remove fceEntries with other professors from current semester
            let semester = yearEntry[sem];
            let deleteIndices = []
            semester.forEach((fceEntry, i) => {
                if (!fceEntry.instructor.toUpperCase()
                    .includes(instructor)) {
                    deleteIndices.push(i);
                }
            });
            // Remove entire semester if all entries invalid
            if (deleteIndices.length === semester.length) {
                deleteSems.push(sem);
                yearEntry[sem] = undefined;
            } else {
                for (let i = deleteIndices.length - 1; i >= 0; i--) {
                    semester.splice(deleteIndices[i], 1);
                }
                yearEntry[sem] = semester;
            }
        });
        if (deleteSems.length === sems.length) {
            deleteYears.push(yearIdx);
        }
    });
    // Remove entire year if all semesters invalid
    for (let i = deleteYears.length - 1; i >= 0; i--) {
        entries.splice(deleteYears[i], 1);
    }
}

export const getFCEWithID = (req, res) => {
    let id = standardizeID(req.params.courseID);

    FCE.findOne({ courseID: id }, (err, fce) => {
        if (err) return res.send(err);
        if (fce === null) {
            fce = {};
        } else {
            if (req.query !== undefined) {
                if(req.query.hasOwnProperty('instructor')) {
                    let instructor = req.query.instructor.toUpperCase();
                    _purgeOtherInstructors(instructor, fce);
                }
                if (req.query.hasOwnProperty('semesters')) {
                    let semesters = req.query.semesters;
                }
            }
        }
        return res.json(fce);
    }).select(resultFilter);
};

export const getFCEs = (req, res) => {
    FCE.find({}, (err, course) => {
        if (err) {
            res.send(err);
        }
        res.json(course);
    }).select(resultFilter);
}

export const updateFCE = (req, res) => {
    let fceDocs = parseFCEData();
    let FCEs = []
    console.log("Uploading FCEs");
    FCE.insertMany(fceDocs, (err, fce) => {
        if (err) {
            console.log("An error occured.");
            console.log(err);
            res.send(err);
        } else {
            console.log("Upload successful.");
            res.json({
                message: "Upload successful"
            });
        }
    });
}
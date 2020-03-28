import mongoose, { Query } from "mongoose";
import { fceSchema } from "../models/fceModel";
import { parseFCEData } from "../api/parser";
import { standardizeID } from "../api/util.js";

const FCE = mongoose.model("FCE", fceSchema);
const resultFilter =
    "-_id -__v -fce._id -fce.fall._id -fce.spring._id -fce.summer._id";

function hasOwnProperty(obj, property) {
    return obj[property] !== undefined || obj.hasOwnProperty(property);
}

// Filters results to return only entries with specified instructors
function _purgeOtherInstructors(instructors, fce) {
    let entries = fce.fce;
    let deleteYears = [];
    entries.forEach((yearEntry, yearIdx) => {
        let sems = ["spring", "summer", "fall"];
        let deleteSems = [];
        sems.forEach(sem => {
            // Remove fceEntries with other professors from current semester
            let semester = yearEntry[sem];
            let deleteIndices = [];
            semester.forEach((fceEntry, i) => {
                let good = false;
                instructors.forEach(instructor => {
                    good |= fceEntry.instructor
                        .toUpperCase()
                        .includes(instructor);
                });
                if (!good) deleteIndices.push(i);
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

// Filters results to only show the specified amount of past semesters
function _purgeOlderSemesters(semesters, fce) {
    if (semesters < 1) {
        return {
            error: "Semester count must be a positive integer!"
        };
    } else {
        let entries = fce.fce;
        let semesterCount = 0;
        let deleteYears = [];
        entries.forEach((yearEntry, yearIdx) => {
            let semesterNames = ["fall", "summer", "spring"];
            let deleteSemesters = [];
            let yearSemCount = 0;
            semesterNames.forEach((sem) => {
                if (hasOwnProperty(yearEntry, sem)) {
                    yearSemCount++;
                    if (semesterCount < semesters) {
                        semesterCount++;
                    } else {
                        deleteSemesters.push(sem);
                    }
                }
            });
            if (deleteSemesters.length == yearSemCount) {
                deleteYears.push(yearIdx);
            } else {
                // Delete semester if beyond semester count cap
                deleteSemesters.forEach((sem) => {
                    yearEntry[sem] = undefined;
                });
            }
        });
        // Delete entire year if all semesters invalid
        for (let i = deleteYears.length - 1; i >= 0; i--) {
            entries.splice(deleteYears[i], 1);
        }
        fce.fce = entries;
    }
}

export const getFCEWithID = (req, res) => {
    let id = standardizeID(req.params.courseID);
    FCE.findOne({ courseID: id }, (err, fce) => {
        if (err) return res.send(err);
        if (fce === null) {
            fce = {};
        } else {
            if (req.body !== undefined) {
                // Query fce's for specified instructors
                console.log(req.body);
                if (hasOwnProperty(req.body, "instructors")) {
                    let instructors = req.body.instructors;
                    if (!(instructors instanceof Array)) {
                        instructors = [instructors];
                    }
                    instructors.forEach((instructor, i) => {
                        instructors[i] = instructor.toUpperCase();
                    });
                    _purgeOtherInstructors(instructors, fce);
                }
                // Query fce's for the past n semesters
                if (hasOwnProperty(req.body, "semesters")) {
                    let semesters = req.body.semesters;
                    let res = _purgeOlderSemesters(semesters, fce);
                    if (res !== undefined) fce = res;
                }
            }
        }
        return res.json(fce);
    }).select(resultFilter);
};

export const getFCEs = (req, res) => {
    res.json({
        message: "Too much data. Please query for a specific course only"
    });
    /*
    Remove until migration to CC server is complete
    FCE.find({}, (err, course) => {
        if (err) {
            res.send(err);
        }
        res.json(course);
    }).select(resultFilter);
    */
};

export const updateFCE = (req, res) => {
    let fceDocs = parseFCEData();
    let FCEs = [];
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
};

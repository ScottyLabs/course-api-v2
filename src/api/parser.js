import fs from 'fs';
import csv from 'csv-parser';
import fceEntry from '../models/fceEntry';
import fceDocument from '../models/fceDocument';

const semesters = {
    "F": ["f", "fall"],
    "S": ["s", "spring"],
    "M1": ["m1", "summer1"],
    "M2": ["m2", "summer2"]
}

const getSemester = (semester) => {
    semester = semester.toLowerCase();
    for (var key in semesters) {
        var aliases = semesters[key];
        if (aliases.indexOf(semester) > -1) {
            return key;
        }
    }
    return null;
}

export const getCourseData = (query) => {}

export const getSemesterData = (query) => {
    var semester = getSemester(query);
    if (semester === null) {
        return {
            code: 422,
            message: "Invalid semester"
        };
    } else {
        var content = fs.readFileSync("data/" + semester + ".json");
        return content;
    }
}

const parseFCEData = () => {
    var headerLabels = ["year", "semester", "college", "department", "courseId",
        "section", "instructor", "courseName", "level", "possibleRespondents", 
        "numRespondents", "responseRate", "hrsPerWeek", "hrsPerWeek5", 
        "hrsPerWeek8", "rating1", "rating2", "rating3", "rating4", "rating5",
        "rating6", "rating7", "rating8", "rating9"];
    var entriesCount = 0;
    fceDocuments = {};
    fs.createReadStream("data/fce/fce.csv")
        .pipe(csv({
            mapHeaders: ({headers, index}) => headerLabels[index]
        }))
        .on("data", (data) => {
            fceEntry = new FCEEntry(
                data.year, data.semester, data.college, data.department,
                data.courseId, data.section, data.instructor, data.courseName,
                data.level, data.possibleRespondents, data.numRespondents,
                data.responseRate, data.hrsPerWeek, data.hrsPerWeek5,
                data.hrsPerWeek8, [
                    data.rating1, data.rating2, data.rating3, data.rating4,
                    data.rating5, data.rating6, data.rating7, data.rating8,
                    data.rating9
                ]
            );
            courseName = fceEntry.courseName;
            if (courseName in fceDocuments) {
                fceDocuments[courseName].addEntry(fceEntry);
            } else {
                fceDocuments[courseName] = new FCEDocument(fceEntry);
            }
            entriesCount++;
        })
        .on("end", () => {
            console.log(entriesCount.toString() + " entries recorded");
        });
}
import { FCEEntry } from '../models/fceEntry.js';
import { FCEDocument } from '../models/fceDocument.js';
import fs from 'fs';
import parse from 'csv-parse/lib/sync.js';
import { stringify } from 'querystring';

//old parser code
//seems to work after I modified it for the new csv
export const parseFCEData = () => {
    let headerLabels = ['semester', 'college', 'department', 'courseID',
        'courseName', 'level', 'hrsPerWeek',
        'rating1', 'rating2', 'rating3', 'rating4', 'rating5',
        'rating6', 'rating7', 'rating8', 'rating9'];

    //parses 2020 FCE's (by course name)
    let content = fs.readFileSync('./Course_Evaluation_Results_2020.csv', 'UTF8');
    let entries = parse(content, {
        columns: headerLabels,
        skip_empty_lines: true
    });
    let entriesCount = 0;
    let fceDocuments = [];
    for (let data of entries) {
        if (entriesCount != 0) {
            let fceEntry = new FCEEntry(
                2020, data.semester, data.college, data.department,
                data.courseID, '', '', data.courseName,
                data.level, '', '',
                '', data.hrsPerWeek, '',
                '', [
                    data.rating1, data.rating2, data.rating3, data.rating4,
                    data.rating5, data.rating6, data.rating7, data.rating8,
                    data.rating9
                ]
            );
            let courseID = fceEntry.courseID;
            if (fceDocuments.hasOwnProperty(courseID)) {
                fceDocuments[courseID].addEntry(fceEntry);
            } else {
                fceDocuments[courseID] = new FCEDocument(fceEntry);
            }
        }
        entriesCount++;
    }

    //parses 2019 FCE's (by course name)
    content = fs.readFileSync('./Course_Evaluation_Results_2019.csv', 'UTF8');
    entries = parse(content, {
        columns: headerLabels,
        skip_empty_lines: true
    });
    for (let data of entries) {
        if (entriesCount != 0) {
            let fceEntry = new FCEEntry(
                2019, data.semester, data.college, data.department,
                data.courseID, '', '', data.courseName,
                data.level, '', '',
                '', data.hrsPerWeek, '',
                '', [
                    data.rating1, data.rating2, data.rating3, data.rating4,
                    data.rating5, data.rating6, data.rating7, data.rating8,
                    data.rating9
                ]
            );
            let courseID = fceEntry.courseID;
            if (fceDocuments.hasOwnProperty(courseID)) {
                fceDocuments[courseID].addEntry(fceEntry);
            } else {
                fceDocuments[courseID] = new FCEDocument(fceEntry);
            }
        }
        entriesCount++;
    }

    //resets header labels to process section-by-section analysis
    headerLabels = ['semester', 'college', 'instructor', 'loginID',
        'dept', 'courseID','courseName', 'level', 'trait',
        'numRespondents', 'possibleRespondents', 'responseRate', 'hrsPerWeek',
        'rating1', 'rating2', 'rating3', 'rating4', 'rating5',
        'rating6', 'rating7', 'rating8', 'rating9'];
    
    //processes 2020 section-by-section analysis
    content = fs.readFileSync('./FCE_Section_2020.csv', 'UTF8');
    entries = parse(content, {
        columns: headerLabels,
        skip_empty_lines: true
    });
    for (let data of entries) {
        if (entriesCount != 0) {
            let match = fceDocuments.find( elem =>
                elem.year == 2020
                && elem.semester == data.semester
                && elem.courseID == data.courseID);
            let fceEntry = new FCEEntry(
                2020, data.semester, data.college, data.department,
                data.courseID, '', data.instructor, data.courseName,
                data.level, data.possibleRespondents, data.numRespondents,
                data.responseRate, data.hrsPerWeek, '', '',
                [
                    data.rating1, data.rating2, data.rating3, data.rating4,
                    data.rating5, data.rating6, data.rating7, data.rating8,
                    data.rating9
                ]
            );
            let courseID = fceEntry.courseID;
            if (fceDocuments.hasOwnProperty(courseID)) {
                fceDocuments[courseID].addEntry(fceEntry);
            } else {
                fceDocuments[courseID] = new FCEDocument(fceEntry);
            }
        }
    }

    //processes 2019 section-by-section analysis
    content = fs.readFileSync('./FCE_Section_2019.csv', 'UTF8');
    entries = parse(content, {
        columns: headerLabels,
        skip_empty_lines: true
    });
    for (let data of entries) {
        if (entriesCount != 0) {
            let match = fceDocuments.find( elem =>
                elem.year == 2019
                && elem.semester == data.semester
                && elem.courseID == data.courseID);
            let fceEntry = new FCEEntry(
                2020, data.semester, data.college, data.department,
                data.courseID, '', data.instructor, data.courseName,
                data.level, data.possibleRespondents, data.numRespondents,
                data.responseRate, data.hrsPerWeek, '', '',
                [
                    data.rating1, data.rating2, data.rating3, data.rating4,
                    data.rating5, data.rating6, data.rating7, data.rating8,
                    data.rating9
                ]
            );
            let courseID = fceEntry.courseID;
            if (fceDocuments.hasOwnProperty(courseID)) {
                fceDocuments[courseID].addEntry(fceEntry);
            } else {
                fceDocuments[courseID] = new FCEDocument(fceEntry);
            }
        }
    }

    //complies return object
    let docList = []
    Object.keys(fceDocuments).forEach((key) => {
        docList.push(fceDocuments[key]);
    });
    //.index of? look up javascript find index
    //use find?
    return docList;
}

const data = parseFCEData();
fs.writeFile('./testResults.json', JSON.stringify(data, null, 2), function(err) {
    console.log(err);
});
//console.log(data);
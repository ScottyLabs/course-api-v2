import { FCEEntry } from '../models/fceEntry.js';
import { FCEDocument } from '../models/fceDocument.js';
import fs from 'fs';
import parse from 'csv-parse/lib/sync.js';
import { stringify } from 'querystring';

// export const parseFCEData2 = () => {
//     var data2020 = new File([""], './Course_Evaluation_Results_2020.csv');
//     let fceDocuments = {};
//     console.log("this function is running")
//     Papa.parse(data2020, {
//         header: true,
//         skipEmptyLines: true,
//         //where data is being processed
//         step: function(results, file) {
//              //old parser code below, slightly modified
//             let fceEntry = new FCEEntry(
//                 2020, results.data['Semester'], results.data['Division'], results.data['Dept'],
//                 results.data['Num'], '', '', results.data['Course Name'],
//                 results.data['Course Level'], '', '',
//                 '', results.data['Hrs Per Week'], '',
//                 '', [
//                     results.data['Interest in student learning'],
//                     results.data['Clearly explain course requirements'],
//                     results.data['Clear learning objectives & goals'],
//                     results.data['Instructor provides feedback to students to improve'],
//                     results.data["demonstrate importance of subject matter"],
//                     results.data['Explains subject matter of course'],
//                     results.data['Show respect for all students'],
//                     results.data['Overall teaching rate'],
//                     results.data['Overall course rate']
//                 ]
//             );
//             let courseID = fceEntry.courseID;
//             if (fceDocuments.hasOwnProperty(courseID)) {
//                 fceDocuments[courseID].addEntry(fceEntry);
//             } else {
//                 fceDocuments[courseID] = new FCEDocument(fceEntry);
//             }
//             console.log("successfully parsed 2020 data");
//         }
//     });

//     //once data is done being processed
//     //old code from parser.js
//     let docList = []
//     Object.keys(fceDocuments).forEach((key) => {
//         docList.push(fceDocuments[key]);
//     });
//     return docList;
// }

//old parser code
//seems to work after I modified it for the new csv
export const parseFCEData = () => {
    let headerLabels = ['semester', 'college', 'department', 'courseID',
        'courseName', 'level', 'hrsPerWeek',
        'rating1', 'rating2', 'rating3', 'rating4', 'rating5',
        'rating6', 'rating7', 'rating8', 'rating9'];
    let content = fs.readFileSync('./Course_Evaluation_Results_2020_2.csv', 'UTF8');
    let entries = parse(content, {
        columns: headerLabels,
        skip_empty_lines: true
    });
    let entriesCount = 0;
    let fceDocuments = {};
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

    content = fs.readFileSync('./Course_Evaluation_Results_2019.csv', 'UTF8');
    entries = parse(content, {
        columns: headerLabels,
        skip_empty_lines: true
    });
    //let entriesCount = 0;
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
        //entriesCount++;
    }

    let docList = []
    Object.keys(fceDocuments).forEach((key) => {
        docList.push(fceDocuments[key]);
    });
    return docList;
}

const data = parseFCEData();
const str = stringify(data);
fs.writeFile('./testResults.json', JSON.stringify(data), function(err) {
    console.log(err);
});
//console.log(data);
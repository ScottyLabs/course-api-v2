import fs from 'fs';
import csv from 'csv-parse';
import parse from 'csv-parse/lib/sync.js';
import { FCEEntry } from '../models/fceEntry.js';
import { FCEDocument } from '../models/fceDocument.js';

const semesters = {
    'F': ['f', 'fall'],
    'S': ['s', 'spring'],
    'M1': ['m1', 'summer1'],
    'M2': ['m2', 'summer2']
}

const getSemester = (semester) => {
    semester = semester.toLowerCase();
    for (let key in semesters) {
        let aliases = semesters[key];
        if (aliases.indexOf(semester) > -1) {
            return key;
        }
    }
    return null;
}

export const getCourseData = (query) => {}

export const getSemesterData = (query) => {
    let semester = getSemester(query);
    if (semester === null) {
        return {
            code: 422,
            message: 'Invalid semester'
        };
    } else {
        let content = fs.readFileSync('data/' + semester + '.json');
        return content;
    }
}

export const parseFCEData = () => {
    let headerLabels = ['year', 'semester', 'college', 'department', 'courseID',
        'section', 'instructor', 'courseName', 'level', 'possibleRespondents', 
        'numRespondents', 'responseRate', 'hrsPerWeek', 'hrsPerWeek5', 
        'hrsPerWeek8', 'rating1', 'rating2', 'rating3', 'rating4', 'rating5',
        'rating6', 'rating7', 'rating8', 'rating9'];
    let content = fs.readFileSync('data/fce/fce.csv', 'UTF8');
    let entries = parse(content, {
        columns: headerLabels,
        skip_empty_lines: true
    });
    let entriesCount = 0;
    let fceDocuments = {};
    for (let data of entries) {
        let fceEntry = new FCEEntry(
            data.year, data.semester, data.college, data.department,
            data.courseID, data.section, data.instructor, data.courseName,
            data.level, data.possibleRespondents, data.numRespondents,
            data.responseRate, data.hrsPerWeek, data.hrsPerWeek5,
            data.hrsPerWeek8, [
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
        entriesCount++;
    }

    let docList = []
    Object.keys(fceDocuments).forEach((key) => {
        docList.push(fceDocuments[key]);
    });
    return docList;
}
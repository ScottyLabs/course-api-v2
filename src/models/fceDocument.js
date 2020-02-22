export class FCEDocument {
    constructor(fceEntry) {
        this.courseId = fceEntry.courseId;
        this.courseName = fceEntry.courseName;
        this.college = fceEntry.college;
        this.department = fceEntry.department;
        this.level = fceEntry.level;
        this.fce = [];
        this.addEntry(fceEntry);
    }

    // Get fce entry (year)
    _getYearObj(fceEntry) {
        yearObj = null;
        for (yearEntry in this.fce) {
            if (yearEntry.year == fceEntry.year) {
                yearObj = yearEntry;
                break;
            }
        }
        if (yearObj == null) {
            yearObj = {
                year: fceEntry.year,
                semesters: []
            };
        }
        return yearObj
    }

    // Get fce.semesters entry (semester)
    _getSemObj(fceEntry, yearObj) {
        semesters = yearObj.semesters;
        semObj = null;
        for (semEntry in semesters) {
            if (semEntry.semester == fceEntry.semester) {
                semObj = semEntry;
                break;
            }
        }
        if (semObj == null) {
            semObj = {
                semester: fceEntry.semester,
                data: []
            };
            semesters.push(semObj);
        }
        return semObj;
    }

    // Update the FCE data
    addEntry(fceEntry) {
        yearObj = _getYearObj(fceEntry);
        semObj = _getSemObj(fceEntry, yearObj);
        dataObj = {
            section: fceEntry.section,
            instructor: fceEntry.instructor,
            possibleRespondents: fceEntry.possibleRespondents,
            numRespondents: fceEntry.numRespondents,
            responseRate: fceEntry.responseRate,
            hrsPerWeek: fceEntry.hrsPerWeek,
            hrsPerWeek5: fceEntry.hrsPerWeek5,
            hrsPerWeek8: fceEntry.hrsPerWeek8,
            rating: fceEntry.rating
        };
        semObj.data.push(dataObj);
    }
}
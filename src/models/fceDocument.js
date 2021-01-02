export class FCEDocument {
  constructor(fceEntry) {
    this.courseID = fceEntry.courseID;
    this.name = fceEntry.courseName;
    this.college = fceEntry.college;
    this.department = fceEntry.department;
    this.level = fceEntry.level;
    this.fce = [];
    this.addEntry(fceEntry);
  }

  // Get fce entry (year)
  _getYearObj(fceEntry) {
    for (let i = 0; i < this.fce.length; i++) {
      let yearEntry = this.fce[i];
      if (yearEntry.year == fceEntry.year) {
        return yearEntry;
      }
    }
    let yearObj = {
      year: fceEntry.year,
      spring: [],
      fall: [],
      summer: [],
    };
    this.fce.push(yearObj);
    return yearObj;
  }

  _validate(semester) {
    return ["spring", "fall", "summer"].includes(semester);
  }

  // Update the FCE data
  addEntry(fceEntry) {
    let sem = fceEntry.semester;
    if (!this._validate(sem)) {
      console.log("Error unknown semester: " + sem);
    } else {
      let yearObj = this._getYearObj(fceEntry);
      let semList = yearObj[sem];
      let dataObj = {
        section: fceEntry.section,
        instructor: fceEntry.instructor,
        possibleRespondents: fceEntry.possibleRespondents,
        numRespondents: fceEntry.numRespondents,
        responseRate: fceEntry.responseRate,
        hrsPerWeek: fceEntry.hrsPerWeek,
        hrsPerWeek5: fceEntry.hrsPerWeek5,
        hrsPerWeek8: fceEntry.hrsPerWeek8,
        rating: fceEntry.rating,
      };
      semList.push(dataObj);
    }
  }
}

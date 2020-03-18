export class FCEEntry {
    _castToNum(val) {
        if (val == undefined || val == "") {
            return "0";
        } else {
            return val;
        }
    }

    _insertDash(courseID) {
        if (courseID.charAt(2) != "-") {
            return courseID.substring(0, 2) + "-" + courseID.substring(2);
        }
        return courseID;
    }

    constructor(year, semester, college, department, courseID, section, 
        name, courseName, level, possibleRespondents, numRespondents,
        responseRate, hrsPerWeek, hrsPerWeek5, hrsPerWeek8, rating) {
        this.year = year;
        this.semester = semester.toLowerCase();
        this.college = college;
        this.department = department;
        this.courseID = this._insertDash(courseID);
        this.section = section;
        this.instructor = name;
        this.courseName = courseName;
        this.level = level;
        this.possibleRespondents = possibleRespondents;
        this.numRespondents = numRespondents;

        this.responseRate = this._castToNum(responseRate);
        this.hrsPerWeek = this._castToNum(hrsPerWeek);
        this.hrsPerWeek5 = this._castToNum(hrsPerWeek5);
        this.hrsPerWeek8 = this._castToNum(hrsPerWeek8);
        this.rating = [];
        rating.forEach(element => {
            this.rating.push(this._castToNum(element));
        })
    }

    /*
    Rating:
        Interest in student learning
        Clearly explain course requirements
        Clear learning objectives & goals
        Instructor provides feedback to students to improve
        Demonstrate importance of subject matter
        Explains subject matter of course
        Show respect for all students
        Overall teaching rate
        Overall course rate
    */
    getCriteriaMiscLabels() {
        var labels = ["Interest in student learning", 
            "Clearly explain course requirements",
            "Clear learning objectives & goals",
            "Instructor provides feedback to students to improve",
            "Demonstrate importance of subject matter",
            "Explains subject matter of course",
            "Show respect for all students",
            "Overall teaching rate",
            "Overall course rate"];
        return labels;
    }


}
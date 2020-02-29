export class FCEEntry {
    _castToNum(val) {
        if (val == undefined || val == "") {
            return "0";
        } else {
            return val;
        }
    }

    constructor(year, semester, college, department, courseId, section, 
        name, courseName, level, possibleRespondents, numRespondents,
        responseRate, hrsPerWeek, hrsPerWeek5, hrsPerWeek8, rating) {
        this.year = year;
        this.semester = semester.toLowerCase();
        this.college = college;
        this.department = department;
        this.courseId = courseId;
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
        for (let r in rating) {
            this.rating.push(this._castToNum(r));
        }
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
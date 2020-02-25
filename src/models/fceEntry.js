export class FCEEntry {
    constructor(year, semester, college, department, courseId, section, 
        name, courseName, level, possibleRespondents, numRespondents,
        responseRate, hrsPerWeek, hrsPerWeek5, hrsPerWeek8, rating) {
        this.year = year;
        this.semester = semester;
        this.college = college;
        this.department = department;
        this.courseId = courseId;
        this.section = section;
        this.name = name;
        this.courseName = courseName;
        this.level = level;
        this.possibleRespondents = possibleRespondents;
        this.numRespondents = numRespondents;
        this.responseRate = responseRate;
        this.hrsPerWeek = hrsPerWeek;
        this.hrsPerWeek5 = hrsPerWeek5;
        this.hrsPerWeek8 = hrsPerWeek8;
        this.rating = rating;
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
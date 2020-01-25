const fs = require("fs");

const semesters = {
    "F": ["f", "fall"],
    "S": ["s", "spring"],
    "M1": ["m1", "summer1"],
    "M2": ["m2", "summer2"]
}

module.exports = {
    getSemesterData: function(query) {
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
    },
    getCourseData: function(query) {
        
    }
};

function getSemester(semester) {
    semester = semester.toLowerCase();
    for (var key in semesters) {
        var aliases = semesters[key];
        if (aliases.indexOf(semester) > -1) {
            return key;
        }
    }
    return null;
}
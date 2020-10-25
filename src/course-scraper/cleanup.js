/*
	Cleans up data for Mongo Schema

	export const courseSchema = new mongoose.Schema({
		courseID: String,
		desc: String,
		prereqs: [String],
		prereqString: String,
		coreqs: [String],
		crosslisted: [String],
		name: String,
		units: Number,
		department: String
	});

	export const schedule = new mongoose.Schema({
		courseID: String,
		year: Number,
		semester: {
			type: String,
			enum: ["fall", "spring", "summer"]
		},
		session: {
			type: String,
			enum: ["summer all", "summer one", "summer two", "qatar summer"]
		},
		lectures: lecture,
		sections: section
	});
*/

const prereqStrToArray = (prereqStr) => {
  if (prereqStr.trim() === "None") return [];
  return prereqStr.match(/(\d{5})/).slice(1);
};

const cleanUpCourse = (courseJson) => {
  return {
    courseID: courseJson.courseId,
    desc: courseJson.description,
    prereqs: prereqStrToArray(courseJson.prerequisites),
    prereqString: courseJson.prerequisites,
    coreqs: courseJson.corequisites,
    crosslisted: courseJson.crossListed,
    units: courseJson.units, // string, since not all units are integers
    department: courseJson.department
  }
}

export const cleanUp = (json) => {
  const courses = [];
  const sessions = [];
};

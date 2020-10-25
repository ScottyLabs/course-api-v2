/*
  Cleans up data for Mongo Schema
  Data from two sources: scraped schedule, and individually scraped courses

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
    department: courseJson.department,
  };
};

const getDetailsFromSchedules = (schedules) => {
  const details = new Map();
  for (const schedule of schedules) {
    for (const course of schedule.courses) {
      let courseName = course.name;
      let suffixes = [];

      for (const section of course.sections) {
        if (section.sessions.length > 0 && section.sessions?.courseName)
          suffixes.push(`${section.section} - ${section.sessions.courseName}`);
      }

      if (suffixes.length > 0) courseName += " | " + suffixes.join(" | ");

      if (!details.has(course.id)) {
        details.set(course.id, {
          name: courseName,
          department: course.subject,
        });
      }
    }
  }

  return details;
};

export const cleanUp = (scheduleJson, detailsJson) => {
  const courses = [];
  const sessions = [];

  const details = getDetailsFromSchedules(scheduleJson.schedules);

  for (const scrapedCourse of detailsJson.scraped) {
    const courseId = scrapedCourse.courseId;
    const courseDetails = details.get(courseId);
    scrapedCourse.name = courseDetails.name;
    scrapedCourse.department = courseDetails.department;
  }
};

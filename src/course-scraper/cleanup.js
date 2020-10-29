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
  return prereqStr.match(/(\d{5})/g);
};

const cleanUpCourse = (courseJson) => {
  return {
    name: courseJson.name,
    department: courseJson.department,
    courseID: courseJson.courseId,
    desc: courseJson.description,
    prereqs: prereqStrToArray(courseJson.prerequisites),
    prereqString:
      courseJson.prerequisites === "None" ? "" : courseJson.prerequisites,
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

const daysStrToList = (daysStr) => {
  const dayOfTheWeek = { U: 0, M: 1, T: 2, W: 3, R: 4, F: 5, S: 6 };

  if (daysStr === "TBA") return null;
  return daysStr.split("").map((dayChar) => dayOfTheWeek[dayChar]);
};

const roomStrToBuildingRoom = (roomStr) => {
  if (roomStr === "TBA") return { building: null, room: null };
  if (roomStr === "CMU REMOTE") return { building: null, room: "CMU REMOTE" };

  const parts = roomStr.split(" ");
  return {
    building: parts[0],
    room: parts[1],
  };
};

const cleanUpSession = (sessionJson) => {
  return {
    days: daysStrToList(sessionJson.days),
    begin: sessionJson.begin,
    end: sessionJson.end,
    ...roomStrToBuildingRoom(sessionJson.room),
    location: sessionJson.location,
  };
};

const cleanUpLecSec = (rowJson) => {
  return {
    name: rowJson.name,
    instructors: rowJson.instructors,
    times: rowJson.sessions.map((session) => cleanUpSession(session)),
  };
};

const cleanUpLecture = (rowJson) => {
  return cleanUpLecSec(rowJson);
};

const cleanUpSection = (rowJson) => {
  return cleanUpLecSec(rowJson);
};

export const cleanUp = (scheduleJson, detailsJson) => {
  const courses = [];
  const schedules = [];
  const details = getDetailsFromSchedules(scheduleJson.schedules);
  const lectures = [];
  const sections = [];

  const isLecture = (letter, isFirstLine) => {
    letter = letter.toLowerCase();

    if (isFirstLine) return /lec|w|\d+/.test(letter);
    else return /\d+/.test(letter);
  };

  const year = parseInt(scheduleJson.schedules[0].semester.match(/(\d+)/)[1]);

  for (const scrapedCourse of detailsJson.scraped) {
    const courseId = scrapedCourse.courseId;
    const courseDetails = details.get(courseId);

    scrapedCourse.name = courseDetails.name;
    scrapedCourse.department = courseDetails.department;

    let course = cleanUpCourse(scrapedCourse);
    courses.push(course);

    let schedule = {
      courseID: courseId,
      year,
      lectures: [],
      sections: [],
    };

    for (const [idx, row] of scrapedCourse.sections.entries()) {
      if (isLecture(row.section, idx === 0)) {
        let lecture = cleanUpLecture(row);
        schedule.lectures.push(lecture);
      } else {
        let section = cleanUpSection(row);
        schedule.sections.push(section);
      }
    }

    schedules.push(schedule);
  }

  return {
    courses,
    schedules
  };
};

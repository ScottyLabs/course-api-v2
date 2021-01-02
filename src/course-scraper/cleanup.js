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
  return prereqStr.match(/(\d{5})/g).map(hyphenateId);
};

const hyphenateId = (courseId) => {
  return courseId.slice(0, 2) + "-" + courseId.slice(2);
};

const cleanUpCourse = (courseJson) => {
  return {
    name: courseJson.name,
    department: courseJson.department,
    courseID: hyphenateId(courseJson.courseId),
    desc: courseJson.description,
    prereqs: prereqStrToArray(courseJson.prerequisites),
    prereqString:
      courseJson.prerequisites === "None" ? "" : courseJson.prerequisites,
    coreqs: courseJson.corequisites.map(hyphenateId),
    crosslisted: courseJson.crossListed.map(hyphenateId),
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
          department: course.department,
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
  };
};

const getInstructors = (rowJson) => {
  let instructors = rowJson.sessions
    .map((session) => session.instructors)
    .flat();
  return [...new Set(instructors)];
};

const getLocation = (rowJson) => {
  let locations = rowJson.sessions.map((session) => session.location).flat();
  locations = [...new Set(locations)];
  if (locations.length !== 1) {
    console.log(`Had more than one location for ${rowJson.section}.`);
  }
  return locations[0];
};

const cleanUpLecSec = (rowJson) => {
  return {
    name: rowJson.section,
    instructors: getInstructors(rowJson),
    times: rowJson.sessions.map((session) => cleanUpSession(session)),
    location: getLocation(rowJson),
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

  const isLecture = (letter, isFirstLine) => {
    letter = letter.toLowerCase();

    if (isFirstLine) return /lec|w|\d+/.test(letter);
    else return /\d+/.test(letter);
  };

  const year = parseInt(scheduleJson.schedules[0].semester.match(/(\d+)/)[1]);
  const semester = scheduleJson.scrapeInfo.args.schedule;

  for (const scrapedCourse of detailsJson.scraped) {
    const courseId = scrapedCourse.courseId;
    const courseDetails = details.get(courseId);

    scrapedCourse.name = courseDetails.name;
    scrapedCourse.department = courseDetails.department;

    let course = cleanUpCourse(scrapedCourse);
    courses.push(course);

    const baseSchedule = {
      courseID: hyphenateId(courseId),
      year,
      semester,
    };

    if (semester !== "summer") {
      baseSchedule.lectures = [];
      baseSchedule.sections = [];

      for (const [idx, row] of scrapedCourse.sections.entries()) {
        if (row.cancelled) continue;

        if (isLecture(row.section, idx === 0)) {
          let lecture = cleanUpLecture(row);
          baseSchedule.lectures.push(lecture);
        } else {
          let section = cleanUpSection(row);
          baseSchedule.sections.push(section);
        }
      }

      schedules.push(baseSchedule);
    } else {
      const summerSessionNames = [
        "",
        "summer all",
        "summer one",
        "summer two",
        "qatar summer",
      ];

      for (const summerSession of summerSessionNames) {
        let sessionSchedule = {
          ...baseSchedule,
          lectures: [],
          sections: [],
          session: summerSession === "" ? null : summerSession,
        };

        const sessionRows = scrapedCourse.sections.filter((section) => {
          if (section.cancelled) return false;
          return section.session === summerSession;
        });

        if (sessionRows.length === 0) continue;

        for (const [idx, row] of sessionRows.entries()) {
          if (row.cancelled) continue;

          if (isLecture(row.section, idx === 0)) {
            let lecture = cleanUpLecture(row);
            sessionSchedule.lectures.push(lecture);
          } else {
            let section = cleanUpSection(row);
            sessionSchedule.sections.push(section);
          }
        }

        schedules.push(sessionSchedule);
      }
    }
  }

  return {
    courses,
    schedules,
  };
};

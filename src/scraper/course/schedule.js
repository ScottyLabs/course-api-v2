import fs from "fs";
import Xray from "x-ray";
import cheerio from "cheerio";

const x = Xray();

const getScheduleUrl = (semester) => {
  const SEMESTERS = ["spring", "summer_1", "summer_2", "fall"];

  if (!SEMESTERS.includes(semester)) {
    throw new Error(`semester should be one of [${SEMESTERS.join(", ")}].`);
  }

  return `https://enr-apps.as.cmu.edu/assets/SOC/sched_layout_${semester}.htm`;
};

const repairHtml = (rawHtml) => {
  return cheerio
    .load(rawHtml, {
      decodeEntities: true,
    })
    .html();
};

const getScheduleRawHtml = async (semester) => {
  const scheduleUrl = getScheduleUrl(semester);
  console.log(`Scraping schedule from ${scheduleUrl}`);

  return await x(scheduleUrl, "body@html");
};

export const getScheduleJson = async (semester) => {
  const rawHtml = await getScheduleRawHtml(semester);
  const repairedHtml = repairHtml(rawHtml);

  return await x(repairedHtml, {
    runDate: "p:nth-child(1) > b",
    semester: "p:nth-child(1) > b > b",
    rows: x("tbody tr", [["td"]]),
  });
};

const parseRows = (rows) => {
  console.log("Parsing schedule...");
  const isSubjectRow = (row) =>
    /\S/.test(row[0]) && row.slice(1).every((el) => el.trim() === "");

  let currentDepartment = "";

  let courses = [];
  let departments = [];

  let courseObj = {};
  let sectionObj = {};

  for (const row of rows.slice(2)) {
    if (isSubjectRow(row)) {
      console.log("Encountered subject row", row[0]);
      currentDepartment = row[0];
      departments.push(currentDepartment);
      continue;
    }

    if (row[0].trim() !== "") {
      if (Object.keys(courseObj).length !== 0) {
        if (Object.keys(sectionObj).length !== 0) {
          courseObj.sections.push(sectionObj);
        }
        courses.push(courseObj);
      }

      courseObj = {
        id: row[0],
        name: row[1],
        units: row[2],
        department: currentDepartment,
        sections: [],
      };
      sectionObj = {};
    }

    if (row[3].trim() !== "") {
      if (Object.keys(sectionObj).length !== 0) {
        courseObj.sections.push(sectionObj);
      }

      sectionObj = {
        section: row[3],
        sessions: [],
      };
    }

    if (!row.slice(3).every((el) => el.trim() === "")) {
      if (row.length < 10) continue;

      let sessionObj = {
        days: row[4],
        begin: row[5],
        end: row[6],
        room: row[7],
        location: row[8],
        instructors: row[9].split(", "),
      };

      if (row[1].trim() != "" && row[1] != courseObj.name)
        sessionObj.courseName = row[1];

      sectionObj.sessions.push(sessionObj);
    }
  }

  if (Object.keys(sectionObj).length !== 0) {
    courseObj.sections.push(sectionObj);
  }
  courses.push(courseObj);

  return { courses, departments };
};

export const parseScheduleJson = (json) => {
  let runDate = json.runDate.match(/^Run Date: (\S+)\n/)[1];
  let semester = json.semester.match(/^Semester: (.+)$/)[1];

  let parsedRows = parseRows(json.rows);

  console.log(`Scraped schedule for ${semester}, generated on ${runDate}.`);
  console.log(`Scraped ${parsedRows.courses.length} courses.`);

  return { ...parsedRows, runDate, semester };
};

import fs from "fs";
import { getScheduleJson, parseScheduleJson } from "./schedule.js";
import { getCourseJson, parseCourseJson } from "./course.js";
import { cleanUp } from "./cleanup.js";
import dotenv from "dotenv";
import { courseSchema, scheduleSchema } from "../models/courseModel.js";
import mongoose from "mongoose";

dotenv.config();
const database = process.env.MONGODB_URI || "mongodb://localhost:27017";

mongoose.set("useFindAndModify", false);
mongoose.Promise = global.Promise;
mongoose.connect(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Course = mongoose.model("Course", courseSchema);
const Schedule = mongoose.model("Schedule", scheduleSchema);

export const scrapeCourseIds = async (courseIds, shortSem) => {
  console.log(`Scraping ${courseIds.length} courses for ${shortSem}...`);
  let scraped = [];
  let skipped = [];
  for (const [i, courseId] of courseIds.entries()) {
    if (i % 10 == 0) {
      console.log(`Scraped ${i} courses`);
    }

    try {
      const courseJson = await getCourseJson(courseId, shortSem, false);
      const parsedCourse = parseCourseJson(courseJson);
      scraped.push({ courseId, ...parsedCourse });
    } catch (e) {
      console.log(e);
      console.log(`Unable to scrape ${courseId}, skipping...`);
      skipped.push(courseId);
    }
  }

  return { scraped, skipped };
};

export const scrapeSchedule = async (semester) => {
  if (semester === "summer") {
    const summerOneJson = await getScheduleJson("summer_1");
    const summerTwoJson = await getScheduleJson("summer_2");

    const parsedScheduleOne = parseScheduleJson(summerOneJson);
    const parsedScheduleTwo = parseScheduleJson(summerTwoJson);

    return [
      { semester: "summer_1", ...parsedScheduleOne },
      { semester: "summer_2", ...parsedScheduleTwo },
    ];
  } else {
    const scheduleJson = await getScheduleJson(semester);
    const parsedSchedule = parseScheduleJson(scheduleJson);

    return [{ semester: semester, ...parsedSchedule }];
  }
};

export const scrapeSingleCourse = async (course) => {
  const courseJson = await getCourseJson(course, argv.semester);
  return parseCourseJson(courseJson);
};

/*
  Parse schedule from Semester Schedule Page
    --schedule fall schedule.json
  Scrape single course
    --course 15122 --semester F20 15122_F20.json
  Scrape all courses from schedule (generated by --schedule)
    --courses -i schedule.json details.json
  Clean up and combine data from details and schedule
    --cleanup --schedules schedule.json --details details.json cleaned.json
  Upload to Mongo
    --upload cleaned.json
*/

export const cli = async (argv) => {
  const scrapeInfo = {
    date: new Date(),
    args: argv,
  };

  if (argv?.schedule) {
    const outputFile = argv?._[0] || "schedules.json";

    const outputJson = {
      scrapeInfo,
      schedules: await scrapeSchedule(argv.schedule),
    };

    await fs.promises.writeFile(
      outputFile,
      JSON.stringify(outputJson, null, 2)
    );
  } else if (argv?.course) {
    let courseId = argv?.course.toString();
    if (course.length === 4) courseId = "0" + courseIId;

    const outputFile = argv?._[0] || `${courseId}_${argv.semester}.json`;
    const outputJson = {
      scrapeInfo,
      ...(await scrapeSingleCourse(courseId, argv.semester)),
    };

    await fs.promises.writeFile(
      outputFile,
      JSON.stringify(outputJson, null, 2)
    );
  } else if (argv?.courses) {
    if (!argv?.i) {
      console.log(`Pass a JSON file generated by --schedule to the -i flag`);
      return;
    }

    const outputFile = argv?._[0] || "schedules.json";
    const inputFile = argv?.i;

    const parsedScheduleStream = await fs.promises.readFile(inputFile);
    const parsedSchedule = JSON.parse(parsedScheduleStream.toString());

    const semester = parsedSchedule.scrapeInfo.args.schedule;
    const year = parsedSchedule.schedules[0].semester.match(/20([0-9]{2})/)[1];

    let output;

    if (semester === "fall" || semester === "spring") {
      const shortSem = (semester === "fall" ? "F" : "S") + year;

      const courseIds = [
        ...new Set(
          parsedSchedule.schedules[0].courses.map((course) => course.id)
        ),
      ];

      console.log(`Found ${courseIds.length} unique course IDs.`);
      output = await scrapeCourseIds(courseIds, shortSem);
    } else if (semester === "summer") {
      let summerOneCourseIdsSet = new Set(
        parsedSchedule.schedules[0].courses.map((course) => course.id)
      );
      let summerTwoCourseIdsSet = new Set(
        parsedSchedule.schedules[1].courses.map((course) => course.id)
      );

      let summerOneCourseIds = [...summerOneCourseIdsSet];
      let summerTwoOnly = [...summerTwoCourseIdsSet].filter(
        (courseId) => !summerOneCourseIdsSet.has(courseId)
      );

      console.log(
        `Found ${summerOneCourseIds.length} unique course IDs ` +
          `for summer one/all.`
      );
      console.log(
        `Found ${summerTwoOnly.length} unique course IDs ` +
          `for summer two only.`
      );

      const {
        scraped: summerOneScraped,
        skipped: summerOneSkipped,
      } = await scrapeCourseIds(summerOneCourseIds, "M" + year);

      const {
        scraped: summerTwoOnlyScraped,
        skipped: summerTwoOnlySkipped,
      } = await scrapeCourseIds(summerTwoOnly, "N" + year);

      output = {
        scraped: [...summerOneScraped, ...summerTwoOnlyScraped],
        skipped: [...summerOneSkipped, ...summerTwoOnlySkipped],
      };
    } else {
      console.log(`Unrecognized semester ${semester}.`);
      return;
    }

    let outputJson = { scrapeInfo, ...output };
    await fs.promises.writeFile(
      outputFile,
      JSON.stringify(outputJson, null, 2)
    );
  } else if (argv?.cleanup) {
    const schedulesFile = argv.schedules;
    const detailsFile = argv.details;
    const outputFile = argv?._[0] || "schedules.json";

    const schedulesStream = await fs.promises.readFile(schedulesFile);
    const schedules = JSON.parse(schedulesStream.toString());

    const detailsStream = await fs.promises.readFile(detailsFile);
    const details = JSON.parse(detailsStream.toString());

    const cleanedUp = cleanUp(schedules, details);
    await fs.promises.writeFile(outputFile, JSON.stringify(cleanedUp, null, 2));
  } else if (argv?.upload) {
    const cleanedStream = await fs.promises.readFile(argv?.upload);
    const cleaned = JSON.parse(cleanedStream.toString());

    const courses = cleaned.courses;
    const schedules = cleaned.schedules;

    if (!argv?.schedules_only) {
      for (const [idx, course] of courses.entries()) {
        if (idx % 10 == 0) {
          console.log(`Completed ${(idx / courses.length) * 100}% of courses.`);
        }

        try {
          const courseQuery = { courseID: course.courseID };
          const docs = await Course.find(courseQuery);
          if (docs.length !== 0) {
            console.log(
              `Course ${course.courseID} already exists, overriding...`
            );
            console.log(docs[0]);
            await Course.findOneAndReplace(courseQuery, course);
          } else {
            const newCourse = new Course(course);
            newCourse.save();
          }
        } catch (err) {
          console.log(`Encountered an error while saving ${course.courseID}.`);
        }
      }
    }

    if (!argv?.courses_only) {
      for (const [idx, schedule] of schedules.entries()) {
        if (idx % 10 == 0) {
          console.log(
            `Completed ${(idx / schedules.length) * 100}% of schedules.`
          );
        }

        try {
          const scheduleQuery = {
            courseID: schedule.courseID,
            year: schedule.year,
            semester: schedule.semester,
          };
          if ("session" in schedule) scheduleQuery.session = schedule.session;

          const docs = await Schedule.find(scheduleQuery);
          if (docs.length !== 0) {
            console.log(
              `Schedule ${JSON.stringify(scheduleQuery)} already exists, ` +
                `overriding...`
            );
            await Schedule.findOneAndReplace(scheduleQuery, schedule);
          } else {
            const newSchedule = new Schedule(schedule);
            newSchedule.save();
          }
        } catch (err) {
          console.log(
            `Encountered an error while saving ` +
              `${JSON.stringify(scheduleQuery)}.`
          );
        }
      }
    }
  }

  return;
};

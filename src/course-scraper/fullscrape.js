import fs from "fs";
import parseArgs from "minimist";
import { cli } from "./scrape.js";
import path from "path";

/* Command line arguments:
   --semester: one of "fall", "summer", "spring"
   --dir: directory to store intermediate files
*/

const argv = parseArgs(process.argv.slice(2), {});
console.log(argv);

(async () => {

  const scheduleFile = path.join(argv.dir, "schedule.json");
  const detailsFile = path.join(argv.dir, "details.json");
  const cleanedFile = path.join(argv.dir, "cleaned.json");

  console.log(`Schedule: ${scheduleFile}`);
  console.log(`Details: ${detailsFile}`);
  console.log(`Cleaned: ${cleanedFile}`);

  // 1. SCRAPE SCHEDULE
  console.log("1. Scraping Schedule");
  try {
    await cli({
      schedule: argv.semester,
      _: [scheduleFile],
    });
  } catch (e) {
    console.log("Encountered error while scraping schedule.");
    console.log(e);
    return;
  }

  // 2. SCRAPE INDIVIDUAL COURSES
  console.log("2. Scraping Courses");
  try {
    await cli({
      courses: true,
      _: [detailsFile],
      i: scheduleFile
    });
  } catch(e) {
    console.log("Encountered error while scraping courses.");
    console.log(e);
    return;
  }

  // 3. CLEAN UP DATA
  console.log("3. Combining & Cleaning Data");
  try {
    await cli({
      cleanup: true,
      _: [cleanedFile],
      schedules: scheduleFile,
      details: detailsFile
    }); 
  } catch(e) {
    console.log("Encountered error while scraping courses.");
    console.log(e);
    return; 
  }

  // 4. UPLOAD TO MONGO
  console.log("4. Uploading to Database");
  try {
    await cli({
      upload: [cleanedFile]
    });
  } catch(e) {
    console.log("Encountered error while uploading to MongoDB.");
    console.log(e);
    return;
  }
})();

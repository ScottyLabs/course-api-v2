import { FCEEntry } from "../../models/fceEntry.js";
import fs from "fs";
import parse from "csv-parse/lib/sync.js";

//old parser code
//seems to work after I modified it for the new csv
export const parseFCEData = async () => {
  //resets header labels to process section-by-section analysis
  let headerLabels = [
    "semester",
    "college",
    "department",
    "courseID",
    "section",
    "instructor",
    "courseName",
    "level",
    "numRespondents",
    "possibleRespondents",
    "responseRate",
    "hrsPerWeek",
    "rating1",
    "rating2",
    "rating3",
    "rating4",
    "rating5",
    "rating6",
    "rating7",
    "rating8",
    "rating9",
  ];

  //processes all section by section analyses
  let fceDocuments = [];
  let filenames = fs.readdirSync("./src/scraper/fce/FCEFiles", "UTF8");
  console.log("\nCurrent directory filenames:");
  for (let name of filenames) {
    console.log(name);

    let content = fs.readFileSync("./src/scraper/fce/FCEFiles/" + name, "UTF8"); //changed this
    let entries = parse(content, {
      skip_empty_lines: true,
    });
    console.log(entries.length);
    let entriesCount = 0;
    let year = 2021; //new
    entries.shift();
    for (let data of entries) {
      let dataArray = [];
      for (let cell of data) {
        if (cell.match(/\w/gm) != null) {
          dataArray.push(cell);
        }
      }
      if (dataArray.length < headerLabels.length) {
        for (let i = 0; i <= headerLabels.length - dataArray.length; i++) {
          dataArray.push("");
        }
      }
      if (dataArray[headerLabels.indexOf("courseName")].length === 0) {
        continue;
      }
      let fceEntry = new FCEEntry(dataArray, headerLabels, year);
      await fceEntry.addLocation();
      fceDocuments.push(fceEntry);
      entriesCount++;
    }
  }

  return fceDocuments;
};

//find out where in this that's casting courseID to an int
parseFCEData().then((data) => {
  if (!fs.existsSync("./results")) {
    fs.mkdirSync("./results");
  }
  fs.writeFile(
    "./results/FCEs.json",
    JSON.stringify(data, null, 2),
    function (err) {
      console.log(err);
      process.exit();
    }
  );
});

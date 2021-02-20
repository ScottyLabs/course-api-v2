// const puppeteer = require("puppeteer");
// //import { parseFCEData } from './fceScraper.js';
// // import { FCEEntry } from '../models/fceEntry.js';
// // import { FCEDocument } from '../models/fceDocument.js';
// // import fs from 'fs';
// // import parse from 'csv-parse/lib/sync.js';

// const SECRET_ID;
// const SECRET_PASSWORD;

// const test = async () => {
//   let browser = await puppeteer.launch({
//     headless: false,
//     ignoreHTTPSErrors: true,
//     args: [
//       "--ignore-certificate-errors",
//       "--ignore-certificate-errors-spki-list ",
//     ],
//   });
//   let page = await browser.newPage();
//   await page.goto("https://cmu.smartevals.com", { waitUntil: "networkidle2" });

//   //logs in to smart evals using Abby's info
//   await page.type("input#username", SECRET_ID);
//   await page.type("input#passwordinput", SECRET_PASSWORD);
//   await page.click('input[class="loginbutton"]');

//   //clicks through all the buttons to get to actual FCE
//   //the wait for selector makes sure the page loads first
//   await page.waitForSelector("#proceed-button");
//   await page.click("#proceed-button");
//   await page.waitForSelector("span#lnkSeeResultsImg");
//   await page.click("span#lnkSeeResultsImg");
//   await page.waitForSelector("a#hypSections");
//   await page.click("a#hypSections");
//   await page.waitForSelector(
//     'a[href="https://wwwp3.smartevals.com/Reporting/Students/Results.aspx?Type=Sections&y=2020&Wizard=True&FiveYearsOnly=True"]'
//   );
//   await page.click(
//     'a[href="https://wwwp3.smartevals.com/Reporting/Students/Results.aspx?Type=Sections&y=2020&Wizard=True&FiveYearsOnly=True"]'
//   );

//   let list;

//   //my attempt at actually scraping the contents lol
//   await page.evaluate(() => {
//     //might need to nest this in while loop (while next button is there)
//     list = document.querySelectorAll('tr[class="dxgvDataRow_Custom"]');
//     //const list = document.querySelector('tr[class="dxgvDataRow_Custom"]');
//     //console.log(list == null);
//     //console.log(list);
//     //console.log(list.querySelectorAll('td[class="dxgv"]'));
//     for (const row of list) {
//       const data = row.querySelectorAll('td[class="dxgv"]');
//       console.log(data);
//     }
//   });
//   return list;
//   // await browser.close()
// };

// const list = await test();
// console.log(list);

import fs from 'fs';
import Xray from 'x-ray';
import cheerio from 'cheerio';

const x = Xray().throttle(2, '1s');

const repairHtml = (rawHtml) => {
  return cheerio.load(rawHtml, {
    decodeEntities: true
  }).html();
};

const getCourseDetailsUrl = (courseId, semester) => {
  courseId = courseId.toString().replace('-', '');

  return `https://enr-apps.andrew.cmu.edu/open/SOC/SOCServlet/courseDetails?` +
    `COURSE=${courseId}&SEMESTER=${semester}`;
};

const getCourseRawHtml = async (courseId, semester, log = true) => {
  const courseDetailsUrl = getCourseDetailsUrl(courseId, semester);
  if (log) console.log(`Scraping course from ${courseDetailsUrl}`);
  return await x(courseDetailsUrl, '#course-detail-modal-body@html');
};

export const getCourseJson = async (courseId, semester, log = true) => {
  const rawHtml = await getCourseRawHtml(courseId, semester, log);
  const repairedHtml = repairHtml(rawHtml);

  return await x(repairedHtml, {
    sectionHeaders: x('.row:nth-child(1) thead tr', ['th']),
    sectionRows: x('.row:nth-child(1) tbody tr', [['td']]),
    relatedUrls: x('#course-detail-related-urls ul li', ['a']),
    specialPermission: '.row:nth-child(2) > div:nth-child(2) dd',
    description: '#course-detail-description p',
    prerequisites: '.row:nth-child(5) > div:nth-child(1) dd',
    corequisites: '.row:nth-child(5) > div:nth-child(2) dd',
    crossListed: '.row:nth-child(6) > div:nth-child(1) dd',
    notes: '.row:nth-child(6) > div:nth-child(2) dd',
    reservationRows: x('.row:nth-child(8) tbody tr', [['td']])
  });
};

export const parseCourseJson = (json) => {
  let reservations = {};
  if (json?.reservationRows) {
    for (let row of json.reservationRows) {
      let section = row[0].trim();
      let reservation = row[1].replace('\n\n        ', '').trim();
      reservation = reservation.replace(/\s+/g, ' ');

      if (section in reservations) reservations[section].push(reservation)
      else reservations[section] = [reservation];
    }
  }

  let units = 0;
  let sections = [];

  if (json?.sectionRows) {
    let hasCancelledColumn = false;
    let hasSessionColumn = false;

    // table has a cancelled column
    if (json.sectionHeaders.indexOf('Session') != -1) hasSessionColumn = true;
    if (json.sectionRows[0].length == 10 + hasSessionColumn ? 1 : 0)
      hasCancelledColumn = true;

    let sectionObj = {};

    for (let row of json.sectionRows) {
      let sectionRow = row;
      let cancelled = false;
      let session = '';

      if (hasCancelledColumn) {
        cancelled = row[0] == 'Cancelled';
        sectionRow = row.slice(1);
      }

      if (hasSessionColumn) {
        session = sectionRow[0];
        sectionRow = sectionRow.slice(1);
      }

      sectionRow = sectionRow.map(str => str.trim());

      if (sectionRow[0] != '') units = sectionRow[0];
      if (sectionRow[1] != '') {
        if (Object.keys(sectionObj).length != 0)
          sections.push(sectionObj);

        let section = sectionRow[1];

        let sectionReservations = [];
        if (section in reservations)
          sectionReservations = reservations[section];
        
        sectionObj = {
          cancelled, session, section, sessions: [],
          sectionReservations
        };
      }

      let instructors = sectionRow[8].split(/\n/).map(str => str.trim())
        .filter(str => str != '');

      sectionObj.sessions.push({
        mini: sectionRow[2] == 'Y',
        days: sectionRow[3],
        begin: sectionRow[4],
        end: sectionRow[5],
        location: sectionRow[6],
        room: sectionRow[7],
        instructors
      });
    }

    sections.push(sectionObj);
  }

  return {
    units,
    sections,
    relatedUrls: json.relatedUrls,
    specialPermission: json.specialPermission,
    prerequisites: json.prerequisites.split(',').map(str => str.trim()),
    corequisites: json.corequisites.split(',').map(str => str.trim()),
    crossListed: json.crossListed.split(',').map(str => str.trim()),
    notes: json.notes.trim()
  }
};
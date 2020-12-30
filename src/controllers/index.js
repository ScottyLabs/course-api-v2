import {
  getCourses,
  getCourseWithID
} from './courseController.js';
import { updateFCE, getFCEWithID, getFCEs } from './fceController.js';
import { getSchedules } from './scheduleController.js';
import {
  registerUser,
  checkUser,
  loginUser,
  verifyToken,
  verifyAdmin
} from './authController.js';
import * as parser from '../api/parser.js';

const routes = (app) => {
  app.route('/courses').get(getCourses);

  app.route('/courses/courseID/:courseID').get(getCourseWithID);

  app.route('/schedules').get(getSchedules);

  app.route('/info').get((req, res) => {
    res.send({ message: '200' });
  });

  app.route('/fces').get(getFCEs);

  app.route('/fces/courseID/:courseID').get(getFCEWithID);

  app.route('/semesters/:semester').get((req, res) => {
    var semester = req.params.semester;
    console.log('Requested semester: ' + semester);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(parser.getSemesterData(semester));
  });

  app.route('/register').post(registerUser);

  app.route('/whoami').get(verifyToken, checkUser);

  app.route('/login').post(loginUser);
};

export default routes;

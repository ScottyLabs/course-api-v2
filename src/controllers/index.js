import {
  addCourse,
  getCourses,
  getCourseWithID,
  addCoursesFromJSON,
  updateCourse,
} from './courseController';
import { updateFCE, getFCEWithID, getFCEs } from './fceController';
import {
  registerUser,
  checkUser,
  loginUser,
  verifyToken,
  verifyAdmin
} from './authController';
import parser from '../api/parser';

const routes = (app) => {
  app.route('/courses').get(getCourses);

  app.route('/courses/courseID/:courseID').get(getCourseWithID);

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

  app.route('/fces/update').get(verifyToken, verifyAdmin, updateFCE);

  app.route('/courses/update').post(verifyToken, verifyAdmin, addCourse);

  app.route('/courses/upload').post(verifyToken, verifyAdmin, addCoursesFromJSON);

  app.route('/courses/update/:courseID').put(verifyToken, verifyAdmin, updateCourse);

  app.route('/register').post(registerUser);

  app.route('/whoami').get(verifyToken, checkUser);

  app.route('/login').post(loginUser);
};

export default routes;

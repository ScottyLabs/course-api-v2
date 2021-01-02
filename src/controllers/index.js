import {
  getCourses,
  getCourseWithID
} from './courseController.js';
import { getFCEWithID, getFCEs } from './fceController.js';
import { getSchedules } from './scheduleController.js';

const routes = (app) => {
  app.route('/courses').get(getCourses);

  app.route('/courses/courseID/:courseID').get(getCourseWithID);

  app.route('/schedules').get(getSchedules);

  app.route('/info').get((req, res) => {
    res.send({ message: '200' });
  });

  app.route('/fces').get(getFCEs);

  app.route('/fces/courseID/:courseID').get(getFCEWithID);
};

export default routes;

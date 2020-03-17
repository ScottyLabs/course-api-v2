import { 
    addCourse,
    getCourses,
    getCourseWithID,
    addCoursesFromJSON, 
    updateCourse
} from '../controllers/courseController';
import {
    updateFCE,
    getFCEWithID
} from '../controllers/fceController';
import parser from '../api/parser';

const routes = (app) => {
    app.route('/courses')
        .get(getCourses);

    app.route('/courses/courseID/:courseID')
        .get(getCourseWithID);

    app.route('/info')
        .get((req, res) => {
            res.send({'message': '200'});
        });

    app.route('/fces')
        .get((req, res) => {
        }); 

    app.route('/fces/update')
        .get(updateFCE);

    app.route('/semesters/:semester')
        .get((req, res) => {
            var semester = req.params.semester;
            console.log("Requested semester: " + semester);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(parser.getSemesterData(semester));
        });

    app.route('/update')
        .post(addCourse);
    
    app.route('/upload')
        .post(addCoursesFromJSON);
    
    app.route('/update/:courseID')
        .put(updateCourse);
}

export default routes;
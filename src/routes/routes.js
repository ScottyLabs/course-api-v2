import { 
    addCourse,
    getCourses,
    getCourseWithID,
    addCoursesFromJSON, 
    updateCourse
} from '../controllers/courseController';
import { updateFCE } from '../controllers/fceController';
import parser from '../api/parser';

const routes = (app) => {
    app.route('/query')
        .get(getCourses);

    app.route('/query/:courseID')
        .get(getCourseWithID);

    app.route('/info')
        .get((req, res) => {

        });

    app.route('/fce/query')
        .get((req, res) => {
        }); 

    app.route('/fce/update')
        .get(updateFCE);

    app.route('/semester/:semester')
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
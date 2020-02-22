import { addCourse, updateCourse } from '../controllers/courseController';
import parser from '../api/parser';

const routes = (app) => {
    app.route('/query')
        .get((req, res) => {
            var query = req.query;
        })

    app.route('/semester/:semester')
        .get((req, res) => {
            var semester = req.params.semester;
            console.log("Requested semester: " + semester);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(parser.getSemesterData(semester));
        })

    app.route('/update')
        .post(addCourse);
    
    app.route('/update/:courseID')
        .put(updateCourse);
}

export default routes;
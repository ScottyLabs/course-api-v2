import { addCourse } from '../controllers/courseController';
import parser from '../api/parser';
import io from '../api/io';

const routes = (app) => {
    app.route('/query')
        .get((req, res) => {
            io.updateCache(cache);
            var query = req.query;
        })

    app.route('/semester/:semester')
        .get((req, res) => {
            io.updateCache(cache);
            var semester = req.params.semester;
            console.log("Requested semester: " + semester);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(parser.getSemesterData(semester));
        })

    app.route('/update').post(addCourse);
}

export default routes;
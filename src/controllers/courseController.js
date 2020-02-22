import mongoose from 'mongoose';
import { courseSchema } from '../models/courseModel';
import fs from 'fs';

const Course = mongoose.model('Course', courseSchema);

export const addCourse = (req, res) => {
    let newCourse = new Course(req.body);
    Course.find({ courseID: req.body.courseID }, (err, docs) => {
        if (docs.length > 0) {
            res.send({ "message": "Course already exists! Try PUT instead." });
        } else {
            newCourse.save((err, course) => {
                if (err) {
                    res.send(err);
                }
                res.json(course);
            });
        }
    })
}

export const addCoursesFromJSON = (req, res) => {
    let data = fs.readFileSync('./data/' + req.body.file);
    let parsed = JSON.parse(data);
    let result = {
        added: [],
        exists: []
    }
    for (var course in parsed.courses) {
        if (parsed.courses[course].prereqs_obj.reqs_list != null) {
            var prereqs = parsed.courses[course].prereqs_obj.reqs_list[0];
        } else {
            var prereqs = null;
        }
        if (parsed.courses[course].coreqs_obj.reqs_list != null) {
            var coreqs = parsed.courses[course].coreqs_obj.reqs_list[0];
        } else {
            var coreqs = null;
        }
        let courseObj = {
            courseID: course,
            desc: parsed.courses[course].desc,
            prereqs: prereqs,
            coreqs: coreqs,
            name: parsed.courses[course].name,
            units: parsed.courses[course].units,
            department: parsed.courses[course].department,
            lectures: parsed.courses[course].lectures,
            sections: parsed.courses[course].sections
        }
        
        Course.find({ courseID: courseObj.courseID }, (err, docs) => {
            if (docs.length == 0) {
                let newCourse = new Course(courseObj);
                newCourse.save((err, course) => {
                    if (err) {
                        res.send(err);
                    }
                })
            }
        })
    }
    res.json({ message: 'Successfully added documents' });
}

export const updateCourse = (req, res) => {
    Course.findOneAndUpdate({ courseID: req.params.courseID }, (err, course) => {
        if (err) {
            res.send(err);
        }
        res.json(course);
    })
}
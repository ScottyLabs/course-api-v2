import mongoose from 'mongoose';
import { courseSchema } from '../models/courseModel';

const Course = mongoose.model('Course', courseSchema);

export const addCourse = (req, res) => {
    let newCourse = new Course(req.body);
    Course.find({ courseID: req.body.courseID }, (err, docs) => {
        if (docs.length > 0) {
            res.send({ 'message': 'Course already exists! Try PUT instead.'});
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

export const updateCourse = (req, res) => {
    Course.findOneAndUpdate({ courseID: req.params.courseID }, (err, course) => {
        if (err) {
            res.send(err);
        }
        res.json(course);
    })
}
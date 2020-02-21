import mongoose from 'mongoose';
import { courseSchema } from '../models/models';

const Course = mongoose.model('Course', courseSchema);

export const addCourse = (req, res) => {
    let newCourse = new Course(req.body);
    
    newCourse.save((err, course) => {
        if (err) {
            res.send(err);
        }
        res.json(course);
    });
}
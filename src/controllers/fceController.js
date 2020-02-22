import mongoose from 'mongoose';
import { courseSchema } from '../models/models';

const FCE = mongoose.model('FCE', courseSchema);

export const addCourse = (req, res) => {
    let newCourse = new FCE(req.body);
    
    newCourse.save((err, course) => {
        if (err) {
            res.send(err);
        }
        res.json(course);
    });
}
import mongoose from 'mongoose';
import { courseSchema } from '../models/models';
import { parseFCEData } from '../api/parser.js';

const FCE = mongoose.model('FCE', courseSchema);

export const addFce = (req, res) => {
    fceData = parseFCEData();
    for (const [courseId, fceDocument] of Object.entries(fceData)) {
        let newFce = new FCE(fceDocument);
        newFce.save((err, fce) => {
            if (err) {
                res.send(err);
            }
            res.json(fce);
        });
    }
}
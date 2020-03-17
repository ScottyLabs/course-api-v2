import mongoose from 'mongoose';
import { fceSchema } from '../models/fceModel';
import { parseFCEData } from '../api/parser';
import { standardizeID } from '../api/util.js';

const FCE = mongoose.model('FCE', fceSchema);
const resultFilter = "-_id -__v -fce.fall._id -fce.spring._id -fce.summer._id";

export const getFCEWithID = (req, res) => {
    let id = standardizeID(req.params.courseID);
    FCE.findOne({ courseID: id }, (err, fce) => {
        if (err) return res.send(err);
        if (fce === null) fce = {};
        return res.json(fce);
    }).select(resultFilter);
};

export const getFCEs = (req, res) => {
    FCE.find({}, (err, course) => {
        if (err) {
            res.send(err);
        }
        res.json(course);
    }).select(resultFilter);
}

export const updateFCE = (req, res) => {
    let fceDocs = parseFCEData();
    let FCEs = []
    console.log("Uploading FCEs");
    FCE.insertMany(fceDocs, (err, fce) => {
        if (err) {
            console.log("An error occured.");
            console.log(err);
            res.send(err);
        } else {
            console.log("Upload successful.");
            res.json({
                message: "Upload successful"
            });
        }
    });
}
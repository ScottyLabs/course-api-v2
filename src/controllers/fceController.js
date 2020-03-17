import mongoose from 'mongoose';
import { fceSchema } from '../models/fceModel';
import { parseFCEData } from '../api/parser';

const FCE = mongoose.model('FCE', fceSchema);

export const getFCEWithID = (req, res) => {
    FCE.findOne({ courseID: req.params.courseID }, (err, fce) => {
        if (err) return res.send(err);
        return res.json(fce);
    })
};

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
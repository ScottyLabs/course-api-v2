import mongoose from 'mongoose';
import { fceSchema } from '../models/fceModel';
import { parseFCEData } from '../api/parser';

const FCE = mongoose.model('FCE', fceSchema);

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
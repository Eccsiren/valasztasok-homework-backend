import { Schema, model } from "mongoose";
// https://mongoosejs.com/docs/typescript.html
// https://mongoosejs.com/docs/validation.html

// ref: "onside" -> 1 oldali modell neve, nem kell átírni!

const candidateSchema = new Schema(
    {
        _id: Number,
        party: {
            ref: "party",
            type: Number,
            required: [true, "Party must be filled in!"],
        },
        constituency: {
            type: String,
            required: [true, "Constituency cannot be empty!"],
        },
        number_of_votes: {
            type: Number,
            required: [true, "Number of votes must be filled in!"],
            min: 0,
        },
        name: {
            type: String,
            required: [true, "Name cannot be empty!"],
            unique: true,
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Mongoose also supports populating virtuals.
// The ref option, which tells Mongoose which model to populate documents from.
// The localField and foreignField options. Mongoose will populate documents from the model in ref whose foreignField matches this document's localField.
// justOne says that it'll populate a single connected object, set it to false if you need to get an array
// nsideSchema.virtual("populateField", {
//     ref: "oneside",
//     localField: "party",
//     foreignField: "_id",
//     justOne: true,
// });
// Use virtual for populate in controller:
// const data = await this.nsideM.find().populate("populateField", "-_id field1 field2 -field3 ...");

const candidateModel = model("candidate", candidateSchema, "candidates");

export default candidateModel;

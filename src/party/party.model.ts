import { Schema, model } from "mongoose";

const partySchema = new Schema(
    {
        _id: Number,
        short_name: {
            type: String,
            required: true,
            unique: true,
        },
        full_name: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const partyModel = model("party", partySchema, "parties");

export default partyModel;

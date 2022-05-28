import { Schema, model } from "mongoose";
import User from "./user.interface";

const userSchema = new Schema<User>(
    {
        email: String,
        user_name: String,
        password: String,
    },
    { versionKey: false },
);

const userModel = model<User>("user", userSchema, "users");

export default userModel;

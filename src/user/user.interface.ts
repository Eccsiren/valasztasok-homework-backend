import { Types } from "mongoose";
export default interface User {
    _id: Types.ObjectId | string;
    user_name: string;
    email: string;
    password: string;
}

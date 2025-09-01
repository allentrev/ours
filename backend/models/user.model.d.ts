import { Model } from "mongoose";
import { UserDocument } from "../types/user.js";

declare const User: Model<UserDocument>;
export default User;

import { Types } from "mongoose";
import { RoleCode, RoleModel } from "../models/roleModel";
import { InternalServerError } from "../core/CustomError";

async function getRole(role: RoleCode): Promise<Types.ObjectId | null> {
    try {
        const userRole = await RoleModel.findOne({ code: role, status: true });
        if (!userRole) throw new InternalServerError("User role not found");
        return userRole._id;
    } catch (error) {
        throw new InternalServerError("User role not found");
    }
}

export default getRole;
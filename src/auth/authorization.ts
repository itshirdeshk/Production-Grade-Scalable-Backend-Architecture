import express from 'express';
import { ProtectedRequest, RoleRequest } from '../types/app-request';
import asyncHandler from '../helpers/asyncHandler';
import { ForbiddenError } from '../core/CustomError';
import { RoleModel } from '../models/roleModel';

const router = express.Router();

export default router.use(
    asyncHandler(
        async (req: RoleRequest, res: express.Response, next: express.NextFunction) => {
            if (!req.user || !req.user.roles || !req.currentRoleCodes) {
                throw new ForbiddenError("Permission denied");
            }

            const roles = await RoleModel.find({
                code: {
                    $in: req.currentRoleCodes,
                },
                status: true
            })

            if (!roles.length) throw new ForbiddenError("Permission denied");

            const roleIds = roles.map(role => role._id.toString());

            let authorized = false;
            for (const userRole of req.user.roles) {
                if (authorized) break;
                if (roleIds.includes(userRole.toString())) {
                    authorized = true;
                    break;
                }
            }

            if (!authorized) {
                throw new ForbiddenError("Permission denied");
            }

            return next();
        }
    )
)
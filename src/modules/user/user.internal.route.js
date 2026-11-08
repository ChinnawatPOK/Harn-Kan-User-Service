import { Router } from "express";

import validate from "../../middleware/validate.middleware.js";

import { userController } from "./user.controller.js";
import { nearbyUsersSchema } from "./dto/nearby-users.dto.js";

const router = Router();

router.get("/nearby", validate(nearbyUsersSchema), userController.getNearbyUsers);

export default router;

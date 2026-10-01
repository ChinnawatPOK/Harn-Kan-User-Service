import { Router } from "express";

import auth from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import { userController } from "./user.controller.js";
import { updateUserSchema } from "./dto/update-user.dto.js";

const router = Router();

router.use(auth);

router.get("/me", userController.getMe);

router.put("/me", validate(updateUserSchema), userController.updateMe);

router.delete("/me", userController.deactivateMe);

export default router;

import { userService } from "./user.service.js";
import { successResponse } from "../../shared/utils/response.js";

const getMe = async (req, res) => {
  const user = await userService.getCurrentUser(req.auth.userId);

  return successResponse(res, {
    data: user,
  });
};

const updateMe = async (req, res) => {
  const user = await userService.updateCurrentUser(req.auth.userId, req.validated.body);

  return successResponse(res, {
    message: "User updated successfully",
    data: user,
  });
};

const deactivateMe = async (req, res) => {
  await userService.deactivateCurrentUser(req.auth.userId);

  return successResponse(res, {
    message: "Account deactivated successfully",
  });
};

export const userController = {
  getMe,
  updateMe,
  deactivateMe,
};

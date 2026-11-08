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

const updateMyLocation = async (req, res) => {
  const location = await userService.updateCurrentUserLocation(
    req.auth.userId,
    req.validated.body
  );

  return successResponse(res, {
    message: "Location updated successfully",
    data: location,
  });
};

const deactivateMe = async (req, res) => {
  await userService.deactivateCurrentUser(req.auth.userId);

  return successResponse(res, {
    message: "Account deactivated successfully",
  });
};

const getNearbyUsers = async (req, res) => {
  const nearby = await userService.findNearbyUserIds(req.validated.query);

  return successResponse(res, {
    data: nearby,
  });
};

export const userController = {
  getMe,
  updateMe,
  updateMyLocation,
  deactivateMe,
  getNearbyUsers,
};

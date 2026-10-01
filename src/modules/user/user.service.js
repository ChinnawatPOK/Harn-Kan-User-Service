import AppError from "../../shared/errors/app-error.js";
import { ErrorCodes } from "../../shared/errors/error-codes.js";

import { userRepository } from "./user.repository.js";
import { toUserResponse } from "./dto/user-response.dto.js";

const getCurrentUser = async (userId) => {
  const user = await userRepository.findActiveById(userId);

  if (!user) {
    throw new AppError(ErrorCodes.USER_NOT_FOUND);
  }

  return toUserResponse(user);
};

const updateCurrentUser = async (userId, updates) => {
  const user = await userRepository.updateActiveById(userId, updates);

  if (!user) {
    throw new AppError(ErrorCodes.USER_NOT_FOUND);
  }

  return toUserResponse(user);
};

const deactivateCurrentUser = async (userId) => {
  const user = await userRepository.deactivateById(userId);

  if (!user) {
    throw new AppError(ErrorCodes.USER_NOT_FOUND);
  }
};

export const userService = {
  getCurrentUser,
  updateCurrentUser,
  deactivateCurrentUser,
};

import AppError from "../../shared/errors/app-error.js";
import { ErrorCodes } from "../../shared/errors/error-codes.js";

import { userRepository } from "./user.repository.js";
import { toLocationResponse, toUserResponse } from "./dto/user-response.dto.js";

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

const updateCurrentUserLocation = async (userId, location) => {
  const user = await userRepository.updateLocationById(userId, location);

  if (!user) {
    throw new AppError(ErrorCodes.USER_NOT_FOUND);
  }

  return toLocationResponse(user);
};

const deactivateCurrentUser = async (userId) => {
  const user = await userRepository.deactivateById(userId);

  if (!user) {
    throw new AppError(ErrorCodes.USER_NOT_FOUND);
  }
};

const findNearbyUserIds = async ({ lat, lng, radiusMeters, maxAgeMinutes, limit, cursor }) => {
  const users = await userRepository.findActiveIdsWithinRadius({
    latitude: lat,
    longitude: lng,
    radiusMeters,
    updatedSince: new Date(Date.now() - maxAgeMinutes * 60_000),
    limit: limit + 1,
    cursor,
  });

  const page = users.slice(0, limit);

  return {
    userIds: page.map((user) => user._id),
    nextCursor: users.length > limit ? page.at(-1)._id : null,
  };
};

export const userService = {
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserLocation,
  deactivateCurrentUser,
  findNearbyUserIds,
};

import { userRepository } from "../user/user.repository.js";
import { toUserResponse } from "../user/dto/user-response.dto.js";
import { tokenService } from "../../security/token.service.js";
import { passwordService } from "../../security/password.service.js";
import AppError from "../../shared/errors/app-error.js";
import { ErrorCodes } from "../../shared/errors/error-codes.js";

const register = async ({ name, phone_number, password }) => {
  const existingUser = await userRepository.findByPhoneNumber(phone_number);

  if (existingUser) {
    throw new AppError(ErrorCodes.PHONE_ALREADY_REGISTERED);
  }

  const passwordHash = await passwordService.hash(password);

  const user = await userRepository.create({
    name,
    phone_number,
    password_hash: passwordHash,
  });

  return toUserResponse(user);
};

const login = async ({ phone_number, password }) => {
  const user = await userRepository.findActiveByPhoneNumberWithPassword(phone_number);

  if (!user) {
    throw new AppError(ErrorCodes.INVALID_CREDENTIALS);
  }

  const passwordMatches = await passwordService.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError(ErrorCodes.INVALID_CREDENTIALS);
  }

  const accessToken = tokenService.generateAccessToken(user._id);

  return {
    access_token: accessToken,
    token_type: "Bearer",
    user: toUserResponse(user),
  };
};

export const authService = {
  register,
  login,
};

import { userRepository } from "../user/user.repository.js";
import { tokenService } from "../../security/token.service.js";
import { passwordService } from "../../security/password.service.js";
import {
  toAuthUserResponse,
  toDisplayName,
} from "./dto/auth-response.dto.js";
import AppError from "../../shared/errors/app-error.js";
import { ErrorCodes } from "../../shared/errors/error-codes.js";

const register = async ({ fullName, phoneNumber, password, acceptedTerms }) => {
  const existingUser = await userRepository.findByPhoneNumber(phoneNumber);

  if (existingUser) {
    throw new AppError(ErrorCodes.PHONE_ALREADY_REGISTERED);
  }

  const passwordHash = await passwordService.hash(password);
  const displayName = toDisplayName(fullName);

  const user = await userRepository.create({
    name: fullName,
    display_name: displayName,
    phone_number: phoneNumber,
    password_hash: passwordHash,
    terms_accepted_at: acceptedTerms ? new Date() : undefined,
  });

  return {
    token: tokenService.generateAccessToken(user._id, displayName),
    user: toAuthUserResponse(user),
  };
};

const login = async ({ phoneNumber, password }) => {
  const user = await userRepository.findActiveByPhoneNumberWithPassword(phoneNumber);

  if (!user) {
    throw new AppError(ErrorCodes.INVALID_CREDENTIALS);
  }

  const passwordMatches = await passwordService.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError(ErrorCodes.INVALID_CREDENTIALS);
  }

  return {
    token: tokenService.generateAccessToken(
      user._id,
      toDisplayName(user.display_name ?? user.name)
    ),
    user: toAuthUserResponse(user),
  };
};

export const authService = {
  register,
  login,
};

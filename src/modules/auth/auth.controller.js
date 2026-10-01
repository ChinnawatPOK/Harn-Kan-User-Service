import { authService } from "./auth.service.js";
import { successResponse } from "../../shared/utils/response.js";

const register = async (req, res) => {
  const user = await authService.register(req.validated.body);

  return successResponse(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: {
      user,
    },
  });
};

const login = async (req, res) => {
  const result = await authService.login(req.validated.body);

  return successResponse(res, {
    message: "Login successful",
    data: result,
  });
};

export const authController = {
  register,
  login,
};

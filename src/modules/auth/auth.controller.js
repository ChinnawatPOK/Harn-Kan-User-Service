import { authService } from "./auth.service.js";

const register = async (req, res) => {
  const result = await authService.register(req.validated.body);
  return res.status(201).json(result);
};

const login = async (req, res) => {
  const result = await authService.login(req.validated.body);
  return res.status(200).json(result);
};

export const authController = {
  register,
  login,
};

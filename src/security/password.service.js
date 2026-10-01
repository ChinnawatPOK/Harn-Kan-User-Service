import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

const hash = (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const compare = (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

export const passwordService = {
  hash,
  compare,
};

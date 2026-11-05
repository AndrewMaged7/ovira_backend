import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import * as userService from '../users/user.service.js';

const SALT_ROUNDS = 12;

const DUMMY_HASH = bcrypt.hashSync('dummy-password', SALT_ROUNDS);

const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });

export const register = async ({ name, email, password }) => {
  const existing = await userService.findByEmail(email);
  if (existing) throw new AppError('Email already in use', 409);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userService.createUser({ name, email, passwordHash });

  return {
    user: userService.toPublicUser(user),
    accessToken: signAccessToken(user),
  };
};

export const login = async ({ email, password }) => {
  const user = await userService.findByEmail(email, { withPassword: true });

  const hash = user?.passwordHash || DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, hash);

  if (!user || !user.passwordHash || !isMatch) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) throw new AppError('Account disabled', 403);

  return {
    user: userService.toPublicUser(user),
    accessToken: signAccessToken(user),
  };
};
import { User } from './user.model.js';

export const findByEmail = (email, { withPassword = false } = {}) => {
  const query = User.findOne({ email });
  return withPassword ? query.select('+passwordHash') : query;
};

export const findById = (id) => User.findById(id);

export const createUser = (data) => User.create(data);

export const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
});